import { NextRequest, NextResponse } from 'next/server'; 
import { YousignService } from '@/src/lib/yousign';
import pool from '@/src/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log("--- Début de la requête API /api/yousign/signature ---");
  try {
    const body = await request.json();
    console.log("1. Corps de la requête reçu:", body);

    // Vérifier que le document existe et récupérer les infos
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        cf.id_contract_file,
        cf.contract_file_url,
        cf.compensatory_file_url,
        cf.tag,
        cf.id_company,
        cf.id_basic_user,
        cf.yousign_procedure_id,
        c.name AS company_name,
        bu.first_name AS user_first_name,
        bu.name AS user_last_name,
        bu.email AS user_email
      FROM contract_file cf
      JOIN company c ON c.id_company = cf.id_company
      LEFT JOIN basic_user bu ON bu.id_basic_user = cf.id_basic_user
      WHERE cf.id_contract_file = ?
    `, [body.contractFileId]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Document non trouvé' }, { status: 404 });
    }

    const document = rows[0];
    console.log("2. Document trouvé dans la BDD:", document.id_contract_file);

    // Vérifier si une procédure existe déjà
    if (document.yousign_procedure_id) {
      console.log("Procédure Yousign déjà existante:", document.yousign_procedure_id);

      const signersRes = await YousignService.getSigners(document.yousign_procedure_id);

      const userSigner = signersRes.find((s: any) => s.email === document.user_email);
      const adminSigner = signersRes.find((s: any) => s.email === body.adminEmail);

      let signingUrl: string | null = null;

      if (userSigner && userSigner.status === "notified") {
        console.log("Lien de signature pour l'utilisateur");
        signingUrl = await YousignService.getSignerLink(document.yousign_procedure_id, userSigner.id);
      } else if (adminSigner && userSigner?.status === "signed") {
        console.log("Utilisateur a signé. Lien de signature pour l'admin.");
        signingUrl = await YousignService.getSignerLink(document.yousign_procedure_id, adminSigner.id);
      } else {
        console.log("Pas encore prêt pour l'admin");
      }

      return NextResponse.json({
        success: true,
        procedureId: document.yousign_procedure_id,
        environnement: process.env.YOUSIGN_MODE?.includes('sandbox') ? 'sandbox' : 'production',
        signingUrl,
        signers: signersRes.map((s: any) => ({
          id: s.id,
          email: s.email,
          status: s.status,
          signatureImagePreview: s.signature_image_preview,
        })),
      });
    }

    // si non création d'une nouvelle procédure
    const fileUrl = document.tag === 'contract'
      ? document.contract_file_url
      : document.compensatory_file_url;

    if (!fileUrl) {
      return NextResponse.json({ success: false, error: 'URL du document manquante' }, { status: 400 });
    }

    console.log("3. Téléchargement du fichier depuis:", `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${fileUrl}`);
    const fileResponse = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${fileUrl}`, { cache: 'no-store' });
    if (!fileResponse.ok) throw new Error(`Erreur de téléchargement: ${fileResponse.status}`);

    console.log("4. Fichier téléchargé avec succès. Conversion en base64...");
    const buffer = Buffer.from(await fileResponse.arrayBuffer());
    const fileBase64 = buffer.toString('base64');
    console.log("5. Fichier converti en base64.");

    console.log("6. Appel du service YousignService.createSignatureProcedure...");
    const procedure = await YousignService.createSignatureProcedure({
      procedureName: body.procedureName || `Signature ${document.tag} - ${document.company_name}`,
      documentName: document.tag === 'contract' ? 'Contrat de domiciliation' : 'Mandat de prélèvement',
      fileBase64: fileBase64,
      pageToSign : body.pageToSign,
      signers: [
        {
          firstName: document.user_first_name,
          lastName: document.user_last_name,
          email: document.user_email,
          positionX: body.clientPositionX,
          positionY: body.clientPositionY,
        },
        {
          firstName: body.adminFirstName,
          lastName: body.adminLastName,
          email: body.adminEmail,
          positionX: body.adminPositionX,
          positionY: body.adminPositionY,
        }
      ],
      metadata: {
        contractFileId: body.contractFileId,
        signerType: body.signerType,
        companyId: document.id_company,
        userId: document.id_basic_user
      }
    });

    console.log("7. Procédure Yousign créée avec succès:", procedure.id);
    await pool.execute(
      `UPDATE contract_file SET yousign_procedure_id = ? WHERE id_contract_file = ?`,
      [procedure.id, body.contractFileId]
    );
    console.log("8. Base de données mise à jour avec l'ID de procédure.");

    // Récupérer le lien de l'utilisateur (premier signataire)
    const userSignerId = procedure.signers?.[0]?.id;
    let signingUrl: string | null = null;

    if (userSignerId) {
      console.log("9. Récupération du lien de signature pour l'utilisateur ID:", userSignerId);
      signingUrl = await YousignService.getSignerLink(procedure.id, userSignerId);
    }

    console.log("--- Fin de la requête API /api/yousign/signature ---");

    return NextResponse.json({
      success: true,
      procedureId: procedure.id,
      environnement: process.env.YOUSIGN_MODE?.includes('sandbox') ? 'sandbox' : 'production',
      signingUrl,
      fileBase64,
      signers: procedure.signers.map((s: { id: string; email: string; signatureImagePreview?: string; status?: string }) => ({
        id: s.id,
        email: s.email,
        status: s.status,
        signatureImagePreview: s.signatureImagePreview,
      })),
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
