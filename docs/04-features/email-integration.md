# Email Integratie (V5.8)

De Email Integratie feature maakt het mogelijk om emails direct in het Bedrijfsbeheer Dashboard te importeren en automatisch te verwerken tot orders, taken of notificaties. Dit vermindert handmatig werk en verbetert de workflow efficiency.

---

## Overzicht

**Versie:** 5.8 (Nieuw)
**Status:** Volledig geïmplementeerd

De Email Drop Zone is een krachtige functie waarmee je .eml bestanden of directe Outlook emails naar het dashboard kunt slepen, waarna het systeem automatisch de inhoud analyseert en de juiste actie voorstelt.

### Belangrijkste Voordelen

- ⚡ **Snelle verwerking** - Van email naar order in seconden
- 🎯 **Automatische detectie** - Systeem herkent automatisch wat voor email het is
- 🔗 **Klant matching** - Vindt automatisch bestaande klanten op basis van email adres
- 📋 **Workflow integratie** - Naadloze koppeling met offertes, werkorders en taken
- 💼 **Outlook support** - Directe integratie met Microsoft Outlook
- ✅ **Preview functie** - Controleer altijd eerst voor je converteert

---

## Email Drop Zone Functionaliteit

### Locatie

De Email Drop Zone is beschikbaar in **meerdere modules**:

1. **Dashboard** - Centrale drop zone voor algemene emails
2. **CRM Module - Email Tab** - Voor klant-gerelateerde emails
3. **Offertes Tab** - Voor offerte-gerelateerde emails
4. **Boekhouding Module** - Voor factuur en betaling gerelateerde emails

### Hoe Te Gebruiken

**Methode 1: .eml Bestand Slepen**

1. Sla een email op als .eml bestand (vanuit je email client)
2. Sleep het .eml bestand naar de Email Drop Zone
3. Het systeem detecteert automatisch het bestand type
4. Preview modal opent met email inhoud
5. Kies de gewenste actie (order/taak/notificatie)
6. Bevestig en klaar!

**Methode 2: Directe Outlook Integratie**

1. Open Outlook (via Electron app integratie)
2. Selecteer een email in Outlook
3. Sleep de email direct naar het dashboard
4. Email wordt automatisch geconverteerd en geopend in preview
5. Verwerk verder zoals gewenst

**Methode 3: Click to Upload**

1. Klik op de Email Drop Zone
2. Selecteer .eml bestanden via file browser
3. Upload en verwerk zoals bij slepen

---

## Drag-and-Drop Functionaliteit

### Visuele Feedback

**Bij Slepen Over Drop Zone:**
- Zone kleurt groen/blauw
- Dashed border wordt highlighted
- Tekst toont "Drop email hier"
- Cursor verandert naar copy/move indicator

**Bij Verkeerde Bestand Type:**
- Zone kleurt rood
- Error bericht: "Alleen .eml bestanden toegestaan"
- Bestand wordt niet geaccepteerd

**Tijdens Verwerking:**
- Loading spinner verschijnt
- "Email verwerken..." bericht
- Progress indicator (indien beschikbaar)
- Disable verdere uploads tot verwerking compleet

**Na Succesvolle Upload:**
- Groene checkmark animatie
- "Email succesvol verwerkt" notificatie
- Preview modal opent automatisch
- Drop zone reset naar standaard staat

---

## Automatische Email Parsing

Het systeem analyseert **automatisch** de volgende onderdelen van een email:

### Basis Informatie

- **Van:** Email adres en naam van afzender
- **Aan:** Ontvanger(s)
- **Onderwerp:** Email onderwerp (gebruikt voor titel)
- **Datum:** Verzend datum en tijd
- **CC/BCC:** Eventuele CC ontvangers
- **Attachments:** Lijst van bijlagen (toekomstig)

### Intelligente Content Extractie

**Items & Producten:**
- Detecteert productnamen in email body
- Herkent SKU nummers en product codes
- Vindt prijzen (€XX,XX of €XX.XX formaat)
- Zoekt hoeveelheden (aantal, stuks, meter, etc.)
- Match met bestaande voorraad items

**Werkuren:**
- Detecteert "uren", "werkzaamheden", "manuren"
- Herkent tijdsaanduiding (bijv. "8 uur", "2 dagen")
- Zoekt uurtarieven in tekst
- Berekent automatisch totaal

**Klant Informatie:**
- Extraheert bedrijfsnaam uit handtekening
- Vindt telefoonnummers
- Detecteert adressen
- Zoekt BTW nummers

