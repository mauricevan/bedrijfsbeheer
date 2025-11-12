# Werkorder Integratie Workflow

De Werkorder Integratie Workflow is een complete end-to-end oplossing die offertes, werkorders en facturen naadloos met elkaar verbindt. Deze feature elimineert dubbel werk en zorgt voor real-time synchronisatie tussen alle stappen in het bedrijfsproces.

**Versie:** 4.0 en hoger
**Status:** Volledig geïmplementeerd en werkend

---

## Overzicht

De werkorder workflow integreert drie cruciale modules:

1. **Offertes** - Prijsopgave voor klant
2. **Werkorders** - Uitvoering van werkzaamheden
3. **Facturen** - Facturering van voltooid werk

### Belangrijkste Voordelen

- 🔄 **Bidirectionele synchronisatie** - Wijzigingen worden automatisch doorgevoerd
- 🎯 **Eén klik conversie** - Van offerte naar werkorder naar factuur
- 📊 **Real-time status tracking** - Altijd actueel overzicht
- 🔗 **Volledige traceerbaarheid** - Links tussen alle documenten
- ⚡ **Tijd besparing** - Geen dubbele data entry meer
- ✅ **Foutpreventie** - Minder menselijke fouten

---

## Complete End-to-End Workflow

### Fase 1: OFFERTE FASE

**Stap 1: Offerte Aanmaken**

```
Admin maakt nieuwe offerte aan:
├─ Klant selecteren of aanmaken
├─ Items uit voorraad toevoegen
├─ Custom items toevoegen (indien nodig)
├─ Werkuren opgeven
│  ├─ Aantal uren
│  ├─ Uurtarief (€65,00 standaard)
│  └─ Automatische berekening
├─ BTW percentage instellen (21% standaard)
├─ Notities toevoegen
└─ Geldig tot datum instellen
```

**Stap 2: Offerte Versturen**

```
Status updaten naar "Sent":
├─ Klant ontvangt offerte
├─ Wacht op feedback
└─ Status in systeem: 📤 Verzonden
```

**Stap 3: Klant Accepteert**

```
Status updaten naar "Approved":
├─ Klant accepteert offerte
├─ Status wijzigt naar: ✅ Geaccepteerd
├─ Knop verschijnt: "📋 Maak Werkorder"
└─ Offerte ready voor conversie
```

---

### Fase 2: WERKORDER CREATIE

**Automatische Werkorder Generatie**

Wanneer je klikt op **"📋 Maak Werkorder"** gebeurt het volgende automatisch:

```typescript
Werkorder wordt aangemaakt met:
{
  // Basis Informatie
  title: "[Klantnaam] - [Offerte titel]",
  description: "[Offerte beschrijving]",

  // Materialen
  materials: [
    // Alle items uit offerte worden toegevoegd
    { item: "Stalen buis 50mm", quantity: 10, unit: "meter" },
    { item: "Laswerk materiaal", quantity: 1, unit: "stuk" }
  ],

  // Uren
  estimatedHours: [Werkuren uit offerte],
  actualHours: 0,  // Wordt bijgehouden tijdens uitvoering

  // Status & Tracking
  status: "todo",  // To Do
  assignedTo: null,  // Admin wijst medewerker toe

  // Links
  relatedQuoteId: "[Offerte ID]",
  quoteNumber: "2025-042",

  // Timestamps
  createdAt: "2025-11-12T10:30:00Z",
  assignedAt: null,
  startedAt: null,
  completedAt: null
}
```

**Visuele Feedback in Offerte**

Na werkorder creatie toont de offerte:

```
┌─────────────────────────────────────────┐
│ Offerte #2025-042                       │
│ Status: ✅ Geaccepteerd                 │
│                                         │
│ 🔵 Werkorder: To Do                     │
│ [Klik voor details]                     │
└─────────────────────────────────────────┘
```

---

### Fase 3: UITVOERING

**Stap 1: Toewijzing aan Medewerker**

