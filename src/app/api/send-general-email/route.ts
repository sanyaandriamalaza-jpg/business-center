import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT) || 587,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html, replyTo } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        {
          success: false,
          message: "Certains champs obligatoires sont manquants.",
        },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: process.env.MAIL_SENDER,
      to,
      subject,
      html,
      replyTo: replyTo || process.env.MAIL_SENDER,
    };

    const info = await transporter.sendMail(mailOptions);

    if (info.accepted.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Email envoyé avec succès.",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "L'email n'a pas été accepté par le serveur.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}