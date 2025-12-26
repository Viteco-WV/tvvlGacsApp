# Database Schema voor GACS Opnamen App

## Overzicht
Dit schema is ontworpen voor het opslaan van opnamen (audits) met hun verschillende secties en bijbehorende foto's.

## Tabellen

### 1. `opnamen` (Hoofdtabel)
Bevat de algemene informatie over een opname/audit.

```sql
CREATE TABLE opnamen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_type VARCHAR(20) NOT NULL, -- 'basis' of 'geavanceerd'
  gebouwnaam VARCHAR(255) NOT NULL,
  adres TEXT NOT NULL,
  postcode VARCHAR(7),
  huisnummer VARCHAR(10),
  huisnummertoevoeging VARCHAR(10),
  straat VARCHAR(255),
  stad VARCHAR(255),
  gebouwtype VARCHAR(50), -- kantoor, winkel, school, etc.
  energielabel VARCHAR(10), -- A+++, A++, A+, A, B, C, D, E, F, G, onbekend
  gebouw_oppervlakte DECIMAL(10, 2), -- m²
  datum_opname DATE NOT NULL,
  contactpersoon VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, archived
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255), -- gebruiker die de opname heeft aangemaakt
  bag_verblijfsobject_id VARCHAR(50) -- BAG identificatie
);
```

### 2. `opname_fotos` (Foto's bij opname)
Algemene foto's die bij de opname horen (zoals gebouwfoto).

```sql
CREATE TABLE opname_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES opnamen(id) ON DELETE CASCADE,
  foto_type VARCHAR(50) DEFAULT 'gebouw', -- gebouw, overzicht, etc.
  bestandsnaam VARCHAR(255) NOT NULL,
  bestandspad TEXT NOT NULL, -- pad naar opgeslagen bestand
  mime_type VARCHAR(50), -- image/jpeg, image/png, etc.
  bestandsgrootte INTEGER, -- in bytes
  volgorde INTEGER DEFAULT 0, -- voor sortering
  beschrijving TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
);

CREATE INDEX idx_opname_fotos_opname_id ON opname_fotos(opname_id);
```

### 3. `opname_secties` (Secties per opname)
Bevat metadata over welke secties zijn ingevuld voor een opname.

```sql
CREATE TABLE opname_secties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES opnamen(id) ON DELETE CASCADE,
  sectie_naam VARCHAR(50) NOT NULL, -- verwarmingssysteem, warmTapwater, ventilatie, etc.
  sectie_type VARCHAR(20) NOT NULL, -- 'basis' of 'geavanceerd'
  is_voltooid BOOLEAN DEFAULT FALSE,
  laatste_wijziging TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE,
  UNIQUE(opname_id, sectie_naam)
);

CREATE INDEX idx_opname_secties_opname_id ON opname_secties(opname_id);
```

### 4. `opname_antwoorden` (Antwoorden per sectie)
Bevat alle antwoorden op vragen per sectie. Flexibel schema dat alle vraagtypes kan opslaan.

```sql
CREATE TABLE opname_antwoorden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES opnamen(id) ON DELETE CASCADE,
  sectie_naam VARCHAR(50) NOT NULL,
  vraag_id VARCHAR(100) NOT NULL, -- unieke identifier van de vraag
  vraag_tekst TEXT,
  antwoord_waarde TEXT, -- voor tekstuele antwoorden
  antwoord_optie VARCHAR(255), -- voor select/radio antwoorden
  antwoord_nummer DECIMAL(10, 2), -- voor numerieke antwoorden
  antwoord_boolean BOOLEAN, -- voor ja/nee vragen
  sectie_nummer VARCHAR(20), -- bijv. "1 - Warmteafgifte"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
);

CREATE INDEX idx_opname_antwoorden_opname_sectie ON opname_antwoorden(opname_id, sectie_naam);
CREATE INDEX idx_opname_antwoorden_vraag_id ON opname_antwoorden(vraag_id);
```

### 5. `opname_sectie_fotos` (Foto's per sectie/vraag)
Foto's die bij specifieke vragen of secties horen.