```
Admin wijst werkorder toe:
├─ Selecteer medewerker uit dropdown
├─ Werkorder verschijnt in workboard van medewerker
├─ Status blijft: To Do
├─ Notificatie naar medewerker
└─ Timestamp: assignedAt wordt ingevuld
```

**Stap 2: Medewerker Start Werkorder**

```
Medewerker in workboard:
├─ Ziet werkorder in "To Do" kolom
├─ Klik op werkorder card
├─ Details bekijken:
│  ├─ Klant informatie
│  ├─ Benodigde materialen
│  ├─ Geschatte uren
│  └─ Link naar originele offerte
├─ Klik "Start Werkorder"
├─ Status wijzigt naar: "In Uitvoering"
└─ Timestamp: startedAt wordt ingevuld
```

**Real-time Status Update in Offerte**

```
┌─────────────────────────────────────────┐
│ Offerte #2025-042                       │
│ Status: ✅ Geaccepteerd                 │
│                                         │
│ 🟢 Werkorder: In Uitvoering             │
│ [Klik voor details]                     │
│                                         │
│ ⏱️ Gestart: 2 uur geleden               │
└─────────────────────────────────────────┘
```

**Stap 3: Uren Registratie**

```
Tijdens uitvoering:
├─ Medewerker registreert uren
├─ Editable hours veld in werkorder card
├─ Wijzigingen worden real-time opgeslagen
├─ Admin kan uren ook aanpassen
└─ Verschil geschat vs werkelijk wordt bijgehouden
```

---

### Fase 4: TUSSENTIJDSE WIJZIGINGEN

**Scenario: Klant wil extra items**

```
Wijziging workflow:
1. Admin opent offerte
2. Klik op "✏️ Bewerk & Update Werkorder"
3. Voeg extra items toe aan offerte:
   ├─ Nieuw item selecteren
   ├─ Hoeveelheid opgeven
   └─ Prijs wordt automatisch berekend
4. Sla wijzigingen op
5. AUTOMATISCH: Werkorder wordt bijgewerkt
   ├─ Extra materialen toegevoegd
   ├─ Medewerker ziet update in workboard
   └─ Notificatie: "Werkorder bijgewerkt"
```

**Bidirectionele Synchronisatie**

```
Offerte → Werkorder:
✅ Items toevoegen/verwijderen
✅ Hoeveelheden aanpassen
✅ Werkuren wijzigen
✅ Beschrijving updaten
✅ Klant informatie aanpassen

Werkorder → Offerte:
✅ Status updates (To Do → In Progress → Completed)
✅ Daadwerkelijke uren vs geschat
✅ Materiaalverbruik tracking
✅ Voltooiing timestamp
```

**Smart Business Logic**

Het systeem heeft ingebouwde checks:

```typescript
// Voorraad Controle
if (item.stock < requiredQuantity) {
  showWarning("⚠️ Onvoldoende voorraad voor [item]");
  confirmAction("Toch doorgaan?");
}

// Status Guard
if (workorder.status === "completed") {
  showError("❌ Werkorder al voltooid, wijzigingen niet toegestaan");
  preventEdit();
}

// Conflict Detectie
if (offerte.updatedAt > workorder.lastSyncedAt) {
  showWarning("⚠️ Offerte is gewijzigd sinds laatste sync");
  suggestUpdate("Werkorder synchroniseren?");
}
```

---

### Fase 5: VOLTOOIING

**Stap 1: Medewerker Voltooit Werkorder**

```
Medewerker markeert als voltooid:
├─ Klik "Voltooi Werkorder"
├─ Bevestig voltooiing
├─ Status wijzigt naar: "Completed"
├─ Timestamp: completedAt wordt ingevuld
├─ Finale uren worden geregistreerd
└─ Werkorder verplaatst naar "Afgerond" kolom
```

**Stap 2: Automatische Voorraad Update**

