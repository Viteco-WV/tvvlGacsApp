import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

// POST - Voeg contactpersoon toe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
    const body = await request.json();
    const { voornaam, achternaam, organisatie, rol, email, telefoon, volgorde } = body;
    const db = getDb();

    if (!voornaam || !achternaam) {
      return NextResponse.json(
        { error: 'Voornaam en achternaam zijn verplicht' },
        { status: 400 }
      );
    }

    const id = randomUUID();

    db.prepare(`
      INSERT INTO contactpersonen (
        id, opname_id, voornaam, achternaam, organisatie,
        rol, email, telefoon, volgorde
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      opnameId,
      voornaam,
      achternaam,
      organisatie || null,
      rol || null,
      email || null,
      telefoon || null,
      volgorde || 0
    );

    const contactpersoon = db.prepare('SELECT * FROM contactpersonen WHERE id = ?').get(id);

    return NextResponse.json(contactpersoon, { status: 201 });
  } catch (error) {
    console.error('Error creating contactpersoon:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken contactpersoon' },
      { status: 500 }
    );
  }
}

// GET - Haal alle contactpersonen op
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
    const db = getDb();

    const contactpersonen = db.prepare('SELECT * FROM contactpersonen WHERE opname_id = ? ORDER BY volgorde ASC').all(opnameId);

    return NextResponse.json(contactpersonen);
  } catch (error) {
    console.error('Error fetching contactpersonen:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen contactpersonen' },
      { status: 500 }
    );
  }
}
