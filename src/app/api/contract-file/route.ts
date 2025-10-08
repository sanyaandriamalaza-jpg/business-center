import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/src/lib/db";

/**
 * @swagger
 * /api/contract-file:
 *   post:
 *     summary: Créer un nouveau fichier de contrat
 *     description: |
 *       Ajoute un fichier lié à un contrat ou à un prélèvement.
 *       - Si `tag = "contrat"`, alors l'URL est insérée dans `contract_file_url`.
 *       - Si `tag = "prelèvement"`, alors l'URL est insérée dans `compensatory_file_url`.
 *     tags:
 *       - ContractFile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - tag
 *               - id_company
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://example.com/documents/contrat-001.pdf"
 *               tag:
 *                 type: string
 *                 enum: [contrat, prélèvement]
 *                 description: Définit dans quelle colonne l'URL sera stockée
 *                 example: "contrat"
 *               is_signedBy_user:
 *                 type: boolean
 *                 example: false
 *               is_signedBy_admin:
 *                 type: boolean
 *                 example: false
 *               id_basic_user:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               id_company:
 *                 type: integer
 *                 description: L’ID de la société liée au fichier
 *                 example: 1
 *     responses:
 *       201:
 *         description: Fichier de contrat créé avec succès
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
 *                   example: "Contract file créé avec succès"
 *                 insertedId:
 *                   type: integer
 *                   example: 12
 *       400:
 *         description: Erreur de validation (champs manquants ou invalides)
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
 *                   example: "Le tag est obligatoire"
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
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { url, tag, is_signedBy_user, is_signedBy_admin, id_basic_user, id_company } = body;

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Le champ 'tag' est obligatoire" },
        { status: 400 }
      );
    }

    if (!id_company) {
      return NextResponse.json(
        { success: false, message: "Le champ 'id_company' est obligatoire" },
        { status: 400 }
      );
    }

    let contract_file_url: string | null = null;
    let compensatory_file_url: string | null = null;

    if (tag === "contract") {
      if (!url) {
        return NextResponse.json(
          { success: false, message: "L'URL est obligatoire pour le tag 'contrat'" },
          { status: 400 }
        );
      }
      contract_file_url = url;
    } else if (tag === "compensatory") {
      if (!url) {
        return NextResponse.json(
          { success: false, message: "L'URL est obligatoire pour le tag 'prelèvement'" },
          { status: 400 }
        );
      }
      compensatory_file_url = url;
    } else {
      return NextResponse.json(
        { success: false, message: "Tag invalide. Utilisez 'contract' ou 'compensatory'" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO contract_file (
        contract_file_url,
        compensatory_file_url,
        created_at,
        tag,
        is_signedBy_user,
        is_signedBy_admin,
        id_basic_user,
        id_company
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
    `;

    const queryParams = [
      contract_file_url,
      compensatory_file_url,
      tag,
      is_signedBy_user ?? false,
      is_signedBy_admin ?? false,
      id_basic_user ?? null,
      id_company,
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, queryParams);

    return NextResponse.json(
      {
        success: true,
        message: "Contract file créé avec succès",
        insertedId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du contract file :", error);
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
 * /api/contract-file:
 *   get:
 *     summary: Récupère les contract files
 *     tags: 
 *        - ContractFile
 *     parameters:
 *       - in: query
 *         name: id_basic_user
 *         schema:
 *           type: integer
 *         description: Filtrer par ID utilisateur
 *       - in: query
 *         name: id_company
 *         schema:
 *           type: integer
 *         description: Filtrer par ID société
 *     responses:
 *       200:
 *         description: Liste des contract files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       contractFileUrl:
 *                         type: string
 *                       compensatoryFileUrl:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       tag:
 *                         type: string
 *                       isSignedByUser:
 *                         type: boolean
 *                       isSignedByAdmin:
 *                         type: boolean
 *                       company:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           address:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       user:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           email:
 *                             type: string
 *       500:
 *         description: Erreur interne du serveur
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idCompany = url.searchParams.get("id_company");
    const idUser = url.searchParams.get("id_basic_user");

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (idUser) {
      conditions.push("cf.id_basic_user = ?");
      params.push(Number(idUser));
    } else if (idCompany) {
      conditions.push("cf.id_company = ?");
      params.push(Number(idCompany));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        cf.id_contract_file AS fileId,
        cf.contract_file_url,
        cf.compensatory_file_url,
        cf.created_at,
        cf.tag,
        cf.is_signedBy_user,
        cf.is_signedBy_admin,
        cf.yousign_procedure_id as procedureId,
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
      ${whereClause}
      ORDER BY cf.created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    const files = rows.map((row) => ({
      contractFileId: row.fileId,
      url: row.tag === "contract" ? row.contract_file_url : row.compensatory_file_url,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      contractFileTag: row.tag,
      isContractSignedByUser: row.is_signedBy_user === 1 ? true : false,
      isContractSignedByAdmin: row.is_signedBy_admin === 1 ? true : false,
      procedureId : row.procedureId,
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
    }));

    return NextResponse.json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contract files :", error);
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
