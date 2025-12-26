# Quick Start Guide

## Installatie

1. **Installeer dependencies:**
   ```bash
   npm install
   ```

2. **Start de development server:**
   ```bash
   npm run dev
   ```

3. **Open de applicatie:**
   - Ga naar http://localhost:3000

## Database

De applicatie gebruikt **SQLite** als database. De database wordt automatisch aangemaakt bij eerste gebruik in `data/gacs.db`.

**Geen extra setup nodig!** De database wordt automatisch geïnitialiseerd met alle benodigde tabellen.

## Structuur

- **Database:** `data/gacs.db` (SQLite)
- **Foto's:** `public/uploads/opnamen/`
- **API Routes:** `src/app/api/`

## Veelvoorkomende problemen

### Database fouten
- De database wordt automatisch aangemaakt bij eerste gebruik
- Controleer of de `data/` directory bestaat en schrijfrechten heeft

### Foto upload fouten
- Controleer of de `public/uploads/opnamen/` directory bestaat
- Controleer schrijfrechten voor de uploads directory

### Server start niet
- Verwijder `node_modules` en `.next` directory
- Run `npm install` opnieuw
- Run `npm run dev` opnieuw
