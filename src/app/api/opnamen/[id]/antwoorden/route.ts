import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

// POST - Sla antwoorden op voor een sectie
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
    const body = await request.json();
    const { sectieNaam, antwoorden, sectieType = 'basis' } = body;
    const db = getDb();

    if (!sectieNaam || !antwoorden || !Array.isArray(antwoorden)) {
      return NextResponse.json(
        { error: 'Ongeldige data: sectieNaam en antwoorden array zijn verplicht' },
        { status: 400 }
      );
    }

    // Begin transaction
    const transaction = db.transaction(() => {
      // Verwijder bestaande antwoorden voor deze sectie
      db.prepare('DELETE FROM opname_antwoorden WHERE opname_id = ? AND sectie_naam = ?').run(opnameId, sectieNaam);

      // Maak nieuwe antwoorden aan
      const insertStmt = db.prepare(`
        INSERT INTO opname_antwoorden (
          id, opname_id, sectie_naam, vraag_id, vraag_tekst,
          antwoord_waarde, antwoord_optie, antwoord_nummer,
          antwoord_boolean, sectie_nummer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const antwoord of antwoorden) {
        const id = randomUUID();
        insertStmt.run(
          id,
          opnameId,
          sectieNaam,
          antwoord.vraagId,
          antwoord.vraagTekst || null,
          antwoord.antwoordWaarde || null,
          antwoord.antwoordOptie || null,
          antwoord.antwoordNummer || null,
          antwoord.antwoordBoolean !== undefined ? (antwoord.antwoordBoolean ? 1 : 0) : null,
          antwoord.sectieNummer || null
        );
      }

      // Update of maak sectie aan
      const existingSectie = db.prepare('SELECT * FROM opname_secties WHERE opname_id = ? AND sectie_naam = ?').get(opnameId, sectieNaam);
      
      if (existingSectie) {
        db.prepare(`
          UPDATE opname_secties SET
            is_voltooid = 1,
            laatste_wijziging = datetime('now')
          WHERE opname_id = ? AND sectie_naam = ?
        `).run(opnameId, sectieNaam);
      } else {
        const sectieId = randomUUID();
        db.prepare(`
          INSERT INTO opname_secties (id, opname_id, sectie_naam, sectie_type, is_voltooid)
          VALUES (?, ?, ?, ?, 1)
        `).run(sectieId, opnameId, sectieNaam, sectieType);
      }
    });

    transaction();

    return NextResponse.json({
      message: 'Antwoorden opgeslagen',
      count: antwoorden.length,
    });
  } catch (error) {
    console.error('Error saving antwoorden:', error);
    return NextResponse.json(
      { error: 'Fout bij opslaan antwoorden' },
      { status: 500 }
    );
  }
}

// GET - Haal antwoorden op voor een sectie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
    const { searchParams } = new URL(request.url);
    const sectieNaam = searchParams.get('sectieNaam');
    const db = getDb();

    let query = 'SELECT * FROM opname_antwoorden WHERE opname_id = ?';
    const queryParams: any[] = [opnameId];

    if (sectieNaam) {
      query += ' AND sectie_naam = ?';
      queryParams.push(sectieNaam);
    }

    query += ' ORDER BY sectie_naam ASC, vraag_id ASC';

    const antwoorden = db.prepare(query).all(...queryParams);

    return NextResponse.json(antwoorden);
  } catch (error) {
    console.error('Error fetching antwoorden:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen antwoorden' },
      { status: 500 }
    );
  }
}
