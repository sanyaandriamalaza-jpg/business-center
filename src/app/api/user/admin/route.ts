import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/user/admin:
 *   get:
 *     summary: Récupère tous les administrateurs.
 *     description: Retourne la liste de tous les administrateurs, avec leurs informations personnelles, leur entreprise et leur rôle (subRole). Possibilité de filtrer par `id_company`.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: query
 *         name: id_company
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtre optionnel pour récupérer uniquement les administrateurs d'une entreprise spécifique.
 *     responses:
 *       200:
 *         description: Liste des administrateurs récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminUser'
 *       500:
 *         description: Erreur serveur lors de la récupération des administrateurs.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la récupération des administrateurs."
 *                 error: "Détail de l'erreur ici"
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("id_company"); // filtre optionnel

    let query = `
      SELECT 
        admin_user.id_admin_user AS id,
        admin_user.name AS name,
        admin_user.first_name AS firstName,
        admin_user.email,
        admin_user.phone,
        admin_user.profile_picture_url AS profilePictureUrl,
        admin_user.created_at AS createdAt,
        admin_user.updated_at AS updatedAt,
        admin_user.is_banned AS isBanned,
        company.id_company AS company_id_company,
        company.name AS company_name,
        company.description AS company_description,
        company.legal_form AS company_legal_form,
        company.siren AS company_siren,
        company.siret AS company_siret,
        company.logo_url AS company_logo_url,
        company.phone AS company_phone,
        company.reservation_is_active AS company_reservation_is_active,
        company.manage_plan_is_active AS company_manage_plan_is_active,
        company.virtual_office_is_active AS company_virtual_office_is_active,
        company.post_mail_management_is_active AS company_post_mail_management_is_active,
        company.digicode_is_active AS company_digicode_is_active,
        company.mail_scanning_is_active AS company_mail_scanning_is_active,
        company.electronic_signature_is_active AS company_electronic_signature_is_active,
        company.is_banned AS company_is_banned,
        company.created_at AS company_created_at,
        company.updated_at AS company_updated_at,
        sub_role.id_sub_role,
        sub_role.label AS sub_role_label
      FROM admin_user
      LEFT JOIN sub_role ON sub_role.id_sub_role = admin_user.id_sub_role
      INNER JOIN company ON admin_user.id_company = company.id_company
    `;

    const params: any[] = [];

    // Ajouter le filtre si id_company est fourni et valide
    if (companyId && !isNaN(Number(companyId))) {
      query += " WHERE company.id_company = ?";
      params.push(Number(companyId));
    }

    const [rows]: any = await pool.execute(query, params);

    const formatted = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      firstName: row.firstName,
      email: row.email,
      phone: row.phone,
      profilePictureUrl: row.profilePictureUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isBanned: row.isBanned,
      companyInfo: {
        id: row.company_id_company,
        name: row.company_name,
        description: row.company_description,
        legalForm: row.company_legal_form,
        siren: row.company_siren,
        siret: row.company_siret,
        logoUrl: row.company_logo_url,
        phone: row.company_phone,
        reservationIsActive: row.company_reservation_is_active,
        managePlanIsActive: row.company_manage_plan_is_active,
        virtualOfficeIsActive: row.company_virtual_office_is_active,
        postMailManagementIsActive: row.company_post_mail_management_is_active,
        digicodeIsActive: row.company_digicode_is_active,
        mailScanningIsActive: row.company_mail_scanning_is_active,
        electronicSignatureIsActive: row.company_electronic_signature_is_active,
        isBanned: row.company_is_banned,
        createdAt: row.company_created_at,
        updatedAt: row.company_updated_at,
      },
      id_sub_role: row.id_sub_role,
      sub_role_label: row.sub_role_label
    }));

    return NextResponse.json(
      {
        success: true,
        count: formatted.length,
        data: formatted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur GET admin_user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération des administrateurs.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}