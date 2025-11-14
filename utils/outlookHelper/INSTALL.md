# Outlook Helper - Installatie Instructies

## ⚠️ Belangrijk: Direct Slepen vanuit Outlook

**Het probleem:** Browsers kunnen niet direct communiceren met Outlook voor drag-and-drop vanwege security beperkingen.

**De oplossing:** Een kleine Windows helper applicatie die tussen Outlook en de browser communiceert.

## 📦 Installatie Stappen

### Stap 1: Installeer Node.js (als je dat nog niet hebt)
- Download van: https://nodejs.org/
- Installeer Node.js 18+

### Stap 2: Installeer Helper Dependencies
```bash
cd utils/outlookHelper
npm install
```

### Stap 3: Start Helper Server
```bash
npm start
```

Of dubbelklik op `start-helper.bat`

### Stap 4: Gebruik in Browser
1. Zorg dat helper server draait (zie console: "Outlook Helper Server gestart")
2. Ga naar CRM → Email tab in je browser
3. Je ziet: "✅ Outlook Helper Actief!"
4. **Sleep nu email uit Outlook** → Helper detecteert en importeert automatisch

## 🔧 Hoe het werkt:

1. **Helper server draait** op localhost:8765
2. **Browser detecteert helper** via status check
3. **Outlook COM interface** (toekomstig) leest email data
4. **Data wordt doorgestuurd** naar browser via REST API
5. **Email wordt geïmporteerd** in CRM

## ⚠️ Huidige Status:

**Wat werkt:**
- ✅ Helper server structuur
- ✅ Browser detectie van helper
- ✅ REST API endpoints
- ✅ File-based import (.eml bestanden)
- ✅ Clipboard detectie

**Wat nog nodig is:**
- 🔄 Windows COM interface voor Outlook
- 🔄 Drag-and-drop event detection
- 🔄 Native Windows service implementatie

## 🚀 Voor Direct Slepen:

Voor volledige direct drag-and-drop functionaliteit heb je nodig:
- Een Windows native applicatie (C#) die:
  - Outlook COM interface gebruikt
  - Windows drag-and-drop events opvangt
  - Data doorgeeft aan helper server

**Alternatief:** Gebruik de clipboard detectie functie:
1. Klik "Activeer Clipboard Detectie" in CRM
2. Selecteer email in Outlook
3. Druk Ctrl+C (kopieer)
4. Email wordt automatisch gedetecteerd!

## 📝 Toekomstige Uitbreidingen:

- Electron wrapper voor de hele applicatie (dan werkt drag-and-drop wel)
- Browser extensie voor betere integratie
- Outlook Add-in voor directe integratie







