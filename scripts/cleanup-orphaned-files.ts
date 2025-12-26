/**
 * Script om orphaned bestanden en directories te verwijderen
 * (bestanden die geen corresponderende database records hebben)
 * 
 * Run met: npm run cleanup:files
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { rm } from 'fs/promises';

// Database pad
const dbPath = path.join(process.cwd(), 'data', 'gacs.db');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'opnamen');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database niet gevonden op:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

console.log('🧹 Cleanup Orphaned Files\n');
console.log('='.repeat(60));

// Haal alle opname IDs uit database
const opnamenInDb = db.prepare('SELECT id FROM opnamen').all() as Array<{ id: string }>;
const opnameIdsInDb = new Set(opnamenInDb.map(o => o.id));

console.log(`\n📊 Opnamen in database: ${opnameIdsInDb.size}`);

// Haal alle directories in uploads/opnamen op
if (!fs.existsSync(uploadsDir)) {
  console.log('\n✅ Geen uploads directory gevonden - niets te cleanen');
  process.exit(0);
}

const directories = fs.readdirSync(uploadsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`📁 Directories in uploads/opnamen: ${directories.length}`);

// Vind orphaned directories
const orphanedDirs: string[] = [];
const validDirs: string[] = [];

for (const dir of directories) {
  if (opnameIdsInDb.has(dir)) {
    validDirs.push(dir);
  } else {
    orphanedDirs.push(dir);
  }
}

console.log(`\n✅ Geldige directories: ${validDirs.length}`);
console.log(`🗑️  Orphaned directories: ${orphanedDirs.length}`);

if (orphanedDirs.length === 0) {
  console.log('\n✅ Geen orphaned directories gevonden - alles is schoon!');
  db.close();
  process.exit(0);
}

// Toon orphaned directories
console.log('\n🗑️  Orphaned directories die verwijderd zullen worden:');
orphanedDirs.forEach((dir, index) => {
  const dirPath = path.join(uploadsDir, dir);
  const stats = fs.statSync(dirPath);
  const size = fs.readdirSync(dirPath, { recursive: true })
    .reduce((total, file) => {
      const filePath = path.join(dirPath, file);
      try {
        return total + (fs.statSync(filePath).isFile() ? fs.statSync(filePath).size : 0);
      } catch {
        return total;
      }
    }, 0);
  const sizeMB = (size / 1024 / 1024).toFixed(2);
  console.log(`  ${index + 1}. ${dir} (${sizeMB} MB)`);
});

// Vraag bevestiging (in script mode automatisch verwijderen)
console.log('\n⚠️  Deze directories zullen worden verwijderd...');

async function cleanup() {
  let removedCount = 0;
  let errorCount = 0;

  for (const dir of orphanedDirs) {
    const dirPath = path.join(uploadsDir, dir);
    try {
      await rm(dirPath, { recursive: true, force: true });
      console.log(`  ✅ Verwijderd: ${dir}`);
      removedCount++;
    } catch (error) {
      console.error(`  ❌ Fout bij verwijderen ${dir}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Cleanup Samenvatting:');
  console.log(`  ✅ Verwijderd: ${removedCount}`);
  console.log(`  ❌ Fouten: ${errorCount}`);
  console.log(`  📁 Totaal orphaned: ${orphanedDirs.length}`);

  if (removedCount === orphanedDirs.length) {
    console.log('\n🎉 Alle orphaned directories succesvol verwijderd!');
  } else if (removedCount > 0) {
    console.log('\n⚠️  Sommige directories konden niet worden verwijderd');
  } else {
    console.log('\n❌ Geen directories verwijderd');
  }

  db.close();
}

cleanup().catch(error => {
  console.error('Fout bij cleanup:', error);
  db.close();
  process.exit(1);
});

