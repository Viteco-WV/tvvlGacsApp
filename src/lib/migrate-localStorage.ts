/**
 * Client-side utility functie om localStorage data naar database te migreren
 * Gebruik deze functie in je React componenten
 */

export interface MigrationResult {
  success: boolean;
  opnameId?: string;
  error?: string;
}

/**
 * Migreert localStorage data naar database via API
 */
export async function migrateLocalStorageToDatabase(
  opnameType: 'basis' | 'geavanceerd' = 'basis'
): Promise<MigrationResult> {
  try {
    // Haal data uit localStorage
    const buildingDataStr = localStorage.getItem('gacsBuildingData');
    const opnamenDataStr = localStorage.getItem('gacsOpnamenData');

    if (!buildingDataStr || !opnamenDataStr) {
      return {
        success: false,
        error: 'Geen data gevonden in localStorage',
      };
    }

    const buildingData = JSON.parse(buildingDataStr);
    const opnamenData = JSON.parse(opnamenDataStr);

    // Controleer of er daadwerkelijk data is
    const hasData = Object.keys(opnamenData).some(
      (key) => opnamenData[key] && Object.keys(opnamenData[key]).length > 0
    );

    if (!hasData) {
      return {
        success: false,
        error: 'Geen opname data gevonden',
      };
    }

    // Stuur data naar migratie API
    const response = await fetch('/api/migrate/localStorage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        buildingData,
        opnamenData,
        opnameType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Fout bij migreren data',
      };
    }

    const result = await response.json();

    // Optioneel: localStorage legen na succesvolle migratie
    // localStorage.removeItem('gacsBuildingData');
    // localStorage.removeItem('gacsOpnamenData');

    return {
      success: true,
      opnameId: result.opnameId,
    };
  } catch (error) {
    console.error('Error migrating localStorage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

/**
 * Controleert of er data in localStorage is die gemigreerd kan worden
 */
export function hasLocalStorageData(): boolean {
  const buildingData = localStorage.getItem('gacsBuildingData');
  const opnamenData = localStorage.getItem('gacsOpnamenData');

  if (!buildingData || !opnamenData) {
    return false;
  }

  try {
    const opnamen = JSON.parse(opnamenData);
    return Object.keys(opnamen).some(
      (key) => opnamen[key] && Object.keys(opnamen[key]).length > 0
    );
  } catch {
    return false;
  }
}

