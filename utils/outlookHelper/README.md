# Outlook Helper - Direct Drag & Drop vanuit Outlook

## Probleem
Browsers kunnen niet direct communiceren met Outlook desktop applicatie voor drag-and-drop.

## Oplossing
Een kleine Windows helper applicatie die:
1. Outlook COM interface gebruikt om email data te lezen
2. Lokale webserver draait (localhost:8765)
3. Communiceert met de browser via REST API
4. Detecteert wanneer gebruiker email uit Outlook sleept

## Installatie & Gebruik

### Optie 1: Node.js Helper (Aanbevolen)
```bash
cd utils/outlookHelper
npm install
npm start
```

### Optie 2: Windows Executable (Komt later)
Download `OutlookHelper.exe` en draai deze op de achtergrond.

## Hoe het werkt:

1. **Helper app start** → Luistert op localhost:8765
2. **Gebruiker sleept email uit Outlook** → Helper detecteert via Windows API
3. **Browser vraagt data op** → Via REST API call naar helper
4. **Email wordt geïmporteerd** → Direct in CRM

## API Endpoints:

- `GET /status` - Check of helper actief is
- `GET /outlook-email` - Haal laatste gesleepte email op
- `POST /set-email` - Zet email data (voor COM interface)







