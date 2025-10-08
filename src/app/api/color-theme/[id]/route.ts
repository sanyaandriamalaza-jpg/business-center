import pool from "@/src/lib/db";
import { ColorTheme } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/color-theme/{id}:
 *   patch:
 *     summary: Met à jour une palette de couleurs existante.
 *     description: Modifie partiellement les champs d'une palette de couleurs en fonction de l'ID fourni.
 *     tags:
 *       - color-theme
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la palette de couleur à modifier.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Thème mis à jour"
 *               background_color:
 *                 type: string
 *                 example: "#123456"
 *               foreground_color:
 *                 type: string
 *                 example: "#abcdef"
 *     responses:
 *       200:
 *         description: Palette mise à jour avec succès.
 *       400:
 *         description: Requête invalide ou champs manquants.
 *       404:
 *         description: Palette non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const color_theme_id = params.id;

    if (!color_theme_id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de la palette de couleur non fourni.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, background_color, foreground_color } = body;

    if (!name && !background_color && !foreground_color) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucun champ à mettre à jour.",
        },
        { status: 400 }
      );
    }

    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }

    if (background_color) {
      fields.push("background_color = ?");
      values.push(background_color);
    }

    if (foreground_color) {
      fields.push("foreground_color = ?");
      values.push(foreground_color);
    }

    values.push(Number(color_theme_id));

    const [result]: any = await pool.execute(
      `UPDATE color_theme SET ${fields.join(", ")} WHERE id_color_theme = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucune palette trouvée avec cet ID.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Palette mise à jour avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la modification de la palette de couleur :", error);
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

/**
 * @swagger
 * /api/color-theme/{id}:
 *   get:
 *     summary: Récupère une palette de couleurs.
 *     description: Récupère les détails d'une palette de couleurs en fonction de son ID.
 *     tags:
 *       - color-theme
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la palette à récupérer.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Palette récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ColorTheme'
 *       400:
 *         description: ID invalide ou manquant.
 *       404:
 *         description: Palette non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const color_theme_id = params.id;

    if (!color_theme_id || isNaN(Number(color_theme_id))) {
      return NextResponse.json(
        {
          success: false,
          message: "ID invalide ou manquant.",
        },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.execute(
      `SELECT 
         id_color_theme AS id,
         name,
         background_color AS backgroundColor,
         foreground_color AS foregroundColor,
         created_at AS createdAt
       FROM color_theme
       WHERE id_color_theme = ?`,
      [Number(color_theme_id)]
    );

    if (!rows.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Palette non trouvée.",
        },
        { status: 404 }
      );
    }

    const theme: ColorTheme = rows[0];

    return NextResponse.json(
      {
        success: true,
        data: theme,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la palette :", error);
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