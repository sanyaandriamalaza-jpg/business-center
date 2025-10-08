import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const isSandbox = process.env.YOUSIGN_MODE === 'sandbox';

    // Vérification HMAC uniquement en production
    if (!isSandbox) {
      const signature = request.headers.get('x-yousign-signature');
      const timestamp = request.headers.get('x-yousign-timestamp');
      const webhookSecret = process.env.YOUSIGN_WEBHOOK_SECRET;
      if (!signature || !timestamp || !webhookSecret) {
        return NextResponse.json(
          { success: false, error: 'En-têtes manquants ou secret non configuré' },
          { status: 400 }
        );
      }
    } else {
      console.log('Mode sandbox : HMAC ignoré');
    }

    const signatureRequest = body.event_data?.signature_request;
    const contractFileId = signatureRequest?.metadata?.contractFileId;
    const signerType = signatureRequest?.metadata?.signerType;
    const signatureRequestId = body.event_data?.signature_request.id;

    if (!contractFileId) {
      return NextResponse.json({ success: false, error: 'ContractFileId manquant' }, { status: 400 });
    }

    switch (body.event_name) {
      case 'signature_request.signed':
        await handleSignedEvent(contractFileId, signerType, signatureRequest);
        break;

      case 'signature_request.completed':
        await handleCompletedEvent(contractFileId, signatureRequestId);
        break;

      default:
        console.log('Événement non traité (sandbox ou prod) :', body.event_name);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function handleSignedEvent(contractFileId: string, signerType: string, signatureRequest: any) {
  const updateField = signerType === 'admin' ? 'is_signedBy_admin = 1' : 'is_signedBy_user = 1';

  await pool.execute(
    `UPDATE contract_file 
     SET ${updateField}, yousign_signature_date = NOW() 
     WHERE id_contract_file = ?`,
    [contractFileId]
  );

  console.log(`Document ${contractFileId} signé par ${signerType}`);
}

async function handleCompletedEvent(contractFileId: string, signatureRequest: any) {
  await pool.execute(
    `UPDATE contract_file 
     SET signature_status = 'completed',is_signedBy_admin = 1, yousign_completion_date = NOW() 
     WHERE id_contract_file = ?`,
    [contractFileId]
  );

  await checkAndActivateVirtualOffice(contractFileId);
}

async function checkAndActivateVirtualOffice(contractFileId: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT cf.id_company, cf.id_basic_user
    FROM contract_file cf
    WHERE cf.id_contract_file = ?
  `, [contractFileId]);

  if (rows.length === 0) return;

  const { id_company, id_basic_user } = rows[0];

  const [signedRows] = await pool.execute<RowDataPacket[]>(`
    SELECT 
      SUM(is_signedBy_admin) as admin_signed,
      SUM(is_signedBy_user) as user_signed,
      COUNT(*) as total_documents
    FROM contract_file 
    WHERE id_company = ? AND id_basic_user = ?
  `, [id_company, id_basic_user]);

  if (signedRows.length > 0) {
    const { admin_signed, user_signed, total_documents } = signedRows[0];
    console.log(`Documents signés : admin ${admin_signed}, user ${user_signed}, total ${total_documents}`);
  }
}

// async function ckeckFullySigned (signatureRequestId: string) {
//   const docsRes = await yousignApi.get(`/signature_requests/${signatureRequestId}/documents`);
      
//       if (!docsRes.data || docsRes.data.length === 0) {
//         throw new Error("Aucun document trouvé pour cette procédure");
//       }
// }
