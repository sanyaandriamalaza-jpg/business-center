import { getConnection } from "@/src/lib/db";
import { UserDataSession } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/password-hash:
 *   get:
 *     summary: Récupérer le mot de passe haché d'un utilisateur à partir d‘un email
 *     description: Recherche un utilisateur dans les trois tables (`basic_user`, `admin_user`, `super_admin_user`) et retourne ses informations essentielles, y compris le mot de passe haché, s'il existe.
 *     tags:
 *       - auth
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: L'adresse email de l'utilisateur à rechercher.
 *     responses:
 *       200:
 *         description: Utilisateur trouvé, retourne les informations utilisateur et le mot de passe haché.
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
 *                   example: Mot de passe haché récupéré avec succès.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     email:
 *                       type: string
 *                       example: test@example.com
 *                     password_hash:
 *                       type: string
 *                       example: $2a$12$abc123...
 *                     firstName:
 *                       type: string
 *                       example: Jean
 *                     name:
 *                       type: string
 *                       example: Dupont
 *                     profilePictureUrl:
 *                       type: string
 *                       nullable: true
 *                       example: https://example.com/avatar.jpg
 *                     profileType:
 *                       type: string
 *                       description: Type d'utilisateur (table d'origine)
 *                       enum: [basicUser, adminUser, superAdminUser]
 *                       example: basicUser
 *       400:
 *         description: Adresse email manquante ou invalide.
 *       404:
 *         description: Aucun utilisateur trouvé avec cette adresse email.
 *       500:
 *         description: Erreur interne du serveur.
 */
export async function GET(request: NextRequest) {
  try {
    // Extraction de l'email depuis la query string (ex: ?email=test@example.com)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse email manquante",
        },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    const query = `
      SELECT id_basic_user AS id, email, password_hash, first_name AS firstName, name, profile_picture_url AS profilePictureUrl, 'basicUser' AS user_type
      FROM basic_user WHERE email = ?
      UNION
      SELECT id_admin_user AS id, email, password_hash, first_name AS firstName, name, profile_picture_url AS profilePictureUrl, 'adminUser' AS user_type
      FROM admin_user WHERE email = ?
      UNION
      SELECT id_super_admin_user AS id, email, password_hash, first_name AS firstName, name, profile_picture_url AS profilePictureUrl, 'superAdminUser' AS user_type
      FROM super_admin_user WHERE email = ?
      LIMIT 1
    `;

    const [rows]: any = await connection.execute(query, [email, email, email]);
    await connection.end();

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucun utilisateur trouvé avec cette adresse email.",
        },
        { status: 404 }
      );
    }

    const user = rows[0];

    const data: UserDataSession = {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      firstName: user.firstName,
      name: user.name,
      profilePictureUrl: user.profilePictureUrl ?? null,
      profileType : user.user_type
    };

    return NextResponse.json(
      {
        success: true,
        message: "Mot de passe haché récupéré avec succès.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du mot de passe haché :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne lors de la récupération du mot de passe haché.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}