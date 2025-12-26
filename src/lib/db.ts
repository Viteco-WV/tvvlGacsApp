import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database pad
const dbPath = path.join(process.cwd(), 'data', 'gacs.db');

// Zorg dat de data directory bestaat
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Maak database connectie
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables if they don't exist
    initializeDatabase(db);
  }
  
  return db;
}

function initializeDatabase(db: Database.Database) {
  // Create opnamen table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opnamen (
      id TEXT PRIMARY KEY,
      opname_type TEXT NOT NULL,
      gebouwnaam TEXT NOT NULL,
      adres TEXT NOT NULL,
      postcode TEXT,
      huisnummer TEXT,
      huisnummertoevoeging TEXT,
      straat TEXT,
      stad TEXT,
      gebouwtype TEXT,
      energielabel TEXT,
      gebouw_oppervlakte REAL,
      datum_opname TEXT NOT NULL,
      contactpersoon TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'in_progress',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      created_by TEXT,
      bag_verblijfsobject_id TEXT
    )
  `);

  // Create opname_fotos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opname_fotos (
      id TEXT PRIMARY KEY,
      opname_id TEXT NOT NULL,
      foto_type TEXT DEFAULT 'gebouw',
      bestandsnaam TEXT NOT NULL,
      bestandspad TEXT NOT NULL,
      mime_type TEXT,
      bestandsgrootte INTEGER,
      volgorde INTEGER DEFAULT 0,
      beschrijving TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
    )
  `);

  // Create opname_secties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opname_secties (
      id TEXT PRIMARY KEY,
      opname_id TEXT NOT NULL,
      sectie_naam TEXT NOT NULL,
      sectie_type TEXT NOT NULL,
      is_voltooid INTEGER DEFAULT 0,
      laatste_wijziging TEXT DEFAULT (datetime('now')),
      UNIQUE(opname_id, sectie_naam),
      FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
    )
  `);

  // Create opname_antwoorden table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opname_antwoorden (
      id TEXT PRIMARY KEY,
      opname_id TEXT NOT NULL,
      sectie_naam TEXT NOT NULL,
      vraag_id TEXT NOT NULL,
      vraag_tekst TEXT,
      antwoord_waarde TEXT,
      antwoord_optie TEXT,
      antwoord_nummer REAL,
      antwoord_boolean INTEGER,
      sectie_nummer TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
    )
  `);

  // Create opname_sectie_fotos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opname_sectie_fotos (
      id TEXT PRIMARY KEY,
      opname_id TEXT NOT NULL,
      sectie_naam TEXT NOT NULL,
      vraag_id TEXT,
      bestandsnaam TEXT NOT NULL,
      bestandspad TEXT NOT NULL,
      mime_type TEXT,
      bestandsgrootte INTEGER,
      volgorde INTEGER DEFAULT 0,
      beschrijving TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
    )
  `);

  // Create contactpersonen table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contactpersonen (
      id TEXT PRIMARY KEY,
      opname_id TEXT NOT NULL,
      voornaam TEXT NOT NULL,
      achternaam TEXT NOT NULL,
      organisatie TEXT,
      rol TEXT,
      email TEXT,
      telefoon TEXT,
      volgorde INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
    )
  `);

  // Create opname_geavanceerd_data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opname_geavanceerd_data (
      id TEXT PRIMARY KEY,
      opname_id TEXT NOT NULL,
      data_type TEXT NOT NULL,
      data_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(opname_id, data_type),
      FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_opname_fotos_opname_id ON opname_fotos(opname_id);
    CREATE INDEX IF NOT EXISTS idx_opname_secties_opname_id ON opname_secties(opname_id);
    CREATE INDEX IF NOT EXISTS idx_opname_antwoorden_opname_id ON opname_antwoorden(opname_id, sectie_naam);
    CREATE INDEX IF NOT EXISTS idx_opname_antwoorden_vraag_id ON opname_antwoorden(vraag_id);
    CREATE INDEX IF NOT EXISTS idx_opname_sectie_fotos_opname_id ON opname_sectie_fotos(opname_id, sectie_naam);
    CREATE INDEX IF NOT EXISTS idx_opname_sectie_fotos_vraag_id ON opname_sectie_fotos(vraag_id);
    CREATE INDEX IF NOT EXISTS idx_contactpersonen_opname_id ON contactpersonen(opname_id);
    CREATE INDEX IF NOT EXISTS idx_opname_geavanceerd_data_opname_id ON opname_geavanceerd_data(opname_id);
    CREATE INDEX IF NOT EXISTS idx_opname_geavanceerd_data_data_type ON opname_geavanceerd_data(data_type);
  `);
}

// Close database connection
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

