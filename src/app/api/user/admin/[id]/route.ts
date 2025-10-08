import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";


/**
 * @swagger
 * /api/user/admin/{id}:
 *   get:
 *     summary: Récupère un utilisateur administrateur par son ID.
 *     description: Retourne les informations complètes d'un administrateur à partir de son identifiant unique.
 *     tags:
 *       - admin
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de l'utilisateur administrateur à récupérer.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Administrateur récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AdminUser'
 *       400:
 *         description: ID invalide ou manquant.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "ID invalide ou manquant."
 *       404:
 *         description: Administrateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Administrateur non trouvé."
 *       500:
 *         description: Erreur serveur lors de la récupération de l’administrateur.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la récupération de l’administrateur."
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
        au.id_admin_user AS id,
        au.name,
        au.first_name AS firstName,
        au.email,
        au.phone,
        au.profile_picture_url AS profilePictureUrl,
        au.created_at AS createdAt,
        au.updated_at AS updatedAt,
        au.is_banned AS isBanned,
        au.id_company AS idCompany,
        c.id_company AS companyId,
        c.slug AS companySlug,
        c.name AS companyName,
        c.description AS companyDescription,
        c.legal_form AS companyLegalForm,
        c.siren AS companySiren,
        c.siret AS companySiret,
        c.logo_url AS companyLogoUrl,
        c.phone AS companyPhone,
        c.reservation_is_active AS companyReservationIsActive,
        c.manage_plan_is_active AS companyManagePlanIsActive,
        c.virtual_office_is_active AS companyVirtualOfficeIsActive,
        c.post_mail_management_is_active AS companyPostMailManagementIsActive,
        c.digicode_is_active AS companyDigicodeIsActive,
        c.mail_scanning_is_active AS companyMailScanningIsActive,
        c.electronic_signature_is_active AS companyElectronicSignatureIsActive,
        c.is_banned AS companyIsBanned,
        c.created_at AS companyCreatedAt,
        c.updated_at AS companyUpdatedAt
      FROM admin_user au
      LEFT JOIN company c ON au.id_company = c.id_company
      WHERE au.id_admin_user = ?
      `,
      [Number(id_admin_user)]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrateur non trouvé.",
        },
        { status: 404 }
      );
    }

    const row = rows[0];

    const adminUser = {
      id: row.id,
      name: row.name,
      firstName: row.firstName,
      email: row.email,
      phone: row.phone,
      profilePictureUrl: row.profilePictureUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isBanned: row.isBanned,
      idCompany: row.idCompany,
      companyInfo: row.companyId
        ? {
          id: row.companyId,
          slug: row.companySlug,
          name: row.companyName,
          description: row.companyDescription,
          legalForm: row.companyLegalForm,
          siren: row.companySiren,
          siret: row.companySiret,
          logoUrl: row.companyLogoUrl,
          phone: row.companyPhone,
          reservationIsActive: row.companyReservationIsActive,
          managePlanIsActive: row.companyManagePlanIsActive,
          virtualOfficeIsActive: row.companyVirtualOfficeIsActive,
          postMailManagementIsActive: row.companyPostMailManagementIsActive,
          digicodeIsActive: row.companyDigicodeIsActive,
          mailScanningIsActive: row.companyMailScanningIsActive,
          electronicSignatureIsActive: row.companyElectronicSignatureIsActive,
          isBanned: row.companyIsBanned,
          createdAt: row.companyCreatedAt,
          updatedAt: row.companyUpdatedAt,
        }
        : null,
    };

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
        message: "Erreur serveur lors de la récupération de l’administrateur.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}


/**
 * @swagger
 * /api/user/admin/{id}:
 *   patch:
 *     summary: Met à jour partiellement un administrateur.
 *     description: Modifie un ou plusieurs champs d’un utilisateur administrateur à partir de son ID.
 *     tags:
 *       - admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'administrateur à mettre à jour.
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
 *                 example: "Dupont"
 *               first_name:
 *                 type: string
 *                 example: "Lucie"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "lucie.dupont@example.com"
 *               phone:
 *                 type: string
 *                 example: "+33123456789"
 *               profile_picture_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/avatar.png"
 *               password_hash:
 *                 type: string
 *                 example: "$2b$10$xxxxx..."
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
 *                 message: "Administrateur mis à jour avec succès."
 *       400:
 *         description: Requête invalide ou champs manquants.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Aucun champ à mettre à jour."
 *       404:
 *         description: Administrateur introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Administrateur introuvable."
 *       500:
 *         description: Erreur serveur.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la mise à jour de l’administrateur."
 *                 error: "Message d'erreur détaillé"
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
          message: "Administrateur introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Administrateur mis à jour avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PATCH admin_user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la mise à jour de l’administrateur.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}