```
Bij voltooiing:
├─ Alle gebruikte materialen
│  ├─ Worden afgetrokken van voorraad
│  ├─ Voorraad wordt real-time bijgewerkt
│  └─ Lage voorraad alerts indien onder minimum
├─ Transactie wordt geregistreerd
│  ├─ Datum en tijd
│  ├─ Welke items
│  └─ Voor welke werkorder
└─ Admin ontvangt notificatie
    └─ "✅ Werkorder [#ID] voltooid"
```

**Stap 3: Status Update in Offerte**

```
┌─────────────────────────────────────────┐
│ Offerte #2025-042                       │
│ Status: ✅ Geaccepteerd                 │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Werkorder: Voltooid              │ │
│ │ Afgerond: 12 nov 2025, 16:30       │ │
│ │ Werkelijke uren: 8,5 uur            │ │
│ │ (Geschat: 8 uur)                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [🧾 Omzetten naar Factuur]             │
└─────────────────────────────────────────┘

Border: Groen (✅ volledig afgerond)
```

---

### Fase 6: FACTURATIE

**Stap 1: Conversie naar Factuur**

```
Admin klikt "🧾 Omzetten naar Factuur":

Factuur wordt automatisch aangemaakt:
{
  // Factuurnummer
  invoiceNumber: "2025-089",  // Automatisch incrementerend per jaar

  // Klant & Referenties
  customer: [Klant uit offerte],
  relatedQuoteId: "[Offerte ID]",
  relatedWorkorderId: "[Werkorder ID]",

  // Items
  items: [
    // Alle items uit offerte
    // Met werkelijke hoeveelheden indien aangepast
  ],

  // Uren
  laborHours: [Werkelijke uren uit werkorder],  // ⚠️ Belangrijk!
  hourlyRate: €65,00,
  laborTotal: €552,50,  // 8,5 uur × €65

  // Bedragen
  subtotal: €XXX,XX,
  vatAmount: €XXX,XX,
  total: €XXX,XX,

  // Datums
  invoiceDate: "2025-11-12",  // Vandaag
  dueDate: "2025-11-26",      // Vandaag + 14 dagen

  // Status
  status: "draft"
}
```

**Key Feature: Daadwerkelijke Uren**

```
Verschil tussen geschat en werkelijk:

Offerte:
├─ Geschatte uren: 8 uur
└─ Geschat bedrag: €520,00

Werkelijke uitvoering:
├─ Gewerkte uren: 8,5 uur
└─ Te factureren: €552,50

Factuur gebruikt ALTIJD werkelijke uren!
```

**Stap 2: Factuur Finaliseren**

```
Admin controleert en finaliseert:
├─ Controleer items en bedragen
├─ Voeg notities toe (optioneel)
├─ Pas betalingstermijn aan (indien nodig)
├─ Status updaten naar "Sent"
└─ Factuur naar klant versturen
```

**Stap 3: Links Behouden**

```
Volledige traceerbaar heid:

Factuur toont:
├─ Link naar originele offerte
│  └─ "📋 Bekijk Offerte #2025-042"
├─ Link naar werkorder
│  └─ "🔨 Bekijk Werkorder #WO-156"
├─ Werkelijke vs geschatte uren
└─ Materiaalverbruik details
```

---

### Fase 7: BETALING

**Markeer Factuur als Betaald**

```
Wanneer betaling ontvangen:
├─ Admin opent factuur
├─ Klik "Markeer als Betaald"
├─ Status wijzigt naar: "Paid"
├─ Betalingsdatum wordt automatisch ingevuld: [Vandaag]
├─ Factuur krijgt groene checkmark ✅
├─ Transactie wordt geregistreerd in boekhouding
└─ Klant status wordt bijgewerkt
```

**Cyclus Compleet**

```
✅ Complete workflow afgerond:

Offerte → Werkorder → Factuur → Betaald

Alle stappen gedocumenteerd
Alle links behouden
Volledige audit trail
```

