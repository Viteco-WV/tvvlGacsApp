# API Architectuur - Hoe werkt de data flow?

## Overzicht

Next.js API Routes zijn **server-side endpoints** die draaien op dezelfde server als je Next.js applicatie. Ze zijn NIET een aparte server, maar onderdeel van je Next.js app.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                        │
│  React Component (bijv. algemeen/page.tsx)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Gebruiker vult formulier in                       │  │
│  │ 2. handleStartOpnamen() wordt aangeroepen            │  │
│  │ 3. createOpname() functie roept API aan              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Request
                          │ POST /api/opnamen
                          │ { gebouwnaam: "...", ... }
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (Node.js)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Route: src/app/api/opnamen/route.ts              │  │
│  │                                                       │  │
│  │ export async function POST(request) {                │  │
│  │   const body = await request.json();                  │  │
│  │   const db = getDb();  // SQLite connectie           │  │
│  │   db.prepare('INSERT INTO opnamen...').run(...);      │  │
│  │   return NextResponse.json(opname);                  │  │
│  │ }                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ SQL Query                        │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SQLite Database: data/gacs.db                        │  │
│  │                                                       │  │
│  │ INSERT INTO opnamen (id, gebouwnaam, ...)           │  │
│  │ VALUES ('uuid-123', 'Gebouw A', ...)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Response
                          │ { id: "uuid-123", ... }
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 4. Response ontvangen                                 │  │
│  │ 5. opnameId opgeslagen in sessionStorage             │  │
│  │ 6. Router navigeert naar volgende pagina              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Stap-voor-stap Uitleg

### 1. Frontend maakt API call

**Locatie:** `src/lib/opname-api.ts`

```typescript
export async function createOpname(data: CreateOpnameData): Promise<string> {
  // Dit is een HTTP request naar de Next.js server
  const response = await fetch('/api/opnamen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // Data wordt naar JSON geconverteerd
  });

  const result = await response.json();
  return result.id; // Retourneert de opname ID
}
```

**Belangrijk:**
- `/api/opnamen` is een **relatief pad** - Next.js weet automatisch dat dit naar `src/app/api/opnamen/route.ts` gaat
- Dit draait op dezelfde server (localhost:3000 in development)
- Het is een normale HTTP request, net zoals naar een externe API

### 2. API Route verwerkt de request

**Locatie:** `src/app/api/opnamen/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  // 1. Parse de JSON data uit de request
  const body = await request.json();
  
  // 2. Maak database connectie (SQLite)
  const db = getDb();
  
  // 3. Genereer unieke ID
  const id = randomUUID();
  
  // 4. Voer SQL query uit
  db.prepare(`
    INSERT INTO opnamen (id, gebouwnaam, adres, ...)
    VALUES (?, ?, ?, ...)
  `).run(id, body.gebouwnaam, body.adres, ...);
  
  // 5. Haal nieuwe record op
  const opname = db.prepare('SELECT * FROM opnamen WHERE id = ?').get(id);
  
  // 6. Stuur JSON response terug
  return NextResponse.json(opname, { status: 201 });
}
```

**Belangrijk:**
- Dit draait op de **server** (Node.js), niet in de browser
- Heeft directe toegang tot het bestandssysteem (SQLite database)
- Kan geen browser APIs gebruiken (geen `window`, `document`, etc.)

### 3. Database opslag

