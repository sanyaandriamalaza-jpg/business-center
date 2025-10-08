import pool from "@/src/lib/db";
import { CoworkingOffer, Invoice, Office } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/invoice/single/{id}:
 *   get:
 *     summary: Récupère une facture par son ID
 *     description: Retourne une facture unique au format structuré.
 *     tags:
 *       - invoice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la facture
 *         schema:
 *           type: integer
 *           example: 5
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
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Facture non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoiceId = Number(params.id);

  if (isNaN(invoiceId) || invoiceId <= 0) {
    return NextResponse.json(
      { success: false, message: "ID invalide." },
      { status: 400 }
    );
  }

  try {
    const query = `
      SELECT
        i.*,
        o.id_office AS office_id,
        o.name AS office_name,
        o.description AS office_description,
        o.features AS office_features,
        o.specific_business_hour AS office_specific_business_hour,
        o.specific_address AS office_specific_address,
        o.max_seat_capacity AS office_max_seat_capacity,
        o.image_url AS office_image_url,
        o.id_coworking_offer AS office_id_coworking_offer,
        o.created_at AS office_created_at,
        o.updated_at AS office_updated_at,
        co.type AS co_type,
        co.description AS co_description,
        co.hourly_rate AS co_hourly_rate,
        co.daily_rate AS co_daily_rate,
        co.features AS co_features,
        co.is_tagged AS co_is_tagged,
        co.tag AS co_tag,
        co.created_at AS co_created_at,
        co.updated_at AS co_updated_at,
        co.id_company AS co_id_company
      FROM invoice i
      LEFT JOIN office o ON i.id_office = o.id_office
      LEFT JOIN coworking_offer co ON co.id_coworking_offer = o.id_coworking_offer
      WHERE i.id_invoice = ?
      LIMIT 1
    `;

    const [rows]: any[] = await pool.execute(query, [invoiceId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Facture non trouvée." },
        { status: 404 }
      );
    }

    const row = rows[0];
    const coworkingOffer: CoworkingOffer = {
      id: row.id_coworking_offer,
      type: row.co_type,
      description: row.co_description,
      hourlyRate: row.co_hourly_rate ? parseFloat(row.co_hourly_rate) : null,
      dailyRate: row.co_daily_rate ? parseFloat(row.co_daily_rate) : null,
      features: row.co_features ? JSON.parse(row.co_features) : [],
      isTagged: row.co_is_tagged,
      tag: row.co_tag,
      createdAt: row.co_created_at,
      updatedAt: row.co_updated_at,
      idCompany: row.co_id_company,
    }


    const office: Office | null = row.office_id
      ? {
        id: row.office_id,
        name: row.office_name,
        description: row.office_description ?? "",
        features: row.office_features ? JSON.parse(row.office_features) : [],
        specificBusinessHour: row.office_specific_business_hour
          ? JSON.parse(row.office_specific_business_hour)
          : null,
        specificAddress: row.office_specific_address
          ? JSON.parse(row.office_specific_address)
          : null,
        maxSeatCapacity: row.office_max_seat_capacity,
        imageUrl: row.office_image_url,
        idCoworkingOffer: row.office_id_coworking_offer,
        coworkingOffer,
        createdAt: new Date(row.office_created_at),
        updatedAt: row.office_updated_at ? new Date(row.office_updated_at) : null,
      }
      : null;

    const invoice: Invoice = {
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
      isProcessed: row.is_processed > 0 ? true : false,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? null,
      idBasicUser: row.id_basic_user,
      idVirtualOfficeOffer: row.id_virtual_office_offer ?? null,
      idAccessCode: row.id_access_code ?? null,
      idOffice: row.id_office ?? null,
      office,
    };

    return NextResponse.json(
      {
        success: true,
        data: invoice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération de la facture.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}