**Deadlines & Datums:**
- Herkent deadline aanwijzingen ("voor vrijdag", "deze week")
- Detecteert datums (DD-MM-YYYY, DD/MM/YYYY, etc.)
- Converteert relatieve datums ("binnen 3 dagen")
- Stelt vervaldatum voor op basis van tekst

---

## Workflow Detectie

Het systeem detecteert **automatisch** wat voor type email het is en stelt de juiste workflow voor:

### 1. 📋 Order/Offerte Email

**Detectie triggers:**
- Bevat productnamen of SKU's
- Vermeldt prijzen of totaalbedragen
- Tekst met "offerte", "aanbieding", "prijsopgave"
- Email van bekende klant met order historie

**Voorgestelde actie:**
- Creëer nieuwe offerte
- Items automatisch toegevoegd
- Klant automatisch gekoppeld
- Preview voor verificatie

### 2. ✅ Taak/Werkorder Email

**Detectie triggers:**
- Bevat actie verzoeken ("kunnen jullie...", "graag willen we...")
- Vermeldt werkzaamheden of diensten
- Tekst met "reparatie", "onderhoud", "montage"
- Deadline aanwijzingen aanwezig

**Voorgestelde actie:**
- Creëer nieuwe taak in CRM
- Of converteer naar werkorder
- Deadline automatisch ingesteld
- Prioriteit op basis van tekst

### 3. 📧 Informatie/Notificatie Email

**Detectie triggers:**
- Algemene vraag of informatie verzoek
- Geen duidelijke order of taak content
- Email met "ter informatie", "FYI", "update"
- Communicatie zonder actie items

**Voorgestelde actie:**
- Creëer notificatie voor relevante persoon
- Of registreer als interactie in CRM
- Link aan klant (indien bekend)
- Markeer voor follow-up (optioneel)

---

## Preview Modal

De Preview Modal toont een **volledige voorvertoning** van de email voordat deze verwerkt wordt:

### Modal Layout

**Header:**
- Email onderwerp als titel
- Van/Aan informatie
- Datum en tijd
- Sluiten knop (X)

**Body:**
- Volledige email tekst (geformatteerd)
- Gedetecteerde items highlighted
- Gevonden klant informatie
- Voorgestelde workflow actie

**Footer:**
- "Annuleren" knop - sluit modal zonder actie
- "Creëer als Notificatie" knop - grijze knop
- "Creëer als Taak" knop - blauwe knop
- "Creëer als Offerte" knop - groene knop (primary)

### Gedetecteerde Informatie

**Klant Matching:**
```
✅ Klant gevonden: [Klantnaam]
   Email: [email@adres.nl]
   Laatste order: 2 weken geleden
```

**Items Gevonden:**
```
📦 2 items gedetecteerd:
   • Product A - €50,00 x 2 = €100,00
   • Product B - €75,00 x 1 = €75,00

   Subtotaal: €175,00
```

**Werkuren:**
```
⏱️ Werkuren gedetecteerd:
   • 8 uur á €65,00 = €520,00
```

**Deadline:**
```
📅 Deadline: vrijdag 15 november 2025
   (gedetecteerd uit: "voor vrijdag klaar")
```

---

## Automatische Klant/Lead Matching

### Email Adres Matching

**Primaire Matching:**
1. Zoek exact email adres in bestaande klanten database
2. Match gevonden → Koppel aan bestaande klant
3. Geen match → Stel voor nieuwe klant aan te maken

**Secundaire Matching:**
- Domain matching (bijv. alle @bedrijf.nl emails)
- Naam matching uit handtekening
- Telefoonnummer matching (indien aanwezig)

### Klant Creatie

**Wanneer geen match:**

```
❓ Onbekend email adres: nieuw@klant.nl

Opties:
□ Creëer nieuwe klant
□ Creëer nieuwe lead
□ Link handmatig aan bestaande klant
□ Verwerk zonder klant koppeling
```

**Automatisch vooringevulde velden:**
- Email adres (uit Van: veld)
- Naam (uit email handtekening of Van: naam)
- Bedrijf (indien vermeld in handtekening)
- Telefoon (indien gevonden in email)

### Email-Customer Mapping

Het systeem **slaat de koppeling op** voor toekomstige emails:

**Database Entry:**
```typescript
{
  email: "klant@bedrijf.nl",
  customerId: "CLT-123",
  lastSeen: "2025-11-12T10:30:00Z",
  emailCount: 5,
  lastOrderId: "OFF-2025-042"
}
```

**Voordelen:**
- Snellere verwerking bij volgende emails
- Automatische historie tracking
- Betere klant relatie inzichten
- Minder handmatige data entry

---

## Offerte Creatie vanuit Email

### Automatische Offerte Generatie

