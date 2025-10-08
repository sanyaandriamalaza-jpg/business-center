import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/src/lib/db";

/**
 * @swagger
 * /api/virtual-office-offer/{id}:
 *   get:
 *     summary: Récupère une offre de domiciliation par ID
 *     description: Retourne une offre spécifique avec les informations de l'entreprise liée.
 *     tags:
 *       - Virtual Office Offer
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'offre de bureau virtuel
 *     responses:
 *       200:
 *         description: Offre trouvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/VirtualOfficeOffer"
 *       404:
 *         description: Offre non trouvée
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
 *                   example: "Offre non trouvée"
 *       400:
 *         description: ID invalide
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
 *                   example: "ID invalide"
 *       500:
 *         description: Erreur interne
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
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

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
      WHERE vo.id_virtual_office_offer = ?
      LIMIT 1
    `;

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Offre non trouvée",
                },
                { status: 404 }
            );
        }

        const row = rows[0];
        const offer = {
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
        };

        return NextResponse.json({
            success: true,
            data: offer,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'offre :", error);
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
 * /api/virtual-office-offer/{id}:
 *   patch:
 *     summary: Met à jour une offre de domiciliation
 *     description: Permet de modifier les informations d’une offre existante (partiellement ou totalement).
 *     tags:
 *       - Virtual Office Offer
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'offre à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/VirtualOfficeOffer"
 *     responses:
 *       200:
 *         description: Offre mise à jour avec succès
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
 *                   example: Offre mise à jour avec succès
 *       400:
 *         description: Aucune donnée fournie pour la mise à jour
 *       404:
 *         description: Offre non trouvée
 *       500:
 *         description: Erreur interne
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;
      const body = await request.json();
  
      const fields: string[] = [];
      const values: any[] = [];
  
      if (body.name) {
        fields.push("name = ?");
        values.push(body.name);
      }
      if (body.description) {
        fields.push("description = ?");
        values.push(body.description);
      }
      if (body.features) {
        fields.push("features = ?");
        values.push(JSON.stringify(body.features));
      }
      if (body.price !== undefined) {
        fields.push("price = ?");
        values.push(body.price);
      }
      if (body.is_tagged !== undefined) {
        fields.push("is_tagged = ?");
        values.push(body.is_tagged);
      }
      if (body.tag !== undefined) {
        fields.push("tag = ?");
        values.push(body.tag);
      }
  
      if (fields.length === 0) {
        return NextResponse.json(
          { success: false, message: "Aucune donnée à mettre à jour" },
          { status: 400 }
        );
      }
  
      values.push(id);
  
      const query = `
        UPDATE virtual_office_offer 
        SET ${fields.join(", ")} 
        WHERE id_virtual_office_offer = ?
      `;
  
      const [result] = await pool.execute<ResultSetHeader>(query, values);
  
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: "Offre non trouvée" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        success: true,
        message: "Offre mise à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'offre :", error);
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
 * /api/virtual-office-offer/{id}:
 *   delete:
 *     summary: Supprime une offre de domiciliation
 *     description: Permet de supprimer définitivement une offre par son ID.
 *     tags:
 *       - Virtual Office Offer
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'offre à supprimer
 *     responses:
 *       200:
 *         description: Offre supprimée avec succès
 *       404:
 *         description: Offre non trouvée
 *       500:
 *         description: Erreur interne
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;
  
      const query = `DELETE FROM virtual_office_offer WHERE id_virtual_office_offer = ?`;
      const [result] = await pool.execute<ResultSetHeader>(query, [id]);
  
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: "Offre non trouvée" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        success: true,
        message: "Offre supprimée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'offre :", error);
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
