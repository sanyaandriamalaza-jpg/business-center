import pool from "@/src/lib/db"
import { RowDataPacket } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server"


/**
 * @swagger
 * components:
 *   schemas:
 * /api/user/basic-user:
 *   get:
 *     summary: Récupère les admins et les utilisateurs d'une entreprise
 *     description: Retourne tous les administrateurs et utilisateurs de base d'une entreprise donnée par son ID. Les utilisateurs bannis sont exclus.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: id_company
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'entreprise dont on veut récupérer les utilisateurs
 *     responses:
 *       200:
 *         description: Succès - renvoie la liste des admins et des utilisateurs
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
 *                 admin:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminUser'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BasicUser'
 *       400:
 *         description: Paramètre manquant ou invalide
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
 *                   example: "Un identifiant valide d’entreprise est requis."
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Erreur serveur lors de la récupération des utilisateurs"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("id_company");

    if (!companyId || isNaN(Number(companyId))) {
      return NextResponse.json(
        { success: false, message: "Un identifiant valide d’entreprise est requis." },
        { status: 400 }
      );
    }

    const [userRows] = await pool.query<RowDataPacket[]>(
      `
        SELECT 
          bu.id_basic_user AS id,
          bu.name,
          bu.first_name AS firstName,
          bu.email,
          bu.phone,
          bu.address_line AS addressLine,
          bu.city,
          bu.state,
          bu.postal_code AS postalCode,
          bu.country,
          bu.profile_picture_url AS profilePictureUrl,
          bu.created_at AS createdAt,
          bu.updated_at AS updatedAt,
          bu.is_banned AS isBanned,
          bu.id_company
        FROM basic_user bu
        WHERE bu.id_company = ? AND (bu.is_banned = FALSE OR bu.is_banned IS NULL)
        ORDER BY bu.created_at DESC
      `,
      [companyId]
    );

    return NextResponse.json({
      success: true,
      count: userRows.length,
      data: userRows,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération des utilisateurs",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
