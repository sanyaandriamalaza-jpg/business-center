import pool from "@/src/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";


/**
 * @swagger
 * /api/received-file/{id}:
 *   get:
 *     summary: Récupère un fichier reçu par son ID
 *     description: Renvoie un fichier reçu unique, avec les informations associées à l'entreprise et à l'utilisateur (si présent).
 *     tags:
 *       - Received File
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du fichier reçu
 *     responses:
 *       200:
 *         description: Fichier trouvé avec succès
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
 *                     id:
 *                       type: integer
 *                       example: 12
 *                     receivedFrom:
 *                       type: string
 *                       example: null
 *                     courrielObject:
 *                       type: string
 *                       example: null
 *                     status:
 *                       type: string
 *                       example: "non lu"
 *                     sendAt:
 *                       type: string
 *                       example: null
 *                     fileUrl:
 *                       type: string
 *                       example: "https://example.com/rapport_annuel.pdf"
 *                     uploadedAt:
 *                       type: string
 *                       example: "2025-08-22T12:00:00.000Z"
 *                     isSent:
 *                       type: boolean
 *                       example: false
 *                     isArchived:
 *                       type: boolean
 *                       example: false
 *                     company:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "AR BioChem"
 *                         slug:
 *                           type: string
 *                           example: "ar-biochem"
 *                         address:
 *                           type: string
 *                           example: "123 Rue Exemple, Paris"
 *                         email:
 *                           type: string
 *                           example: "contact@arbiochem.com"
 *                         phone:
 *                           type: string
 *                           example: "+33 1 23 45 67 89"
 *                     user:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *       400:
 *         description: ID invalide
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
 *                   example: "ID du fichier invalide"
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
 *         description: Erreur interne lors de la récupération du fichier
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
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const fileId = Number(params.id);
    if (isNaN(fileId)) {
      return NextResponse.json(
        { success: false, message: "ID du fichier invalide" },
        { status: 400 }
      );
    }

    const query = `
        SELECT 
          rf.id_received_file AS fileId,
          rf.received_from,
          rf.courriel_object,
          rf.status,
          rf.send_at,
          rf.file_url,
          rf.uploaded_at,
          rf.isSent,
          rf.isArchived,
          c.id_company AS companyId,
          c.name AS companyName,
          c.slug AS companySlug,
          c.address_line AS companyAddress,
          c.email AS companyEmail,
          c.phone AS companyPhone,
          bu.id_basic_user AS userId,
          bu.first_name AS userFirstName,
          bu.name AS userName,
          bu.email AS userEmail
        FROM received_file rf
        JOIN company c ON c.id_company = rf.id_company
        LEFT JOIN basic_user bu ON bu.id_basic_user = rf.id_basic_user
        WHERE rf.id_received_file = ?
        LIMIT 1
      `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [fileId]);

    if (!rows.length) {
      return NextResponse.json(
        { success: false, message: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    const row = rows[0];
    const file = {
      id: row.fileId,
      receivedFrom: row.received_from,
      courrielObject: row.courriel_object,
      status: row.status,
      sendAt: row.send_at ? new Date(row.send_at).toISOString() : null,
      fileUrl: row.file_url,
      uploadedAt: row.uploaded_at ? new Date(row.uploaded_at).toISOString() : null,
      isSent: !!row.isSent,
      isArchived: !!row.isArchived,
      company: {
        id: row.companyId,
        name: row.companyName,
        slug: row.companySlug,
        address: row.companyAddress,
        email: row.companyEmail,
        phone: row.companyPhone,
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

    return NextResponse.json({ success: true, data: file });
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier :", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne", error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/received-file/{id}:
 *   patch:
 *     summary: Met à jour un fichier reçu
 *     description: Permet de mettre à jour un fichier reçu existant. Les champs non fournis ne seront pas modifiés.
 *     tags:
 *       - Received File
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du fichier reçu à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               received_from_name:
 *                 type: string
 *                 example: "Jean Dupont"
 *               recipient_name:
 *                 type: string
 *                 example: "Karim Benali"
 *               recipient_email:
 *                 type: string
 *                 example: "karim.benali@example.com"
 *               courriel_object:
 *                 type: string
 *                 example: "Rapport annuel 2025"
 *               resume:
 *                 type: string
 *                 example: "Résumé du contenu du fichier"
 *               status:
 *                 type: string
 *                 example: "lu"
 *               send_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-23T10:00:00.000Z"
 *               file_url:
 *                 type: string
 *                 example: "https://example.com/nouveau_fichier.pdf"
 *               uploaded_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-22T09:30:00.000Z"
 *               is_sent:
 *                 type: boolean
 *                 example: true
 *               is_archived:
 *                 type: boolean
 *                 example: false
 *               id_company:
 *                 type: integer
 *                 example: 1
 *               id_basic_user:
 *                 type: integer
 *                 example: 2
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
 *                   example: "Fichier mis à jour avec succès"
 *       400:
 *         description: Mauvaise requête (ID invalide ou aucun champ fourni)
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
 *                   example: "Aucun champ fourni pour la mise à jour"
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
 *                   example: "Fichier non trouvé ou rien à mettre à jour"
 *       500:
 *         description: Erreur interne
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
    const fileId = Number(params.id);
    if (isNaN(fileId)) {
      return NextResponse.json(
        { success: false, message: "ID du fichier invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      received_from_name,
      recipient_name,
      courriel_object,
      resume,
      recipient_email,
      status,
      send_at,
      file_url,
      uploaded_at,
      is_sent,
      is_archived,
      id_company,
      id_basic_user
    } = body;

    const fields: string[] = [];
    const values: (string | number | boolean | Date | null)[] = [];

    if (received_from_name !== undefined) {
      fields.push("received_from_name = ?");
      values.push(received_from_name);
    }
    if (recipient_name !== undefined) {
      fields.push("recipient_name = ?");
      values.push(recipient_name);
    }
    if (courriel_object !== undefined) {
      fields.push("courriel_object = ?");
      values.push(courriel_object);
    }
    if (resume !== undefined) {
      fields.push("resume = ?");
      values.push(resume);
    }
    if (recipient_email !== undefined) {
      fields.push("recipient_email = ?");
      values.push(recipient_email);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }
    if (send_at !== undefined) {
      fields.push("send_at = ?");
      values.push(new Date(send_at));
    }
    if (file_url !== undefined) {
      fields.push("file_url = ?");
      values.push(file_url);
    }
    if (uploaded_at !== undefined) {
      fields.push("uploaded_at = ?");
      values.push(new Date(uploaded_at));
    }
    if (is_sent !== undefined) {
      fields.push("is_sent = ?");
      values.push(is_sent);
    }
    if (is_archived !== undefined) {
      fields.push("is_archived = ?");
      values.push(is_archived);
    }
    if (id_company !== undefined) {
      fields.push("id_company = ?");
      values.push(id_company);
    }
    if (id_basic_user !== undefined) {
      fields.push("id_basic_user = ?");
      values.push(id_basic_user);
    }

    if (!fields.length) {
      return NextResponse.json(
        { success: false, message: "Aucun champ fourni pour la mise à jour" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE received_file
      SET ${fields.join(", ")}
      WHERE id_received_file = ?
    `;
    values.push(fileId);

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Fichier non trouvé ou rien à mettre à jour", data: null },
        { status: 404 }
      );
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
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
      WHERE rf.id_received_file = ?
      `,
      [fileId]
    );
    return NextResponse.json(
      { success: true, message: "Fichier mis à jour avec succès", data: rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fichier :", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message, data: null },
      { status: 500 }
    );
  }
}