import pool from "@/src/lib/db";
import { CoworkingOffer, Invoice, InvoiceStatus, invoiceStatusList, Office, subscriptionStatusList } from "@/src/lib/type";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * @swagger
 * /api/invoice:
 *   post:
 *     summary: Crée une nouvelle facture
 *     description: Enregistre une facture à partir des informations utilisateur et d'abonnement.
 *     tags:
 *       - invoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *               - referenceNum
 *               - userName
 *               - userFirstName
 *               - userEmail
 *               - startSubscription
 *               - duration
 *               - durationType
 *               - amount
 *               - currency
 *               - status
 *               - paymentMethod
 *               - idBasicUser
 *             properties:
 *               reference:
 *                 type: string
 *                 example: "FACT-2025-001"
 *               referenceNum:
 *                 type: number
 *                 example: 1
 *               userName:
 *                 type: string
 *                 example: "Dupont"
 *               userFirstName:
 *                 type: string
 *                 example: "Marie"
 *               userEmail:
 *                 type: string
 *                 example: "dupont@email.fr"
 *               userAddressLine:
 *                 type: string
 *                 example: "12 rue de la République"
 *                 nullable: true
 *               userCity:
 *                 type: string
 *                 example: "Paris"
 *                 nullable: true
 *               userState:
 *                 type: string
 *                 example: "Île-de-France"
 *                 nullable: true
 *               userPostalCode:
 *                 type: string
 *                 example: "75001"
 *                 nullable: true
 *               userCountry:
 *                 type: string
 *                 example: "France"
 *                 nullable: true
 *               startSubscription:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-22"
 *               duration:
 *                 type: number
 *                 example: 12
 *               durationType:
 *                 type: string
 *                 enum: [hourly, daily, monthly, annualy]
 *                 example: "monthly"
 *               amount:
 *                 type: number
 *                 example: 1200.50
 *               amountNet:
 *                 type: number
 *                 example: 1150.25
 *                 nullable: true
 *               currency:
 *                 type: string
 *                 example: "EUR"
 *               status:
 *                 type: string
 *                 example: "paid"
 *               paymentMethod:
 *                 type: string
 *                 example: "card"
 *               stripePaymentId:
 *                 type: string
 *                 example: "pi_3Nd3Gx..."
 *                 nullable: true
 *               idBasicUser:
 *                 type: number
 *                 example: 3
 *               idVirtualOfficeOffer:
 *                 type: number
 *                 example: 1
 *                 nullable: true
 *               idAccessCode:
 *                 type: number
 *                 example: 4
 *                 nullable: true
 *               idOffice:
 *                 type: number
 *                 example: 2
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Facture créée avec succès
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
 *                   example: "Facture créée avec succès."
 *                 insertedId:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Erreur de validation des champs
 *       500:
 *         description: Erreur serveur lors de la création de la facture
 */


