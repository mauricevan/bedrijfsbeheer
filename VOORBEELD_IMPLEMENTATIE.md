# 📘 Voorbeeld Implementatie - handleCreateQuote met Audit Trail

Dit bestand toont een **COMPLEET WERKEND VOORBEELD** van hoe een functie eruit ziet met het nieuwe audit trail systeem.

## ❌ VOOR (Zonder Audit Trail)

```typescript
const handleCreateQuote = () => {
  if (!newQuote.customerId || newQuote.items.length === 0 || !newQuote.validUntil) {
    alert('Vul alle verplichte velden in (klant, minimaal 1 item, en geldig tot datum)!');
    return;
  }

  const { subtotal, vatAmount, total } = calculateQuoteTotals();

  const quote: Quote = {
    id: `Q${Date.now()}`,
    customerId: newQuote.customerId,
    items: newQuote.items,
    labor: newQuote.labor.length > 0 ? newQuote.labor : undefined,
    subtotal: subtotal,
    vatRate: newQuote.vatRate,
    vatAmount: vatAmount,
    total: total,
    status: 'draft',
    createdDate: new Date().toISOString().split('T')[0],
    validUntil: newQuote.validUntil,
    notes: newQuote.notes,
  };

  setQuotes([...quotes, quote]);
  setNewQuote({
    customerId: '',
    items: [],
    labor: [],
    vatRate: 21,
    notes: '',
    validUntil: '',
  });
  setShowQuoteForm(false);
};
```

## ✅ NA (Met Complete Audit Trail)

```typescript
const handleCreateQuote = () => {
  if (!newQuote.customerId || newQuote.items.length === 0 || !newQuote.validUntil) {
    alert('Vul alle verplichte velden in (klant, minimaal 1 item, en geldig tot datum)!');
    return;
  }

  const { subtotal, vatAmount, total } = calculateQuoteTotals();
  
  // ⭐ NIEUW: Haal huidige timestamp op
  const now = new Date().toISOString();
  
  // ⭐ NIEUW: Haal klantnaam op voor in de history
  const customerName = getCustomerName(newQuote.customerId);

  const quote: Quote = {
    id: `Q${Date.now()}`,
    customerId: newQuote.customerId,
    items: newQuote.items,
    labor: newQuote.labor.length > 0 ? newQuote.labor : undefined,
    subtotal: subtotal,
    vatRate: newQuote.vatRate,
    vatAmount: vatAmount,
    total: total,
    status: 'draft',
    createdDate: new Date().toISOString().split('T')[0],
    validUntil: newQuote.validUntil,
    notes: newQuote.notes,
    
    // ⭐⭐⭐ NIEUW: Audit trail velden ⭐⭐⭐
    createdBy: currentUser.employeeId,
    
    timestamps: {
      created: now  // Exacte datum/tijd van aanmaak
    },
    
    history: [
      {
        timestamp: now,
        action: 'created',
        performedBy: currentUser.employeeId,
        details: `Offerte aangemaakt door ${getEmployeeName(currentUser.employeeId)} voor klant ${customerName}`
      }
    ]
  };

  setQuotes([...quotes, quote]);
  setNewQuote({
    customerId: '',
    items: [],
    labor: [],
    vatRate: 21,
    notes: '',
    validUntil: '',
  });
  setShowQuoteForm(false);
  
  // ⭐ NIEUW: Betere bevestiging met offerte ID
  alert(`✅ Offerte ${quote.id} succesvol aangemaakt!`);
};
```

## 📊 Wat Verandert Er?

### 1. Timestamp Opslaan
```typescript
const now = new Date().toISOString();
// Output: "2025-10-22T14:23:45.123Z"
```

### 2. CreatedBy Veld
```typescript
createdBy: currentUser.employeeId
// Slaat op: "e4" (bijvoorbeeld Sophie van Dam's ID)
```

### 3. Timestamps Object
```typescript
timestamps: {
  created: now
}
// Later kun je toevoegen: sent, approved, convertedToInvoice, etc.
```

### 4. History Array
```typescript
history: [
  {
    timestamp: now,                      // Wanneer
    action: 'created',                   // Wat
    performedBy: currentUser.employeeId, // Wie (ID)
    details: "Offerte aangemaakt..."     // Beschrijving
  }
]
```

## 💾 Wat Wordt Opgeslagen in de Database

**Offerte Object in State:**
```json
{
  "id": "Q1729603425123",
  "customerId": "c1",
  "items": [...],
  "subtotal": 1500,
  "vatRate": 21,
  "vatAmount": 315,
  "total": 1815,
  "status": "draft",
  "createdDate": "2025-10-22",
  "validUntil": "2025-11-22",
  
  "createdBy": "e4",
  "timestamps": {
    "created": "2025-10-22T14:23:45.123Z"
  },
  "history": [
    {
      "timestamp": "2025-10-22T14:23:45.123Z",
      "action": "created",
      "performedBy": "e4",
      "details": "Offerte aangemaakt door Sophie van Dam voor klant Johan Bakker B.V."
    }
  ]
}
```

## 🔄 Wat Gebeurt Er bij Status Update?

**Voorbeeld: Offerte Verzenden**

