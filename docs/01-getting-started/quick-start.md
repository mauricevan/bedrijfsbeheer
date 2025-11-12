# Quick Start Guide

## Snel aan de slag in 3 stappen

### 1. Installeer en start

```bash
npm install && npm run dev
```

### 2. Login als Admin

- Email: sophie@bedrijf.nl
- Wachtwoord: 1234

### 3. Verken de modules

- **Dashboard** → Zie overzicht
- **Werkorders** → Beheer taken (volledig overzicht)
- **Facturen en Offerte** → Offertes & Facturen
- **Boekhouding & Dossier** → Grootboek, BTW-aangifte, Journaal, Dossiers
- **Admin Instellingen** → Schakel modules in/uit
- **Admin Instellingen → Systeem Analytics** → Data-driven optimalisatie dashboard
- **Admin Instellingen → Database Diagnostics** → Database health monitoring

**Of login als User** (jan@bedrijf.nl / 1234) om het persoonlijke workboard te testen!

---

## Werkorder Integratie Demo Flow 🆕

**Probeer de volledige werkorder integratie:**

1. **Login als Admin** (sophie@bedrijf.nl / 1234)
2. **Ga naar Boekhouding, Offertes & Facturen**
3. **Tab "Offertes":**
   - Zoek offerte Q001 (status: Geaccepteerd)
   - Klik oranje knop **"📋 Maak Werkorder"**
   - Werkorder WO001 is aangemaakt!
4. **Bekijk Status Badge:**
   - Offerte toont nu: 🔵 "Werkorder: To Do"
   - Klik op badge → Spring naar workboard
5. **Ga naar Werkorders Module:**
   - Zie nieuwe taak in "To Do" kolom
   - Klik "▶ Start Werkorder"
6. **Terug naar Offertes:**
   - Badge is nu: 🟢 "Werkorder: In Uitvoering"
   - Real-time update!
7. **Tussentijdse Aanpassing:**
   - Klik **"✏️ Bewerk & Update Werkorder"**
   - Voeg extra materiaal toe
   - Klik "💾 Opslaan & Update Werkorder"
   - Check workboard → Materiaal is toegevoegd!
8. **Voltooiing:**
   - Ga naar workboard
   - Voltooi werkorder
   - Terug naar offerte: ✅ "Werkorder: Voltooid"
   - Groene border verschijnt!
9. **Facturatie:**
   - Klik "🧾 Omzetten naar Factuur"
   - Factuur bevat gewerkte uren (niet geschat)
   - Link naar werkorder behouden

---

## Facturen Demo Flow

**Probeer de volledige factuur workflow:**

1. **Login als Admin** (sophie@bedrijf.nl / 1234)
2. **Ga naar Boekhouding, Offertes & Facturen**
3. **Klik op tab "Offertes"**
4. **Zoek offerte Q001** (status: Geaccepteerd)
5. **Klik paarse knop** "🧾 Omzetten naar Factuur"
6. **Zie nieuwe factuur** in Facturen tab (2025-001 of volgende nummer)
7. **Update status**: Draft → Verzenden → Betaald
8. **Bekijk statistieken** bovenaan pagina

**Of maak handmatig factuur:**

1. Klik "+ Nieuwe Factuur"
2. Selecteer klant en datums
3. Voeg items/werkuren toe
4. Sla op en beheer

---

## Email Integratie Demo 🆕 V5.8

**Test de nieuwe email drop zone:**

1. **Login als Admin** (sophie@bedrijf.nl / 1234)
2. **Ga naar Dashboard**
3. **Sleep een .eml bestand** naar de email drop zone
4. **Bekijk de preview** in de modal
5. **Kies een actie:**
   - Maak offerte
   - Maak taak
   - Maak notificatie
6. **Systeem matcht automatisch** klant/lead op basis van email adres
7. **Bevestig** en de actie wordt uitgevoerd

---

## Volgende Stappen

- [Modules Overzicht](../03-modules/overview.md) - Leer meer over alle modules
- [User Roles](../04-features/user-roles.md) - Begrijp de rechten per rol
- [Workflows](../04-features/workorder-workflow.md) - Gedetailleerde workflow documentatie
