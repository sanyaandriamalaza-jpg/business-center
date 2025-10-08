import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/invoice/single/{id}/update-reservation:
 *   patch:
 *     summary: Met à jour le statut ou le traitement d'une réservation
 *     description: Met à jour le champ `subscription_status` ou `is_processed` d'une facture.
 *     tags:
 *       - reservation
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la facture à mettre à jour
 *         example: 12
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [canceled, confirmed]
 *         required: false
 *         description: Nouveau statut de la réservation
 *       - in: query
 *         name: isProcessed
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Indique si la réservation a été traitée
 *         example: true
 *     responses:
 *       200:
 *         description: Mise à jour réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Paramètres invalides
 *       404:
 *         description: Facture introuvable
 *       409:
 *         description: Conflit (déjà défini)
 *       500:
 *         description: Erreur serveur
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoiceId = Number(params.id);

  if (isNaN(invoiceId) || invoiceId <= 0) {
    return NextResponse.json(
      { success: false, message: "ID de facture invalide." },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const isProcessedRaw = url.searchParams.get("isProcessed");

  // Validation des deux paramètres
  const isUpdatingStatus = !!status;
  const isUpdatingProcessed = isProcessedRaw !== null;

  if (!isUpdatingStatus && !isUpdatingProcessed) {
    return NextResponse.json(
      {
        success: false,
        message: "Veuillez fournir soit 'status', soit 'isProcessed' comme paramètre.",
      },
      { status: 400 }
    );
  }

  if (status && status !== "canceled" && status !== "confirmed") {
    return NextResponse.json(
      {
        success: false,
        message: "Le statut doit être 'canceled' ou 'confirmed'.",
      },
      { status: 400 }
    );
  }

  const isProcessed = isProcessedRaw === "true";

  try {
    const [rows]: any[] = await pool.execute(
      "SELECT subscription_status, is_processed FROM invoice WHERE id_invoice = ?",
      [invoiceId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Facture introuvable." },
        { status: 404 }
      );
    }

    const current = rows[0];

    if (isUpdatingStatus && current.subscription_status === status) {
      return NextResponse.json(
        {
          success: false,
          message: `Le statut est déjà '${status}'.`,
        },
        { status: 409 }
      );
    }

    if (isUpdatingProcessed && current.is_processed === isProcessed) {
      return NextResponse.json(
        {
          success: false,
          message: `Le champ 'is_processed' est déjà à '${isProcessed}'.`,
        },
        { status: 409 }
      );
    }

    // Construire dynamiquement la requête
    let updateQuery = "UPDATE invoice SET ";
    const updateParams: any[] = [];

    if (isUpdatingStatus) {
      updateQuery += "subscription_status = ?";
      updateParams.push(status);
    }

    if (isUpdatingProcessed) {
      if (updateParams.length > 0) updateQuery += ", ";
      updateQuery += "is_processed = ?";
      updateParams.push(isProcessed);
    }

    updateQuery += " WHERE id_invoice = ?";
    updateParams.push(invoiceId);

    await pool.execute(updateQuery, updateParams);

    return NextResponse.json(
      {
        success: true,
        message: "Mise à jour effectuée avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur de mise à jour :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la mise à jour.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}