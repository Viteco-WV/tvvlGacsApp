/**
 * Script om database data te bekijken
 * 
 * Run met: npm run view:db
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

// Database pad
const dbPath = path.join(process.cwd(), 'data', 'gacs.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database niet gevonden op:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

console.log('📊 GACS Database Overzicht\n');
console.log('='.repeat(60));

// Overzicht van alle tabellen
console.log('\n📋 Tabellen in database:');
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
  ORDER BY name
`).all() as Array<{ name: string }>;

tables.forEach((table, index) => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
  console.log(`  ${index + 1}. ${table.name} (${count.count} records)`);
});

// Opnamen overzicht
console.log('\n\n🏢 Opnamen:');
console.log('-'.repeat(60));
const opnamen = db.prepare(`
  SELECT 
    id,
    gebouwnaam,
    adres,
    opname_type,
    status,
    datum_opname,
    created_at
  FROM opnamen
  ORDER BY created_at DESC
  LIMIT 10
`).all() as Array<{
  id: string;
  gebouwnaam: string;
  adres: string;
  opname_type: string;
  status: string;
  datum_opname: string;
  created_at: string;
}>;

if (opnamen.length === 0) {
  console.log('  Geen opnamen gevonden');
} else {
  opnamen.forEach((opname, index) => {
    console.log(`\n  ${index + 1}. ${opname.gebouwnaam}`);
    console.log(`     ID: ${opname.id}`);
    console.log(`     Adres: ${opname.adres}`);
    console.log(`     Type: ${opname.opname_type} | Status: ${opname.status}`);
    console.log(`     Datum: ${opname.datum_opname}`);
    console.log(`     Aangemaakt: ${opname.created_at}`);
  });
}

// Secties overzicht
console.log('\n\n📑 Secties per opname:');
console.log('-'.repeat(60));
const secties = db.prepare(`
  SELECT 
    os.opname_id,
    o.gebouwnaam,
    os.sectie_naam,
    os.sectie_type,
    os.is_voltooid,
    os.laatste_wijziging,
    COUNT(oa.id) as aantal_antwoorden
  FROM opname_secties os
  LEFT JOIN opnamen o ON os.opname_id = o.id
  LEFT JOIN opname_antwoorden oa ON os.opname_id = oa.opname_id AND os.sectie_naam = oa.sectie_naam
  GROUP BY os.opname_id, os.sectie_naam
  ORDER BY o.gebouwnaam, os.sectie_naam
  LIMIT 20
`).all() as Array<{
  opname_id: string;
  gebouwnaam: string;
  sectie_naam: string;
  sectie_type: string;
  is_voltooid: number;
  laatste_wijziging: string;
  aantal_antwoorden: number;
}>;

if (secties.length === 0) {
  console.log('  Geen secties gevonden');
} else {
  secties.forEach((sectie, index) => {
    const voltooid = sectie.is_voltooid ? '✅' : '❌';
    console.log(`\n  ${index + 1}. ${sectie.gebouwnaam} - ${sectie.sectie_naam}`);
    console.log(`     ${voltooid} Voltooid: ${sectie.is_voltooid ? 'Ja' : 'Nee'} | Antwoorden: ${sectie.aantal_antwoorden}`);
    console.log(`     Laatste wijziging: ${sectie.laatste_wijziging || 'N/A'}`);
  });
}

// Foto's overzicht
console.log('\n\n📸 Foto\'s:');
console.log('-'.repeat(60));
const fotos = db.prepare(`
  SELECT 
    COUNT(*) as totaal,
    COUNT(CASE WHEN type = 'opname' THEN 1 END) as opname_fotos,
    COUNT(CASE WHEN type = 'sectie' THEN 1 END) as sectie_fotos
  FROM (
    SELECT 'opname' as type FROM opname_fotos
    UNION ALL
    SELECT 'sectie' as type FROM opname_sectie_fotos
  )
`).get() as { totaal: number; opname_fotos: number; sectie_fotos: number };

console.log(`  Totaal foto's: ${fotos.totaal}`);
console.log(`  Opname foto's: ${fotos.opname_fotos}`);
console.log(`  Sectie foto's: ${fotos.sectie_fotos}`);

// Laatste antwoorden
console.log('\n\n💬 Laatste antwoorden (top 5):');
console.log('-'.repeat(60));
const laatsteAntwoorden = db.prepare(`
  SELECT 
    oa.vraag_id,
    oa.vraag_tekst,
    oa.antwoord_waarde,
    oa.sectie_naam,
    o.gebouwnaam
  FROM opname_antwoorden oa
  LEFT JOIN opnamen o ON oa.opname_id = o.id
  ORDER BY oa.id DESC
  LIMIT 5
`).all() as Array<{
  vraag_id: string;
  vraag_tekst: string;
  antwoord_waarde: string;
  sectie_naam: string;
  gebouwnaam: string;
}>;

if (laatsteAntwoorden.length === 0) {
  console.log('  Geen antwoorden gevonden');
} else {
  laatsteAntwoorden.forEach((antwoord, index) => {
    console.log(`\n  ${index + 1}. ${antwoord.gebouwnaam} - ${antwoord.sectie_naam}`);
    console.log(`     Vraag: ${antwoord.vraag_tekst || antwoord.vraag_id}`);
    console.log(`     Antwoord: ${antwoord.antwoord_waarde || 'N/A'}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 Tip: Gebruik SQLite browser tools voor gedetailleerde queries');
console.log('   - DB Browser for SQLite: https://sqlitebrowser.org/');
console.log('   - VS Code extension: SQLite Viewer');
console.log('   - Command line: sqlite3 data/gacs.db\n');

db.close();