---

## Bidirectionele Synchronisatie Details

### Offerte → Werkorder Updates

**Wat wordt gesynchroniseerd:**

| Offerte Wijziging | Werkorder Effect |
|-------------------|------------------|
| Item toegevoegd | Materiaal toegevoegd aan werkorder |
| Item verwijderd | Materiaal verwijderd (met waarschuwing) |
| Hoeveelheid gewijzigd | Materiaal hoeveelheid aangepast |
| Werkuren gewijzigd | Geschatte uren bijgewerkt |
| Beschrijving aangepast | Werkorder beschrijving geüpdatet |
| Klant gewijzigd | Werkorder klant aangepast |

**Update Mechanisme:**

```typescript
function syncQuoteToWorkorder(quote, workorder) {
  // Check of werkorder niet voltooid is
  if (workorder.status === 'completed') {
    showError("Voltooide werkorder kan niet worden aangepast");
    return;
  }

  // Update materialen
  workorder.materials = quote.items.map(item => ({
    item: item.name,
    quantity: item.quantity,
    unit: item.unit,
    fromStock: item.inventoryItemId !== null
  }));

  // Update geschatte uren
  workorder.estimatedHours = quote.laborHours || 0;

  // Update beschrijving
  workorder.description = quote.description;

  // Update klant
  workorder.customer = quote.customer;

  // Timestamp van laatste sync
  workorder.lastSyncedAt = new Date();

  // Notificeer toegewezen medewerker
  if (workorder.assignedTo) {
    createNotification({
      type: 'info',
      title: 'Werkorder bijgewerkt',
      message: `Werkorder ${workorder.id} is bijgewerkt vanuit offerte`,
      userId: workorder.assignedTo
    });
  }
}
```

### Werkorder → Offerte Updates

**Wat wordt doorgegeven:**

| Werkorder Wijziging | Offerte Effect |
|---------------------|----------------|
| Status: In Uitvoering | Badge: 🟢 In Uitvoering |
| Status: Voltooid | Badge: ✅ Voltooid + Groene border |
| Status: In Wacht | Badge: 🟡 In Wacht + Reden |
| Uren geregistreerd | Werkelijke uren zichtbaar in offerte |
| Voltooiing timestamp | "Afgerond op [datum]" in offerte |

### Werkorder → Factuur Updates

**Bij conversie naar factuur:**

```typescript
function convertWorkorderToInvoice(workorder, quote) {
  return {
    // Basis van offerte items
    items: quote.items,

    // MAAR: Werkelijke uren van werkorder
    laborHours: workorder.actualHours,  // ⚠️ Niet quote.laborHours!
    hourlyRate: quote.hourlyRate,

    // Links behouden
    relatedQuoteId: quote.id,
    relatedWorkorderId: workorder.id,

    // Status informatie
    workorderCompletedAt: workorder.completedAt,
    workorderAssignedTo: workorder.assignedTo
  };
}
```

---

## Smart Business Logic

### Voorraad Controle bij Conversie

**Scenario: Onvoldoende voorraad**

```
Bij "Maak Werkorder" klik:

Check voorraad:
├─ Voor elk item in offerte
│  ├─ Controleer huidige voorraad
│  ├─ Vergelijk met benodigde hoeveelheid
│  └─ Als tekort:
│     ├─ Toon waarschuwing:
│     │  "⚠️ Onvoldoende voorraad:
│     │   Stalen buis 50mm
│     │   Nodig: 10 meter
│     │   Beschikbaar: 6 meter
│     │   Tekort: 4 meter"
│     ├─ Suggestie: "Bestel extra voorraad"
│     └─ Vraag: "Toch werkorder aanmaken?"
└─ Werkorder wordt aangemaakt met waarschuwing
```

### Status Guards

**Voorkom ongewenste wijzigingen:**

