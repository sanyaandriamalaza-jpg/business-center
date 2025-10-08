import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
];
const ALLOWED_FOLDERS = ['kbis', 'status', 'identity', 'rib'];

export interface UploadResponse {
    success: boolean;
    url?: string;
    urls?: string[];
    error?: string;
    details?: {
        fileName: string;
        fileSize: number;
        fileType: string;
        folder: string;
    };
}

function validateFile(file: File, folder: string): { isValid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: `Type de fichier non autorisé. Types acceptés: ${ALLOWED_TYPES.join(', ')}`
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        };
    }

    if (folder && !ALLOWED_FOLDERS.includes(folder)) {
        return {
            isValid: false,
            error: `Dossier non autorisé. Dossiers acceptés: ${ALLOWED_FOLDERS.join(', ')}`
        };
    }

    const fileName = file.name;
    if (!fileName || fileName.length > 255) {
        return {
            isValid: false,
            error: 'Nom de fichier invalide'
        };
    }

    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(fileName)) {
        return {
            isValid: false,
            error: 'Le nom du fichier contient des caractères non autorisés'
        };
    }

    return { isValid: true };
}

function generateSecureFileName(originalName: string): string {
    const timestamp = Date.now();
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);

    return `${timestamp}_${baseName}${extension}`;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// Fonction pour uploader un seul fichier
async function uploadSingleFile(
    file: File, 
    folder: string = 'general'
): Promise<UploadResponse> {
    try {
        const validation = validateFile(file, folder);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error
            };
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        await ensureDirectoryExists(uploadDir);

        const secureFileName = generateSecureFileName(file.name);
        const filePath = path.join(uploadDir, secureFileName);

        const buffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));

        const publicUrl = `/uploads/${folder}/${secureFileName}`;

        return {
            success: true,
            url: publicUrl,
            details: {
                fileName: secureFileName,
                fileSize: file.size,
                fileType: file.type,
                folder: folder
            }
        };

    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        return {
            success: false,
            error: 'Erreur interne lors de l\'upload du fichier'
        };
    }
}

// Fonction pour uploader plusieurs fichiers
async function uploadMultipleFiles(
    files: File[], 
    folders: string[]
): Promise<UploadResponse> {
    try {
        const uploadPromises = files.map(async (file, index) => {
            const folder = folders[index] || 'general';
            return await uploadSingleFile(file, folder);
        });

        const results = await Promise.all(uploadPromises);
        
        // Vérifier si tous les uploads ont réussi
        const failedUploads = results.filter(result => !result.success);
        if (failedUploads.length > 0) {
            return {
                success: false,
                error: `Erreur lors de l'upload: ${failedUploads.map(f => f.error).join(', ')}`
            };
        }

        const urls = results.map(result => result.url!);
        
        return {
            success: true,
            urls: urls
        };

    } catch (error) {
        console.error('Erreur lors de l\'upload multiple:', error);
        return {
            success: false,
            error: 'Erreur interne lors de l\'upload des fichiers'
        };
    }
}

// Handler principal
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const singleFile = formData.get('image') as File;
        const multipleFiles = formData.getAll('images') as File[];
        
        if (singleFile) {
            const folder = (formData.get('folder') as string) || 'general';
            const result = await uploadSingleFile(singleFile, folder);
            
            return NextResponse.json(result, { 
                status: result.success ? 200 : 400 
            });

        } else if (multipleFiles.length > 0) {
            const folders = formData.getAll('folders') as string[];
            const result = await uploadMultipleFiles(multipleFiles, folders);
            
            return NextResponse.json(result, { 
                status: result.success ? 200 : 400 
            });

        } else {
            return NextResponse.json({
                success: false,
                error: 'Aucun fichier fourni. Utilisez "image" pour un fichier ou "images" pour plusieurs fichiers.'
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Erreur dans l\'API upload:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne du serveur'
        }, { status: 500 });
    }
}

