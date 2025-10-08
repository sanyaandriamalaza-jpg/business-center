import pool from "@/src/lib/db";
import { Formule, Invoice } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/invoice/single?id_basic_user={id_basic_user}:
 *   get:
 *     summary: Récupérer une facture par ID utilisateur
 *     description: Récupère une facture avec les détails de l'offre de bureau virtuel associée pour un utilisateur donné
 *     tags:
 *       - Invoice
 *     parameters:
 *       - in: query
 *         name: id_basic_user
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de l'utilisateur basique
 *         example: 123
 *     responses:
 *       200:
 *         description: Facture récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID de la facture
 *                       example: 456
 *                     reference:
 *                       type: string
 *                       description: Référence de la facture
 *                       example: "INV-2024-001"
 *                     referenceNum:
 *                       type: string
 *                       description: Numéro de référence
 *                       example: "001"
 *                     user:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Dupont"
 *                         firstName:
 *                           type: string
 *                           example: "Jean"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "jean.dupont@email.com"
 *                         addressLine:
 *                           type: string
 *                           example: "123 Rue de la Paix"
 *                         city:
 *                           type: string
 *                           example: "Paris"
 *                         state:
 *                           type: string
 *                           example: "Île-de-France"
 *                         postalCode:
 *                           type: string
 *                           example: "75001"
 *                         country:
 *                           type: string
 *                           example: "France"
 *                     issueDate:
 *                       type: string
 *                       format: date-time
 *                       description: Date d'émission de la facture
 *                       example: "2024-01-15T10:30:00Z"
 *                     startSubscription:
 *                       type: string
 *                       format: date-time
 *                       description: Date de début de l'abonnement
 *                       example: "2024-01-15T00:00:00Z"
 *                     duration:
 *                       type: integer
 *                       description: Durée de l'abonnement
 *                       example: 12
 *                     durationType:
 *                       type: string
 *                       description: Type de durée (mois, années, etc.)
 *                       example: "mois"
 *                     note:
 *                       type: string
 *                       description: Note associée à la facture
 *                       example: "Abonnement premium"
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                       description: Montant total TTC
 *                       example: 299.99
 *                     amountNet:
 *                       type: number
 *                       format: decimal
 *                       description: Montant net HT
 *                       example: 249.99
 *                     currency:
 *                       type: string
 *                       description: Devise
 *                       example: "EUR"
 *                     status:
 *                       type: string
 *                       description: Statut de la facture
 *                       example: "paid"
 *                     subscriptionStatus:
 *                       type: string
 *                       description: Statut de l'abonnement
 *                       example: "active"
 *                     paymentMethod:
 *                       type: string
 *                       description: Méthode de paiement
 *                       example: "stripe"
 *                     stripePaymentId:
 *                       type: string
 *                       description: ID du paiement Stripe
 *                       example: "pi_1234567890"
 *                     isProcessed:
 *                       type: boolean
 *                       description: Indique si la facture a été traitée
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création
 *                       example: "2024-01-15T10:30:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: Date de dernière mise à jour
 *                       example: "2024-01-16T14:20:00Z"
 *                     idBasicUser:
 *                       type: integer
 *                       description: ID de l'utilisateur basique
 *                       example: 123
 *                     idVirtualOfficeOffer:
 *                       type: integer
 *                       nullable: true
 *                       description: ID de l'offre de bureau virtuel
 *                       example: 789
 *                     idAccessCode:
 *                       type: integer
 *                       nullable: true
 *                       description: ID du code d'accès
 *                       example: 101112
 *                     virtualOfficeOffer:
 *                       type: object
 *                       nullable: true
 *                       description: Détails de l'offre de bureau virtuel associée
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 789
 *                         name:
 *                           type: string
 *                           example: "Bureau Virtuel Premium"
 *                         description:
 *                           type: string
 *                           example: "Offre complète de bureau virtuel avec services premium"
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Adresse prestigieuse", "Réception courrier", "Salle de réunion"]
 *                         monthlyPrice:
 *                           type: number
 *                           format: decimal
 *                           example: 99.99
 *                         idCompany:
 *                           type: integer
 *                           example: 456
 *       400:
 *         description: Paramètre id_basic_user invalide
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
 *                   example: "id_basic_user invalide."
 *       404:
 *         description: Facture non trouvée
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
 *                   example: "Facture non trouvée."
 *       500:
 *         description: Erreur serveur interne
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
 *                   example: "Erreur serveur lors de la récupération de la facture."
 *                 error:
 *                   type: string
 *                   description: Message d'erreur détaillé
 *                   example: "Database connection failed"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idBasicUserParam = searchParams.get("id_basic_user");
  const idBasicUser = idBasicUserParam ? Number(idBasicUserParam) : null;

  try {
    let query = `
      SELECT
        i.*,
        vo.id_virtual_office_offer AS offerId,
        vo.name AS offerName,
        vo.description AS offerDescription,
        vo.features AS offerFeatures,
        vo.price AS offerPrice,
        vo.id_company AS companyId
      FROM invoice i
      LEFT JOIN virtual_office_offer vo 
        ON i.id_virtual_office_offer = vo.id_virtual_office_offer
    `;

    const params: any[] = [];

    if (idBasicUser && !isNaN(idBasicUser)) {
      query += ` WHERE i.id_basic_user = ?`;
      params.push(idBasicUser);
    }

    const [rows]: any[] = await pool.execute(query, params);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Aucune facture trouvée." },
        { status: 404 }
      );
    }

    const invoices: Invoice[] = rows.map((row: any) => {
      const virtualOfficeOffer: Formule | null = row.offerId
        ? {
            id: row.offerId,
            name: row.offerName,
            description: row.offerDescription ?? "",
            features: row.offerFeatures ? JSON.parse(row.offerFeatures) : [],
            monthlyPrice: row.offerPrice,
            idCompany: row.companyId,
          }
        : null;

      return {
        id: row.id_invoice,
        reference: row.reference,
        referenceNum: row.reference_num,
        user: {
          name: row.user_name,
          firstName: row.user_first_name,
          email: row.user_email,
          addressLine: row.user_address_line,
          city: row.user_city,
          state: row.user_state,
          postalCode: row.user_postal_code,
          country: row.user_country,
        },
        issueDate: row.issue_date,
        startSubscription: row.start_subscription,
        duration: row.duration,
        durationType: row.duration_type,
        note: row.note ?? "",
        amount: row.amount,
        amountNet: row.amount_net,
        currency: row.currency,
        status: row.status,
        subscriptionStatus: row.subscription_status,
        paymentMethod: row.payment_method,
        stripePaymentId: row.stripe_payment_id,
        isProcessed: row.is_processed > 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at ?? null,
        idBasicUser: row.id_basic_user,
        idVirtualOfficeOffer: row.id_virtual_office_offer ?? null,
        idAccessCode: row.id_access_code ?? null,
        virtualOfficeOffer,
      };
    });

    return NextResponse.json(
      { success: true, data: invoices },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des factures :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération des factures.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}