import pool from "@/src/lib/db";
import { AdminUser } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";


/**
 * @swagger
 * /api/user/super-admin/{id}:
 *   get:
 *     summary: Récupère un utilisateur super-administrateur par son ID.
 *     description: Retourne les informations complètes d'un super-administrateur à partir de son identifiant unique.
 *     tags:
 *       - super-admin
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de l'utilisateur super-administrateur à récupérer.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Super Administrateur récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SuperAdminUser'
 *       400:
 *         description: ID invalide ou manquant.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "ID invalide ou manquant."
 *       404:
 *         description: Super Administrateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Super Administrateur non trouvé."
 *       500:
 *         description: Erreur serveur lors de la récupération du super administrateur.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la récupération du super administrateur."
 *                 error: "Détail de l'erreur ici"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id_admin_user = params.id;

  if (!id_admin_user || isNaN(Number(id_admin_user))) {
    return NextResponse.json(
      {
        success: false,
        message: "ID invalide ou manquant.",
      },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await pool.execute(
      `
      SELECT 
        id_admin_user AS id,
        name,
        first_name AS firstName,
        email,
        phone,
        profile_picture_url AS profilePictureUrl,
        created_at AS createdAt,
        updated_at AS updatedAt,
        is_banned AS isBanned
      FROM admin_user
      WHERE id_admin_user = ?
      `,
      [Number(id_admin_user)]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Super Administrateur non trouvé.",
        },
        { status: 404 }
      );
    }

    const adminUser: AdminUser = rows[0];

    return NextResponse.json(
      {
        success: true,
        data: adminUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur GET admin_user by id:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération du super administrateur.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}


/**
 * @swagger
 * /api/user/super-admin/{id}:
 *   patch:
 *     summary: Met à jour partiellement un super administrateur.
 *     description: Permet de modifier un ou plusieurs champs d’un super administrateur à partir de son ID.
 *     tags:
 *       - super-admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du super administrateur à mettre à jour.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Martin"
 *               first_name:
 *                 type: string
 *                 example: "Claire"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "claire.martin@example.com"
 *               phone:
 *                 type: string
 *                 example: "+33611223344"
 *               profile_picture_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/avatar/claire.png"
 *               password_hash:
 *                 type: string
 *                 format: password
 *                 example: "$2b$10$E8mN1w7xFlwHQwG9Lo1LOZt/0neRNyJ9e0eYI9uZbA0DHOyP92M"
 *                 description: Mot de passe déjà hashé.
 *               is_banned:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Mise à jour réussie.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: true
 *                 message: "Super Administrateur mis à jour avec succès."
 *       400:
 *         description: Requête invalide (ID ou corps incorrect).
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Aucun champ à mettre à jour."
 *       404:
 *         description: Super administrateur introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Super Administrateur introuvable."
 *       500:
 *         description: Erreur serveur.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la mise à jour du super administrateur."
 *                 error: "Détail de l’erreur ici"
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      {
        success: false,
        message: "ID invalide ou manquant.",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const allowedFields = [
      "name",
      "first_name",
      "email",
      "phone",
      "profile_picture_url",
      "password_hash",
      "is_banned",
    ];

    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];

    for (const key of allowedFields) {
      if (key in body) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucun champ à mettre à jour.",
        },
        { status: 400 }
      );
    }

    values.push(Number(id)); // ID dans WHERE clause

    const [result]: any = await pool.execute(
      `UPDATE admin_user SET ${fields.join(", ")}, updated_at = NOW() WHERE id_admin_user = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Super Administrateur introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Super Administrateur mis à jour avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PATCH admin_user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la mise à jour du super administrateur.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}