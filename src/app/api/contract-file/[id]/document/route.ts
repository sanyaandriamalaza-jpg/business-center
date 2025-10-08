import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/src/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const query = `
      SELECT 
        cf.id_contract_file,
        cf.contract_file_url,
        cf.compensatory_file_url,
        cf.tag,
        c.name AS company_name,
        bu.email AS user_email
      FROM contract_file cf
      JOIN company c ON c.id_company = cf.id_company
      LEFT JOIN basic_user bu ON bu.id_basic_user = cf.id_basic_user
      WHERE cf.id_contract_file = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Document non trouvé' },
        { status: 400 }
      );
    }

    const document = rows[0];
    
    const fileUrl = document.tag === 'contract' 
      ? document.contract_file_url 
      : document.compensatory_file_url;

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: 'URL du document non disponible' },
        { status: 404 }
      );
    }

    //  Télécharger le fichier
    let fileBase64: string;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${fileUrl}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || 'application/pdf';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileBase64 = buffer.toString('base64');

      // Retourner le fichier en base64
      return NextResponse.json({ 
        success: true, 
        fileBase64: fileBase64,
        fileName: `document_${id}.${getFileExtension(contentType)}`,
        mimeType: contentType,
        documentInfo: {
          id: document.id_contract_file,
          tag: document.tag,
          company: document.company_name,
          userEmail: document.user_email
        }
      });

    } catch (error: any) {
      console.error('Erreur de téléchargement:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur de téléchargement du document',
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
      },
      { status: 500 }
    );
  }
}

// Helper function pour déterminer l'extension du fichier
function getFileExtension(contentType: string): string {
  const extensions: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'text/plain': 'txt',
  };
  
  return extensions[contentType] || 'bin';
}