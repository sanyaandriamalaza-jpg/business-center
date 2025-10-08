import { NextRequest, NextResponse } from "next/server";
import { YousignService } from "@/src/lib/yousign";
import pool from "@/src/lib/db";
import { uploadFile } from "@/src/lib/customfunction";

export async function POST(request: NextRequest) {
  try {
    const { contractFileId, signatureRequestId } = await request.json();

    const isCompleted = await YousignService.isProcedureCompleted(signatureRequestId);
    console.log(isCompleted)
    if (!isCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: "La procédure de signature n'est pas encore terminée (tous les signataires n'ont pas signé).",
        },
        { status: 400 }
      );
    }

    const signedDocs = await YousignService.downloadSignedDocument(contractFileId,signatureRequestId);
    if (!signedDocs || signedDocs.length === 0) {
      throw new Error("Aucun document signé disponible pour cette procédure");
    }

    const signedDoc = signedDocs[0];

    const buffer = Buffer.isBuffer(signedDoc.file) 
      ? signedDoc.file 
      : Buffer.from(signedDoc.file);
    
    const fileBlob = new Blob([buffer], { type: "application/pdf" });
    const file = new File([fileBlob], signedDoc.name, { 
      type: "application/pdf",
      lastModified: Date.now()
    });

    const uploadRes = await uploadFile(file, { customFolder: "signed" });

    if (!uploadRes.success || !uploadRes.path) {
      throw new Error(uploadRes.error || "Erreur lors de l'upload du document signé");
    }

    await pool.execute(
      `UPDATE contract_file SET signed_file_url = ? WHERE id_contract_file = ?`,
      [uploadRes.path, contractFileId]
    );

    return NextResponse.json({
      success: true,
      message: "Document signé sauvegardé avec succès",
      signedFileUrl: uploadRes.path,
    });
  } catch (error: any) {
    console.error("Erreur lors de la sauvegarde du document signé:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}