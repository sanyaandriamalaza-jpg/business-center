import { NextRequest, NextResponse } from "next/server";
import { FILE_TYPES, FileType } from "../route";
import pool from "@/src/lib/db";


/**
 * @swagger
 * /api/upload-file-user/{file_type}:
 *   get:
 *     summary: Récupérer tous les fichiers d'un type donné
 *     description: Récupère la liste complète des fichiers pour un type précis (RIB, CIN, Kbis, etc.)
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: file_type
 *         required: true
 *         description: Type de fichier à récupérer
 *         schema:
 *           type: string
 *           enum: [rib, cin, kbis, contrat, fiche_paie]
 *     responses:
 *       200:
 *         description: Liste des fichiers récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Liste des fichiers CIN récupérée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFiles:
 *                       type: integer
 *                       example: 8
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           id_basic_user:
 *                             type: integer
 *                             example: 55
 *                           file_type:
 *                             type: string
 *                             example: cin
 *                           file_url:
 *                             type: string
 *                             example: "https://example.com/uploads/files/cin_101.pdf"
 *                           note:
 *                             type: string
 *                             example: "Copie recto-verso"
 *                           is_validate:
 *                             type: boolean
 *                             example: false
 *                           validate_at:
 *                             type: string
 *                             format: date-time
 *                             example: null
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-08-20T09:15:00Z"
 *       400:
 *         description: Paramètre file_type invalide
 *       404:
 *         description: Aucun fichier trouvé pour ce type
 *       500:
 *         description: Erreur interne du serveur
 */

export async function GET(
    request: NextRequest,
    { params }: { params: { file_type: string } }
  ) {
    try {
      const { file_type } = params;
  
      if (!FILE_TYPES[file_type as FileType]) {
        return NextResponse.json(
          { success: false, message: "Type de fichier invalide" },
          { status: 400 }
        );
      }
  
      const fileConfig = FILE_TYPES[file_type as FileType];
  
      const query = `
        SELECT 
          ${fileConfig.idField} as id,
          '${file_type}' as file_type,
          ${fileConfig.urlField} as file_url,
          ${fileConfig.noteField} as note,
          is_validate,
          validate_at,
          created_at,
          id_basic_user
        FROM ${fileConfig.table}
        ORDER BY created_at DESC
      `;
  
      const [rows]: any = await pool.execute(query);
  
      if (rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Aucun fichier trouvé pour le type : ${file_type}`,
          },
          { status: 404 }
        );
      }
  
      const files = rows.map((file: any) => ({
        ...file,
        file_type,
        file_type_label: getFileTypeLabel(file_type as FileType),
      }));
  
      return NextResponse.json(
        {
          success: true,
          message: `Liste des fichiers ${file_type} récupérée avec succès`,
          data: {
            totalFiles: files.length,
            files,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers par type:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur interne du serveur",
          error: (error as Error).message,
        },
        { status: 500 }
      );
    }
  }
  
  // Libellés
  function getFileTypeLabel(fileType: FileType): string {
    const labels: Record<FileType, string> = {
      identity: "Pièce d'identité du gérant",
      rib: "Relevé d'identité bancaire",
      kbis: "Kbis de la société",
      status: "Statut légal de la société",
    };
    return labels[fileType] || fileType;
  }