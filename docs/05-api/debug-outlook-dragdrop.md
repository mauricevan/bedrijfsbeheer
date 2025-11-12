# Debug Stappen Plan - Outlook Drag-and-Drop

Volg deze stappen **in volgorde** om te isoleren waar het probleem zit.

## Stap 1: Electron Start Controleren

1. **Start Electron:**
   ```bash
   npm run electron:dev
   ```

2. **Check de terminal output:**
   - ✅ Zie je "✅ Page loaded, injecting drag-and-drop handlers..."?
   - ✅ Zie je "✅ Drag-and-drop handlers set up"?
   - ❌ Zie je errors? Noteer welke.

## Stap 2: Browser Console Controleren

1. **Open DevTools in Electron** (F12 of Ctrl+Shift+I)
2. **Ga naar Console tab**
3. **Check de console output:**
   - ✅ Zie je "🔧 Setting up drag-and-drop handlers..."?
   - ✅ Zie je "✅ Drag-and-drop handlers set up"?
   - ✅ Zie je "🔍 EmailDropZone: Checking for Electron..."?
   - ✅ Zie je "✅ Electron detected! Setting up event listeners..."?

## Stap 3: Drag Event Testen

1. **Sleep een email vanuit Outlook** naar de Electron window
2. **Kijk in de Browser Console:**
   - ✅ Zie je "📥 Drag enter detected"?
   - ✅ Zie je "📦 Drag over detected"?
   - ✅ Zie je "🎯 DROP EVENT DETECTED!"?
   - ✅ Zie je "DataTransfer types:" met een lijst?

**Als je GEEN drop event ziet:**
- Outlook geeft mogelijk geen drag events door aan Electron
- Mogelijk Windows security restrictie

## Stap 4: Data Transfer Types Controleren

Als je een drop event ziet, check:

1. **In Browser Console:**
   - ✅ Zie je "Checking for Outlook types:" met types?
   - ✅ Zie je "✅ Outlook drag type detected!"?
   - ❌ Of zie je "❌ No Outlook drag type found"?

**Als maillistrow niet wordt gedetecteerd:**
- Outlook gebruikt mogelijk een andere data type
- Noteer welke types je WEL ziet

## Stap 5: Data Ophalen Testen

Als Outlook type wordt gedetecteerd:

1. **Check Browser Console:**
   - ✅ Zie je "Outlook data received:" met data?
   - ✅ Zie je "Calling handleOutlookDrag with data"?
   - ❌ Of zie je "❌ No data in Outlook drag event"?

**Als er geen data is:**
- Outlook blokkeert mogelijk data transfer naar Electron
- Mogelijk Windows security restrictie

## Stap 6: IPC Communicatie Testen

Als data wordt doorgegeven:

1. **Check Terminal (waar Electron draait):**
   - ✅ Zie je "📬 IPC: process-outlook-email called"?
   - ✅ Zie je "📬 Data type: string"?
   - ✅ Zie je "📬 JSON parsed successfully"?

**Als IPC niet werkt:**
- Check of preload script correct geladen wordt
- Check Electron console voor errors

## Stap 7: COM API Testen

Als JSON wordt geparseerd:

1. **Check Terminal:**
   - ✅ Zie je "📬 Windows detected, using VBScript COM API..."?
   - ✅ Zie je "📬 COM API result: SUCCESS"?
   - ❌ Of zie je errors van VBScript?

**Als COM API faalt:**
- Outlook is mogelijk niet open
- Permissions probleem
- VBScript error (check terminal)

## Stap 8: React Event Testen

Als COM API werkt:

1. **Check Browser Console:**
   - ✅ Zie je "📬 React: email-dropped event received!"?
   - ✅ Zie je "📬 Processing Outlook email..."?
   - ✅ Zie je "✅ Email processed successfully"?

**Als React event niet komt:**
- Event wordt niet correct dispatched
- React component luistert niet goed

## Test Checklist

Gebruik deze checklist tijdens het testen:

- [ ] Electron start zonder errors
- [ ] Browser console toont "Electron detected"
- [ ] Drag enter wordt gedetecteerd
- [ ] Drop event wordt gedetecteerd
- [ ] DataTransfer types worden getoond
- [ ] Outlook type (maillistrow) wordt gevonden
- [ ] Data wordt opgehaald uit drag event
- [ ] IPC call wordt gemaakt
- [ ] JSON wordt geparseerd
- [ ] COM API wordt aangeroepen
- [ ] Email data wordt teruggegeven
- [ ] React event wordt ontvangen
- [ ] Email wordt verwerkt

## Wat te Rapporteren

Noteer bij elke stap:
1. ✅ Wat WERKT (console messages die je ziet)
2. ❌ Wat NIET werkt (waar stopt het?)
3. 📋 Welke console messages je ziet bij de stap waar het stopt

Dit helpt om precies te isoleren waar het probleem zit!






