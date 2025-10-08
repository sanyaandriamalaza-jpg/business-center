import axios from 'axios';
import FormData from 'form-data';
import pool from './db';

interface Signer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  locale?: string;
  positionX : number;
  positionY : number;
}

interface SignatureProcedureData {
  procedureName: string;
  metadata?: Record<string, any>;
  fileBase64: string;
  documentName: string;
  pageToSign : number;
  signers: Signer[];
}

const yousignApi = axios.create({
  baseURL: process.env.YOUSIGN_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.YOUSIGN_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class YousignService {
  static async createSignatureProcedure(data: SignatureProcedureData) {
    try {
      const srRes = await yousignApi.post('/signature_requests', {
        name: data.procedureName,
        delivery_mode: 'email',
        ordered_signers: true,
        timezone: 'Europe/Paris',
        expiration_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
      const signatureRequestId = srRes.data.id;
      console.log(`Signature Request créée avec l'ID: ${signatureRequestId}`);

      const fileBuffer = Buffer.from(data.fileBase64, 'base64');
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: `${data.documentName}.pdf`,
        contentType: 'application/pdf',
      });
      form.append('nature', 'signable_document');

      const docRes = await yousignApi.post(
        `/signature_requests/${signatureRequestId}/documents`,
        form,
        { headers: form.getHeaders() }
      );
      const documentId = docRes.data.id;
      console.log(`Document ajouté avec l'ID: ${documentId}`);

      const [userSigner, adminSigner] = data.signers;

      const userRes = await yousignApi.post(
        `/signature_requests/${signatureRequestId}/signers`,
        {
          info: {
            first_name: userSigner.firstName,
            last_name: userSigner.lastName,
            email: userSigner.email,
            phone_number: userSigner.phone,
            locale: userSigner.locale || 'fr',
          },
          signature_level: 'electronic_signature',
          signature_authentication_mode: 'no-otp',
          fields: [
            {
              type: 'signature',
              document_id: documentId,
              page: data.pageToSign,
              x: userSigner.positionX,
              y: userSigner.positionY,
            },
          ],
        }
      );
      console.log(`Signataire utilisateur ${userSigner.email} ajouté.`);
      console.log("id user", userRes.data.id)

      const adminRes = await yousignApi.post(
        `/signature_requests/${signatureRequestId}/signers`,
        {
          insert_after_id: userRes.data.id,
          info: {
            first_name: adminSigner.firstName,
            last_name: adminSigner.lastName,
            email: adminSigner.email,
            phone_number: adminSigner.phone,
            locale: adminSigner.locale || 'fr',
          },
          signature_level: 'electronic_signature',
          signature_authentication_mode: 'no-otp',
          fields: [
            {
              type: 'signature',
              document_id: documentId,
              page: data.pageToSign,
              x: adminSigner.positionX,
              y: adminSigner.positionY,
            },
          ]
        }
      );
      console.log(`Signataire admin ${adminSigner.email} ajouté.`);

      const activateRes = await yousignApi.post(
        `/signature_requests/${signatureRequestId}/activate`
      );
      console.log('Procédure de signature activée.');

      const signersRes = await yousignApi.get(`/signature_requests/${signatureRequestId}/signers`);
      const signersData = signersRes.data.map((s: any) => ({
        id: s.id,
        email: s.info.email,
        signatureImagePreview: s.signature_image_preview,
        signatureLink: s.signature_link,
        status: s.status,
      }));

      // envoie le lien que pour l'utilisateur
      const userLink = signersData.find((s: any) => s.email === userSigner.email)?.signatureLink;

      return { ...activateRes.data, signatureRequestId, userLink, signers: signersData };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error('Erreur API lors de la création de la procédure de signature:', err.response?.data || err.message);
        console.error('Détails de la requête échouée:', err.config);
      } else {
        console.error('Erreur inattendue:', err.message);
      }
      throw err;
    }
  }

  static async getSignerLink(signatureRequestId: string, signerId: string) {
    try {
      await new Promise(r => setTimeout(r, 5000))
      const res = await yousignApi.get(`/signature_requests/${signatureRequestId}/signers`);
      const signer = res.data.find((s: any) => s.id === signerId);
      if (!signer) throw new Error(`Signataire ${signerId} introuvable`);

      if (signer.status === 'signed') {
        console.log(`Le signataire ${signerId} a déjà signé.`);
        return null;
      }

      if (['notified', 'pending'].includes(signer.status)) {
        if (signer.signature_link) {
          console.log(`Lien de signature trouvé pour ${signerId}: ${signer.signature_link}`);
          return signer.signature_link;
        }

        const sandboxUrl = `${process.env.YOUSIGN_BASE_URL?.includes("sandbox")
          ? "https://app.yousign.com/sandbox/signature_requests"
          : "https://app.yousign.com/signature_requests"}/${signatureRequestId}`;

        console.warn(
          `Lien de signature non disponible pour ${signerId}, fallback : ${sandboxUrl}`
        );
        return sandboxUrl;
      }

      console.log(`Le signataire ${signerId} ne peut pas signer pour le moment (status: ${signer.status}).`);
      return null;
    } catch (err: any) {
      console.error(
        "Erreur lors de la récupération du lien de signature:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  static async getSigners(signatureRequestId: string) {
    try {
      const res = await yousignApi.get(`/signature_requests/${signatureRequestId}/signers`);
      return res.data.map((s: any) => ({
        id: s.id,
        email: s.info.email,
        status: s.status,
        signatureLink: s.signature_link,
      }));
    } catch (err: any) {
      console.error("Erreur lors de la récupération des signataires:", err.response?.data || err.message);
      throw err;
    }
  }

  static async isProcedureCompleted(signatureRequestId: string) {
    const res = await yousignApi.get(`/signature_requests/${signatureRequestId}`);
    return res.data.status === "done";
  }

  static async waitUntilSigned(contractFileId: number, timeout = 60000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const [rows]: any = await pool.execute(
        `SELECT is_signedBy_admin FROM contract_file WHERE id_contract_file = ?`,
        [contractFileId]
      );
      if (rows[0]?.is_signedBy_admin) return true;
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    throw new Error("Timeout : le document n'a pas été signé dans le délai imparti.");
  }

  static async downloadSignedDocument(contractFileId: number ,signatureRequestId: string) {
    try {
      await this.waitUntilSigned(contractFileId);

      const docsRes = await yousignApi.get(`/signature_requests/${signatureRequestId}/documents`);
      
      if (!docsRes.data || docsRes.data.length === 0) {
        throw new Error("Aucun document trouvé pour cette procédure");
      }
  
      console.log("Documents trouvés:", docsRes.data.map((d: any) => ({
        id: d.id, 
        name: d.name, 
        is_signed: d.is_signed,
        created_at: d.created_at
      })));
  
      const signedDocs: { name: string; file: Buffer }[] = [];
  
      for (const doc of docsRes.data) {
        if (!doc.is_signed) {
          console.warn(`Document ${doc.id} pas encore signé, on le saute pour l'instant.`);
          continue;
        }
  
        try {
          console.log(`Téléchargement du document signé: ${doc.id}`);
          const downloadRes = await yousignApi.get(
            `/documents/${doc.id}/file`,
            { responseType: 'arraybuffer', timeout: 30000 }
          );
  
          const buffer = Buffer.from(downloadRes.data);
          if (buffer.length === 0) throw new Error("Document vide");
  
          if (buffer.subarray(0, 4).toString('utf8') !== '%PDF') {
            console.warn("Le document ne semble pas être un PDF valide");
          }
  
          signedDocs.push({
            name: doc.name || `document-${doc.id}.pdf`,
            file: buffer,
          });
  
          console.log(`Document téléchargé avec succès: ${doc.name || doc.id}`);
  
        } catch (err: any) {
          console.error(`Erreur téléchargement document ${doc.id}:`, {
            status: err.response?.status,
            message: err.message,
            data: err.response?.data?.toString?.()?.substring(0, 100)
          });
          throw err;
        }
      }
  
      if (signedDocs.length === 0) {
        throw new Error("Aucun document signé n'a pu être téléchargé");
      }
  
      return signedDocs;
  
    } catch (err: any) {
      console.error('Erreur lors du téléchargement:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data?.toString?.()
      });
      throw err;
    }
  }
}
