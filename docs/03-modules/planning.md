# Planning & Agenda

## Overzicht

Volledige kalender module voor planning van werkorders, meetings, vakantie en overige evenementen met medewerker toewijzing.

## Functionaliteiten

### Kalender Weergaven

- ✅ **Volledige kalender module** met meerdere views:
  - **Dag view** - Gedetailleerd overzicht per dag
  - **Week view** - Weekoverzicht met alle evenementen
  - **Maand view** - Maandoverzicht voor lange termijn planning

### Evenementen Beheer

#### Evenement Types

- ✅ **Evenementen toevoegen** met verschillende types:
  - 🔧 **Werkorder** - Geplande werkzaamheden
  - 🤝 **Meeting** - Vergaderingen en afspraken
  - 🏖️ **Vakantie** - Verlof en vrije dagen
  - 📅 **Overig** - Andere evenementen

#### Evenement Details

- ✅ **Medewerker toewijzing** aan evenementen
- ✅ **Klant koppeling** - Koppel evenement aan klant
- ✅ **Start en eind tijd** - Nauwkeurige tijd planning
- ✅ **Beschrijving per evenement** - Extra details en notities

### Navigatie & Usability

- ✅ **Navigatie tussen datums**:
  - Vorige/volgende dag/week/maand
  - Jump naar specifieke datum
- ✅ **"Vandaag" knop** voor quick access naar huidige datum
- ✅ **Visuele kleurcodering** per event type:
  - Werkorders: Blauw
  - Meetings: Groen
  - Vakantie: Paars
  - Overig: Grijs

### Admin Functionaliteiten

- ✅ **Delete functionaliteit** (admin) - Verwijder evenementen indien nodig

---

## Toekomstige Features

- 🔄 **Drag & drop** voor afspraken - Sleep evenementen naar andere tijden
- 🔄 **Project deadlines** - Automatische deadline tracking vanuit projecten
- 🔄 **Leverdata tracking** - Verwachte leverdatums van bestellingen
- 🔄 **Recurring events** - Terugkerende evenementen (dagelijks/wekelijks/maandelijks)
- 🔄 **Notificaties** - Herinneringen voor aankomende evenementen
- 🔄 **Conflict detectie** - Waarschuwing bij dubbele bookings
- 🔄 **Team calendar view** - Overzicht van alle medewerkers tegelijk

---

## Gebruik

### Evenement Toevoegen

1. **Selecteer datum** in kalender
   - Klik op gewenste datum
   - Of gebruik "Nieuw Evenement" knop

2. **Vul evenement details in**:
   - **Type**: Selecteer werkorder, meeting, vakantie of overig
   - **Titel**: Korte beschrijving
   - **Beschrijving**: Uitgebreide details (optioneel)
   - **Start tijd**: Begin tijdstip
   - **Eind tijd**: Eind tijdstip
   - **Medewerker**: Wijs medewerker toe
   - **Klant**: Koppel klant (optioneel)

3. **Opslaan**

### Kalender Navigeren

#### Dag View
- Zie alle evenementen voor één dag
- Gedetailleerde tijdslots
- Ideaal voor dagelijkse planning

#### Week View
- Overzicht van 7 dagen
- Zie beschikbaarheid en conflicten
- Ideaal voor korte termijn planning

#### Maand View
- Overzicht van volledige maand
- Zie bezetting op lange termijn
- Ideaal voor strategische planning

### Navigatie Knoppen

- **◀ Vorige** - Ga naar vorige periode
- **Vandaag** - Spring terug naar huidige datum
- **Volgende ▶** - Ga naar volgende periode

### Evenement Bewerken

1. **Klik op evenement** in kalender
2. **Bekijk details** in popup
3. **Bewerk** indien nodig (admin)
4. **Opslaan** wijzigingen

### Evenement Verwijderen

1. **Klik op evenement**
2. **Klik "Verwijder"** (alleen admin)
3. **Bevestig** verwijdering

---

## Use Cases

### Werkorder Planning

1. **Nieuwe werkorder ontvangen**
2. **Open Planning module**
3. **Selecteer datum voor uitvoering**
4. **Maak werkorder evenement**:
   - Type: Werkorder
   - Wijs medewerker toe
   - Koppel klant
   - Stel tijdslot in
5. **Medewerker ziet werkorder in agenda**

### Verlof Planning

1. **Medewerker vraagt verlof aan**
2. **Admin opent Planning**
3. **Selecteer verlof periode**
4. **Maak vakantie evenement**:
   - Type: Vakantie
   - Selecteer medewerker
   - Vul start en eind datum in
5. **Medewerker is geblokkeerd voor planning**

### Meeting Planning

1. **Klant meeting plannen**
2. **Open kalender**
3. **Zoek beschikbare tijdslot**
4. **Maak meeting evenement**:
   - Type: Meeting
   - Wijs deelnemers toe
   - Koppel klant
   - Voeg beschrijving toe (agenda)
5. **Deelnemers zien meeting in agenda**

---

## Integraties

### Werkorders Module

- Geplande werkorders verschijnen automatisch in kalender
- Status updates worden gesynchroniseerd
- Medewerker toewijzing in sync met workboard

### HRM Module

- Verlof dagen worden automatisch geblokkeerd in planning
- Beschikbaarheid status van medewerkers wordt gerespecteerd
- Medewerker lijst automatisch gesynchroniseerd

### CRM Module

- Klant afspraken koppelbaar aan leads en klanten
- Follow-up datums kunnen direct ingepland worden
- Meeting notities synchroniseren met interacties

---

## Tips

1. **Kleurcodering** - Gebruik kleuren om snel evenement types te herkennen
2. **Week view** - Gebruik week view voor beste overzicht van planning
3. **Medewerker filter** - Filter op specifieke medewerker voor persoonlijke agenda
4. **Buffer tijd** - Plan altijd buffer tijd tussen werkorders
5. **Regelmatig checken** - Check dagelijks de planning voor updates

---

## Gerelateerde Modules

- [Werkorders](./workorders.md) - Voor werkorder planning
- [HRM](./hrm.md) - Voor verlof en beschikbaarheid
- [CRM](./crm.md) - Voor klant afspraken

---

## Versie Geschiedenis

- **V4.0** - Volledige kalender module met dag/week/maand views
- **V3.5** - Visuele kleurcodering en navigatie verbeteringen
