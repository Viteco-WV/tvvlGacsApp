/**
 * Helper functie om antwoorden op te slaan (database + backward compatibility met localStorage)
 */

import { saveAntwoorden, uploadSectieFoto } from './opname-api';
import { useOpnameId } from './useOpname';

export interface AnswerData {
  [key: string]: string | number | boolean | File | null | undefined;
}

/**
 * Converteert antwoorden object naar array formaat voor database
 */
function convertAnswersToArray(
  answers: AnswerData,
  questions: Array<{ id: string; question?: string; section?: string }>
): Array<{
  vraagId: string;
  vraagTekst?: string;
  antwoordWaarde?: string;
  antwoordOptie?: string;
  antwoordNummer?: number;
  antwoordBoolean?: boolean;
  sectieNummer?: string;
}> {
  const result: Array<{
    vraagId: string;
    vraagTekst?: string;
    antwoordWaarde?: string;
    antwoordOptie?: string;
    antwoordNummer?: number;
    antwoordBoolean?: boolean;
    sectieNummer?: string;
  }> = [];

  for (const [key, value] of Object.entries(answers)) {
    // Skip metadata velden en foto's (die worden apart gehandeld)
    if (key === 'section' || key === 'timestamp' || value instanceof File) {
      continue;
    }

    // Vind vraag info
    const question = questions.find((q) => q.id === key);

    // Bepaal antwoord type
    let antwoordWaarde: string | undefined;
    let antwoordOptie: string | undefined;
    let antwoordNummer: number | undefined;
    let antwoordBoolean: boolean | undefined;

    if (typeof value === 'string') {
      // Check of het een base64 foto is (oude localStorage data)
      if (value.startsWith('data:image')) {
        continue; // Skip, wordt apart gehandeld
      }
      antwoordWaarde = value;
    } else if (typeof value === 'number') {
      antwoordNummer = value;
    } else if (typeof value === 'boolean') {
      antwoordBoolean = value;
    } else if (value !== null && value !== undefined) {
      antwoordWaarde = String(value);
    }

    result.push({
      vraagId: key,
      vraagTekst: question?.question,
      antwoordWaarde,
      antwoordOptie,
      antwoordNummer,
      antwoordBoolean,
      sectieNummer: question?.section,
    });
  }

  return result;
}

/**
 * Sla antwoorden op in database en localStorage (backward compatibility)
 */
export async function saveAnswersToDatabase(
  opnameId: string | null,
  sectieNaam: string,
  answers: AnswerData,
  questions: Array<{ id: string; question?: string; section?: string }>,
  sectieType: 'basis' | 'geavanceerd' = 'basis'
): Promise<void> {
  if (!opnameId) {
    // Geen opname ID, sla alleen in localStorage (backward compatibility)
    try {
      const existingData = localStorage.getItem('gacsOpnamenData');
      const parsedData = existingData ? JSON.parse(existingData) : {};
      parsedData[sectieNaam] = answers;
      localStorage.setItem('gacsOpnamenData', JSON.stringify(parsedData));
    } catch (error) {
      console.error('localStorage quota exceeded:', error);
      throw new Error('localStorage quota exceeded. Start een nieuwe audit om data in de database op te slaan.');
    }
    return;
  }

  try {
    // Converteer antwoorden
    const antwoordenArray = convertAnswersToArray(answers, questions);

    // Sla op in database
    await saveAntwoorden(opnameId, {
      sectieNaam,
      sectieType,
      antwoorden: antwoordenArray,
    });

    // NIET meer naar localStorage schrijven als we een opnameId hebben
    // Data wordt nu alleen in de database opgeslagen
  } catch (error) {
    console.error('Fout bij opslaan antwoorden in database:', error);
    // Alleen fallback naar localStorage als database opslaan faalt EN er geen opnameId is
    // Maar we hebben al een opnameId, dus gooi de error door
    throw error;
  }
}

/**
 * Upload foto's uit antwoorden object
 * Converteert base64 strings terug naar Files en uploadt ze
 */
export async function uploadAnswerPhotos(
  opnameId: string | null,
  sectieNaam: string,
  answers: AnswerData,
  photoFiles: Map<string, File> // Map van vraagId -> File object
): Promise<void> {
  if (!opnameId) {
    return; // Geen opname ID, skip foto upload
  }

  // Upload alle foto's die als File object beschikbaar zijn
  for (const [vraagId, file] of photoFiles.entries()) {
    try {
      await uploadSectieFoto(opnameId, sectieNaam, file, vraagId);
    } catch (error) {
      console.error(`Fout bij uploaden foto voor ${vraagId}:`, error);
      // Ga door met andere foto's
    }
  }
}

