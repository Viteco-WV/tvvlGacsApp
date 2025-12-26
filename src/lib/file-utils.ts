import { writeFile, mkdir, unlink, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default
const COMPRESSION_THRESHOLD = 2 * 1024 * 1024; // 2MB

export interface FileUploadResult {
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
}

/**
 * Comprimeert een afbeelding als deze groter is dan 2MB
 * Behoudt goede kwaliteit (quality: 85 voor JPEG, 90 voor PNG)
 */
async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const sharpInstance = sharp(buffer);
  const metadata = await sharpInstance.metadata();
  
  // Bepaal output format
  let outputFormat: 'jpeg' | 'png' | 'webp' = 'jpeg';
  if (mimeType.includes('png')) {
    outputFormat = 'png';
  } else if (mimeType.includes('webp')) {
    outputFormat = 'webp';
  }

  // Comprimeer met goede kwaliteit
  const compressed = await sharpInstance
    .resize(1920, 1920, { 
      fit: 'inside', 
      withoutEnlargement: true 
    })
    .toFormat(outputFormat, {
      quality: outputFormat === 'png' ? 90 : 85,
      progressive: true
    })
    .toBuffer();

  return compressed;
}

/**
 * Genereert bestandsnaam met vraag ID
 * Format: vraagId_sectieNaam_timestamp.extension
 * Bijvoorbeeld: warmteafgifte_foto_verwarmingssysteem_1703456789123.jpg
 */
function generateFilename(vraagId: string | undefined, sectieNaam: string | undefined, extension: string): string {
  // Sanitize vraagId (vervang speciale karakters, behoud punten en underscores)
  const sanitizedVraagId = vraagId 
    ? vraagId.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
    : 'foto';
  
  // Sanitize sectieNaam
  const sanitizedSectie = sectieNaam 
    ? sectieNaam.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
    : 'opname';
  
  // Format: vraagId_sectieNaam_timestamp.extension
  // Dit zorgt ervoor dat dezelfde vraag altijd dezelfde prefix heeft
  const timestamp = Date.now();
  return `${sanitizedVraagId}_${sanitizedSectie}_${timestamp}.${extension}`;
}

/**
 * Slaat een geüploade foto op in het file system
 */
export async function savePhoto(
  opnameId: string,
  file: File,
  type: 'opname' | 'sectie' = 'opname',
  sectieNaam?: string,
  vraagId?: string
): Promise<FileUploadResult> {
  // Valideer file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Bestand is te groot. Maximum grootte: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Valideer file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Alleen afbeeldingen zijn toegestaan');
  }

  // Maak directory structuur
  let uploadPath: string;
  if (type === 'sectie' && sectieNaam) {
    uploadPath = join(UPLOAD_DIR, 'opnamen', opnameId, 'secties', sectieNaam);
  } else {
    uploadPath = join(UPLOAD_DIR, 'opnamen', opnameId);
  }

  // Maak directory aan als deze niet bestaat
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }

  // Converteer file naar buffer
  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);
  let finalSize = file.size;
  let finalMimeType = file.type;

  // Comprimeer als bestand groter is dan 2MB
  if (buffer.length > COMPRESSION_THRESHOLD) {
    try {
      buffer = await compressImage(buffer, file.type);
      finalSize = buffer.length;
      // Update mime type naar gecomprimeerd formaat
      if (file.type.includes('png')) {
        finalMimeType = 'image/png';
      } else {
        finalMimeType = 'image/jpeg';
      }
    } catch (error) {
      console.error('Fout bij comprimeren foto:', error);
      // Ga door met origineel bestand als compressie faalt
    }
  }

  // Genereer bestandsnaam met vraag ID
  const extension = finalMimeType.includes('png') ? 'png' : 
                   finalMimeType.includes('webp') ? 'webp' : 'jpg';
  const filename = generateFilename(vraagId, sectieNaam, extension);
  const filepath = join(uploadPath, filename);

  // Sla bestand op
  await writeFile(filepath, buffer);

  // Retourneer relatief pad vanaf public directory
  const relativePath = filepath.replace(/^.*\/public\//, '/');

  return {
    filename,
    filepath: relativePath,
    mimeType: finalMimeType,
    size: finalSize,
  };
}

/**
 * Verwijdert een foto uit het file system
 */
export async function deletePhoto(filepath: string): Promise<void> {
  const fullPath = join(process.cwd(), 'public', filepath);
  if (existsSync(fullPath)) {
    await unlink(fullPath);
  }
}

/**
 * Verwijdert alle bestanden en directories voor een opname
 * Verwijdert recursief de hele opname directory
 */
export async function deleteOpnameFiles(opnameId: string): Promise<void> {
  const opnameDir = join(process.cwd(), 'public', 'uploads', 'opnamen', opnameId);
  
  if (existsSync(opnameDir)) {
    try {
      // Verwijder recursief de hele directory inclusief alle subdirectories en bestanden
      await rm(opnameDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Fout bij verwijderen opname directory ${opnameId}:`, error);
      throw error;
    }
  }
}

/**
 * Valideert of een bestand een geldige afbeelding is
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type) && file.size <= MAX_FILE_SIZE;
}

