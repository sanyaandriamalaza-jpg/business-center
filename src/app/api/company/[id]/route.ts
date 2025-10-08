import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/company/{id}:
 *   patch:
 *     summary: Met à jour partiellement une entreprise.
 *     description: Met à jour un ou plusieurs champs d'une entreprise existante via son ID.
 *     tags:
 *       - company
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant unique de l'entreprise.
 *         schema:
 *           type: number
 *           example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Entreprise Alpha"
 *               description:
 *                 type: string
 *                 example: "Société de conseil en innovation technologique."
 *               legal_form:
 *                 type: string
 *                 example: "SAS"
 *               siren:
 *                 type: string
 *                 example: "732829320"
 *               siret:
 *                 type: string
 *                 example: "73282932000074"
 *               logo_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://cdn.example.com/logo_alpha.png"
 *               phone:
 *                 type: string
 *                 example: "+33765432109"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@entreprise-alpha.com"
 *               address_line:
 *                 type: string
 *                 example: "45 rue des Entrepreneurs"
 *               postal_code:
 *                 type: string
 *                 example: "75015"
 *               city:
 *                 type: string
 *                 example: "Paris"
 *               state:
 *                 type: string
 *                 example: "Île-de-France"
 *               country:
 *                 type: string
 *                 example: "France"
 *               google_map_iframe:
 *                 type: string
 *                 example: "<iframe src='https://maps.google.com/...'></iframe>"
 *               reservation_is_active:
 *                 type: boolean
 *                 example: true
 *               manage_plan_is_active:
 *                 type: boolean
 *                 example: false
 *               virtual_office_is_active:
 *                 type: boolean
 *                 example: true
 *               post_mail_management_is_active:
 *                 type: boolean
 *                 example: false
 *               digicode_is_active:
 *                 type: boolean
 *                 example: true
 *               mail_scanning_is_active:
 *                 type: boolean
 *                 example: false
 *               electronic_signature_is_active:
 *                 type: boolean
 *                 example: true
 *               is_banned:
 *                 type: boolean
 *                 example: false
 *               social_links:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/SocialLinkItem"
 *               business_hour:
 *                 type: object
 *                 example:
 *                   monday: "08:00-17:00"
 *                   tuesday: "08:00-17:00"
 *               id_color_theme:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Entreprise mise à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Entreprise mise à jour avec succès."
 *       400:
 *         description: Requête invalide ou aucun champ à mettre à jour.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Aucun champ à mettre à jour."
 *       404:
 *         description: Aucune entreprise trouvée avec cet ID.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Entreprise introuvable."
 *       500:
 *         description: Erreur interne du serveur lors de la mise à jour.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la mise à jour."
 *                 error: "Détail de l’erreur technique ici"
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id_company = params.id;

  if (!id_company || isNaN(Number(id_company))) {
    return NextResponse.json(
      { success: false, message: "ID de l’entreprise invalide." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const allowedFields = [
      "name",
      "description",
      "legal_form",
      "siren",
      "siret",
      "logo_url",
      "phone",
      "email",
      "social_links",
      "address_line",
      "postal_code",
      "city",
      "state",
      "country",
      "business_hour",
      "google_map_iframe",
      "reservation_is_active",
      "manage_plan_is_active",
      "virtual_office_is_active",
      "post_mail_management_is_active",
      "digicode_is_active",
      "mail_scanning_is_active",
      "electronic_signature_is_active",
      "is_banned",
      "id_color_theme"
    ];

    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    for (const field of allowedFields) {
      if (body.hasOwnProperty(field)) {
        let value = body[field];

        // Convertir les booléens en 0/1
        if (
          [
            "reservation_is_active",
            "manage_plan_is_active",
            "virtual_office_is_active",
            "post_mail_management_is_active",
            "digicode_is_active",
            "mail_scanning_is_active",
            "electronic_signature_is_active",
            "is_banned"
          ].includes(field)
        ) {
          value = value === true || value === "true" ? 1 : 0;
        }

        // Stringify les objets JSON
        if (
          ["social_links", "business_hour"].includes(field) &&
          typeof value === "object"
        ) {
          value = JSON.stringify(value);
        }

        fields.push(`${field} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, message: "Aucun champ à mettre à jour." },
        { status: 400 }
      );
    }

    values.push(Number(id_company));

    const [result]: any = await pool.execute(
      `UPDATE company SET ${fields.join(", ")}, updated_at = NOW() WHERE id_company = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Entreprise introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Entreprise mise à jour avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PATCH entreprise :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la mise à jour.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}


/**
 * @swagger
 * /api/company/{id}:
 *   get:
 *     summary: Récupère les informations d'une entreprise.
 *     description: Retourne les détails d'une entreprise à partir de son identifiant.
 *     tags:
 *       - company
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant unique de l'entreprise.
 *         schema:
 *           type: number
 *           example: 5
 *     responses:
 *       200:
 *         description: Informations de l'entreprise récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
*               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Requête invalide (ID non numérique ou manquant).
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "ID invalide."
 *       404:
 *         description: Aucune entreprise trouvée avec cet ID.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Entreprise introuvable."
 *       500:
 *         description: Erreur serveur lors de la récupération.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la récupération."
 *                 error: "Détails de l'erreur ici"
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id_company = Number(params.id);

  if (isNaN(id_company)) {
    return NextResponse.json(
      { success: false, message: "ID invalide." },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await pool.execute(
      `SELECT 
        c.id_company AS id,
        c.name,
        c.slug,
        c.description,
        c.legal_form AS legalForm,
        c.siren,
        c.siret,
        c.logo_url AS logoUrl,
        c.phone,
        c.email,
        c.social_links,
        c.address_line,
        c.postal_code,
        c.city,
        c.state,
        c.country,
        c.business_hour,
        c.google_map_iframe,
        c.reservation_is_active AS reservationIsActive,
        c.manage_plan_is_active AS managePlanIsActive,
        c.virtual_office_is_active AS virtualOfficeIsActive,
        c.post_mail_management_is_active AS postMailManagementIsActive,
        c.digicode_is_active AS digicodeIsActive,
        c.mail_scanning_is_active AS mailScanningIsActive,
        c.electronic_signature_is_active AS electronicSignatureIsActive,
        c.is_banned AS isBanned,
        c.created_at AS createdAt,
        c.updated_at AS updatedAt,
        au.id_admin_user AS adminId,
        au.name AS adminName,
        au.first_name AS adminFirstName,
        au.phone AS adminPhone,
        au.email AS adminEmail,
        au.profile_picture_url AS adminProfilePictureUrl,
        au.created_at AS adminCreatedAt,
        au.updated_at AS adminUpdatedAt,
        au.is_banned AS adminIsBanned,
        au.id_company AS adminIdCompany,
        ct.id_color_theme AS id_color_theme,
        ct.name AS color_theme_name,
        ct.background_color AS color_theme_background,
        ct.primary_color AS color_theme_primary_color,
        ct.primary_color_hover AS color_theme_primary_color_hover,
        ct.foreground_color AS color_theme_foreground,
        ct.standard_color AS color_theme_standard_color,
        ct.created_at AS color_theme_created_at
      FROM company c
      LEFT JOIN admin_user au ON au.id_company = c.id_company
      INNER JOIN color_theme ct ON ct.id_color_theme = c.id_color_theme
      WHERE c.id_company = ?`,
      [id_company]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Entreprise introuvable." },
        { status: 404 }
      );
    }

    const firstRow = rows[0];

    const companyData = {
      id: firstRow.id,
      name: firstRow.name,
      slug: firstRow.slug,
      description: firstRow.description,
      legalForm: firstRow.legalForm,
      siren: firstRow.siren,
      siret: firstRow.siret,
      logoUrl: firstRow.logoUrl,
      phone: firstRow.phone,
      email: firstRow.email,
      socialLinks: firstRow.social_links ? JSON.parse(firstRow.social_links) : null,
      addressLine: firstRow.address_line,
      postalCode: firstRow.postal_code,
      city: firstRow.city,
      state: firstRow.state,
      country: firstRow.country,
      businessHour: firstRow.business_hour ? JSON.parse(firstRow.business_hour) : null,
      googleMapIframe: firstRow.google_map_iframe,
      reservationIsActive: !!firstRow.reservationIsActive,
      managePlanIsActive: !!firstRow.managePlanIsActive,
      virtualOfficeIsActive: !!firstRow.virtualOfficeIsActive,
      postMailManagementIsActive: !!firstRow.postMailManagementIsActive,
      digicodeIsActive: !!firstRow.digicodeIsActive,
      mailScanningIsActive: !!firstRow.mailScanningIsActive,
      electronicSignatureIsActive: !!firstRow.electronicSignatureIsActive,
      isBanned: !!firstRow.isBanned,
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
      adminUserList: [] as any[],
      theme: {
        id: firstRow.id_color_theme,
        name: firstRow.color_theme_name,
        backgroundColor: firstRow.color_theme_background,
        primaryColor: firstRow.color_theme_primary_color,
        primaryColorHover: firstRow.color_theme_primary_color_hover,
        foregroundColor: firstRow.color_theme_foreground,
        standardColor: firstRow.color_theme_standard_color,
        createdAt: firstRow.color_theme_created_at,
      },
    };

    for (const row of rows) {
      if (row.adminId) {
        companyData.adminUserList.push({
          id: row.adminId,
          name: row.adminName,
          firstName: row.adminFirstName,
          email: row.adminEmail,
          phone: row.adminPhone,
          profilePictureUrl: row.adminProfilePictureUrl,
          createdAt: row.adminCreatedAt,
          updatedAt: row.adminUpdatedAt,
          isBanned: !!row.adminIsBanned,
          idCompany: row.adminIdCompany,
        });
      }
    }

    return NextResponse.json(
      { success: true, data: companyData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur GET entreprise :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}