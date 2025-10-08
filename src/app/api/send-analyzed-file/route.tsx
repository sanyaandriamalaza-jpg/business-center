import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import SendGeneralMailNotif from "@/src/emails/SendGeneralMailNotif";
import { Text, Button } from "@react-email/components";
import { baseUrl } from "@/src/lib/utils";

type SendMailBody = {
  object: string;
  received_from_name: string;
  recipient_name: string;
  courriel_object: string;
  resume: string;
  recipient_email: string;
  file_url?: string;
  companyName?: string;
  companyEmail?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: SendMailBody = await request.json();
    const {
      object,
      received_from_name,
      recipient_name,
      courriel_object,
      resume,
      recipient_email,
      file_url,
      companyName,
      companyEmail,
    } = body;

    const requiredFields: { field: keyof SendMailBody; label: string }[] = [
      { field: "object", label: "Objet du mail" },
      { field: "received_from_name", label: "Nom de l'expéditeur" },
      { field: "recipient_name", label: "Nom du destinataire" },
      { field: "courriel_object", label: "Objet du courrier" },
      { field: "resume", label: "Résumé du courrier" },
      { field: "recipient_email", label: "Adresse email du destinataire" },
    ];

    for (const { field, label } of requiredFields) {
      if (
        !body[field] ||
        (typeof body[field] === "string" && body[field].trim() === "")
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Le champ obligatoire "${label}" est manquant ou vide.`,
            field: field,
          },
          { status: 400 }
        );
      }
    }

    const html = render(
      <SendGeneralMailNotif object={object}>
        <Text style={paragraph}>Bonjour,</Text>
        <Text style={paragraph}>
          Vous avez reçu un courrier de la part de <strong>"{received_from_name}"</strong> pour{" "}
          {recipient_name}, dont l‘objet est <strong>"{courriel_object}"</strong>.
        </Text>
        <Text style={paragraph}>
          Résumé du courrier : <br />
          {resume}
        </Text>
        {file_url && (
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_FILE_BASE_URL}${file_url}`}
          >
            Télécharger le courrier scanné
          </Button>
        )}
      </SendGeneralMailNotif>
    );

    const htmlContent = await html;

    const res = await fetch(`${baseUrl}/api/send-general-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: recipient_email,
        subject: `Vous avez reçu un courrier chez ${companyName || "l'entreprise"}`,
        html: htmlContent,
        replyTo: companyEmail ? { email: companyEmail } : undefined,
      }),
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json(
        { success: true, message: data.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du mail :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "10px",
};