**Stap 1: Email Verwerking**
- Upload .eml bestand naar Offertes tab
- Systeem detecteert offerte inhoud
- Preview toont gedetecteerde items en prijzen

**Stap 2: Verificatie & Aanpassing**
- Controleer gedetecteerde items
- Pas hoeveelheden aan indien nodig
- Voeg ontbrekende items toe
- Wijzig prijzen indien nodig

**Stap 3: Offerte Creatie**
- Klik "Creëer als Offerte"
- Offerte wordt automatisch aangemaakt met:
  - Klant gekoppeld (of nieuw aangemaakt)
  - Items toegevoegd
  - Werkuren opgenomen (indien gedetecteerd)
  - Geldig tot datum ingesteld
  - Status: Draft

**Stap 4: Finaliseren**
- Offerte opent in edit modal
- Laatste aanpassingen mogelijk
- Notities toevoegen
- Status updaten naar "Sent"

### Item Detectie in Email

**Gedetecteerde patronen:**

```
Email tekst:
"We hebben graag een offerte voor:
- Stalen buis 50mm x 2 meter à €45,50
- Laswerk circa 4 uur
- Poedercoating RAL9005"

Wordt gedetecteerd als:
┌─────────────────────────────────────────┐
│ Item 1: Stalen buis 50mm                │
│ Hoeveelheid: 2 meter                     │
│ Prijs: €45,50 p/m                       │
│ Totaal: €91,00                          │
├─────────────────────────────────────────┤
│ Item 2: Laswerk (werkuren)              │
│ Uren: 4                                  │
│ Uurtarief: €65,00 (standaard)           │
│ Totaal: €260,00                         │
├─────────────────────────────────────────┤
│ Item 3: Poedercoating RAL9005           │
│ Hoeveelheid: 1                           │
│ Prijs: €0,00 (handmatig invullen)      │
└─────────────────────────────────────────┘
```

---

## Taak Creatie vanuit Email

### Wanneer Taak in plaats van Offerte

**Situaties:**
- Email bevat verzoek zonder prijzen
- Duidelijke actie items in email
- Follow-up of terugbelverzoek
- Informatievraag met deadline
- Service of onderhoud aanvraag

### Automatische Taak Velden

**Van email naar taak:**

| Email Element | Taak Veld |
|--------------|-----------|
| Onderwerp | Taak titel |
| Email body | Taak beschrijving |
| Gedetecteerde deadline | Deadline datum |
| Urgentie woorden ("urgent", "zo snel mogelijk") | Hoge prioriteit |
| Standaard | Gemiddelde prioriteit |
| Van: email adres | Gekoppelde klant |
| Eerste zin/vraag | Taak samenvatting |

### Deadline Tracking

**Automatische deadline detectie:**

```
Email tekst voorbeelden:

"Voor vrijdag 15 november" → Deadline: 15-11-2025
"Deze week nog" → Deadline: Einde huidige week (vrijdag)
"Binnen 3 dagen" → Deadline: Vandaag + 3 dagen
"Zo snel mogelijk" → Deadline: Vandaag + 1 dag (urgent)
"Geen haast" → Deadline: Vandaag + 7 dagen (standaard)
```

---

## Notificatie Creatie vanuit Email

### Email naar Notificatie

**Gebruik cases:**
- FYI emails (For Your Information)
- Updates zonder directe actie
- Bevestigingen van derden
- Algemene communicatie

### Notificatie Configuratie

**Van email naar notificatie:**

```typescript
{
  type: 'info',  // of 'warning' bij urgente emails
  title: '[Email onderwerp]',
  message: '[Eerste 200 karakters van email]',
  relatedId: '[Klant ID indien gekoppeld]',
  relatedType: 'customer',
  priority: 'medium',
  timestamp: [Nu],
  read: false
}
```

### Wie Krijgt De Notificatie?

**Admin:** Krijgt alle email notificaties
**Toegewezen User:** Als email aan specifieke medewerker gericht is
**Team:** Bij @team of algemene emails

---

## Outlook Integratie

### Electron App Integratie

**Setup vereist:**
1. Installeer Bedrijfsbeheer Desktop App (Electron)
2. App integreert met Windows Outlook
3. Geef toestemming voor email toegang
4. Klaar voor gebruik

### Direct Vanuit Outlook

**Workflow:**
1. Open Outlook (desktop versie)
2. Selecteer email in inbox
3. Sleep email naar Bedrijfsbeheer app
4. Email wordt automatisch geëxporteerd als .eml
5. Preview modal opent
6. Verwerk als order/taak/notificatie

**Voordelen:**
- Geen handmatig .eml bestand opslaan
- Sneller workflow
- Directe integratie met bestaand email proces
- Behoud van originele email formatting

