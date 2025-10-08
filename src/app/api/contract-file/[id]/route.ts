import pool from "@/src/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /contract-file/{id}:
 *   patch:
 *     summary: Met à jour l'état de signature d'un fichier de contrat
 *     description: Permet de mettre à jour les champs `is_signedBy_user` et `is_signedBy_admin` d'un contrat.
 *     tags:
 *       - ContractFile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'identifiant du fichier de contrat à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_signedBy_user:
 *                 type: boolean
 *                 description: Mettre à jour l'état de signature côté utilisateur
 *                 example: true
 *               is_signedBy_admin:
 *                 type: boolean
 *                 description: Mettre à jour l'état de signature côté administrateur
 *                 example: false
 *     responses:
 *       200:
 *         description: Mise à jour réussie
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
 *                   example: "Fichier mis à jour avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 12
 *                     nom:
 *                       type: string
 *                       example: "contract"
 *                     isSignedByUser:
 *                       type: boolean
 *                       example: true
 *                     isSignedByAdmin:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Requête invalide ou aucun champ à mettre à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Aucun champ à mettre à jour (is_signedBy_user ou is_signedBy_admin requis)"
 *       404:
 *         description: Fichier non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Fichier non trouvé"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur interne"
 *                 error:
 *                   type: string
 *                   example: "Détails de l'erreur"
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { is_signedBy_user, is_signedBy_admin } = body;

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

    // Vérifier si le fichier existe
    const checkQuery = `SELECT id_contract_file, is_signedBy_admin, is_signedBy_user FROM contract_file WHERE id_contract_file = ?`;
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

    if (is_signedBy_admin !== undefined) {
      fieldsToUpdate.push(`is_signedBy_admin = ?`);
      queryParams.push(is_signedBy_admin);
    }

    if (is_signedBy_user !== undefined) {
      fieldsToUpdate.push("is_signedBy_user = ?");
      queryParams.push(is_signedBy_user);
    }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucun champ à mettre à jour (is_signedBy_user ou is_signedBy_admin requis)",
        },
        { status: 400 }
      );
    }

    // Mise à jour
    const updateQuery = `
        UPDATE contract_file 
        SET ${fieldsToUpdate.join(", ")}
        WHERE id_contract_file = ?
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
          id_contract_file as id,
          tag as fileName,
          is_signedBy_user as isSignedByUser,
          is_signedBy_admin as isSignedByAdmin
        FROM contract_file
        WHERE id_contract_file = ?
      `;

    const [updatedFile] = await pool.execute(selectQuery, [fileIdNum]);
    const fileData = Array.isArray(updatedFile) && updatedFile.length > 0 ? (updatedFile[0] as any) : null;

    return NextResponse.json(
      {
        success: true,
        message: `Fichier mis à jour avec succès`,
        data: fileData
          ? {
            id: fileData.id,
            nom: fileData.fileName,
            isSignedByUser: fileData.isSignedByUser === 1 ? true : false,
            isSignedByAdmin: fileData.isSignedByAdmin === 1 ? true : false,
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


/**
 * @swagger
 * /contract-file/{id}:
 *   get:
 *     summary: Récupère les informations d'un contrat
 *     description: Renvoie les détails d'un fichier de contrat, y compris les informations sur la société, l'utilisateur et l'état de signature.
 *     tags:
 *       - ContractFile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'identifiant du fichier de contrat à récupérer
 *     responses:
 *       200:
 *         description: Contrat récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     contractFileId:
 *                       type: integer
 *                       example: 12
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/contracts/contract1.pdf"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-08T12:34:56.000Z"
 *                     contractFileTag:
 *                       type: string
 *                       example: "contract"
 *                     isContractSignedByUser:
 *                       type: boolean
 *                       example: false
 *                     isContractSignedByAdmin:
 *                       type: boolean
 *                       example: true
 *                     procedureId:
 *                       type: string
 *                       example: "abcd-1234-efgh-5678"
 *                     signedUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/signed/contract1.pdf"
 *                     company:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 5
 *                         name:
 *                           type: string
 *                           example: "Ma Société"
 *                         slug:
 *                           type: string
 *                           example: "ma-societe"
 *                     user:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 10
 *                         name:
 *                           type: string
 *                           example: "Doe"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "john.doe@example.com"
 *       404:
 *         description: Contrat non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Contrat non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur récupération contrat"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
      cf.id_contract_file AS fileId,
      cf.contract_file_url,
      cf.compensatory_file_url,
      cf.created_at,
      cf.tag,
      cf.is_signedBy_user,
      cf.is_signedBy_admin,
      cf.yousign_procedure_id AS procedureId,
      cf.signed_file_url AS signedUrl,
      c.id_company AS companyId,
      c.name AS companyName,
      c.slug AS companySlug,
      bu.id_basic_user AS userId,
      bu.first_name AS userFirstName,
      bu.name AS userName,
      bu.email AS userEmail
    FROM contract_file cf
    JOIN company c ON c.id_company = cf.id_company
    LEFT JOIN basic_user bu ON bu.id_basic_user = cf.id_basic_user
    WHERE cf.id_contract_file = ?`,
      [params.id]
    );

    const row = rows[0];

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Contrat non trouvé" },
        { status: 404 }
      );
    }

    const files = {
      contractFileId: row.fileId,
      url: row.tag === "contract" ? row.contract_file_url : row.compensatory_file_url,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      contractFileTag: row.tag,
      isContractSignedByUser: row.is_signedBy_user === 1 ? true : false,
      isContractSignedByAdmin: row.is_signedBy_admin === 1 ? true : false,
      procedureId: row.procedureId,
      signedUrl: row.signedUrl,
      company: {
        id: row.companyId,
        name: row.companyName,
        slug: row.companySlug,
      },
      user: row.userId
        ? {
          id: row.userId,
          name: row.userName,
          firstName: row.userFirstName,
          email: row.userEmail,
        }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    console.error("Erreur récupération contrat:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}