```typescript
// Guard: Voltooide werkorder niet bewerken
if (workorder.status === 'completed') {
  if (attemptEdit()) {
    showError("❌ Voltooide werkorder kan niet worden bewerkt");
    return false;
  }
}

// Guard: Offerte met actieve werkorder
if (quote.hasWorkorder && workorder.status === 'in_progress') {
  if (attemptDelete()) {
    showError("❌ Kan offerte niet verwijderen tijdens actieve werkorder");
    return false;
  }
}

// Guard: Materiaal verwijderen tijdens uitvoering
if (workorder.status === 'in_progress') {
  if (removeMaterial()) {
    showWarning("⚠️ Werkorder is al gestart, materiaal verwijderen?");
    requireConfirmation();
  }
}
```

### Conflict Detectie

**Scenario: Gelijktijdige wijzigingen**

```typescript
// Check timestamps
if (quote.updatedAt > workorder.lastSyncedAt) {
  showWarning({
    title: "⚠️ Synchronisatie verschil gedetecteerd",
    message: `
      Offerte is gewijzigd sinds laatste synchronisatie.

      Offerte laatst gewijzigd: ${formatDate(quote.updatedAt)}
      Werkorder laatst gesync: ${formatDate(workorder.lastSyncedAt)}

      Wilt u werkorder synchroniseren met offerte?
    `,
    actions: [
      { label: "Ja, synchroniseer", action: syncNow },
      { label: "Nee, behoud werkorder zoals is", action: cancel }
    ]
  });
}
```

---

## Visuele Feedback

### Status Badges in Offertes

**Badge Varianten:**

```
Status: To Do
┌─────────────────────────┐
│ 🔵 Werkorder: To Do     │
└─────────────────────────┘
Kleur: Blauw
Betekenis: Toegewezen maar nog niet gestart

Status: In Wacht (Pending)
┌──────────────────────────────────────┐
│ 🟡 Werkorder: In Wacht               │
│ Reden: Wacht op materiaal levering  │
└──────────────────────────────────────┘
Kleur: Geel/Oranje
Betekenis: Gepauzeerd met reden

Status: In Uitvoering
┌─────────────────────────┐
│ 🟢 Werkorder: In Uitvoering │
│ Gestart: 3 uur geleden  │
└─────────────────────────┘
Kleur: Groen (animated pulse)
Betekenis: Actief in bewerking

Status: Voltooid
┌─────────────────────────────────┐
│ ✅ Werkorder: Voltooid          │
│ Afgerond: 12 nov 2025, 16:30   │
│ Werkelijke uren: 8,5 uur        │
└─────────────────────────────────┘
Kleur: Groen met checkmark
Betekenis: Succesvol afgerond
```

### Offerte Card Borders

**Border Kleuren:**

```css
/* Geen werkorder */
border: 1px solid #e5e7eb;

/* Werkorder To Do */
border-left: 4px solid #3b82f6;  /* Blauw */

/* Werkorder In Progress */
border-left: 4px solid #10b981;  /* Groen */
animation: pulse 2s infinite;

/* Werkorder Pending */
border-left: 4px solid #f59e0b;  /* Oranje */

/* Werkorder Voltooid */
border: 2px solid #10b981;       /* Groen rondom hele card */
background: linear-gradient(to right, #f0fdf4, white);
```

### Progress Indicators

**Uren Vergelijking:**

```
┌────────────────────────────────────┐
│ Uren Tracking                      │
├────────────────────────────────────┤
│ Geschat:     8,0 uur               │
│ Werkelijk:   8,5 uur               │
│ Verschil:   +0,5 uur (+6%)         │
│ [=========>  ] 106%                │
└────────────────────────────────────┘

Groen: Binnen geschatte tijd
Geel: 0-10% overschrijding
Rood: >10% overschrijding
```

---

## Gebruikersgemak Features

### Eén Klik Conversie

**Van Offerte naar Werkorder:**
- Één knop: "📋 Maak Werkorder"
- Geen formulier invullen nodig
- Alles automatisch overgenomen
- Direct klaar voor toewijzing