```typescript
const updateQuoteStatus = (quoteId: string, newStatus: Quote['status']) => {
  setQuotes(quotes.map(q => {
    if (q.id === quoteId) {
      const now = new Date().toISOString();
      const oldStatus = q.status;  // "draft"
      
      const updates: Partial<Quote> = {
        status: newStatus,  // "sent"
        
        // ⭐ Voeg nieuwe history entry toe
        history: [
          ...(q.history || []),  // Behoud bestaande history
          {
            timestamp: now,
            action: newStatus,  // "sent"
            performedBy: currentUser.employeeId,
            details: `Status gewijzigd van "${oldStatus}" naar "${newStatus}" door ${getEmployeeName(currentUser.employeeId)}`,
            fromStatus: oldStatus,
            toStatus: newStatus
          }
        ]
      };
      
      // ⭐ Update timestamps
      if (!q.timestamps) {
        updates.timestamps = { created: q.createdDate };
      } else {
        updates.timestamps = { ...q.timestamps };
      }
      
      // ⭐ Voeg sent timestamp toe
      if (newStatus === 'sent' && !updates.timestamps.sent) {
        updates.timestamps.sent = now;
      }
      
      return { ...q, ...updates };
    }
    return q;
  }));
};
```

**Resultaat in Database:**
```json
{
  "id": "Q1729603425123",
  "status": "sent",
  
  "timestamps": {
    "created": "2025-10-22T14:23:45.123Z",
    "sent": "2025-10-22T14:45:12.456Z"
  },
  
  "history": [
    {
      "timestamp": "2025-10-22T14:23:45.123Z",
      "action": "created",
      "performedBy": "e4",
      "details": "Offerte aangemaakt door Sophie van Dam voor klant Johan Bakker B.V."
    },
    {
      "timestamp": "2025-10-22T14:45:12.456Z",
      "action": "sent",
      "performedBy": "e4",
      "details": "Status gewijzigd van \"draft\" naar \"sent\" door Sophie van Dam",
      "fromStatus": "draft",
      "toStatus": "sent"
    }
  ]
}
```

## 👀 Hoe Ziet de Gebruiker Dit?

### In de Offerte Card:

```
┌─────────────────────────────────────────┐
│ Offerte Q1729603425123                  │
│ Johan Bakker B.V.              [Concept]│
│                                          │
│ Items: ...                               │
│ Totaal: €1,815.00                       │
│                                          │
│ 🆕 Aangemaakt: 22 okt 2025, 14:23      │
│    door Sophie van Dam                  │
│                                          │
│ ── Geschiedenis (2 acties) ──          │
│                                          │
│ 📤 Verzonden                            │
│    22 okt 2025, 14:45                   │
│    Status gewijzigd van "draft" naar   │
│    "sent" door Sophie van Dam          │
│    Door: Sophie van Dam                 │
│                                          │
│ 🆕 Aangemaakt                           │
│    22 okt 2025, 14:23                   │
│    Offerte aangemaakt door Sophie van  │
│    Dam voor klant Johan Bakker B.V.    │
│    Door: Sophie van Dam                 │
│                                          │
│ [Accepteren] [Afwijzen] [Verwijderen]  │
└─────────────────────────────────────────┘
```

## 🎓 Leer Patronen

### Patroon 1: Nieuw Item Aanmaken
```typescript
// 1. Maak timestamp
const now = new Date().toISOString();

// 2. Voeg toe aan object
{
  ...otherFields,
  createdBy: currentUser.employeeId,
  timestamps: { created: now },
  history: [{
    timestamp: now,
    action: 'created',
    performedBy: currentUser.employeeId,
    details: `Beschrijving van actie door ${userName}`
  }]
}
```

### Patroon 2: Status Wijzigen
```typescript
// 1. Maak nieuwe history entry
const historyEntry = {
  timestamp: new Date().toISOString(),
  action: newStatus,
  performedBy: currentUser.employeeId,
  details: `Beschrijving`,
  fromStatus: oldStatus,
  toStatus: newStatus
};

// 2. Voeg toe aan bestaande history
history: [...(existing.history || []), historyEntry]

// 3. Update relevante timestamp
timestamps: {
  ...existing.timestamps,
  [statusField]: new Date().toISOString()
}
```

### Patroon 3: Conversie (Offerte → Werkorder)
```typescript
// In BEIDE objecten history toevoegen!

// Offerte krijgt:
history: [...quote.history, {
  action: 'converted_to_workorder',
  details: `Geconverteerd naar werkorder ${woId}...`
}]

// Werkorder krijgt:
history: [{
  action: 'created',
  details: `Aangemaakt...`
}, {
  action: 'converted',
  details: `Geconverteerd van offerte ${quoteId}...`
}, {
  action: 'assigned',
  details: `Toegewezen aan ${userName}...`
}]
```

## 🚀 Volgende Stappen

1. **Kopieer** deze patronen naar andere functies
2. **Test** elke functie grondig
3. **Verifieer** dat history correct wordt opgeslagen
4. **Check** dat timestamps kloppen
5. **Implementeer** History Viewer component voor visualisatie

---

**Dit voorbeeld kun je letterlijk copy-pasten en aanpassen voor je eigen functies!** 🎯
