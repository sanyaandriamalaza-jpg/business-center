import { generateId } from "@/src/lib/customfunction";
import pool from "@/src/lib/db";
import { AdminUser, ColorTheme } from "@/src/lib/type";
import { ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";


/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Crée une nouvelle entreprise.
 *     description: Ajoute une nouvelle entrée dans la table `company` avec les informations fournies.
 *     tags:
 *       - company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Business Pole & Co"
 *               description:
 *                 type: string
 *                 example: "Entreprise spécialisée dans la domiciliation"
 *               legal_form:
 *                 type: string
 *                 example: "SARL"
 *               siren:
 *                 type: string
 *                 example: "123456789"
 *               siret:
 *                 type: string
 *                 example: "12345678900010"
 *               logo_url:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               phone:
 *                 type: string
 *                 example: "+33123456789"
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
 *               id_color_theme:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Entreprise créée avec succès.
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
 *                   example: Entreprise créée avec succès
 *                 insertedId:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Requête invalide, champ `name` manquant.
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
 *                   example: Le nom de l‘entreprise est obligatoire
 *       500:
 *         description: Erreur interne du serveur.
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
 *                   example: Erreur interne
 *                 error:
 *                   type: string
 *                   example: "Détail technique de l’erreur"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      legal_form,
      siren,
      siret,
      logo_url,
      phone,
      reservation_is_active,
      manage_plan_is_active,
      virtual_office_is_active,
      post_mail_management_is_active,
      digicode_is_active,
      mail_scanning_is_active,
      electronic_signature_is_active,
      id_color_theme
    } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Le nom de l’entreprise est obligatoire",
        },
        { status: 400 }
      );
    }

    const slug = generateId(name);

    const query = `
      INSERT INTO company (
        name,
        slug,
        description,
        legal_form,
        siren,
        siret,
        logo_url,
        phone,
        reservation_is_active,
        manage_plan_is_active,
        virtual_office_is_active,
        post_mail_management_is_active,
        digicode_is_active,
        mail_scanning_is_active,
        electronic_signature_is_active,
        created_at,
        id_color_theme
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    const queryParams = [
      name,
      slug,
      description ?? null,
      legal_form ?? null,
      siren ?? null,
      siret ?? null,
      logo_url ?? null,
      phone ?? null,
      reservation_is_active === true ? 1 : 0,
      manage_plan_is_active === true ? 1 : 0,
      virtual_office_is_active === true ? 1 : 0,
      post_mail_management_is_active === true ? 1 : 0,
      digicode_is_active === true ? 1 : 0,
      mail_scanning_is_active === true ? 1 : 0,
      electronic_signature_is_active === true ? 1 : 0,
      id_color_theme ?? null
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, queryParams);

    return NextResponse.json(
      {
        success: true,
        message: "Entreprise créée avec succès",
        insertedId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de l’entreprise :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne lors de la création de l’entreprise.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}


/**
 * @swagger
 * /api/company:
 *   get:
 *     summary: Récupère la liste de toutes les entreprises.
 *     description: >
 *       Retourne un tableau contenant toutes les entreprises ainsi que le nombre total d'éléments.
 *       Il est possible de filtrer les résultats par slug via le paramètre de requête `slug`.
 *     tags:
 *       - company
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtre les entreprises par slug unique.
 *     responses:
 *       200:
 *         description: Liste des entreprises récupérée avec succès.
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
 *                   example: 2
 *                   description: Nombre total d'entreprises retournées.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       500:
 *         description: Erreur serveur lors de la récupération des entreprises.
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
 *                   example: "Erreur serveur lors de la récupération des entreprises."
 *                 error:
 *                   type: string
 *                   example: "Détail de l'erreur ici"
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    let sql = `
      SELECT 
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
    `;

    const params: any[] = [];
    if (slug) {
      sql += ` WHERE c.slug = ?`;
      params.push(slug);
    }

    const [rows]: any = await pool.execute(sql, params);

    const companyMap = new Map<number, any>();

    for (const row of rows) {
      const companyId = row.id;

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          legalForm: row.legalForm,
          siren: row.siren,
          siret: row.siret,
          logoUrl: row.logoUrl,
          phone: row.phone,
          email: row.email,
          socialLinks: row.social_links ? JSON.parse(row.social_links) : null,
          addressLine: row.address_line,
          postalCode: row.postal_code,
          city: row.city,
          state: row.state,
          country: row.country,
          businessHour: row.business_hour ? JSON.parse(row.business_hour) : null,
          googleMapIframe: row.google_map_iframe,
          reservationIsActive: row.reservationIsActive > 0,
          managePlanIsActive: row.managePlanIsActive > 0,
          virtualOfficeIsActive: row.virtualOfficeIsActive > 0,
          postMailManagementIsActive: row.postMailManagementIsActive > 0,
          digicodeIsActive: row.digicodeIsActive > 0,
          mailScanningIsActive: row.mailScanningIsActive > 0,
          electronicSignatureIsActive: row.electronicSignatureIsActive > 0,
          isBanned: row.isBanned,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          adminUserList: [] as AdminUser[],
          theme: {
            id: row.id_color_theme,
            name: row.color_theme_name,
            backgroundColor: row.color_theme_background,
            primaryColor: row.color_theme_primary_color,
            primaryColorHover: row.color_theme_primary_color_hover,
            foregroundColor: row.color_theme_foreground,
            standardColor: row.color_theme_standard_color,
            createdAt: row.color_theme_created_at
          } as ColorTheme
        });
      }

      if (row.adminId) {
        companyMap.get(companyId).adminUserList.push({
          id: row.adminId,
          name: row.adminName,
          firstName: row.adminFirstName,
          email: row.adminEmail,
          phone: row.adminPhone,
          profilePictureUrl: row.adminProfilePictureUrl,
          createdAt: row.adminCreatedAt,
          updatedAt: row.adminUpdatedAt,
          isBanned: row.adminIsBanned,
          idCompany: row.adminIdCompany,
        });
      }
    }

    const result = Array.from(companyMap.values());

    return NextResponse.json(
      {
        success: true,
        count: result.length,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur GET toutes les entreprises :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération des entreprises.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}