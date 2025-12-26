import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - Haal alle opnamen op
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const opnameType = searchParams.get('opnameType');

    let query = 'SELECT * FROM opnamen WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (opnameType) {
      query += ' AND opname_type = ?';
      params.push(opnameType);
    }

    query += ' ORDER BY created_at DESC';

    const opnamen = db.prepare(query).all(...params);

    return NextResponse.json(opnamen);
  } catch (error) {
    console.error('Error fetching opnamen:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen opnamen' },
      { status: 500 }
    );
  }
}

// POST - Maak nieuwe opname aan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      opnameType,
      gebouwnaam,
      adres,
      postcode,
      huisnummer,
      huisnummertoevoeging,
      straat,
      stad,
      gebouwtype,
      energielabel,
      gebouwOppervlakte,
      datumOpname,
      contactpersoon,
      latitude,
      longitude,
      createdBy,
      bagVerblijfsobjectId,
    } = body;

    // Valideer verplichte velden (alleen opnameType is verplicht)
    if (!opnameType) {
      return NextResponse.json(
        { error: 'Opname type is verplicht' },
        { status: 400 }
      );
    }

    // Gebruik default waarden als velden leeg zijn
    const finalGebouwnaam = gebouwnaam || 'Nieuw gebouw';
    const finalAdres = adres || '';
    const finalDatumOpname = datumOpname || new Date().toISOString().split('T')[0];

    const db = getDb();
    const id = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO opnamen (
        id, opname_type, gebouwnaam, adres, postcode, huisnummer,
        huisnummertoevoeging, straat, stad, gebouwtype, energielabel,
        gebouw_oppervlakte, datum_opname, contactpersoon, latitude,
        longitude, created_by, bag_verblijfsobject_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress')
    `);

    stmt.run(
      id,
      opnameType,
      finalGebouwnaam,
      finalAdres,
      postcode || null,
      huisnummer || null,
      huisnummertoevoeging || null,
      straat || null,
      stad || null,
      gebouwtype || null,
      energielabel || null,
      gebouwOppervlakte ? parseFloat(gebouwOppervlakte) : null,
      finalDatumOpname,
      contactpersoon || null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      createdBy || null,
      bagVerblijfsobjectId || null
    );

    // Haal de nieuwe opname op
    const opname = db.prepare('SELECT * FROM opnamen WHERE id = ?').get(id);

    return NextResponse.json(opname, { status: 201 });
  } catch (error) {
    console.error('Error creating opname:', error);
    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
    return NextResponse.json(
      { 
        error: 'Server fout: De database is mogelijk niet bereikbaar. Controleer of de database draait en probeer de pagina te verversen.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
