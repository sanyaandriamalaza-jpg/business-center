import { NextRequest, NextResponse } from "next/server";
import { FILE_TYPES, FileType } from "../../route";
import pool from "@/src/lib/db";
import { ResultSetHeader } from "mysql2";


/**
 * @swagger
 * /api/upload-user-file/{file_type}/{id}:
 *   get:
 *     summary: Récupérer un fichier par son identifiant et son type
 *     description: >
 *       Récupère un fichier spécifique (RIB, KBIS, Identity, Status) par son ID.  
 *       L'ID seul ne suffit pas car il est auto-incrémenté dans chaque table, donc il faut préciser le type.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: file_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rib, kbis, identity, status]
 *         description: Type de fichier
 *         example: rib
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du fichier dans la table correspondante
 *         example: 12
 *     responses:
 *       200:
 *         description: Fichier récupéré avec succès
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
 *                   example: "Fichier récupéré avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     file_type:
 *                       type: string
 *                     file_type_label:
 *                       type: string
 *                     file_url:
 *                       type: string
 *                     note:
 *                       type: string
 *                     is_validate:
 *                       type: boolean
 *                     validate_at:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *       400:
 *         description: Type de fichier invalide
 *       404:
 *         description: Fichier non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { file_type: string; id: string } }
  ) {
    try {
      const { file_type, id} = params;
  
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
        WHERE ${fileConfig.idField} = ?
        LIMIT 1
      `;
  
      const [rows]: any = await pool.execute(query, [id]);
  
      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Fichier non trouvé" },
          { status: 404 }
        );
      }
  
      const file = {
        ...rows[0],
        file_type,
        file_type_label: getFileTypeLabel(file_type as FileType),
      };
  
      // Récupérer l'utilisateur lié
      const [userRows]: any = await pool.execute(
        `SELECT id_basic_user as id, name, first_name, email, phone FROM basic_user WHERE id_basic_user = ?`,
        [file.id_basic_user]
      );
      const user = userRows[0] || null;
  
      return NextResponse.json(
        {
          success: true,
          message: "Fichier récupéré avec succès",
          data: { ...file, user },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération du fichier :", error);
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

  /**
 * @swagger
 * /api/upload-user-file/{file_type}/{id}:
 *   patch:
 *     summary: Mettre à jour un fichier par type et ID
 *     description: Permet de mettre à jour la note et/ou l'état de validation d'un fichier selon son type.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: file_type
 *         required: true
 *         description: Type de fichier (rib, cin, diplome, etc.)
 *         schema:
 *           type: string
 *           enum: [rib, cin, diplome, contrat, fiche_paie]  
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérique du fichier
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Document lisible et validé"
 *               is_validate:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Fichier mis à jour avec succès
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
 *                   example: "Fichier RIB mis à jour avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 12
 *                     file_type:
 *                       type: string
 *                       example: rib
 *                     note:
 *                       type: string
 *                       example: "Document lisible et validé"
 *                     is_validate:
 *                       type: boolean
 *                       example: true
 *                     validate_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-22T12:34:56Z"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-20T09:15:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-22T13:01:00Z"
 *       400:
 *         description: Mauvaise requête (paramètres invalides ou aucun champ à mettre à jour)
 *       404:
 *         description: Fichier non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */

export async function PATCH(
    request: NextRequest,
    { params }: { params: { file_type: string; id: string } }
  ) {
    try {
      const { file_type, id } = params;
      const body = await request.json();
  
      const { note, is_validate } = body;
  
      if (!FILE_TYPES[file_type as FileType]) {
        return NextResponse.json(
          {
            success: false,
            message: `Type de fichier invalide. Types autorisés: ${Object.keys(FILE_TYPES).join(", ")}`,
          },
          { status: 400 }
        );
      }
  
      const fileIdNum = parseInt(id, 10);
      if (isNaN(fileIdNum)) {
        return NextResponse.json(
          {
            success: false,
            message: "L'ID du fichier doit être un entier valide",
          },
          { status: 400 }
        );
      }

      if (note !== undefined && note !== null && note.length > 200) {
        return NextResponse.json(
          {
            success: false,
            message: "La note ne peut pas dépasser 200 caractères",
          },
          { status: 400 }
        );
      }
  
      const fileConfig = FILE_TYPES[file_type as FileType];
  
      // Vérifier si le fichier existe
      const checkQuery = `SELECT ${fileConfig.idField}, is_validate FROM ${fileConfig.table} WHERE ${fileConfig.idField} = ?`;
      const [existingFile] = await pool.execute(checkQuery, [fileIdNum]);
  
      if (!Array.isArray(existingFile) || existingFile.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Fichier non trouvé",
          },
          { status: 404 }
        );
      }
  
      // Construction des champs à mettre à jour
      const fieldsToUpdate: string[] = [];
      const queryParams: any[] = [];
  
      if (note !== undefined) {
        fieldsToUpdate.push(`${fileConfig.noteField} = ?`);
        queryParams.push(note);
      }
  
      if (is_validate !== undefined) {
        fieldsToUpdate.push("is_validate = ?");
        queryParams.push(is_validate);
  
        if (is_validate === true) {
          fieldsToUpdate.push("validate_at = NOW()");
        } else if (is_validate === false) {
          fieldsToUpdate.push("validate_at = NULL");
        }
      }
  
      if (fieldsToUpdate.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Aucun champ à mettre à jour (note ou is_validate requis)",
          },
          { status: 400 }
        );
      }
  
      // Mise à jour
      const updateQuery = `
        UPDATE ${fileConfig.table} 
        SET ${fieldsToUpdate.join(", ")}
        WHERE ${fileConfig.idField} = ?
      `;
      queryParams.push(fileIdNum);
  
      const [updateResult] = await pool.execute<ResultSetHeader>(updateQuery, queryParams);
  
      if (updateResult.affectedRows === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Aucune modification effectuée",
          },
          { status: 400 }
        );
      }
  
      // Récupérer le fichier mis à jour
      const selectQuery = `
        SELECT 
          ${fileConfig.idField} as id,
          ${fileConfig.noteField} as note,
          is_validate,
          validate_at,
          created_at
        FROM ${fileConfig.table} 
        WHERE ${fileConfig.idField} = ?
      `;
  
      const [updatedFile] = await pool.execute(selectQuery, [fileIdNum]);
      const fileData = Array.isArray(updatedFile) && updatedFile.length > 0 ? (updatedFile[0] as any) : null;
  
      return NextResponse.json(
        {
          success: true,
          message: `Fichier ${file_type.toUpperCase()} mis à jour avec succès`,
          data: fileData
            ? {
                id: fileData.id,
                file_type,
                note: fileData.note,
                is_validate: fileData.is_validate,
                validate_at: fileData.validate_at,
                created_at: fileData.created_at,
                updated_at: new Date().toISOString(),
              }
            : null,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du fichier :", error);
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