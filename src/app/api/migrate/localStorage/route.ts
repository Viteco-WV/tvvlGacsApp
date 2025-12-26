import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

interface BuildingData {
  buildingName: string;
  address: string;
  buildingType?: string;
  energyLabel?: string;
  contactPerson?: string;
  date: string;
  photo?: string; // Base64 encoded
  postcode?: string;
  houseNumber?: string;
  houseAddition?: string;
  street?: string;
  city?: string;
  buildingArea?: number;
  latitude?: number;
  longitude?: number;
}

interface OpnamenData {
  [key: string]: Record<string, unknown>;
}

/**
 * Converteert base64 string naar bestand
 */
async function saveBase64AsFile(
  base64String: string,
  opnameId: string,
  filename: string,
  type: 'opname' | 'sectie' = 'opname',
  sectieNaam?: string
): Promise<string> {
  // Extract mime type en data
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Ongeldige base64 string');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Bepaal extensie
  const extension = mimeType.split('/')[1] || 'jpg';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const finalFilename = `${timestamp}-${randomString}.${extension}`;

  // Maak directory structuur
  let uploadPath: string;
  if (type === 'sectie' && sectieNaam) {
    uploadPath = join(process.cwd(), 'public', 'uploads', 'opnamen', opnameId, 'secties', sectieNaam);
  } else {
    uploadPath = join(process.cwd(), 'public', 'uploads', 'opnamen', opnameId);
  }

  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }

  const filepath = join(uploadPath, finalFilename);
  await writeFile(filepath, buffer);

  // Retourneer relatief pad vanaf public directory
  return filepath.replace(/^.*\/public\//, '/');
}

