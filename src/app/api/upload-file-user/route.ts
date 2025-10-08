import pool from "@/src/lib/db";
import { ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/upload-file-user:
 *   post:
 *     summary: Ajouter un fichier selon son type
 *     description: Insère un fichier dans la table appropriée (rib, kbis, identity, status) selon le type spécifié
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_type
 *               - file_url
 *               - id_basic_user
 *             properties:
 *               file_type:
 *                 type: string
 *                 enum: [rib, kbis, identity, status]
 *                 description: Type de fichier à insérer
 *                 example: "kbis"
 *               file_url:
 *                 type: string
 *                 format: uri
 *                 description: URL du fichier
 *                 example: "https://example.com/files/document.pdf"
 *               id_basic_user:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *                 example: 123
 *               note:
 *                 type: string
 *                 maxLength: 200
 *                 description: Note optionnelle (maximum 200 caractères)
 *                 example: "Document vérifié et validé"
 *     responses:
 *       201:
 *         description: Fichier ajouté avec succès
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
 *                   example: "Fichier KBIS ajouté avec succès"
 *                 insertedId:
 *                   type: integer
 *                   example: 456
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 456
 *                     file_type:
 *                       type: string
 *                       example: "kbis"
 *                     file_url:
 *                       type: string
 *                       example: "https://example.com/files/document.pdf"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-22T10:30:00.000Z"
 *       400:
 *         description: Données invalides
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
 *                   example: "Type de fichier invalide"
 *       404:
 *         description: Utilisateur non trouvé
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
 *                   example: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Database connection failed"
 */

// Types de fichiers autorisés avec leurs tables correspondantes
export const FILE_TYPES = {
    rib: {
        table: 'rib_file',
        idField: 'id_rib_file',
        urlField: 'rib_file_url',
        noteField: 'rib_file_note'
    },
    kbis: {
        table: 'kbis_file',
        idField: 'id_kbis_file',
        urlField: 'kbis_file_url',
        noteField: 'kbis_file_note'
    },
    identity: {
        table: 'identity_file',
        idField: 'id_identity_file',
        urlField: 'identity_file_url',
        noteField: 'identity_file_note'
    },
    status: {
        table: 'status_file',
        idField: 'id_status_file',
        urlField: 'status_file_url',
        noteField: 'status_file_note'
    }
} as const;

export type FileType = keyof typeof FILE_TYPES;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const isMultipleUpload = body.files && Array.isArray(body.files);
        const isSingleUpload = body.file_type && typeof body.file_type === 'string';

        if (isMultipleUpload) {
            return await handleMultipleFilesUpload(body);
        } else if (isSingleUpload) {
            return await handleSingleFileUpload(body);
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Format de requête invalide. Utilisez soit 'file_type' pour un upload simple, soit 'files' pour un upload multiple",
                },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Erreur lors de l'ajout du/des fichier(s) :", error);
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

// Fonction pour gérer l'upload d'un seul fichier
async function handleSingleFileUpload(body: any) {
    const {
        file_type,
        file_url,
        id_basic_user,
    } = body;

    // Vérifications des champs obligatoires
    if (!file_type) {
        return NextResponse.json(
            {
                success: false,
                message: "Le type de fichier est obligatoire",
            },
            { status: 400 }
        );
    }

    if (!file_url) {
        return NextResponse.json(
            {
                success: false,
                message: "L'URL du fichier est obligatoire",
            },
            { status: 400 }
        );
    }

    if (!id_basic_user) {
        return NextResponse.json(
            {
                success: false,
                message: "L'ID de l'utilisateur est obligatoire",
            },
            { status: 400 }
        );
    }

    // Validation du fichier
    const validation = validateFileData({ file_type, file_url });
    if (!validation.isValid) {
        return NextResponse.json(
            {
                success: false,
                message: validation.errors[0],
            },
            { status: 400 }
        );
    }

    const userExists = await checkUserExists(id_basic_user);
    if (!userExists) {
        return NextResponse.json(
            {
                success: false,
                message: "Utilisateur non trouvé",
            },
            { status: 404 }
        );
    }

    // Insérer le fichier
    const result = await insertFile({ file_type, file_url, id_basic_user });

    return NextResponse.json(
        {
            success: true,
            message: `Fichier ${file_type.toUpperCase()} ajouté avec succès`,
            insertedId: result.insertedId,
            data: result.data
        },
        { status: 201 }
    );
}

// Fonction pour gérer l'upload de plusieurs fichiers
async function handleMultipleFilesUpload(body: any) {
    const { files, id_basic_user } = body;

    if (!id_basic_user) {
        return NextResponse.json(
            {
                success: false,
                message: "L'ID de l'utilisateur est obligatoire",
            },
            { status: 400 }
        );
    }

    if (!Array.isArray(files) || files.length === 0) {
        return NextResponse.json(
            {
                success: false,
                message: "Au moins un fichier est requis",
            },
            { status: 400 }
        );
    }

    const userExists = await checkUserExists(id_basic_user);
    if (!userExists) {
        return NextResponse.json(
            {
                success: false,
                message: "Utilisateur non trouvé",
            },
            { status: 404 }
        );
    }

    const results = [];
    const errors = [];

    // Traiter chaque fichier
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { file_type, file_url } = file;

        // Validation de chaque fichier
        const validation = validateFileData({ file_type, file_url });
        if (!validation.isValid) {
            errors.push({
                index: i,
                file_type: file_type || 'unknown',
                errors: validation.errors
            });
            continue;
        }

        try {
            // Insérer le fichier
            const result = await insertFile({ file_type, file_url, id_basic_user });
            results.push({
                index: i,
                file_type,
                success: true,
                insertedId: result.insertedId,
                data: result.data
            });
        } catch (error) {
            errors.push({
                index: i,
                file_type,
                success: false,
                error: (error as Error).message
            });
        }
    }

    const totalFiles = files.length;
    const successCount = results.length;
    const errorCount = errors.length;

    // Déterminer le statut de réponse
    const allSuccess = errorCount === 0;
    const allFailed = successCount === 0;
    const partialSuccess = successCount > 0 && errorCount > 0;

    let status = 201;
    let message = `${successCount}/${totalFiles} fichiers ajoutés avec succès`;

    if (allFailed) {
        status = 400;
        message = "Aucun fichier n'a pu être ajouté";
    } else if (partialSuccess) {
        status = 207;
        message = `${successCount}/${totalFiles} fichiers ajoutés avec succès, ${errorCount} échecs`;
    }

    return NextResponse.json(
        {
            success: allSuccess,
            message,
            totalFiles,
            successCount,
            errorCount,
            results,
            errors: errors.length > 0 ? errors : undefined
        },
        { status }
    );
}