**Locatie:** `src/lib/db.ts`

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'gacs.db');

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath); // Maakt connectie met SQLite bestand
    db.pragma('foreign_keys = ON');
    initializeDatabase(db); // Maakt tabellen aan als ze niet bestaan
  }
  return db;
}
```

**Belangrijk:**
- SQLite is een **bestandsgebaseerde database** (geen aparte server nodig)
- Het bestand staat in `data/gacs.db`
- Alle queries zijn direct SQL (geen ORM zoals Prisma)

## Waar draaien de API routes?

### Development (npm run dev)
- **Frontend:** http://localhost:3000
- **API Routes:** http://localhost:3000/api/*
- **Beide draaien op dezelfde Next.js server**

### Production (npm run build && npm start)
- **Frontend:** Je productie URL (bijv. https://jouwapp.com)
- **API Routes:** https://jouwapp.com/api/*
- **Beide draaien op dezelfde Next.js server**

## Voorbeeld: Volledige Flow

### Stap 1: Gebruiker klikt "Start Opnamen"

**Frontend:** `src/app/opnamen/algemeen/page.tsx`

```typescript
const handleStartOpnamen = async () => {
  // Valideer data
  if (!buildingData.buildingName || !buildingData.address) {
    alert('Vul minimaal de gebouwnaam en adres in');
    return;
  }

  setIsSaving(true);
  try {
    // 1. Roep API aan om opname aan te maken
    const newOpnameId = await createOpname({
      opnameType: 'basis',
      gebouwnaam: buildingData.buildingName,
      adres: buildingData.address,
      // ... meer data
    });

    // 2. Sla opnameId op in sessionStorage
    setOpnameId(newOpnameId);

    // 3. Upload foto als die er is
    if (photoFile) {
      await uploadOpnameFoto(newOpnameId, photoFile, 'gebouw', 'Gebouwfoto');
    }

    // 4. Navigeer naar volgende pagina
    router.push('/opnamen/verwarmingssysteem');
  } catch (error) {
    alert(`Fout: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
};
```

### Stap 2: API Route verwerkt de request

**Backend:** `src/app/api/opnamen/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = getDb();
  const id = randomUUID();

  // SQL INSERT query
  db.prepare(`
    INSERT INTO opnamen (id, opname_type, gebouwnaam, adres, ...)
    VALUES (?, ?, ?, ?, ...)
  `).run(
    id,
    body.opnameType,
    body.gebouwnaam,
    body.adres,
    // ... meer values
  );

  // Haal nieuwe record op
  const opname = db.prepare('SELECT * FROM opnamen WHERE id = ?').get(id);

  // Stuur terug naar frontend
  return NextResponse.json(opname, { status: 201 });
}
```

### Stap 3: Database slaat data op

**SQLite:** `data/gacs.db`

```sql
-- Deze query wordt uitgevoerd door better-sqlite3
INSERT INTO opnamen (
  id, opname_type, gebouwnaam, adres, postcode, ...
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'basis',
  'Gebouw A',
  'Straat 1',
  '1234AB',
  ...
);
```

### Stap 4: Response gaat terug naar frontend

De API route retourneert JSON:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "opname_type": "basis",
  "gebouwnaam": "Gebouw A",
  "adres": "Straat 1",
  ...
}
```

De frontend ontvangt dit en gebruikt de `id` voor verdere operaties.

## Belangrijke Punten

1. **API Routes zijn server-side**
   - Draaien op Node.js server
   - Hebben toegang tot bestandssysteem en database
   - Kunnen geen browser APIs gebruiken

2. **Frontend is client-side**
   - Draait in de browser
   - Kan geen directe database toegang hebben (veiligheid)
   - Moet via HTTP requests communiceren

3. **SQLite is lokaal**
   - Geen aparte database server nodig
   - Bestand staat in `data/gacs.db`
   - Automatisch aangemaakt bij eerste gebruik

4. **Alles draait op één server**
   - Frontend, API routes en database op dezelfde machine
   - In production: één Next.js server die alles afhandelt

## API Routes Overzicht

| Route | Methode | Functie |
|-------|---------|---------|
| `/api/opnamen` | GET | Haal alle opnamen op |
| `/api/opnamen` | POST | Maak nieuwe opname aan |
| `/api/opnamen/[id]` | GET | Haal specifieke opname op |
| `/api/opnamen/[id]` | PUT | Update opname |
| `/api/opnamen/[id]` | DELETE | Verwijder opname |
| `/api/opnamen/[id]/antwoorden` | POST | Sla antwoorden op |
| `/api/opnamen/[id]/fotos` | POST | Upload foto |
| `/api/opnamen/[id]/secties/[sectieNaam]/fotos` | POST | Upload sectie foto |

## Veelgestelde Vragen

**Q: Waar draaien de API routes?**
A: Op dezelfde Next.js server als je frontend. In development: localhost:3000, in production: je productie URL.

**Q: Kan de frontend direct SQL queries uitvoeren?**
A: Nee, dat zou een veiligheidsrisico zijn. Alles gaat via API routes.

**Q: Waar staat de database?**
A: In `data/gacs.db` - een SQLite bestand op de server.

**Q: Moet ik een aparte database server opzetten?**
A: Nee, SQLite is een bestandsgebaseerde database. Geen aparte server nodig.

**Q: Hoe werkt dit in production?**
A: Je bouwt de Next.js app (`npm run build`) en start de server (`npm start`). Alles draait op één server.

