import { getConnection } from "@/src/lib/db";
import { ResultSetHeader } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import { cryptmessage } from "@/src/lib/customfunction";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     description: Cette route permet de créer un utilisateur en enregistrant son nom, prénom, email et mot de passe crypté.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - first_name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de famille de l'utilisateur
 *                 example: Dupont
 *               first_name:
 *                 type: string
 *                 description: Prénom de l'utilisateur
 *                 example: Jean
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email unique
 *                 example: jean.dupont@example.com
 *               password:
 *                 type: string
 *                 description: Mot de passe en clair (sera crypté côté serveur)
 *                 example: motdepasse123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
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
 *                   example: Utilisateur créé avec succès
 *                 id:
 *                   type: integer
 *                   description: ID généré de l'utilisateur dans la base de données
 *                   example: 123
 *       400:
 *         description: Erreur - l'email est déjà utilisé
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
 *                   example: Un utilisateur avec cet email existe déjà
 *       500:
 *         description: Erreur serveur interne lors de l'inscription
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
 *                   example: Erreur lors de l'inscription
 *                 error:
 *                   type: string
 *                   description: Message d'erreur technique (pour debug)
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, first_name, email, password } = body;

        const connection = await getConnection();

        // Vérifier si l'email existe déjà
        const [rows] = await connection.execute(
            `
            SELECT email FROM basic_user WHERE email = ?
            UNION
            SELECT email FROM admin_user WHERE email = ?
            UNION
            SELECT email FROM super_admin_user WHERE email = ?
            `,
            [email, email, email]
        );

        if ((rows as any[]).length > 0) {
            await connection.end();
            return NextResponse.json(
                {
                    success: false,
                    message: "Un utilisateur avec cet email existe déjà",
                },
                { status: 400 }
            );
        }

        const query = `
            INSERT INTO basic_user (
                name,
                first_name,
                email,
                password_hash,
                created_at
            ) VALUES (?, ?, ?, ?, NOW())
        `;

        const passwordHash = await cryptmessage(password);
        const [result] = await connection.execute<ResultSetHeader>(query, [
            name,
            first_name,
            email,
            passwordHash,
        ]);

        await connection.end();

        return NextResponse.json(
            {
                success: true,
                message: "Utilisateur créé avec succès",
                id: result.insertId,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error fetching data:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Erreur lors de l'inscription",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