```sql
CREATE TABLE opname_sectie_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES opnamen(id) ON DELETE CASCADE,
  sectie_naam VARCHAR(50) NOT NULL,
  vraag_id VARCHAR(100), -- optioneel: bij welke vraag hoort deze foto
  bestandsnaam VARCHAR(255) NOT NULL,
  bestandspad TEXT NOT NULL,
  mime_type VARCHAR(50),
  bestandsgrootte INTEGER,
  volgorde INTEGER DEFAULT 0,
  beschrijving TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
);

CREATE INDEX idx_sectie_fotos_opname_sectie ON opname_sectie_fotos(opname_id, sectie_naam);
CREATE INDEX idx_sectie_fotos_vraag ON opname_sectie_fotos(vraag_id);
```

### 6. `contactpersonen` (Contactpersonen bij opname)
Contactpersonen die bij een opname horen (voor geavanceerde opnamen).

```sql
CREATE TABLE contactpersonen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES opnamen(id) ON DELETE CASCADE,
  voornaam VARCHAR(100) NOT NULL,
  achternaam VARCHAR(100) NOT NULL,
  organisatie VARCHAR(255),
  rol VARCHAR(100),
  email VARCHAR(255),
  telefoon VARCHAR(50),
  volgorde INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE
);

CREATE INDEX idx_contactpersonen_opname_id ON contactpersonen(opname_id);
```

### 7. `opname_geavanceerd_data` (Extra data voor geavanceerde opnamen)
Voor geavanceerde opnamen met extra velden zoals ruimtetypes, distributie, etc.

```sql
CREATE TABLE opname_geavanceerd_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES opnamen(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL, -- ruimtetypes, distributie, opwekking, systeem, details, afronden
  data_json JSONB, -- flexibele JSON structuur voor complexe data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opname_id) REFERENCES opnamen(id) ON DELETE CASCADE,
  UNIQUE(opname_id, data_type)
);

CREATE INDEX idx_geavanceerd_data_opname_id ON opname_geavanceerd_data(opname_id);
CREATE INDEX idx_geavanceerd_data_type ON opname_geavanceerd_data(data_type);
```

## Sectie Namen (voor referentie)

### Basis Opnamen:
- `algemeen`
- `verwarmingssysteem`
- `warmTapwater`
- `ventilatie`
- `verlichting`
- `airconditioning`
- `zonwering`
- `gebouwmanagement`

### Geavanceerde Opnamen:
- `algemeen` (uitgebreid)
- `ruimtetypes`
- `distributie`
- `opwekking`
- `systeem`
- `details`
- `afronden`

## Bestandsopslag Strategie

### Optie 1: File System (Aanbevolen voor start)
- Foto's opslaan in `public/uploads/opnamen/{opname_id}/`
- Bestandspad opslaan in database
- Voordelen: eenvoudig, snel te implementeren
- Nadeel: schaalbaarheid op lange termijn

### Optie 2: Object Storage (S3, Azure Blob, etc.)
- Foto's uploaden naar cloud storage
- URL opslaan in database
- Voordelen: schaalbaar, betrouwbaar
- Nadeel: extra kosten, complexiteit

### Optie 3: Database (Alleen voor kleine bestanden)
- Base64 encoded in database
- Voordelen: alles op één plek
- Nadeel: database wordt snel groot, niet aanbevolen

## Aanbevelingen

1. **Foto Opslag**: Gebruik File System of Object Storage, NIET database
2. **JSON voor complexe data**: Gebruik JSONB kolom voor flexibele structuur waar nodig
3. **Indexering**: Indexen op `opname_id` en `sectie_naam` voor snelle queries
4. **Soft Deletes**: Overweeg `deleted_at` kolom voor soft deletes
5. **Audit Trail**: Overweeg een `audit_log` tabel voor wijzigingsgeschiedenis
6. **Backup Strategie**: Regelmatige backups van database + foto's

## Migratie van localStorage

Bij implementatie moet je:
1. Data uit localStorage ophalen
2. Nieuwe opname record aanmaken in `opnamen`
3. Secties aanmaken in `opname_secties`
4. Antwoorden migreren naar `opname_antwoorden`
5. Foto's uploaden en opslaan in `opname_fotos` / `opname_sectie_fotos`

