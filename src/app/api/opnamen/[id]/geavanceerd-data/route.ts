import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

// POST/PUT - Sla geavanceerd data op
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
    const body = await request.json();
    const { dataType, dataJson } = body;
    const db = getDb();

    if (!dataType) {
      return NextResponse.json(
        { error: 'dataType is verplicht' },
        { status: 400 }
      );
    }

    // Check of record al bestaat
    const existing = db.prepare('SELECT * FROM opname_geavanceerd_data WHERE opname_id = ? AND data_type = ?').get(opnameId, dataType);

    let geavanceerdData;
    if (existing) {
      // Update
      db.prepare(`
        UPDATE opname_geavanceerd_data SET
          data_json = ?,
          updated_at = datetime('now')
        WHERE opname_id = ? AND data_type = ?
      `).run(
        dataJson ? JSON.stringify(dataJson) : null,
        opnameId,
        dataType
      );
      geavanceerdData = db.prepare('SELECT * FROM opname_geavanceerd_data WHERE opname_id = ? AND data_type = ?').get(opnameId, dataType);
    } else {
      // Create
      const id = randomUUID();
      db.prepare(`
        INSERT INTO opname_geavanceerd_data (id, opname_id, data_type, data_json)
        VALUES (?, ?, ?, ?)
      `).run(
        id,
        opnameId,
        dataType,
        dataJson ? JSON.stringify(dataJson) : null
      );
      geavanceerdData = db.prepare('SELECT * FROM opname_geavanceerd_data WHERE id = ?').get(id);
    }

    return NextResponse.json(geavanceerdData);
  } catch (error) {
    console.error('Error saving geavanceerd data:', error);
    return NextResponse.json(
      { error: 'Fout bij opslaan geavanceerd data' },
      { status: 500 }
    );
  }
}

// GET - Haal geavanceerd data op
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('dataType');
    const db = getDb();

    let query = 'SELECT * FROM opname_geavanceerd_data WHERE opname_id = ?';
    const queryParams: any[] = [opnameId];

    if (dataType) {
      query += ' AND data_type = ?';
      queryParams.push(dataType);
    }

    const geavanceerdData = db.prepare(query).all(...queryParams);

    return NextResponse.json(geavanceerdData);
  } catch (error) {
    console.error('Error fetching geavanceerd data:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen geavanceerd data' },
      { status: 500 }
    );
  }
}
