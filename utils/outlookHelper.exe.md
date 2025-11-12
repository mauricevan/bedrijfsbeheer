# Outlook Helper Applicatie (Toekomstige Implementatie)

## Concept

Een kleine Windows applicatie die tussen Outlook en de browser communiceert om direct drag-and-drop mogelijk te maken.

## Hoe het werkt:

1. **Helper App draait op achtergrond** (localhost:8765)
2. **Outlook COM Interface** - Leest email data wanneer gebruiker sleept
3. **WebSocket Server** - Communiceert met browser
4. **Browser Extension** (optioneel) - Vangt drag events op en communiceert met helper

## Implementatie:

### Windows Helper App (C# / .NET)
```csharp
// Gebruikt Outlook COM interface om email data te lezen
// Serveert op localhost:8765
// Accepteert drag events van Outlook
```

### Browser Connector
- Detecteert wanneer helper beschikbaar is
- Luistert naar drag events
- Haalt email data op via REST API

## Voordelen:
- ✅ Direct drag-and-drop vanuit Outlook
- ✅ Werkt met alle Outlook versies
- ✅ Geen browser extensie nodig (optioneel)
- ✅ Lokale data, geen cloud

## Status:
🔄 Nog te implementeren - vereist Windows development






