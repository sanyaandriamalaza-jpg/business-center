import pool from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { FILE_TYPES, FileType } from "../upload-file-user/route";
import { add } from "date-fns";

/**
 * @swagger
 * /api/virtual-office:
 *   get:
 *     summary: Récupère la liste des virtual offices avec leurs documents
 *     description: Retourne la liste des virtual offices avec les documents associés à chaque utilisateur, filtrables par entreprise et offre
 *     tags:
 *       - Virtual Office
 *     parameters:
 *       - in: query
 *         name: idCompany
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID de l'entreprise pour filtrer les résultats
 *       - in: query
 *         name: idVirtualOfficeOffer
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID de l'offre de virtual office pour filtrer les résultats
 *       - in: query
 *         name: is_validate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         required: false
 *         description: Filtre sur le statut de validation des documents
 *     responses:
 *       200:
 *         description: Liste des virtual offices récupérée avec succès
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
 *                   description: Nombre total de virtual offices retournés
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VirtualOfficeData'
 *       500:
 *         description: Erreur serveur lors de la récupération des données
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
 *                   example: "Erreur serveur lors de la récupération des addresses virtuels."
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idBasicUser = searchParams.get("id_basic_user");
    const is_validate = searchParams.get("is_validate");
    const companyName = searchParams.get("companyName");
    const idVirtualOfficeOffer = searchParams.get("idVirtualOfficeOffer");

    const filesToFetch = Object.keys(FILE_TYPES);

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (idBasicUser) {
      conditions.push("i.id_basic_user = ?");
      values.push(Number(idBasicUser));
    }

    if (companyName) {
      conditions.push("bu.virtualOfficeName = ?");
      values.push(companyName);
    }
    if (idVirtualOfficeOffer) {
      conditions.push("i.id_virtual_office_offer = ?"); 
      values.push(Number(idVirtualOfficeOffer));
    } else { conditions.push("i.id_virtual_office_offer IS NOT NULL"); }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
        SELECT
          i.*,
          vo.id_virtual_office_offer as virtualOfficeId,
          vo.name as virtualOfficeName,
          bu.id_basic_user as userId,
          bu.id_company as userCompanyId,
          bu.virtualOfficeName as userCompanyName,
          bu.virtualOfficeLegalForm as userCompanyLegalForm,
          bu.virtualOfficeSiret as userCompanySiret
        FROM invoice i
        LEFT JOIN virtual_office_offer vo ON i.id_virtual_office_offer = vo.id_virtual_office_offer
        LEFT JOIN basic_user bu ON i.id_basic_user = bu.id_basic_user
        ${whereClause}
        ORDER BY i.created_at DESC
      `;

    const [rows] = await pool.query(query, values);

    const filesByUser: Record<string, any[]> = {};
    const contractFilesToSignByUser: Record<string, any[]> = {};
    const allContractFilesByUser: Record<string, any[]> = {};

    try {
      const userIds = (rows as any[]).map((row) => row.userId);

      for (const id_basic_user of userIds) {
        try {
          // Récupération des fichiers utilisateur
          const userFiles: any[] = [];
          await fetchFilesForUser(id_basic_user, filesToFetch, is_validate, userFiles);
          filesByUser[id_basic_user] = userFiles;

          // Récupération des contract-files à signer (signés par user mais pas par admin)
          const contractFilesToSign: any[] = [];
          await fetchContractFilesToSign(id_basic_user, contractFilesToSign);
          contractFilesToSignByUser[id_basic_user] = contractFilesToSign;

          // Récupération de tous les contract-files
          const allContractFiles: any[] = [];
          await fetchAllContractFiles(id_basic_user, allContractFiles);
          allContractFilesByUser[id_basic_user] = allContractFiles;
        } catch (error) {
          console.error(
            `Erreur lors de la récupération des fichiers pour l'utilisateur ${id_basic_user}:`,
            error
          );
          filesByUser[id_basic_user] = [];
          contractFilesToSignByUser[id_basic_user] = [];
          allContractFilesByUser[id_basic_user] = [];
        }
      }
    } catch (error) {
      console.error("Erreur lors du traitement des utilisateurs:", error);
    }

    const virtualOffices = (rows as any[]).map((row) => {
      const userFiles = filesByUser[row.userId] || [];
      const contractFilesToSign = contractFilesToSignByUser[row.userId] || [];
      const allContractFiles = allContractFilesByUser[row.userId] || [];

      const sortedFiles = [...userFiles].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const stats = buildStats(userFiles);

      return {
        id: row.id_invoice,
        user: {
          userId: row.userId,
          name: row.user_name,
          firstName: row.user_first_name,
          email: row.user_email,
          role: "Gérant(e)",
        },
        amount: row.amount,
        status: row.subscription_status,
        idBasicUser: row.userId,
        idVirtualOfficeOffer: row.id_virtual_office_offer ?? null,
        company: {
          companyName: row.userCompanyName,
          legalForm: row.userCompanyLegalForm,
          siret: row.userCompanySiret,
        },
        userFiles: {
          total: userFiles.length,
          stats,
          documents: sortedFiles,
        },
        contractFileToSign: contractFilesToSign.map(contractFile => ({
          contractFileId: contractFile.id_contract_file,
          contractFileUrl: contractFile.contract_file_url,
          compensatoryFileUrl: contractFile.compensatory_file_url,
          contractFileTag: contractFile.tag,
          isContractSignedByUser: contractFile.is_signedBy_user,
          isContractSignedByAdmin: contractFile.is_signedBy_admin,
        })),
        contractFiles: allContractFiles.map(contractFile => ({
          contractFileId: contractFile.id_contract_file,
          contractFileUrl: contractFile.contract_file_url,
          compensatoryFileUrl: contractFile.compensatory_file_url,
          contractFileTag: contractFile.tag,
          isContractSignedByUser: contractFile.is_signedBy_user,
          isContractSignedByAdmin: contractFile.is_signedBy_admin,
        })),
        virtualOfficeOffer: {
          offerId: row.virtualOfficeId,
          offerName: row.virtualOfficeName,
        },
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: virtualOffices.length,
        data: virtualOffices,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des virtual offices :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la récupération des virtual offices.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function fetchFilesForUser(
  id_basic_user: string,
  filesToFetch: string[],
  is_validate: string | null,
  userFiles: any[]
) {
  for (const type of filesToFetch) {
    if (!FILE_TYPES[type as FileType]) continue;

    const fileConfig = FILE_TYPES[type as FileType];
    let query = `
        SELECT 
          ${fileConfig.idField} as id,
          '${type}' as file_type,
          ${fileConfig.urlField} as file_url,
          ${fileConfig.noteField} as note,
          is_validate,
          validate_at,
          created_at
        FROM ${fileConfig.table}
        WHERE id_basic_user = ?
      `;

    const queryParams = [id_basic_user];

    if (is_validate !== null) {
      query += " AND is_validate = ?";
      queryParams.push(is_validate === "true" ? "1" : "0");
    }

    query += " ORDER BY created_at DESC";

    try {
      const [rows]: any = await pool.execute(query, queryParams);

      if (Array.isArray(rows)) {
        const typedFiles = rows.map((file: any) => ({
          ...file,
          file_type: type,
          file_type_label: getFileTypeLabel(type as FileType),
        }));
        userFiles.push(...typedFiles);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des fichiers de type ${type}:`, error);
    }
  }
}

async function fetchContractFilesToSign(
  id_basic_user: string,
  contractFiles: any[]
) {
  const query = `
    SELECT 
      id_contract_file,
      contract_file_url,
      compensatory_file_url,
      tag,
      is_signedBy_user,
      is_signedBy_admin,
      created_at
    FROM contract_file
    WHERE id_basic_user = ? 
    AND is_signedBy_user = 1
    AND is_signedBy_admin = 0
    ORDER BY created_at DESC
  `;

  try {
    const [rows]: any = await pool.execute(query, [id_basic_user]);

    if (Array.isArray(rows)) {
      const formattedFiles = rows.map((file: any) => ({
        ...file,
        is_signedBy_user: file.is_signedBy_user === 1,
        is_signedBy_admin: file.is_signedBy_admin === 1
      }));
      contractFiles.push(...formattedFiles);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des contract-files à signer pour l'utilisateur ${id_basic_user}:`, error);
  }
}

async function fetchAllContractFiles(
  id_basic_user: string,
  contractFiles: any[]
) {
  const query = `
    SELECT 
      id_contract_file,
      contract_file_url,
      compensatory_file_url,
      tag,
      is_signedBy_user,
      is_signedBy_admin,
      created_at
    FROM contract_file
    WHERE id_basic_user = ? 
    ORDER BY created_at DESC
  `;

  try {
    const [rows]: any = await pool.execute(query, [id_basic_user]);

    if (Array.isArray(rows)) {
      const formattedFiles = rows.map((file: any) => ({
        ...file,
        is_signedBy_user: file.is_signedBy_user === 1,
        is_signedBy_admin: file.is_signedBy_admin === 1
      }));
      contractFiles.push(...formattedFiles);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération de tous les contract-files pour l'utilisateur ${id_basic_user}:`, error);
  }
}

function buildStats(files: any[]) {
  return {
    total: files.length,
    validated: files.filter((f) => f.is_validate === 1).length,
    pending: files.filter((f) => f.is_validate === null).length,
    rejected: files.filter((f) => f.is_validate === 0).length,
  };
}

function getFileTypeLabel(fileType: FileType): string {
  const labels: Record<FileType, string> = {
    identity: "Pièce d'identité du gérant",
    rib: "Relevé d'identité bancaire",
    kbis: "Kbis de la société",
    status: "Statut légal de la société",
  };
  return labels[fileType] || fileType;
}