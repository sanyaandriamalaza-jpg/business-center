import pool from "@/src/lib/db";
import { BasicUser } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/basic-user/{id}:
 *   get:
 *     summary: Récupère un utilisateur basic_user par ID.
 *     description: Retourne les informations d'un utilisateur de type `basic_user` depuis la table `basic_user`.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de l'utilisateur basic_user
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BasicUser'
 *       400:
 *         description: ID invalide ou manquant.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "ID invalide ou manquant."
 *       404:
 *         description: Utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Utilisateur non trouvé."
 *       500:
 *         description: Erreur serveur lors de la récupération de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               example:
 *                 success: false
 *                 message: "Erreur serveur lors de la récupération de l'utilisateur."
 *                 error: "Détail de l'erreur ici"
 *
 */

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id_basic_user = params.id;

    if (!id_basic_user || isNaN(Number(id_basic_user))) {
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
        bu.id_basic_user AS id,
        bu.name,
        bu.first_name AS firstName,
        bu.email,
        bu.phone,
        bu.address_line AS addressLine,
        bu.city AS city,
        bu.state AS state,
        bu.postal_code AS postalCode,
        bu.country AS country,
        bu.profile_picture_url AS profilePictureUrl,
        bu.created_at AS createdAt,
        bu.updated_at AS updatedAt,
        bu.is_banned AS isBanned

      FROM basic_user bu
      WHERE bu.id_basic_user = ?
      `,
            [Number(id_basic_user)]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Utilisateur non trouvé.",
                },
                { status: 404 }
            );
        }

        const row = rows[0];

        const basicUser: BasicUser = {
            id: row.id,
            name: row.name,
            firstName: row.firstName,
            email: row.email,
            phone: row.phone,
            addressLine: row.addressLine,
            city: row.city,
            state: row.state,
            postalCode: row.postalCode,
            country: row.country,
            profilePictureUrl: row.profilePictureUrl,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            isBanned: row.isBanned
        };

        return NextResponse.json(
            {
                success: true,
                data: basicUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur GET basic_user by id:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Erreur serveur lors de la récupération de l‘utilisateur.",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/user/basic-user/{id}:
 *   patch:
 *     summary: Mettre à jour les informations d'un utilisateur
 *     description: Met à jour partiellement les informations d'un utilisateur par son ID. Seuls les champs fournis seront mis à jour.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           examples:
 *             example1:
 *               summary: Mise à jour des informations de base
 *               value:
 *                 name: "Dupont"
 *                 firstName: "Jean"
 *                 phone: "+33123456789"
 *                 email: "jean.dupont@email.com"
 *             example2:
 *               summary: Mise à jour de l'adresse
 *               value:
 *                 addressLine: "123 Rue de la Paix"
 *                 city: "Paris"
 *                 postalCode: "75001"
 *                 country: "France"
 *             example3:
 *               summary: Mise à jour du statut
 *               value:
 *                 isBanned: true
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Données invalides ou ID incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email déjà utilisé par un autre utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const FIELD_MAPPING: { [key: string]: string } = {
    name: 'name',
    firstName: 'first_name',
    phone: 'phone',
    email: 'email',
    addressLine: 'address_line',
    city: 'city',
    state: 'state',
    postalCode: 'postal_code',
    country: 'country',
    profilePictureUrl: 'profile_picture_url',
    officeName : 'virtualOfficeName',
    officeLegalForm : 'virtualOfficeLegalForm',
    officeSiret : 'virtualOfficeSiret',
    isBanned: 'is_banned',
    id_company: 'id_company'
  };
  
  // Champs autorisés pour la mise à jour
  const ALLOWED_FIELDS = new Set([
    'name', 'firstName', 'phone', 'email', 'addressLine',
    'city', 'state', 'postalCode', 'country', 'profilePictureUrl', 'virtualOfficeName', 'virtualOfficeLegalForm', 'virtualOfficeSiret',
    'isBanned', 'id_company'
  ]);
  
  // Champs qui nécessitent une validation spécifique
  const VALIDATION_RULES: { [key: string]: (value: any) => boolean } = {
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value: string) => typeof value === 'string' && value.length <= 20,
    isBanned: (value: any) => typeof value === 'boolean',
    id_company: (value: any) => value === null || Number.isInteger(Number(value))
  };
  
  
  export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const userId = params.id;
  
      if (!userId || isNaN(Number(userId))) {
        return NextResponse.json(
          { success: false, message: "ID utilisateur invalide" },
          { status: 400 }
        );
      }
  
      const body = await request.json();
  
      if (!body || Object.keys(body).length === 0) {
        return NextResponse.json(
          { success: false, message: "Aucune donnée à mettre à jour" },
          { status: 400 }
        );
      }
  
      const updateData: { [key: string]: any } = {};
      const errors: string[] = [];
  
      for (const [field, value] of Object.entries(body)) {
        if (!ALLOWED_FIELDS.has(field)) {
          errors.push(`Champ non autorisé: ${field}`);
          continue;
        }
  
        if (value === undefined || (value === null && field !== 'id_company')) {
          errors.push(`Valeur invalide pour le champ: ${field}`);
          continue;
        }
  
        if (VALIDATION_RULES[field] && !VALIDATION_RULES[field](value)) {
          errors.push(`Format invalide pour le champ: ${field}`);
          continue;
        }
  
        updateData[field] = value;
      }
  
      if (errors.length > 0) {
        return NextResponse.json(
          { success: false, message: "Données invalides", errors },
          { status: 400 }
        );
      }
  
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { success: false, message: "Aucune donnée valide à mettre à jour" },
          { status: 400 }
        );
      }

      const [userCheckRows] = await pool.query(
        `SELECT id_basic_user, email FROM basic_user WHERE id_basic_user = ?`,
        [userId]
      );
  
      if ((userCheckRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
  
      const existingUser = (userCheckRows as any[])[0];
 
      if (updateData.email && updateData.email !== existingUser.email) {
        const [emailCheckRows] = await pool.query(
          `SELECT id_basic_user FROM basic_user WHERE email = ? AND id_basic_user != ?`,
          [updateData.email, userId]
        );
  
        if ((emailCheckRows as any[]).length > 0) {
          return NextResponse.json(
            { success: false, message: "L'email est déjà utilisé" },
            { status: 409 }
          );
        }
      }
  
      // Construire la requête dynamiquement
      const updateFields: string[] = [];
      const updateValues: any[] = [];
  
      for (const [field, value] of Object.entries(updateData)) {
        const dbField = FIELD_MAPPING[field] || field;
        updateFields.push(`${dbField} = ?`);
        updateValues.push(value);
      }
  
      updateFields.push("updated_at = NOW()");
      
      updateValues.push(userId);
  
      const query = `
        UPDATE basic_user 
        SET ${updateFields.join(", ")}
        WHERE id_basic_user = ?
      `;
  
      await pool.query(query, updateValues);
  
      // Récupérer l'utilisateur mis à jour
      const [updatedUserRows] = await pool.query(
        `
          SELECT 
            id_basic_user AS id,
            name,
            first_name AS firstName,
            email,
            phone,
            address_line AS addressLine,
            city,
            state,
            postal_code AS postalCode,
            country,
            profile_picture_url AS profilePictureUrl,
            virtualOfficeName AS officeName,
            virtualOfficeLegalForm AS officeLegalForm,
            virtualOfficeSiret AS officeSiret,
            created_at AS createdAt,
            updated_at AS updatedAt,
            is_banned AS isBanned,
            id_company
          FROM basic_user 
          WHERE id_basic_user = ?
        `,
        [userId]
      );
  
      const updatedUser = (updatedUserRows as any[])[0];
  
      return NextResponse.json({
        success: true,
        message: "Utilisateur mis à jour avec succès",
        data: updatedUser,
      });
  
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur serveur lors de la mise à jour de l'utilisateur",
          error: (error as Error).message,
        },
        { status: 500 }
      );
    }
  }

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime définitivement un utilisateur par son ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
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
 *                 deletedUserId:
 *                   type: integer
 *       400:
 *         description: ID utilisateur invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const userId = params.id;
  
      if (!userId || isNaN(Number(userId))) {
        return NextResponse.json(
          { success: false, message: "ID utilisateur invalide" },
          { status: 400 }
        );
      }
 
      const [userCheckRows] = await pool.query(
        `SELECT id_basic_user, name, first_name FROM basic_user WHERE id_basic_user = ?`,
        [userId]
      );
  
      if ((userCheckRows as any[]).length === 0) {
        return NextResponse.json(
          { success: false, message: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
  
      const user = (userCheckRows as any[])[0];
  
      const [deleteResult] = await pool.query(
        `DELETE FROM basic_user WHERE id_basic_user = ?`,
        [userId]
      );
  
      const result = deleteResult as any;
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: "Échec de la suppression de l'utilisateur" },
          { status: 500 }
        );
      }
  
      return NextResponse.json({
        success: true,
        message: `Utilisateur ${user.first_name} ${user.name} supprimé avec succès`,
        deletedUserId: Number(userId),
      });
  
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur serveur lors de la suppression de l'utilisateur",
          error: (error as Error).message,
        },
        { status: 500 }
      );
    }
  }
