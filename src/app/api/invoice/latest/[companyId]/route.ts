import pool from '@/src/lib/db';
import { NextRequest, NextResponse } from 'next/server';


/**
 * @swagger
 * /api/invoice/latest/{companyId}:
 *   get:
 *     summary: Récupère le dernier numéro de référence d'une facture pour une entreprise
 *     description: >
 *       Renvoie le dernier numéro de référence (`reference_num`) utilisé pour une entreprise,
 *       ainsi que le prochain numéro recommandé, et les préfixes de référence de facturation associés.
 *     tags:
 *       - invoice
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: L'identifiant de l'entreprise
 *     responses:
 *       200:
 *         description: Dernier numéro de référence récupéré avec succès
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
 *                     referenceNum:
 *                       type: integer
 *                       nullable: true
 *                       example: 3
 *                     nextReferenceNum:
 *                       type: integer
 *                       nullable: true
 *                       example: 4
 *                     invoiceOfficeRef:
 *                       type: string
 *                       nullable: true
 *                       example: "RES_"
 *                     invoiceVirtualOfficeRef:
 *                       type: string
 *                       nullable: true
 *                       example: "VIR_"
 *       400:
 *         description: Requête invalide (ID manquant ou incorrect)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Missing companyId"
 *       500:
 *         description: Erreur serveur lors de la récupération de la facture
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
function incrementReferenceNum(ref: number): number {
  return ref + 1;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const companyId = params.companyId;

  if (!companyId) {
    return NextResponse.json(
      { success: false, error: "Missing companyId" },
      { status: 400 }
    );
  }

  try {
    const query = `
      SELECT i.reference_num, c.invoice_office_ref AS invoiceOfficeRef, c.invoice_virtual_office_ref AS invoiceVirtualOfficeRef
      FROM invoice i
      LEFT JOIN virtual_office_offer v ON i.id_virtual_office_offer = v.id_virtual_office_offer
      LEFT JOIN office o ON i.id_office = o.id_office
      LEFT JOIN coworking_offer co ON o.id_coworking_offer = co.id_coworking_offer
      INNER JOIN company c ON c.id_company = co.id_company OR c.id_company = v.id_company
      WHERE c.id_company = ?
      ORDER BY i.created_at DESC
      LIMIT 1
    `;

    const [rows] = await pool.execute(query, [companyId]);

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          referenceNum: null,
          nextReferenceNum: 1,
          invoiceOfficeRef: null,
          invoiceVirtualOfficeRef: null,
        },
      });
    }

    const latestReferenceNum = (rows as any)[0].reference_num;
    const nextReferenceNum = incrementReferenceNum(latestReferenceNum);
    const invoiceOfficeRef = (rows as any)[0].invoiceOfficeRef ?? null;
    const invoiceVirtualOfficeRef = (rows as any)[0].invoiceVirtualOfficeRef ?? null;

    return NextResponse.json({
      success: true,
      data: {
        referenceNum: latestReferenceNum,
        nextReferenceNum,
        invoiceOfficeRef,
        invoiceVirtualOfficeRef,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
