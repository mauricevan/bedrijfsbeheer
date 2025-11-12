# Notificaties Systeem

Het Bedrijfsbeheer Dashboard beschikt over een uitgebreid real-time notificaties systeem dat gebruikers op de hoogte houdt van belangrijke gebeurtenissen en acties binnen het systeem.

---

## Overzicht

Het notificaties systeem biedt een centrale plek waar gebruikers alle belangrijke meldingen kunnen bekijken en beheren. Het systeem is ontworpen om gebruikers proactief te informeren zonder hun workflow te verstoren.

### Belangrijkste Kenmerken

- ✅ **Real-time notificaties** - Directe updates wanneer gebeurtenissen plaatsvinden
- ✅ **Badge counter** - Visuele indicator van ongelezen meldingen
- ✅ **4 notificatie types** - Verschillende categorieën voor verschillende soorten meldingen
- ✅ **Gelezen/ongelezen status** - Houd bij welke notificaties al bekeken zijn
- ✅ **Notificaties bel in header** - Altijd zichtbaar en toegankelijk
- ✅ **Sidebar badge** - Extra visuele indicator in de navigatie

---

## Notificaties Bel & Badge Counter

### Locatie & Toegang

De notificaties bel bevindt zich in de **header** van de applicatie, rechtsboven naast het gebruikersprofiel. Deze is altijd zichtbaar, ongeacht welke module je gebruikt.

**Badge Counter:**
- Toont het aantal **ongelezen** meldingen
- Rood cirkeltje met wit getal
- Verdwijnt automatisch wanneer alle notificaties gelezen zijn
- Real-time updates bij nieuwe meldingen

### Dropdown Menu

Klik op de notificaties bel om het dropdown menu te openen:

**Functionaliteit:**
- Toont alle recente notificaties (met focus op ongelezen)
- Chronologische volgorde (nieuwste bovenaan)
- Scroll mogelijk bij veel notificaties
- Klik buiten dropdown om te sluiten
- Touch-friendly op mobiele apparaten

---

## Notificatie Types

Het systeem ondersteunt **4 verschillende types** notificaties, elk met eigen kleurcodering en icoon:

### 1. 📘 Info (Blauw)
**Gebruik:** Algemene informatieve meldingen

**Voorbeelden:**
- "Nieuwe werkorder toegewezen"
- "Offerte verstuurd naar klant"
- "Medewerker beschikbaar voor nieuwe taken"
- "Planning bijgewerkt"

### 2. ⚠️ Warning (Oranje/Geel)
**Gebruik:** Waarschuwingen die aandacht vereisen

**Voorbeelden:**
- "Lage voorraad: [Productnaam] heeft nog maar 5 stuks"
- "Taak deadline nadert (binnen 24 uur)"
- "Werkorder al 3 dagen in wacht status"
- "Factuur verloopt binnenkort"

### 3. ❌ Error (Rood)
**Gebruik:** Kritieke problemen of fouten

**Voorbeelden:**
- "Niet op voorraad: [Productnaam] kan niet verkocht worden"
- "Factuur overschrijdt vervaldatum"
- "Werkorder kan niet worden voltooid (ontbrekende materialen)"
- "Synchronisatie fout tussen offerte en werkorder"

### 4. ✅ Success (Groen)
**Gebruik:** Bevestigingen van succesvolle acties

**Voorbeelden:**
- "Offerte geaccepteerd door klant"
- "Werkorder succesvol voltooid"
- "Factuur betaald"
- "Voorraad succesvol bijgewerkt"
- "Email succesvol verwerkt"

---

## Notificaties Paneel in Dashboard

Naast de header bel is er ook een **uitgebreid notificaties paneel** in de Dashboard module:

### Features

- **Volledig overzicht** van alle recente notificaties
- **Filter opties** per type (info/warning/error/success)
- **Uitgebreide details** per notificatie
- **Directe acties** - Klik door naar gerelateerde items
- **Snelle toegang** tot belangrijke meldingen

### Sidebar Badge

