import pool from "@/src/lib/db";
import { ColorTheme } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";
/**
 * @swagger
 * /api/color-theme:
 *   post:
 *     summary: Crée une nouvelle palette de couleurs.
 *     description: Ajoute un nouveau thème de couleur dans la base de données.
 *     tags:
 *       - color-theme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - background_color
 *               - foreground_color
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Thème Sombre"
 *               background_color:
 *                 type: string
 *                 example: "#000000"
 *               foreground_color:
 *                 type: string
 *                 example: "#FFFFFF"
 *     responses:
 *       201:
 *         description: Palette de couleur ajoutée avec succès.
 *       400:
 *         description: Champs requis manquant.
 *       500:
 *         description: Erreur interne du serveur.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, background_color, foreground_color } = body;

    // Validation des champs requis
    if (
      typeof name !== "string" ||
      typeof background_color !== "string" ||
      typeof foreground_color !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Champs requis manquant ou invalide." },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO color_theme (
        name,
        background_color,
        foreground_color,
        created_at
      ) VALUES (?, ?, ?, NOW())
    `;

    const queryParams = [name, background_color, foreground_color];

    await pool.execute(query, queryParams);

    return NextResponse.json(
      { success: true, message: "Palette de couleur ajoutée avec succès." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la palette de couleur :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne lors de la création de la palette.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
/**
 * @swagger
 * /api/color-theme:
 *   get:
 *     summary: Récupère toutes les palettes de couleurs.
 *     description: Retourne la liste complète des palettes de couleurs avec leur nombre total.
 *     tags:
 *       - color-theme
 *     responses:
 *       200:
 *         description: Liste des palettes récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: Nombre total de palettes.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ColorTheme'
 *       500:
 *         description: Erreur interne du serveur.
 */

export async function GET(request: NextRequest) {
  try {
    const [rows]: any = await pool.execute(`
      SELECT 
        id_color_theme AS id,
        name,
        background_color AS backgroundColor,
        foreground_color AS foregroundColor,
        created_at AS createdAt
      FROM color_theme
      ORDER BY created_at DESC
    `);

    const themes: ColorTheme[] = rows;

    return NextResponse.json(
      {
        success: true,
        count: themes.length,
        data: themes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des palettes :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne du serveur.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}