**Van Werkorder naar Factuur:**
- Één knop: "🧾 Omzetten naar Factuur"
- Werkelijke uren automatisch gebruikt
- Alle items overgenomen
- Direct klaar voor verzending

### Automatische Materiaal Toewijzing

**Bij werkorder creatie:**

```typescript
// Materialen uit offerte items
quote.items.forEach(item => {
  if (item.inventoryItemId) {
    // Item uit voorraad
    workorder.materials.push({
      inventoryItem: item.inventoryItemId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      reservedFromStock: true
    });
  } else {
    // Custom item
    workorder.materials.push({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      reservedFromStock: false,
      customItem: true
    });
  }
});
```

### Gewerkte vs Geschatte Uren Vergelijking

**In werkorder details:**

```
┌─────────────────────────────────────┐
│ Uren Overzicht                      │
├─────────────────────────────────────┤
│ Offerte geschat:  8,0 uur           │
│ Daadwerkelijk:    8,5 uur           │
│ Verschil:        +0,5 uur           │
│                                     │
│ Facturatie:                         │
│ 8,5 uur × €65 = €552,50            │
│ (Geschat: €520,00)                  │
│ Meerwerk: €32,50                    │
└─────────────────────────────────────┘
```

**In factuur:**

```
Werkuren:
├─ Volgens offerte: 8,0 uur
├─ Daadwerkelijk gewerkt: 8,5 uur
├─ Verschil: +0,5 uur (+6,25%)
└─ Gefactureerd: 8,5 uur × €65,00 = €552,50
```

### Snelle Status Updates via Badges

**Klikbare badges:**
- Klik op badge in offerte → Open werkorder details
- Klik op "Werkorder: [Status]" → Navigeer naar workboard
- Directe link naar gekoppelde werkorder
- Geen zoeken meer nodig

---

## Audit Trail

### Volledige History Tracking

**Wat wordt gelogd:**

```typescript
History Entry:
{
  action: 'workorder_created_from_quote',
  timestamp: '2025-11-12T10:30:00Z',
  user: 'Sophie van Dam',
  details: {
    quoteId: '2025-042',
    workorderId: 'WO-156',
    estimatedHours: 8,
    materials: ['Stalen buis 50mm', 'Laswerk materiaal']
  }
}

History Entry:
{
  action: 'workorder_status_changed',
  timestamp: '2025-11-12T11:15:00Z',
  user: 'Jan de Vries',
  details: {
    from: 'todo',
    to: 'in_progress',
    workorderId: 'WO-156'
  }
}

History Entry:
{
  action: 'quote_synced_to_workorder',
  timestamp: '2025-11-12T14:00:00Z',
  user: 'Sophie van Dam',
  details: {
    quoteId: '2025-042',
    workorderId: 'WO-156',
    changes: ['Added material: Extra stalen plaat', 'Hours updated: 8 → 10']
  }
}

History Entry:
{
  action: 'workorder_completed',
  timestamp: '2025-11-12T16:30:00Z',
  user: 'Jan de Vries',
  details: {
    workorderId: 'WO-156',
    actualHours: 8.5,
    estimatedHours: 8,
    materialsUsed: ['Stalen buis 50mm: 10m', 'Stalen plaat: 1 stuk']
  }
}

History Entry:
{
  action: 'invoice_created_from_workorder',
  timestamp: '2025-11-12T17:00:00Z',
  user: 'Sophie van Dam',
  details: {
    invoiceNumber: '2025-089',
    workorderId: 'WO-156',
    quoteId: '2025-042',
    totalAmount: '€1.245,75',
    laborHours: 8.5
  }
}
```

### Historie Weergave

**In werkorder details:**