// Fonction utilitaire pour valider un fichier
function validateFileData(file: any) {
    const errors = [];

    if (!FILE_TYPES[file.file_type as FileType]) {
        errors.push(`Type de fichier invalide. Types autorisés: ${Object.keys(FILE_TYPES).join(', ')}`);
    }

    if (!file.file_url) {
        errors.push("L'URL du fichier est obligatoire");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

//  vérifier l'existence d'un utilisateur
async function checkUserExists(id_basic_user: number) {
    const userCheckQuery = 'SELECT id_basic_user FROM basic_user WHERE id_basic_user = ?';
    const [userRows] = await pool.execute(userCheckQuery, [id_basic_user]);
    return Array.isArray(userRows) && userRows.length > 0;
}

// Fonction utilitaire pour insérer un fichier
async function insertFile(fileData: any) {
    const { file_type, file_url, id_basic_user, note } = fileData;

    // Récupérer la configuration du type de fichier
    const fileConfig = FILE_TYPES[file_type as FileType];

    const query = `
      INSERT INTO ${fileConfig.table} (
        ${fileConfig.urlField},
        ${fileConfig.noteField},
        is_validate,
        validate_at,
        created_at,
        id_basic_user
      ) VALUES (?, ?, ?, ?, NOW(), ?)
    `;

    const queryParams = [
        file_url,
        null,
        null,
        null,
        id_basic_user,
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, queryParams);

    // Récupérer l'enregistrement créé pour la réponse
    const selectQuery = `
      SELECT ${fileConfig.idField} as id, ${fileConfig.urlField} as file_url, created_at 
      FROM ${fileConfig.table} 
      WHERE ${fileConfig.idField} = ?
    `;

    const [createdFile] = await pool.execute(selectQuery, [result.insertId]);
    const fileCreated = Array.isArray(createdFile) && createdFile.length > 0 ? createdFile[0] as any : null;

    return {
        insertedId: result.insertId,
        data: fileCreated ? {
            id: fileCreated.id,
            file_type: file_type,
            file_url: fileCreated.file_url,
            created_at: fileCreated.created_at
        } : null
    };
}

/**
 * @swagger
 * /api/upload-file-user:
 *   get:
 *     summary: Récupérer les fichiers (tous les utilisateurs ou un utilisateur spécifique)
 *     description: >
 *       - Si `id_basic_user` est fourni → récupère tous les fichiers (RIB, KBIS, Identity, Status) associés à cet utilisateur.  
 *       - Si `id_basic_user` n'est pas fourni → récupère les fichiers de **tous les utilisateurs**.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: query
 *         name: id_basic_user
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur (optionnel, si absent on récupère les fichiers de tous les utilisateurs)
 *         example: 123
 *       - in: query
 *         name: file_type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [rib, kbis, identity, status]
 *         description: Filtrer par type de fichier
 *       - in: query
 *         name: is_validate
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut de validation (true = validé, false = en attente)
 *     responses:
 *       200:
 *         description: Liste des fichiers récupérée avec succès
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
 *                   example: "Fichiers récupérés avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 12
 *                         stats:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               example: 12
 *                             validated:
 *                               type: integer
 *                               example: 7
 *                             pending:
 *                               type: integer
 *                               example: 5
 *                             byType:
 *                               type: object
 *                               additionalProperties:
 *                                 type: integer
 *                               example:
 *                                 rib: 3
 *                                 kbis: 2
 *                                 identity: 5
 *                                 status: 2
 *                         documents:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               file_type:
 *                                 type: string
 *                               file_type_label:
 *                                 type: string
 *                               file_url:
 *                                 type: string
 *                               note:
 *                                 type: string
 *                               is_validate:
 *                                 type: boolean
 *                               validate_at:
 *                                 type: string
 *                                 format: date-time
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                               user:
 *                                 type: object
 *                                 description: Informations sur l'utilisateur (présent uniquement si id_basic_user n'est pas fourni)
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   name:
 *                                     type: string
 *                                   firstName:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                                   phone:
 *                                     type: string
 *       404:
 *         description: Utilisateur non trouvé (seulement si id_basic_user est fourni)
 *       500:
 *         description: Erreur interne du serveur
 */

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const id_basic_user = searchParams.get("id_basic_user");
      const file_type = searchParams.get("file_type");
      const is_validate = searchParams.get("is_validate");
  
      const filesToFetch = file_type ? [file_type] : Object.keys(FILE_TYPES);
      const allFiles: any[] = [];
  
      if (id_basic_user) {
        // Récupération des fichiers d'un seul utilisateur si id_basic_user est spécifié
        const userQuery = `
          SELECT 
            id_basic_user as id,
            name,
            first_name,
            email,
            phone
          FROM basic_user 
          WHERE id_basic_user = ?
        `;
  
        const [userRows]: any = await pool.execute(userQuery, [id_basic_user]);
        const user = userRows[0];
  
        if (!user) {
          return NextResponse.json(
            { success: false, message: "Utilisateur non trouvé" },
            { status: 404 }
          );
        }
  
        await fetchFilesForUser(id_basic_user, filesToFetch, is_validate, allFiles);
  
        // Trier par date
        allFiles.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
  
        const stats = buildStats(allFiles);
  
        return NextResponse.json(
          {
            success: true,
            message: `${allFiles.length} fichier(s) récupéré(s) pour l'utilisateur`,
            data: {
              user: {
                id: user.id,
                name: user.name,
                firstName: user.first_name,
                email: user.email,
                phone: user.phone,
              },
              files: {
                total: allFiles.length,
                stats,
                documents: allFiles,
              },
            },
          },
          { status: 200 }
        );
      } else {
        //  Récupération des fichiers de TOUS les utilisateurs si id_basic_user n'est pas spécifié
        const usersQuery = `
          SELECT 
            id_basic_user as id,
            name,
            first_name,
            email,
            phone
          FROM basic_user
        `;
        const [users]: any = await pool.execute(usersQuery);
  
        for (const user of users) {
          const userFiles: any[] = [];
          await fetchFilesForUser(user.id, filesToFetch, is_validate, userFiles);
  
          if (userFiles.length > 0) {
            allFiles.push(
              ...userFiles.map((f) => ({
                ...f,
                user: {
                  id: user.id,
                  name: user.name,
                  firstName: user.first_name,
                  email: user.email,
                  phone: user.phone,
                },
              }))
            );
          }
        }
  
        // Trier globalement par date
        allFiles.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
  
        const stats = buildStats(allFiles);
  
        return NextResponse.json(
          {
            success: true,
            message: `${allFiles.length} fichier(s) récupéré(s) pour tous les utilisateurs`,
            data: {
              files: {
                total: allFiles.length,
                stats,
                documents: allFiles,
              },
            },
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers :", error);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur interne du serveur",
          error: (error as Error).message,
        },
        { status: 500 }
      );
    }
  }
  
  // Helper pour récupérer les fichiers d'un utilisateur
  async function fetchFilesForUser(
    id_basic_user: string,
    filesToFetch: string[],
    is_validate: string | null,
    allFiles: any[]
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
          allFiles.push(...typedFiles);
        }
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des fichiers de type ${type}:`,
          error
        );
      }
    }
  }
  
  // Stats
  function buildStats(allFiles: any[]) {
    const stats = {
      total: allFiles.length,
      validated: allFiles.filter((f) => f.is_validate).length,
      pending: allFiles.filter((f) => !f.is_validate).length,
      rejected: allFiles.filter((f) => f.is_validate === 0).length,
      byType: {} as Record<string, number>,
    };
  
    allFiles.forEach((file) => {
      stats.byType[file.file_type] = (stats.byType[file.file_type] || 0) + 1;
    });
  
    return stats;
  }
  
  // Libellés
  function getFileTypeLabel(fileType: FileType): string {
    const labels: Record<FileType, string> = {
      identity: "Pièce d'identité du gérant",
      rib: "Relevé d'identité bancaire",
      kbis: "Kbis de la société",
      status: "Statut légal de la société",
    };
    return labels[fileType] || fileType;
  }