### Ondersteunde Outlook Versies

- ✅ Outlook 2016 en hoger
- ✅ Outlook 365 (desktop)
- 🔄 Outlook Web App (toekomstig)
- ❌ Thunderbird (nog niet ondersteund)
- ❌ Apple Mail (nog niet ondersteund)

---

## Visuele Feedback Tijdens Verwerking

### Stap 1: Upload
```
┌─────────────────────────────┐
│   Drag .eml file here       │
│         [📧 Icon]           │
│   or click to browse        │
└─────────────────────────────┘
```

### Stap 2: Processing
```
┌─────────────────────────────┐
│   ⏳ Verwerken...            │
│   [=========>    ] 60%      │
│   Email parsing...          │
└─────────────────────────────┘
```

### Stap 3: Success
```
┌─────────────────────────────┐
│   ✅ Email verwerkt!         │
│   Preview modal opent...    │
└─────────────────────────────┘
```

### Error States

**Verkeerd bestand type:**
```
❌ Error: Alleen .eml bestanden toegestaan
   Probeer opnieuw met een .eml bestand
```

**Parsing fout:**
```
⚠️ Waarschuwing: Email kon niet volledig worden verwerkt
   Handmatige verificatie aanbevolen
```

**Geen klant gevonden:**
```
❓ Info: Geen bestaande klant gevonden
   Wilt u een nieuwe klant aanmaken?
```

---

## Best Practices

### Voor Optimale Resultaten

1. **Gebruik duidelijke email onderwerpen** - Helpt bij automatische detectie
2. **Structureer informatie** - Gebruik bullets of nummering voor items
3. **Vermeld prijzen expliciet** - "€XX,XX" formaat wordt beter herkend
4. **Gebruik standaard datumformaat** - DD-MM-YYYY of DD/MM/YYYY
5. **Houd emails gefocust** - Eén onderwerp per email voor betere detectie

### Verificatie Checklist

Controleer altijd in preview modal:

- [ ] Juiste klant gekoppeld
- [ ] Alle items correct gedetecteerd
- [ ] Prijzen en hoeveelheden kloppen
- [ ] Deadline correct ingesteld (indien van toepassing)
- [ ] Juiste workflow type geselecteerd (order/taak/notificatie)

---

## Troubleshooting

### Veelvoorkomende Problemen

**1. Email wordt niet geaccepteerd**
- **Oorzaak:** Verkeerd bestand type
- **Oplossing:** Zorg dat bestand .eml extensie heeft

**2. Items niet gedetecteerd**
- **Oorzaak:** Ongestructureerde email tekst
- **Oplossing:** Voeg items handmatig toe in preview modal

**3. Verkeerde klant gekoppeld**
- **Oorzaak:** Meerdere klanten met zelfde email domain
- **Oplossing:** Wijzig handmatig in preview modal

**4. Prijzen verkeerd geïnterpreteerd**
- **Oorzaak:** Onduidelijke prijsnotatie in email
- **Oplossing:** Pas aan in offerte edit modal

**5. Outlook sleep werkt niet**
- **Oorzaak:** Desktop app niet geïnstalleerd of geen rechten
- **Oplossing:** Installeer Electron app en geef permissions

---

## Toekomstige Uitbreidingen

### Geplande Features

- 🔄 **Attachment support** - Bijlagen automatisch koppelen aan orders
- 🔄 **Email threads** - Hele conversaties importeren
- 🔄 **Gmail integratie** - Naast Outlook ook Gmail support
- 🔄 **Automatische antwoorden** - Template responses direct vanuit systeem
- 🔄 **Email archivering** - Emails behouden in systeem
- 🔄 **Advanced parsing** - Betere detectie van complexe email structuren
- 🔄 **Multi-language** - Support voor Engels, Duits, etc.
- 🔄 **AI assistentie** - ML voor nog betere workflow detectie

---

## Gerelateerde Documentatie

- [Notifications Systeem](./notifications.md) - Email verwerkings notificaties
- [CRM Module](../02-modules/crm.md) - Email tab en interacties
- [Offertes & Facturen](../02-modules/accounting.md) - Offerte creatie workflow
- [Workorder Workflow](./workorder-workflow.md) - Van offerte naar werkorder
- [User Roles](./user-roles.md) - Toegangsrechten email functionaliteit

---

## Support & Vragen

Voor vragen over de email integratie:

1. Bekijk deze documentatie
2. Controleer [FAQ](../05-support/faq.md)
3. Test met eenvoudige emails eerst
4. Neem contact op met support voor Outlook setup

**Laatst bijgewerkt:** November 2025 (V5.8)