De sidebar (navigatie menu) toont ook een **badge indicator** bij het Dashboard menu-item wanneer er nieuwe notificaties zijn:

- Kleine rode dot naast "Dashboard" menu item
- Verdwijnt wanneer notificaties bekeken zijn
- Werkt als extra herinnering voor gebruikers

---

## Notificatie Beheer

### Markeren als Gelezen

**Individueel:**
- Klik op een notificatie om deze als gelezen te markeren
- Gelezen notificaties worden visueel anders weergegeven (lichter/transparanter)
- Badge counter wordt automatisch bijgewerkt

**In bulk:**
- Gebruik de **"Alles markeren als gelezen"** knop
- Alle ongelezen notificaties worden in één keer gemarkeerd
- Badge counter springt naar 0
- Notificaties blijven zichtbaar in de lijst

---

## Automatische Notificaties

Het systeem genereert **automatisch** notificaties bij bepaalde gebeurtenissen:

### Voorraad Gerelateerd

- **Lage voorraad waarschuwing** - Wanneer voorraad onder ingesteld minimum komt
- **Niet op voorraad alert** - Wanneer voorraad 0 bereikt
- **Voorraad update** - Bevestiging na handmatige aanpassing

### Offertes & Facturen

- **Offerte acceptatie** - Wanneer klant offerte accepteert
- **Offerte verlopen** - Wanneer offerte vervaldatum passeert
- **Factuur verzonden** - Bevestiging van verzending
- **Factuur betaald** - Melding bij betaling registratie
- **Factuur verlopen** - Wanneer betalingsdatum overschreden wordt

### Werkorders

- **Werkorder toegewezen** - Wanneer nieuwe taak wordt toegewezen
- **Werkorder gestart** - Bevestiging van start
- **Werkorder in wacht** - Melding met reden van wachtstatus
- **Werkorder voltooid** - Bevestiging van voltooiing
- **Status wijziging** - Bij elke status update

### Email Integratie (V5.8)

- **Email succesvol verwerkt** - Bevestiging na email import
- **Nieuwe order vanuit email** - Melding van automatisch aangemaakte order
- **Nieuwe taak vanuit email** - Melding van taak creatie
- **Klant match gevonden** - Wanneer email aan bestaande klant gekoppeld wordt

### CRM & Taken

- **Taak deadline nadert** - Waarschuwing 24 uur voor deadline
- **Taak verlopen** - Melding wanneer deadline gepasseerd is
- **Follow-up herinnering** - Geplande follow-up activiteiten
- **Nieuwe interactie** - Bevestiging van geregistreerd contactmoment

---

## Admin vs User Toegang

### Admin (Manager Productie)

**Volledige Toegang:**
- ✅ Alle notificaties van het hele systeem
- ✅ Notificaties van alle medewerkers
- ✅ Voorraad alerts en kritieke waarschuwingen
- ✅ Financiële notificaties (facturen, betalingen)
- ✅ Systeembrede meldingen
- ✅ Email verwerkings notificaties
- ✅ Admin-specifieke alerts

**Extra Functionaliteit:**
- Notificaties kunnen instellingen aanpassen
- Alert drempels configureren (bijv. lage voorraad niveau)
- Notificatie types in-/uitschakelen per module
- Geschiedenis van alle notificaties bekijken

### User / Medewerker

**Beperkte Toegang:**
- ✅ Eigen werkorder gerelateerde notificaties
- ✅ Toegewezen taken en deadlines
- ✅ Status updates van eigen werkorders
- ✅ Persoonlijke herinneringen
- ❌ Geen toegang tot financiële notificaties
- ❌ Geen systeembrede alerts
- ❌ Geen notificaties van andere medewerkers

**Gefocust op:**
- Eigen taken en werkorders
- Deadline herinneringen
- Status wijzigingen van toegewezen werk
- Materiaal beschikbaarheid voor eigen werkorders

---

## Best Practices

### Voor Gebruikers