```
📜 Geschiedenis

🆕 Werkorder aangemaakt
    12 nov 2025, 10:30 - Sophie van Dam
    Vanuit offerte #2025-042

👤 Toegewezen aan Jan de Vries
    12 nov 2025, 10:45 - Sophie van Dam

▶️ Gestart
    12 nov 2025, 11:15 - Jan de Vries

🔄 Gesynchroniseerd met offerte
    12 nov 2025, 14:00 - Sophie van Dam
    • Materiaal toegevoegd: Extra stalen plaat
    • Geschatte uren: 8 → 10 uur

✅ Voltooid
    12 nov 2025, 16:30 - Jan de Vries
    Werkelijke uren: 8,5 uur

🧾 Factuur aangemaakt
    12 nov 2025, 17:00 - Sophie van Dam
    Factuurnummer: 2025-089
```

---

## Best Practices

### Voor Admins

1. **Controleer voorraad** voor werkorder creatie
2. **Wijs direct toe** aan juiste medewerker na aanmaken
3. **Monitor status** regelmatig via offerte overzicht
4. **Sync tijdig** bij wijzigingen in offerte
5. **Factureer snel** na voltooiing werkorder
6. **Bewaar links** tussen documenten (niet verwijderen)
7. **Check uren** verschil tussen geschat en werkelijk

### Voor Medewerkers

1. **Registreer uren** real-time tijdens werk
2. **Update status** tijdig (Start/In Wacht/Voltooi)
3. **Geef reden** bij in wacht zetten
4. **Check materialen** voor start werkorder
5. **Meld problemen** direct aan admin
6. **Voltooi alleen** wanneer écht klaar
7. **Controleer details** in werkorder card

---

## Troubleshooting

### Veelvoorkomende Problemen

**1. Werkorder button niet zichtbaar**
- **Oorzaak:** Offerte nog niet approved
- **Oplossing:** Update offerte status naar "Approved"

**2. Materialen niet in werkorder**
- **Oorzaak:** Geen items in offerte
- **Oplossing:** Voeg items toe aan offerte en sync werkorder

**3. Uren kloppen niet in factuur**
- **Oorzaak:** Vergeten uren te registreren in werkorder
- **Oplossing:** Update uren in werkorder voor conversie naar factuur

**4. Voorraad niet afgetrokken**
- **Oorzaak:** Werkorder niet correct voltooid
- **Oplossing:** Check werkorder status en voltooi opnieuw

**5. Status niet gesynchroniseerd**
- **Oorzaak:** Browser cache of timing issue
- **Oplossing:** Refresh pagina, check timestamps in history

---

## Toekomstige Uitbreidingen

### Geplande Features

- 🔄 **Digitaal aftekenen** - Klant handtekening bij voltooiing
- 🔄 **Fotobewijs** - Upload foto's tijdens werkorder uitvoering
- 🔄 **Automatische rapportages** - Weekly/monthly werkorder reports
- 🔄 **Tijd tracking** - Geïntegreerde timer in werkorder
- 🔄 **GPS check-in** - Locatie verificatie bij start werkorder
- 🔄 **Materiaal scan** - Barcode/QR scan bij materiaal gebruik
- 🔄 **Client portal** - Klant kan status realtime volgen
- 🔄 **Automatic invoicing** - Factuur automatisch versturen na voltooiing

---

## Gerelateerde Documentatie

- [Offertes & Facturen](../02-modules/accounting.md) - Volledige accounting workflow
- [Werkorders/Workboard](../02-modules/workorders.md) - Workboard functionaliteit
- [Voorraadbeheer](../02-modules/inventory.md) - Voorraad integratie
- [Notifications](./notifications.md) - Notificaties tijdens workflow
- [User Roles](./user-roles.md) - Toegangsrechten per rol
- [Email Integration](./email-integration.md) - Email naar werkorder conversie

---

## Support & Vragen

Voor vragen over de werkorder workflow:

1. Bekijk deze documentatie
2. Test workflow met demo data
3. Check [FAQ](../05-support/faq.md)
4. Neem contact op met support

**Laatst bijgewerkt:** November 2025 (V4.0+)