const invoiceSchema = z.object({
  reference: z.string().nonempty("La référence est obligatoire."),
  referenceNum: z.number({
    required_error: "Le numéro de la référence est obligatoire.",
    invalid_type_error: "Le numéro de la référence doit être un nombre.",
  }),
  userName: z.string().nonempty("Le nom du client est obligatoire."),
  userFirstName: z.string().nonempty("Le prénom du client est obligatoire."),
  userEmail: z.string().email().nonempty("L‘adresse email du client est obligatoire."),
  userAddressLine: z.string().optional().nullable(),
  userCity: z.string().optional().nullable(),
  userState: z.string().optional().nullable(),
  userPostalCode: z.string().optional().nullable(),
  userCountry: z.string().optional().nullable(),
  startSubscription: z.string().nonempty("La date de début est obligatoire."),
  duration: z.number().min(1, "La durée doit être supérieure à 0."),
  durationType: z.enum(["hourly", "daily", "monthly", "annualy"]),
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0."),
  amountNet: z.number().optional().nullable(),
  currency: z.string().nonempty("L’unité monétaire est obligatoire."),
  status: z
    .enum(invoiceStatusList as unknown as [string, ...string[]], {
      errorMap: () => ({ message: "Le statut est invalide. Veuillez choisir un statut valide." }),
    }),
  paymentMethod: z.string().nonempty("La méthode de paiement est obligatoire."),
  stripePaymentId: z.string().optional(),
  idBasicUser: z.number({
    required_error: "L‘id de l‘utilisateur est requis.",
    message: "Veuillez fournir l‘id de l‘utilisateur"
  }),
  idVirtualOfficeOffer: z.number().optional().nullable(),
  idAccessCode: z.number().optional().nullable(),
  idOffice: z.number().optional().nullable(),
  note: z.string().optional().nullable()
});


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = invoiceSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errorsList = Object.entries(fieldErrors).map(([field, messages]) => ({
        field,
        message: messages?.join(", ") || "Erreur inconnue",
      }));

      return NextResponse.json(
        {
          success: false,
          message: `Champs invalides ${JSON.stringify(errorsList)}`,
          errors: errorsList,
        },
        { status: 400 }
      );
    }

    const {
      reference,
      referenceNum,
      userName,
      userFirstName,
      userEmail,
      userAddressLine,
      userCity,
      userState,
      userPostalCode,
      userCountry,
      startSubscription,
      duration,
      durationType,
      amount,
      amountNet,
      currency,
      status,
      paymentMethod,
      stripePaymentId,
      idBasicUser,
      idVirtualOfficeOffer,
      idAccessCode,
      idOffice,
      note
    } = parsed.data;

    const query = `
      INSERT INTO invoice (
        reference,
        reference_num,
        user_name,
        user_first_name,
        user_email,
        user_address_line,
        user_city,
        user_state,
        user_postal_code,
        user_country,
        issue_date,
        start_subscription,
        duration,
        duration_type,
        note,
        amount,
        amount_net,
        currency,
        status,
        subscription_status,
        payment_method,
        stripe_payment_id,
        created_at,
        id_basic_user,
        id_virtual_office_offer,
        id_access_code,
        id_office
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
    `;

    const queryParams = [
      reference,
      referenceNum,
      userName,
      userFirstName,
      userEmail,
      userAddressLine ?? "",
      userCity ?? "",
      userState ?? "",
      userPostalCode ?? "",
      userCountry ?? "",
      new Date(startSubscription),
      duration,
      durationType,
      note  ?? null,
      amount,
      amountNet ?? null,
      currency,
      status,
      status === "paid" ? "confirmed" : "pending",
      paymentMethod,
      stripePaymentId ?? null,
      idBasicUser,
      idVirtualOfficeOffer ?? null,
      idAccessCode ?? null,
      idOffice ?? null,
    ];

    const [result]: any = await pool.execute(query, queryParams);

    return NextResponse.json(
      {
        success: true,
        message: "Facture créée avec succès.",
        insertedId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la facture :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la création de la facture.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}


/**
 * @swagger
 * /api/invoice:
 *   get:
 *     summary: Récupère toutes les factures
 *     description: Retourne une liste des factures structurées. Vous pouvez filtrer par `idOffice`, `idVirtualOfficeOffer` ou `type` (bureau ou domiciliation).
 *     tags:
 *       - invoice
 *     parameters:
 *       - in: query
 *         name: idOffice
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID du bureau physique (Office)
 *         example: 2
 *       - in: query
 *         name: idVirtualOfficeOffer
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID de l’offre de domiciliation (Virtual Office)
 *         example: 3
 *       - in: query
 *         name: type
 *         required: false
 *         description: >
 *           Type de facture :  
 *           - `office` pour les réservations de bureau  
 *           - `virtual-office-offer` pour les offres de domiciliation
 *         schema:
 *           type: string
 *           enum:
 *             - office
 *             - virtual-office-offer
 *         example: office
 *     responses:
 *       200:
 *         description: Liste des factures récupérée avec succès
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *       500:
 *         description: Erreur serveur lors de la récupération des factures
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idOffice = searchParams.get("idOffice");
    const idVirtualOfficeOffer = searchParams.get("idVirtualOfficeOffer");
    const type = searchParams.get("type"); // "office" | "virtual-office-offer"

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (idOffice) {
      conditions.push("i.id_office = ?");
      values.push(Number(idOffice));
    }

    if (idVirtualOfficeOffer) {
      conditions.push("i.id_virtual_office_offer = ?");
      values.push(Number(idVirtualOfficeOffer));
    }


    if (type === "office") {
      conditions.push("i.id_office IS NOT NULL");
    } else if (type === "virtual-office-offer") {
      conditions.push("i.id_virtual_office_offer IS NOT NULL");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
      LEFT JOIN coworking_offer co ON o.id_coworking_offer = co.id_coworking_offer
      ${whereClause}
      ORDER BY i.created_at DESC
    `;

    const [rows] = await pool.query(query, values);

    const invoices = (rows as any[]).map((row) => {
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

      const office: Office = {
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
      };

      const data: Invoice = {
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
        idOffice: row.id_office ?? null,
        office: row.office_id ? office : null,
      }
      return data
    });

    return NextResponse.json(
      {
        success: true,
        count: invoices.length,
        data: invoices,
      },
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