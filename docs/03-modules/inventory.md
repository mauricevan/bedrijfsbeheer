# Voorraadbeheer (Inventory Management)

🆕 **UITGEBREID MET 3 SKU TYPES & CATEGORIEËN V5.7**

## Overzicht

Uitgebreid voorraadbeheer systeem voor grondstoffen, halffabricaten en eindproducten met geavanceerde zoek- en categoriefunctionaliteiten.

## Functionaliteiten

### Basis Voorraadbeheer

- ✅ **Beheer van grondstoffen, halffabricaten en eindproducten**
- ✅ **SKU-nummers en locatie tracking**
- ✅ **Eén magazijn/opslaglocatie**
- ✅ **Automatische meldingen** bij lage voorraad
- ✅ **Add/Edit/Delete functionaliteit** (admin only)
- ✅ **Quick adjust knoppen** (+10/-10)
- ✅ **Status indicators** (OK/Laag/Niet op voorraad)

### 3 SKU Types per Item (V5.7)

🆕 Elk voorraaditem heeft drie verschillende SKU-codes:

1. **SKU Leverancier** - SKU zoals leverancier deze gebruikt
2. **Automatische SKU** - Automatisch gegenereerd (INV-0001, INV-0002, etc.)
3. **Aangepaste SKU** - Vrij invulbare SKU voor eigen gebruik

### Prijzen & Eenheden

- ✅ **Prijzen per voorraad item** - Verkoopprijs per eenheid
- ✅ **Eenheden beheer** - Stuk, meter, kg, liter, m², doos
- ✅ **Prijs weergave in tabel** - €XX.XX per eenheid
- ✅ **Koppeling met offertes en facturen** - Items kunnen direct geselecteerd worden

### Bewerken & Zoeken

- 🆕 **Dubbelklik om te bewerken** (V5.7) - Dubbelklik op item rij om direct te bewerken
- 🆕 **Uitgebreide zoeken/filteren** (V5.7) - Zoek in alle velden:
  - Naam
  - Alle SKU types
  - Locatie
  - Eenheid
  - Leverancier
  - Categorie
  - Prijzen
  - POS alert notitie

### Categorieën Systeem (V5.7)

🆕 Volledig categorieën beheer systeem:

- ✅ **Handmatig categorieën aanmaken** (naam, beschrijving, kleur)
- ✅ **Categorie dropdown** bij item toevoegen/bewerken
- ✅ **Nieuwe categorie aanmaken** vanuit item formulier
- ✅ **Categorieën beheren** in aparte tab (bewerken, verwijderen)
- ✅ **Categorie kleur badges** in tabel
- ✅ **Automatische selectie** van nieuwe categorie bij aanmaken vanuit item formulier

### Zoekbare Categoriefilter Dropdown (V5.7)

🆕 Geavanceerde filter dropdown:

- ✅ **Type om categorieën te filteren** in dropdown
- ✅ **Real-time filtering** van items op geselecteerde categorie
- ✅ **Combinatie met zoekbalk** mogelijk
- ✅ **Visuele feedback** met kleur badges en item count
- ✅ **"Wis filter" knop** voor snel resetten

### Integraties

- ✅ **Reservedelen voor servicewerk**
- ✅ **Materialen koppelen aan werkbon/project** - volledig geïntegreerd met werkorders
- ✅ **Koppeling met POS** - Real-time voorraad controle bij verkoop

### Toekomstige Features

- 🔄 **Automatisch aanmaken** van inkooporders bij drempel
- 🔄 **Picklijsten genereren** voor assemblage/montage
- 🔄 **Retouren verwerken**
- ❌ **Geen barcode/QR-code** (voorlopig niet)

## Gebruik

### Items Toevoegen

1. Klik op "Nieuw Item" knop
2. Vul naam, SKU's, prijzen en eenheden in
3. Selecteer of maak categorie aan
4. Stel drempelwaarde in voor automatische meldingen
5. Opslaan

### Items Bewerken

- **Dubbelklik** op item rij in tabel
- Of gebruik **Edit** knop in item kaart

### Zoeken & Filteren

1. Gebruik **zoekbalk** voor tekst zoeken in alle velden
2. Gebruik **categorie dropdown** voor filtering op categorie
3. Combineer beide voor specifieke resultaten

## Gerelateerde Modules

- [POS](./pos.md) - Voor verkopen en voorraad aftrek
- [Werkorders](./workorders.md) - Voor materiaalbeheer
- [Accounting](./accounting.md) - Voor prijzen en facturatie
- [Webshop](./webshop.md) - Voor webshop product koppeling

## Versie Geschiedenis

- **V5.7** - 3 SKU types, categorieën systeem, uitgebreide zoeken, dubbelklik bewerken
- **V5.0** - Prijzen per item, eenheden beheer, koppeling met offertes
