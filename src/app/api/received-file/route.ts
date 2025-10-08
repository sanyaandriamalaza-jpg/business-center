import pool from "@/src/lib/db";
import { ReceivedFile } from "@/src/lib/type";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/received-file:
 *   post:
 *     summary: Ajoute un fichier reçu
 *     description: |
 *       Insère un nouveau fichier reçu pour une entreprise.
 *       Les champs `received_from`, `courriel_object`, `send_at` et `id_basic_user` sont null par défaut.  
 *       `status` est "non lu", `isSent` et `isArchived` sont false.  
 *       Le champ `uploaded_at` est automatiquement défini à la date actuelle.
 *     tags:
 *       - Received File
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_url
 *               - id_company
 *             properties:
 *               file_url:
 *                 type: string
 *                 example: "https://example.com/rapport_annuel.pdf"
 *                 description: URL du fichier reçu
 *               id_company:
 *                 type: integer
 *                 example: 1
 *                 description: ID de l'entreprise liée
 *     responses:
 *       201:
 *         description: Fichier inséré avec succès
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
 *                   example: "Fichier uploadé avec succès"
 *                 insertedId:
 *                   type: integer
 *                   example: 5
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
 *                   example: "Le file_url est obligatoire"
 *       500:
 *         description: Erreur interne lors de l'insertion du fichier
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_url, id_company } = body;

    if (!file_url) {
      return NextResponse.json(
        {
          success: false,
          message: "L‘URL du fichier est obligatoire",
        },
        { status: 400 }
      );
    }

    if (!id_company) {
      return NextResponse.json(
        {
          success: false,
          message: "L'ID de la company est obligatoire",
        },
        { status: 400 }
      );
    }

    const query = `
        INSERT INTO received_file (
          status,
          file_url,
          uploaded_at,
          id_company
        ) VALUES (?, ?, NOW(), ?)
      `;

    const queryParams = [
      'not-scanned',
      file_url,
      id_company
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, queryParams);

    return NextResponse.json(
      {
        success: true,
        message: "Fichier uploadé avec succès",
        insertedId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'insertion du fichier reçu :", error);
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
 * /api/received-file:
 *   get:
 *     summary: Récupère les fichiers reçus
 *     description: >
 *       - Si `id_basic_user` est fourni → retourne uniquement les fichiers liés à cet utilisateur.  
 *       - Sinon si `id_company` est fourni → retourne uniquement les fichiers liés à cette entreprise.  
 *       - Sinon → retourne **tous les fichiers** reçus.  
 *       
 *       Chaque fichier contient les informations associées à l'entreprise et éventuellement à l'utilisateur.
 *     tags:
 *       - Received File
 *     parameters:
 *       - in: query
 *         name: id_basic_user
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrer les fichiers par ID de l'utilisateur
 *       - in: query
 *         name: id_company
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrer les fichiers par ID de l'entreprise (ignoré si `id_basic_user` est fourni)
 *     responses:
 *       200:
 *         description: Liste des fichiers reçus récupérée avec succès
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
 *                       id_received_file:
 *                         type: integer
 *                       received_from_name:
 *                         type: string
 *                       recipient_name:
 *                         type: string
 *                       courriel_object:
 *                         type: string
 *                       resume:
 *                         type: string
 *                       recipient_email:
 *                         type: string
 *                       status:
 *                         type: string
 *                       send_at:
 *                         type: string
 *                         format: date-time
 *                       file_url:
 *                         type: string
 *                       uploaded_at:
 *                         type: string
 *                         format: date-time
 *                       is_sent:
 *                         type: boolean
 *                       is_archived:
 *                         type: boolean
 *                       id_company:
 *                         type: integer
 *                       id_basic_user:
 *                         type: integer
 *                       user_name:
 *                         type: string
 *                       user_first_name:
 *                         type: string
 *                       user_email:
 *                         type: string
 *       500:
 *         description: Erreur interne lors de la récupération des fichiers
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idCompany = url.searchParams.get("id_company");
    const idUser = url.searchParams.get("id_basic_user");

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (idUser) {
      conditions.push("rf.id_basic_user = ?");
      params.push(Number(idUser));
    } else if (idCompany) {
      conditions.push("rf.id_company = ?");
      params.push(Number(idCompany));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
       rf.id_received_file,
       rf.received_from_name,
       rf.recipient_name,
       rf.courriel_object,
       rf.resume,
       rf.recipient_email,
       rf.status,
       rf.send_at,
       rf.file_url,
       rf.uploaded_at,
       rf.is_sent,
       rf.is_archived,
       rf.id_company,
       rf.id_basic_user,
       bu.name AS user_name,
       bu.first_name AS user_first_name,
       bu.email AS user_email
      FROM received_file rf
      LEFT JOIN basic_user bu ON bu.id_basic_user = rf.id_basic_user
      ${whereClause}
      ORDER BY rf.uploaded_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    const receivedFiles: ReceivedFile[] = rows.map((row) => ({
      id_received_file: row.id_received_file,
      received_from_name: row.received_from_name,
      recipient_name: row.recipient_name,
      courriel_object: row.courriel_object,
      resume: row.resume,
      recipient_email: row.recipient_email,
      status: row.status,
      send_at: row.send_at,
      file_url: row.file_url,
      uploaded_at: row.uploaded_at,
      is_sent: row.is_sent,
      is_archived: row.is_archived === 1 ? true : false,
      id_company: row.id_company,
      id_basic_user: row.id_basic_user,
      user_name: row.user_name,
      user_first_name: row.user_first_name,
      user_email: row.user_email

    }));

    return NextResponse.json({
      success: true,
      count: receivedFiles.length,
      data: receivedFiles,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers reçus :", error);
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