1. **Check regelmatig** - Controleer notificaties meerdere keren per dag
2. **Reageer op tijd** - Vooral bij warning en error meldingen
3. **Markeer als gelezen** - Houd je notificaties lijst overzichtelijk
4. **Let op kleuren** - Rood = urgent, oranje = belangrijk, blauw = info
5. **Klik door** - Gebruik notificaties om snel naar gerelateerde items te navigeren

### Voor Admins

1. **Monitor kritieke alerts** - Let vooral op rode (error) notificaties
2. **Configureer drempels** - Stel voorraad minimums realistisch in
3. **Bekijk trends** - Veel waarschuwingen kunnen op structurele problemen wijzen
4. **Communiceer** - Informeer team bij systeembrede meldingen
5. **Review regelmatig** - Controleer of notificatie instellingen nog passend zijn

---

## Mobiele Weergave

Het notificaties systeem is **volledig geoptimaliseerd** voor mobiele apparaten:

### Mobile Features

- **Touch-friendly dropdown** - Groot genoeg om gemakkelijk te bedienen
- **Responsive layout** - Past zich aan aan schermgrootte
- **Badge altijd zichtbaar** - Ook in mobiele header
- **Swipe gestures** - Veeg notificatie weg om als gelezen te markeren (toekomstig)
- **Full-screen modal** - Notificatie details op mobiel in full-screen
- **Geen zoom** - Optimale font-sizes voor mobiel

### Performance

- **Lightweight** - Minimale impact op laadtijden
- **Efficient updates** - Alleen nieuwe notificaties worden opgehaald
- **Cache** - Recent bekeken notificaties worden gecached
- **Lazy loading** - Oude notificaties worden pas geladen bij scrollen

---

## Technische Details

### Data Structuur

Elke notificatie bevat:

```typescript
{
  id: string,              // Unieke identifier
  type: 'info' | 'warning' | 'error' | 'success',
  title: string,           // Korte titel
  message: string,         // Volledige bericht
  timestamp: Date,         // Tijdstip van creatie
  read: boolean,           // Gelezen status
  userId?: string,         // Voor user-specifieke notificaties
  relatedId?: string,      // Link naar gerelateerd item (order, task, etc.)
  relatedType?: string,    // Type gerelateerd item (workorder, quote, etc.)
  priority?: 'low' | 'medium' | 'high'  // Prioriteit niveau
}
```

### State Management

- **React State** - Centraal beheerd in App component
- **Real-time updates** - Automatisch vernieuwen bij nieuwe meldingen
- **Persistence** - Notificaties blijven behouden tijdens sessie
- **Context ready** - Voorbereid voor toekomstige Context API implementatie

---

## Toekomstige Uitbreidingen

### Geplande Features

- 🔄 **Push notificaties** - Browser notificaties buiten applicatie
- 🔄 **Email notificaties** - Belangrijke alerts per email ontvangen
- 🔄 **SMS alerts** - Kritieke meldingen via SMS
- 🔄 **Notificatie voorkeuren** - Per user configureerbare instellingen
- 🔄 **Stille uren** - Do-not-disturb modus instellen
- 🔄 **Geluid** - Audio alerts bij kritieke notificaties
- 🔄 **Groepering** - Vergelijkbare notificaties samenvoegen
- 🔄 **Archief** - Oude notificaties archiveren maar behouden

---

## Gerelateerde Documentatie

- [User Roles & Rechten](./user-roles.md) - Toegangsrechten per rol
- [Email Integratie](./email-integration.md) - Email notificaties en verwerking
- [Workorder Workflow](./workorder-workflow.md) - Werkorder gerelateerde notificaties
- [Mobile Optimization](./mobile-optimization.md) - Mobiele weergave van notificaties
- [Dashboard Module](../02-modules/dashboard.md) - Notificaties paneel in dashboard
- [CRM Module](../02-modules/crm.md) - Taak en deadline notificaties

---

## Support & Vragen

Voor vragen over het notificaties systeem:

1. Check eerst deze documentatie
2. Bekijk de [FAQ](../05-support/faq.md)
3. Neem contact op met je admin of systeembeheerder

**Laatst bijgewerkt:** November 2025 (V5.8)
