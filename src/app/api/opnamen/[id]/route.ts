import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { deleteOpnameFiles } from '@/lib/file-utils';
import { randomUUID } from 'crypto';

// GET - Haal specifieke opname op
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const opname = db.prepare('SELECT * FROM opnamen WHERE id = ?').get(id) as any;

    if (!opname) {
      return NextResponse.json(
        { error: 'Opname niet gevonden' },
        { status: 404 }
      );
    }

    // Haal gerelateerde data op
    const secties = db.prepare('SELECT * FROM opname_secties WHERE opname_id = ? ORDER BY sectie_naam ASC').all(id);
    const fotos = db.prepare('SELECT * FROM opname_fotos WHERE opname_id = ? ORDER BY volgorde ASC').all(id);
    const antwoorden = db.prepare('SELECT * FROM opname_antwoorden WHERE opname_id = ? ORDER BY sectie_naam ASC, vraag_id ASC').all(id);
    const sectieFotos = db.prepare('SELECT * FROM opname_sectie_fotos WHERE opname_id = ? ORDER BY sectie_naam ASC, volgorde ASC').all(id);
    const contactpersonen = db.prepare('SELECT * FROM contactpersonen WHERE opname_id = ? ORDER BY volgorde ASC').all(id);
    const geavanceerdData = db.prepare('SELECT * FROM opname_geavanceerd_data WHERE opname_id = ?').all(id);

    return NextResponse.json({
      ...opname,
      secties,
      fotos,
      antwoorden,
      sectieFotos,
      contactpersonen,
      geavanceerdData,
    });
  } catch (error) {
    console.error('Error fetching opname:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen opname' },
      { status: 500 }
    );
  }
}

// PUT - Update opname
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const {
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
      status,
    } = body;

    const stmt = db.prepare(`
      UPDATE opnamen SET
        gebouwnaam = COALESCE(?, gebouwnaam),
        adres = COALESCE(?, adres),
        postcode = ?,
        huisnummer = ?,
        huisnummertoevoeging = ?,
        straat = ?,
        stad = ?,
        gebouwtype = ?,
        energielabel = ?,
        gebouw_oppervlakte = ?,
        datum_opname = COALESCE(?, datum_opname),
        contactpersoon = ?,
        latitude = ?,
        longitude = ?,
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      gebouwnaam || null,
      adres || null,
      postcode || null,
      huisnummer || null,
      huisnummertoevoeging || null,
      straat || null,
      stad || null,
      gebouwtype || null,
      energielabel || null,
      gebouwOppervlakte ? parseFloat(gebouwOppervlakte) : null,
      datumOpname || null,
      contactpersoon || null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      status || null,
      id
    );

    const opname = db.prepare('SELECT * FROM opnamen WHERE id = ?').get(id);
    const secties = db.prepare('SELECT * FROM opname_secties WHERE opname_id = ?').all(id);
    const fotos = db.prepare('SELECT * FROM opname_fotos WHERE opname_id = ?').all(id);

    return NextResponse.json({
      ...opname,
      secties,
      fotos,
    });
  } catch (error) {
    console.error('Error updating opname:', error);
    return NextResponse.json(
      { error: 'Fout bij updaten opname' },
      { status: 500 }
    );
  }
}

// DELETE - Verwijder opname
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Verwijder eerst alle fysieke bestanden
    try {
      await deleteOpnameFiles(id);
    } catch (error) {
      console.error('Fout bij verwijderen bestanden:', error);
      // Ga door met verwijderen uit database, zelfs als bestanden verwijderen faalt
    }

    // Verwijder opname uit database (CASCADE verwijdert automatisch alle gerelateerde records)
    db.prepare('DELETE FROM opnamen WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Opname verwijderd' });
  } catch (error) {
    console.error('Error deleting opname:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen opname' },
      { status: 500 }
    );
  }
}