/**
 * Migreert localStorage data naar database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buildingData, opnamenData, opnameType = 'basis' } = body;
    const db = getDb();

    if (!buildingData || !opnamenData) {
      return NextResponse.json(
        { error: 'buildingData en opnamenData zijn verplicht' },
        { status: 400 }
      );
    }

    const bData = buildingData as BuildingData;
    const oData = opnamenData as OpnamenData;

    // 1. Maak opname aan
    const opnameId = randomUUID();
    db.prepare(`
      INSERT INTO opnamen (
        id, opname_type, gebouwnaam, adres, postcode, huisnummer,
        huisnummertoevoeging, straat, stad, gebouwtype, energielabel,
        gebouw_oppervlakte, datum_opname, contactpersoon, latitude,
        longitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `).run(
      opnameId,
      opnameType,
      bData.buildingName || 'Onbekend gebouw',
      bData.address || '',
      bData.postcode || null,
      bData.houseNumber || null,
      bData.houseAddition || null,
      bData.street || null,
      bData.city || null,
      bData.buildingType || null,
      bData.energyLabel || null,
      bData.buildingArea ? parseFloat(bData.buildingArea.toString()) : null,
      bData.date || new Date().toISOString(),
      bData.contactPerson || null,
      bData.latitude ? parseFloat(bData.latitude.toString()) : null,
      bData.longitude ? parseFloat(bData.longitude.toString()) : null
    );

    // 2. Migreer gebouwfoto als die er is
    if (bData.photo && bData.photo.startsWith('data:')) {
      try {
        const filepath = await saveBase64AsFile(
          bData.photo,
          opnameId,
          'gebouw-foto',
          'opname'
        );

        const fotoId = randomUUID();
        db.prepare(`
          INSERT INTO opname_fotos (
            id, opname_id, foto_type, bestandsnaam, bestandspad,
            mime_type, volgorde, beschrijving
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          fotoId,
          opnameId,
          'gebouw',
          filepath.split('/').pop() || 'gebouw-foto.jpg',
          filepath,
          'image/jpeg',
          0,
          'Gebouwfoto'
        );
      } catch (error) {
        console.error('Fout bij migreren gebouwfoto:', error);
        // Ga door met migratie, foto is optioneel
      }
    }

    // 3. Migreer secties en antwoorden
    const sectieNamen = [
      'algemeen',
      'verwarmingssysteem',
      'warmTapwater',
      'ventilatie',
      'verlichting',
      'airconditioning',
      'zonwering',
      'gebouwmanagement',
    ];

    for (const sectieNaam of sectieNamen) {
      const sectieData = oData[sectieNaam];
      if (!sectieData || Object.keys(sectieData).length === 0) {
        continue;
      }

      // Maak sectie aan
      const sectieId = randomUUID();
      db.prepare(`
        INSERT INTO opname_secties (id, opname_id, sectie_naam, sectie_type, is_voltooid)
        VALUES (?, ?, ?, ?, 1)
      `).run(sectieId, opnameId, sectieNaam, opnameType);

      // Migreer antwoorden
      const antwoorden: Array<{
        vraagId: string;
        vraagTekst?: string;
        antwoordWaarde?: string;
        antwoordOptie?: string;
        antwoordNummer?: number;
        antwoordBoolean?: boolean;
        sectieNummer?: string;
      }> = [];

      for (const [key, value] of Object.entries(sectieData)) {
        // Skip metadata velden
        if (key === 'section' || key === 'timestamp') {
          continue;
        }

        // Bepaal antwoord type
        let antwoordWaarde: string | undefined;
        let antwoordOptie: string | undefined;
        let antwoordNummer: number | undefined;
        let antwoordBoolean: boolean | undefined;

        if (typeof value === 'string') {
          // Check of het een base64 foto is
          if (value.startsWith('data:image')) {
            // Foto wordt later afgehandeld
            continue;
          }
          antwoordWaarde = value;
        } else if (typeof value === 'number') {
          antwoordNummer = value;
        } else if (typeof value === 'boolean') {
          antwoordBoolean = value;
        } else if (Array.isArray(value)) {
          antwoordOptie = value.join(', ');
        } else if (value !== null && value !== undefined) {
          antwoordWaarde = String(value);
        }

        antwoorden.push({
          vraagId: key,
          antwoordWaarde,
          antwoordOptie,
          antwoordNummer,
          antwoordBoolean,
        });
      }

      if (antwoorden.length > 0) {
        const insertStmt = db.prepare(`
          INSERT INTO opname_antwoorden (
            id, opname_id, sectie_naam, vraag_id, vraag_tekst,
            antwoord_waarde, antwoord_optie, antwoord_nummer, antwoord_boolean
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const antwoord of antwoorden) {
          const antwoordId = randomUUID();
          insertStmt.run(
            antwoordId,
            opnameId,
            sectieNaam,
            antwoord.vraagId,
            antwoord.vraagTekst || null,
            antwoord.antwoordWaarde || null,
            antwoord.antwoordOptie || null,
            antwoord.antwoordNummer || null,
            antwoord.antwoordBoolean !== undefined ? (antwoord.antwoordBoolean ? 1 : 0) : null
          );
        }
      }

      // Migreer foto's uit deze sectie
      for (const [key, value] of Object.entries(sectieData)) {
        if (typeof value === 'string' && value.startsWith('data:image')) {
          try {
            const filepath = await saveBase64AsFile(
              value,
              opnameId,
              `${sectieNaam}-${key}`,
              'sectie',
              sectieNaam
            );

            const fotoId = randomUUID();
            db.prepare(`
              INSERT INTO opname_sectie_fotos (
                id, opname_id, sectie_naam, vraag_id, bestandsnaam,
                bestandspad, mime_type, volgorde, beschrijving
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              fotoId,
              opnameId,
              sectieNaam,
              key,
              filepath.split('/').pop() || `${key}.jpg`,
              filepath,
              'image/jpeg',
              0,
              `Foto voor ${key}`
            );
          } catch (error) {
            console.error(`Fout bij migreren foto ${key} in sectie ${sectieNaam}:`, error);
            // Ga door met migratie
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Migratie succesvol',
      opnameId,
    });
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
    return NextResponse.json(
      { error: 'Fout bij migreren data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
