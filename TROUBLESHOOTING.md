# Troubleshooting Guide

## Veelvoorkomende problemen en oplossingen

### 1. Database fouten

**Database niet gevonden:**
- De database wordt automatisch aangemaakt bij eerste gebruik
- Controleer of de `data/` directory bestaat en schrijfrechten heeft
- De database staat in `data/gacs.db`

**Database locked:**
- Zorg dat er geen andere processen de database gebruiken
- Herstart de Next.js server

### 2. Foto upload fouten

**Foto's worden niet opgeslagen:**
- Controleer of de `public/uploads/opnamen/` directory bestaat
- Controleer schrijfrechten voor de uploads directory
- Controleer de server logs voor specifieke foutmeldingen

### 3. API fouten

**500 Internal Server Error:**
- Controleer de server console voor foutmeldingen
- Zorg dat de database correct is geïnitialiseerd
- Herstart de Next.js server

**404 Not Found:**
- Controleer of de API route correct is geconfigureerd
- Controleer of de opname ID bestaat in de database

### 4. Build fouten

**Module not found:**
- Verwijder `node_modules` en `.next` directory
- Run `npm install` opnieuw
- Run `npm run dev` opnieuw
