import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { savePhoto, deletePhoto } from '@/lib/file-utils';
import { randomUUID } from 'crypto';

// POST - Upload foto voor sectie
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectieNaam: string }> }
) {
  try {
    const { id: opnameId, sectieNaam } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vraagId = formData.get('vraagId') as string | null;
    const beschrijving = formData.get('beschrijving') as string | null;
    const volgorde = parseInt(formData.get('volgorde') as string) || 0;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geüpload' },
        { status: 400 }
      );
    }

    if (!vraagId) {
      return NextResponse.json(
        { error: 'vraagId is verplicht voor sectie foto\'s' },
        { status: 400 }
      );
    }

    // Sla foto op in file system (met vraagId in bestandsnaam)
    const uploadResult = await savePhoto(opnameId, file, 'sectie', sectieNaam, vraagId || undefined);

    // Sla metadata op in database
    const db = getDb();
    const id = randomUUID();

    db.prepare(`
      INSERT INTO opname_sectie_fotos (
        id, opname_id, sectie_naam, vraag_id, bestandsnaam,
        bestandspad, mime_type, bestandsgrootte, volgorde, beschrijving
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      opnameId,
      sectieNaam,
      vraagId,
      uploadResult.filename,
      uploadResult.filepath,
      uploadResult.mimeType,
      uploadResult.size,
      volgorde,
      beschrijving || null
    );

    const sectieFoto = db.prepare('SELECT * FROM opname_sectie_fotos WHERE id = ?').get(id);

    return NextResponse.json(sectieFoto, { status: 201 });
  } catch (error) {
    console.error('Error uploading sectie foto:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fout bij uploaden foto' },
      { status: 500 }
    );
  }
}

// DELETE - Verwijder sectie foto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectieNaam: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const fotoId = searchParams.get('fotoId');
    const db = getDb();

    if (!fotoId) {
      return NextResponse.json(
        { error: 'fotoId is verplicht' },
        { status: 400 }
      );
    }

    // Haal foto op om bestandspad te krijgen
    const foto = db.prepare('SELECT * FROM opname_sectie_fotos WHERE id = ?').get(fotoId) as any;

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto niet gevonden' },
        { status: 404 }
      );
    }

    // Verwijder bestand uit file system
    await deletePhoto(foto.bestandspad);

    // Verwijder record uit database
    db.prepare('DELETE FROM opname_sectie_fotos WHERE id = ?').run(fotoId);

    return NextResponse.json({ message: 'Foto verwijderd' });
  } catch (error) {
    console.error('Error deleting sectie foto:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen foto' },
      { status: 500 }
    );
  }
}
