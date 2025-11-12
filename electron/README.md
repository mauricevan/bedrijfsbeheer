# Electron Setup voor Outlook Drag-and-Drop

Deze Electron wrapper maakt het mogelijk om **direct emails vanuit Outlook te slepen** naar de applicatie, zonder eerst naar de desktop te hoeven slepen.

## 🚀 Starten

### Development Mode

1. **Start de Vite dev server** (in een aparte terminal):
   ```bash
   npm run dev
   ```

2. **Start Electron** (in een andere terminal):
   ```bash
   npm run electron:dev
   ```

De Electron app zal automatisch verbinden met de Vite dev server op `http://localhost:5173`.

### Production Build

```bash
npm run electron:build
```

Dit bouwt eerst de React app en maakt dan een Electron executable.

## 📧 Hoe te gebruiken

1. **Start de Electron app** (zie hierboven)
2. **Ga naar CRM → Email tab**
3. **Sleep direct een email vanuit Outlook** naar de drop zone
4. De email wordt automatisch verwerkt en omgezet naar een workflow item (order/task/notification)

## 🔧 Technische Details

### Outlook Integratie

De app gebruikt **Windows COM API** via VBScript om Outlook emails te lezen wanneer je ze sleept. Dit werkt alleen op Windows met Microsoft Outlook geïnstalleerd.

### Bestandsstructuur

- `electron/main.js` - Electron main process
- `electron/preload.js` - Veilige IPC bridge
- `electron/outlookHelper.js` - Outlook COM API integratie
- `components/EmailDropZone.tsx` - React component die luistert naar Electron events

### IPC Communicatie

1. **Drag event** → Preload script detecteert Outlook drag data
2. **Main process** → Gebruikt COM API om email content te krijgen
3. **Custom event** → Email data wordt naar React app gestuurd
4. **EmailDropZone** → Verwerkt email en maakt workflow item aan

## ⚠️ Vereisten

- **Windows** (COM API werkt alleen op Windows)
- **Microsoft Outlook** geïnstalleerd
- **Node.js** v18+

## 🐛 Troubleshooting

### Outlook emails worden niet gedetecteerd

- Zorg dat Outlook open is
- Probeer opnieuw te slepen
- Check de Electron console voor errors

### COM API errors

- Zorg dat Outlook toegang heeft tot je emails
- Mogelijk moet je Outlook als administrator starten (eerste keer)

### Electron start niet

- Zorg dat `npm run dev` draait op `http://localhost:5173`
- Check of port 5173 beschikbaar is






