/**
 * Helper functies voor foto handling in sectie pagina's
 */

import { uploadSectieFoto } from './opname-api';

/**
 * Converteert base64 string naar File object
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Upload een foto direct naar de database
 * vraagId wordt gebruikt in de bestandsnaam
 */
export async function uploadPhotoToDatabase(
  opnameId: string | null,
  sectieNaam: string,
  file: File,
  vraagId: string
): Promise<string | null> {
  if (!opnameId || !file || !vraagId) {
    return null;
  }

  try {
    const fotoId = await uploadSectieFoto(opnameId, sectieNaam, file, vraagId);
    return fotoId;
  } catch (error) {
    console.error(`Fout bij uploaden foto voor ${vraagId}:`, error);
    return null;
  }
}

