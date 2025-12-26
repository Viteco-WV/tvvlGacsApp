/**
 * Test script om te verifiëren dat data correct wordt opgeslagen in de database
 * 
 * Run met: npm run test:db
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

// Database pad
const dbPath = path.join(process.cwd(), 'data', 'gacs.db');

// Zorg dat data directory bestaat
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getDb(): Database.Database {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  return db;
}

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(test: string, passed: boolean, error?: string, details?: any) {
  results.push({ test, passed, error, details });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${test}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
  if (details) {
    console.log(`   Details:`, JSON.stringify(details, null, 2));
  }
}

async function testCreateOpname() {
  try {
    const db = getDb();
    const testId = randomUUID();
    const testGebouwnaam = `Test Gebouw ${Date.now()}`;
    
    const stmt = db.prepare(`
      INSERT INTO opnamen (
        id, opname_type, gebouwnaam, adres, datum_opname, status
      ) VALUES (?, ?, ?, ?, ?, 'in_progress')
    `);
    
    stmt.run(
      testId,
      'basis',
      testGebouwnaam,
      'Teststraat 123, Amsterdam',
      new Date().toISOString().split('T')[0]
    );
    
    // Verifieer dat opname is aangemaakt
    const opname = db.prepare('SELECT * FROM opnamen WHERE id = ?').get(testId) as any;
    
    if (opname && opname.gebouwnaam === testGebouwnaam) {
      logTest('Opname aanmaken', true, undefined, { id: testId, gebouwnaam: opname.gebouwnaam });
      return testId;
    } else {
      logTest('Opname aanmaken', false, 'Opname niet gevonden of incorrect');
      return null;
    }
  } catch (error) {
    logTest('Opname aanmaken', false, error instanceof Error ? error.message : 'Onbekende fout');
    return null;
  }
}

async function testSaveAnswers(opnameId: string) {
  try {
    const db = getDb();
    const sectieNaam = 'verwarmingssysteem';
    
    // Test antwoorden
    const testAntwoorden = [
      {
        id: randomUUID(),
        opname_id: opnameId,
        sectie_naam: sectieNaam,
        vraag_id: 'warmteafgifte_van_toepassing',
        vraag_tekst: 'Vraag 1.1 - Van toepassing?',
        antwoord_waarde: 'Ja',
        antwoord_optie: null,
        antwoord_nummer: null,
        antwoord_boolean: null,
        sectie_nummer: '1 - Warmteafgifte'
      },
      {
        id: randomUUID(),
        opname_id: opnameId,
        sectie_naam: sectieNaam,
        vraag_id: 'warmteafgifte_regeling',
        vraag_tekst: 'Vraag 1.2 - Hoe wordt de warmteafgifte geregeld?',
        antwoord_waarde: 'Centrale automatische temperatuurregeling',
        antwoord_optie: null,
        antwoord_nummer: null,
        antwoord_boolean: null,
        sectie_nummer: '1 - Warmteafgifte'
      }
    ];
    
    // Begin transaction
    const transaction = db.transaction(() => {
      // Verwijder bestaande antwoorden
      db.prepare('DELETE FROM opname_antwoorden WHERE opname_id = ? AND sectie_naam = ?').run(opnameId, sectieNaam);
      
      // Insert test antwoorden
      const insertStmt = db.prepare(`
        INSERT INTO opname_antwoorden (
          id, opname_id, sectie_naam, vraag_id, vraag_tekst,
          antwoord_waarde, antwoord_optie, antwoord_nummer,
          antwoord_boolean, sectie_nummer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const antwoord of testAntwoorden) {
        insertStmt.run(
          antwoord.id,
          antwoord.opname_id,
          antwoord.sectie_naam,
          antwoord.vraag_id,
          antwoord.vraag_tekst,
          antwoord.antwoord_waarde,
          antwoord.antwoord_optie,
          antwoord.antwoord_nummer,
          antwoord.antwoord_boolean,
          antwoord.sectie_nummer
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
        `).run(sectieId, opnameId, sectieNaam, 'basis');
      }
    });
    
    transaction();
    
    // Verifieer dat antwoorden zijn opgeslagen
    const savedAntwoorden = db.prepare('SELECT * FROM opname_antwoorden WHERE opname_id = ? AND sectie_naam = ?').all(opnameId, sectieNaam);
    const sectie = db.prepare('SELECT * FROM opname_secties WHERE opname_id = ? AND sectie_naam = ?').get(opnameId, sectieNaam) as any;
    
    if (savedAntwoorden.length === 2 && sectie && sectie.is_voltooid === 1) {
      logTest('Antwoorden opslaan', true, undefined, { 
        aantalAntwoorden: savedAntwoorden.length,
        sectieVoltooid: sectie.is_voltooid 
      });
      return true;
    } else {
      logTest('Antwoorden opslaan', false, 'Antwoorden niet correct opgeslagen', {
        aantalAntwoorden: savedAntwoorden.length,
        sectie: sectie
      });
      return false;
    }
  } catch (error) {
    logTest('Antwoorden opslaan', false, error instanceof Error ? error.message : 'Onbekende fout');
    return false;
  }
}

async function testRetrieveAnswers(opnameId: string) {
  try {
    const db = getDb();
    const sectieNaam = 'verwarmingssysteem';
    
    const antwoorden = db.prepare('SELECT * FROM opname_antwoorden WHERE opname_id = ? AND sectie_naam = ?').all(opnameId, sectieNaam);
    
    if (antwoorden.length > 0) {
      logTest('Antwoorden ophalen', true, undefined, { 
        aantalAntwoorden: antwoorden.length,
        eersteAntwoord: {
          vraag_id: (antwoorden[0] as any).vraag_id,
          antwoord_waarde: (antwoorden[0] as any).antwoord_waarde
        }
      });
      return true;
    } else {
      logTest('Antwoorden ophalen', false, 'Geen antwoorden gevonden');
      return false;
    }
  } catch (error) {
    logTest('Antwoorden ophalen', false, error instanceof Error ? error.message : 'Onbekende fout');
    return false;
  }
}

async function testUpdateOpname(opnameId: string) {
  try {
    const db = getDb();
    const nieuweGebouwnaam = `Bijgewerkt Gebouw ${Date.now()}`;
    
    db.prepare(`
      UPDATE opnamen SET
        gebouwnaam = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(nieuweGebouwnaam, opnameId);
    
    const opname = db.prepare('SELECT * FROM opnamen WHERE id = ?').get(opnameId) as any;
    
    if (opname && opname.gebouwnaam === nieuweGebouwnaam) {
      logTest('Opname bijwerken', true, undefined, { gebouwnaam: opname.gebouwnaam });
      return true;
    } else {
      logTest('Opname bijwerken', false, 'Opname niet correct bijgewerkt');
      return false;
    }
  } catch (error) {
    logTest('Opname bijwerken', false, error instanceof Error ? error.message : 'Onbekende fout');
    return false;
  }
}

async function cleanupTestData(opnameId: string) {
  try {
    const db = getDb();
    
    db.prepare('DELETE FROM opname_antwoorden WHERE opname_id = ?').run(opnameId);
    db.prepare('DELETE FROM opname_secties WHERE opname_id = ?').run(opnameId);
    db.prepare('DELETE FROM opnamen WHERE id = ?').run(opnameId);
    
    logTest('Test data opruimen', true);
  } catch (error) {
    logTest('Test data opruimen', false, error instanceof Error ? error.message : 'Onbekende fout');
  }
}

async function runTests() {
  console.log('🧪 Database Save Tests\n');
  console.log('='.repeat(50));
  
  // Test 1: Opname aanmaken
  const opnameId = await testCreateOpname();
  if (!opnameId) {
    console.log('\n❌ Kan niet verder testen zonder opname ID');
    return;
  }
  
  // Test 2: Antwoorden opslaan
  await testSaveAnswers(opnameId);
  
  // Test 3: Antwoorden ophalen
  await testRetrieveAnswers(opnameId);
  
  // Test 4: Opname bijwerken
  await testUpdateOpname(opnameId);
  
  // Cleanup
  await cleanupTestData(opnameId);
  
  // Samenvatting
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Samenvatting:\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Geslaagd: ${passed}`);
  console.log(`❌ Gefaald: ${failed}`);
  console.log(`📈 Totaal: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Gefaalde tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.test}: ${r.error || 'Onbekende fout'}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 Alle tests geslaagd!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fout bij uitvoeren tests:', error);
  process.exit(1);
});

