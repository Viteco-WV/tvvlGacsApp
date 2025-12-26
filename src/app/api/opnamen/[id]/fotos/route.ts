import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { savePhoto, deletePhoto } from '@/lib/file-utils';
import { randomUUID } from 'crypto';

// POST - Upload foto voor opname
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fotoType = (formData.get('fotoType') as string) || 'gebouw';
    const beschrijving = formData.get('beschrijving') as string | null;
    const volgorde = parseInt(formData.get('volgorde') as string) || 0;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geüpload' },
        { status: 400 }
      );
    }

    // Sla foto op in file system (gebouwfoto, geen vraagId nodig)
    const uploadResult = await savePhoto(opnameId, file, 'opname', undefined, 'gebouwfoto');

    // Sla metadata op in database
    const db = getDb();
    const id = randomUUID();

    db.prepare(`
      INSERT INTO opname_fotos (
        id, opname_id, foto_type, bestandsnaam, bestandspad,
        mime_type, bestandsgrootte, volgorde, beschrijving
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      opnameId,
      fotoType,
      uploadResult.filename,
      uploadResult.filepath,
      uploadResult.mimeType,
      uploadResult.size,
      volgorde,
      beschrijving || null
    );

    const opnameFoto = db.prepare('SELECT * FROM opname_fotos WHERE id = ?').get(id);

    return NextResponse.json(opnameFoto, { status: 201 });
  } catch (error) {
    console.error('Error uploading foto:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fout bij uploaden foto' },
      { status: 500 }
    );
  }
}

// DELETE - Verwijder foto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opnameId } = await params;
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
    const foto = db.prepare('SELECT * FROM opname_fotos WHERE id = ?').get(fotoId) as any;

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto niet gevonden' },
        { status: 404 }
      );
    }

    // Verwijder bestand uit file system
    await deletePhoto(foto.bestandspad);

    // Verwijder record uit database
    db.prepare('DELETE FROM opname_fotos WHERE id = ?').run(fotoId);

    return NextResponse.json({ message: 'Foto verwijderd' });
  } catch (error) {
    console.error('Error deleting foto:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen foto' },
      { status: 500 }
    );
  }
}
