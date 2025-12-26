/**
 * API utility functies voor opname operaties
 */

export interface CreateOpnameData {
  opnameType: 'basis' | 'geavanceerd';
  gebouwnaam: string;
  adres: string;
  postcode?: string;
  huisnummer?: string;
  huisnummertoevoeging?: string;
  straat?: string;
  stad?: string;
  gebouwtype?: string;
  energielabel?: string;
  gebouwOppervlakte?: number;
  datumOpname: string;
  contactpersoon?: string;
  latitude?: number;
  longitude?: number;
  bagVerblijfsobjectId?: string;
}

export interface SaveAntwoordenData {
  sectieNaam: string;
  sectieType?: 'basis' | 'geavanceerd';
  antwoorden: Array<{
    vraagId: string;
    vraagTekst?: string;
    antwoordWaarde?: string;
    antwoordOptie?: string;
    antwoordNummer?: number;
    antwoordBoolean?: boolean;
    sectieNummer?: string;
  }>;
}

/**
 * Maak een nieuwe opname aan in de database
 */
export async function createOpname(data: CreateOpnameData): Promise<string> {
  const response = await fetch('/api/opnamen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Probeer JSON error te lezen, anders toon response text
    let errorMessage = 'Fout bij aanmaken opname';
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.error || error.details || errorMessage;
      } else {
        // Als response geen JSON is (bijv. HTML error pagina), lees als text
        const text = await response.text();
        console.error('API returned non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          preview: text.substring(0, 200)
        });
        errorMessage = `Server error (${response.status}): ${response.statusText}. Check console voor details.`;
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.id;
}

/**
 * Update een bestaande opname
 */
export async function updateOpname(opnameId: string, data: Partial<CreateOpnameData>): Promise<void> {
  const response = await fetch(`/api/opnamen/${opnameId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fout bij updaten opname');
  }
}

/**
 * Sla antwoorden op voor een sectie
 */
export async function saveAntwoorden(
  opnameId: string,
  data: SaveAntwoordenData
): Promise<void> {
  const response = await fetch(`/api/opnamen/${opnameId}/antwoorden`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fout bij opslaan antwoorden');
  }
}

/**
 * Upload een foto voor een opname
 */
export async function uploadOpnameFoto(
  opnameId: string,
  file: File,
  fotoType: string = 'gebouw',
  beschrijving?: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fotoType', fotoType);
  if (beschrijving) {
    formData.append('beschrijving', beschrijving);
  }

  const response = await fetch(`/api/opnamen/${opnameId}/fotos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fout bij uploaden foto');
  }

  const result = await response.json();
  return result.id;
}

/**
 * Upload een foto voor een sectie
 * vraagId is verplicht en wordt gebruikt in de bestandsnaam voor consistentie
 */
export async function uploadSectieFoto(
  opnameId: string,
  sectieNaam: string,
  file: File,
  vraagId: string,
  beschrijving?: string
): Promise<string> {
  if (!vraagId) {
    throw new Error('vraagId is verplicht voor sectie foto\'s');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('vraagId', vraagId); // Altijd meezenden voor bestandsnaam
  if (beschrijving) {
    formData.append('beschrijving', beschrijving);
  }

  const response = await fetch(`/api/opnamen/${opnameId}/secties/${sectieNaam}/fotos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fout bij uploaden sectie foto');
  }

  const result = await response.json();
  return result.id;
}

/**
 * Verwijder een opname foto
 */
export async function deleteOpnameFoto(
  opnameId: string,
  fotoId: string
): Promise<void> {
  const response = await fetch(`/api/opnamen/${opnameId}/fotos?fotoId=${fotoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fout bij verwijderen foto');
  }
}

/**
 * Verwijder een sectie foto
 */
export async function deleteSectieFoto(
  opnameId: string,
  sectieNaam: string,
  fotoId: string
): Promise<void> {
  const response = await fetch(`/api/opnamen/${opnameId}/secties/${sectieNaam}/fotos?fotoId=${fotoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fout bij verwijderen foto');
  }
}

