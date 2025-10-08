import pool from "@/src/lib/db";
import { Formule } from "@/src/lib/type";
import { count } from "console";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";


/**
 * @swagger
 * /api/virtual-office-offer:
 *   post:
 *     summary: Crée une nouvelle offre de domiciliation
 *     description: Permet d'ajouter une offre liée à une entreprise avec ses caractéristiques.
 *     tags:
 *       - Virtual Office Offer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - id_company
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pack Premium"
 *                 description: Nom de l'offre
 *               description:
 *                 type: string
 *                 example: "Accès à un bureau virtuel premium avec services inclus."
 *                 description: Description détaillée de l'offre
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Support 24/7", "Adresse professionnelle", "Accès aux salles de réunion"]
 *                 description: Liste des fonctionnalités
 *               price:
 *                 type: number
 *                 example: 99.99
 *                 description: Tarif de l'offre
 *               is_tagged:
 *                 type: boolean
 *                 example: true
 *                 description: Indique si l'offre est taggée
 *               tag:
 *                 type: string
 *                 example: "Best Seller"
 *                 description: Tag associé à l'offre
 *               id_company:
 *                 type: integer
 *                 example: 12
 *                 description: ID de l'entreprise liée
 *     responses:
 *       201:
 *         description: Offre créée avec succès
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
 *                   example: "Offre créée avec succès"
 *                 insertedId:
 *                   type: integer
 *                   example: 45
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
 *                   example: "Le nom de l'offre est obligatoire"
 *       500:
 *         description: Erreur interne lors de la création de l'offre
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
  
      const {
        name,
        description,
        features,
        price,
        is_tagged,
        tag,
        id_company,
      } = body;
  
      // Vérifications des champs obligatoires
      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Le nom de l'offre est obligatoire",
          },
          { status: 400 }
        );
      }
      if (!id_company) {
        return NextResponse.json(
          {
            success: false,
            message: "L'ID du company est obligatoire",
          },
          { status: 400 }
        );
      }
      if (price === undefined || isNaN(price)) {
        return NextResponse.json(
          {
            success: false,
            message: "Le tarif est obligatoire",
          },
          { status: 400 }
        );
      }
  
      const query = `
        INSERT INTO virtual_office_offer (
          name,
          description,
          features,
          price,
          is_tagged,
          tag,
          created_at,
          id_company
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
      `;
  
      const queryParams = [
        name,
        description,
        features ? JSON.stringify(features) : null,
        price,
        is_tagged ?? null,
        tag ?? null,
        id_company,
      ];
  
      const [result] = await pool.execute<ResultSetHeader>(query, queryParams);
  
      return NextResponse.json(
        {
          success: true,
          message: "Offre créée avec succès",
          insertedId: result.insertId,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Erreur lors de la création de l'offre pour le vitual office :", error);
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
 * /api/virtual-office-offer:
 *   get:
 *     summary: Récupère les offres de domiciliation avec infos entreprise
 *     description: Permet de récupérer la liste des offres (avec possibilité de filtrer par id_company ou company_slug).
 *     tags:
 *       - Virtual Office Offer
 *     parameters:
 *       - in: query
 *         name: id_company
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID de l'entreprise
 *       - in: query
 *         name: company_slug
 *         schema:
 *           type: string
 *         required: false
 *         description: Slug de l'entreprise
 *     responses:
 *       200:
 *         description: Liste des offres récupérée avec succès
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/VirtualOfficeOffer"
 *       500:
 *         description: Erreur interne lors de la récupération des offres
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
 *                   example: "Détail technique de l’erreur"
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idCompany = url.searchParams.get("id_company");
    const slug = url.searchParams.get("company_slug");

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (idCompany) {
      conditions.push("vo.id_company = ?");
      params.push(Number(idCompany));
    }

    if (slug) {
      conditions.push("c.slug = ?");
      params.push(slug);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        vo.id_virtual_office_offer AS idOffer,
        vo.name,
        vo.description,
        vo.features,
        vo.price,
        vo.is_tagged,
        vo.tag,
        vo.created_at,
        c.id_company AS companyId,
        c.name AS companyName,
        c.slug AS companySlug,
        c.address_line AS companyAddress,
        c.email AS companyEmail,
        c.phone AS companyPhone
      FROM virtual_office_offer vo
      JOIN company c ON c.id_company = vo.id_company
      ${whereClause}
      ORDER BY vo.created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    const offers : Formule[] = rows.map((row) => ({
      id: row.idOffer,
      name: row.name,
      description: row.description,
      features: row.features ? JSON.parse(row.features) : [],
      monthlyPrice: row.price,
      isTagged: !!row.is_tagged,
      tag: row.tag ?? null,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      company: {
        id: row.companyId,
        name: row.companyName,
        slug: row.companySlug,
        address: row.companyAddress,
        email: row.companyEmail,
        phone: row.companyPhone,
      },
    }));

    return NextResponse.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des offres :", error);
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