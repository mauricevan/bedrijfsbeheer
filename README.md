# Bedrijfsbeheer Dashboard

Een volledig geïntegreerd dashboard/backend-systeem waarmee de eigenaar alle bedrijfsprocessen kan overzien en regelen, en medewerkers alle tools hebben die nodig zijn om hun taken efficiënt uit te voeren.

---

## 📋 Inhoudsopgave

- [Algemeen](#algemeen)
- [Installatie](#installatie)
- [Login & Gebruikers](#login--gebruikers)
- [Modules & Functionaliteiten](#modules--functionaliteiten)
- [Gebruikersrollen](#gebruikersrollen)
- [Belangrijke Features](#belangrijke-features)
- [Technische Stack](#technische-stack)
- [Toekomstige Ontwikkelingen](#toekomstige-ontwikkelingen)

---

## 🎯 Algemeen

### Projectdoel
Een dashboard/backend-systeem waarmee de eigenaar alle bedrijfsprocessen kan overzien en regelen, en medewerkers alle tools hebben die nodig zijn om hun taken efficiënt uit te voeren.

### Gebruikerstypes / Rollen
- **Admin** (Manager Productie): Volledige toegang, modules in- en uitschakelen, rechten beheren, alle werkorders overzien
- **User / Medewerker**: Toegang afhankelijk van rol, persoonlijk workboard met eigen taken, kan taken van collega's bekijken

---

## 🚀 Installatie

### Vereisten
- Node.js (v18 of hoger)
- npm of yarn

### Stappen

1. **Clone of download het project**
   ```bash
   cd C:\Users\hp\Desktop\Bedrijfsbeheer2.0
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Applicatie draait op: `http://localhost:5173`
   - Login met één van de demo accounts (zie hieronder)

### Build voor productie
```bash
npm run build
npm run preview
```

---

## 🔐 Login & Gebruikers

### Demo Accounts

Het systeem heeft een volledig werkend login systeem met 4 test accounts:

| Naam | Email | Rol | Admin | Wachtwoord |
|------|-------|-----|-------|------------|
| Sophie van Dam | sophie@bedrijf.nl | Manager Productie | ✅ Ja | 1234 |
| Jan de Vries | jan@bedrijf.nl | Productiemedewerker | ❌ Nee | 1234 |
| Maria Jansen | maria@bedrijf.nl | Lasser | ❌ Nee | 1234 |
| Peter Bakker | peter@bedrijf.nl | Spuiter | ❌ Nee | 1234 |

### Login Features
- ✅ Email + wachtwoord authenticatie
- ✅ Quick login knoppen voor snelle demo toegang
- ✅ Modern login scherm met gradient achtergrond
- ✅ Automatische rol detectie (admin/user)
- ✅ Veilige logout functionaliteit
- ✅ Gebruiker info in header met avatar

---

## 🔧 Modules & Functionaliteiten

### 1. **Dashboard / Overzicht**
Realtime weergave van bedrijfsactiviteiten:
- ✅ Omzet overzicht met KPI cards
- ✅ Werkbonnen status samenvatting
- ✅ Voorraadniveau waarschuwingen
- ✅ **Notificaties paneel** met ongelezen meldingen
- ✅ Lage voorraad alerts
- ✅ Recente werkorders overzicht

### 2. **Voorraadbeheer (Inventory Management)**
- ✅ Beheer van grondstoffen, halffabricaten en eindproducten
- ✅ SKU-nummers en locatie tracking
- ✅ Eén magazijn/opslaglocatie
- ✅ **Automatische meldingen** bij lage voorraad
- ✅ Add/Edit/Delete functionaliteit (admin only)
- ✅ Quick adjust knoppen (+10/-10)
- ✅ Status indicators (OK/Laag/Niet op voorraad)
- ✅ **Prijzen per voorraad item** - Verkoopprijs per eenheid
- ✅ **Eenheden beheer** - Stuk, meter, kg, liter, m², doos
- ✅ **Prijs weergave in tabel** - €XX.XX per eenheid
- ✅ **Koppeling met offertes en facturen** - Items kunnen direct geselecteerd worden
- 🔄 Automatisch aanmaken van inkooporders bij drempel
- 🔄 Picklijsten genereren voor assemblage/montage
- 🔄 Retouren verwerken
- ✅ Reservedelen voor servicewerk
- ✅ **Materialen koppelen aan werkbon/project** - volledig geïntegreerd met werkorders
- ❌ Geen barcode/QR-code (voorlopig niet)

### 3. **Kassasysteem (POS)**
- ✅ Producten verkopen met real-time voorraad check
- ✅ Winkelwagen beheer
- ✅ Klant selectie (optioneel)
- ✅ Automatische voorraad updates
- ✅ Transacties registreren
- ✅ Totaal berekening met BTW
- ✅ Winkelwagen wissen functionaliteit
- ✅ **Koppeling met werkorders** - materialen gereserveerd voor werkorders worden getoond

### 4. **Werkorders / Workboard** 🆕 **VOLLEDIG VERNIEUWD + HISTORY VIEWER + INDEXERING**
**Persoonlijk Workboard Systeem:**

**Voor Reguliere Users:**
- ✅ **Persoonlijk workboard** met alleen eigen toegewezen taken
- ✅ Kanban-stijl layout met **4 kolommen** (To Do / In Wacht / In Uitvoering / Afgerond)
- ✅ **Uren registratie** per taak (bewerkbaar tijdens werk)
- ✅ Status updaten van eigen taken (Start / In Wacht Zetten / Voltooi)
- ✅ **Collega's taken bekijken** via dropdown (read-only)
- ✅ Real-time statistieken (to do/pending/in progress/completed/totaal uren)
- ✅ Klant en locatie informatie per werkorder
- ✅ Geplande datum tracking
- ✅ **Reden voor wachtstatus** - bij werkorders in wacht kan een reden worden opgegeven
- ✅ **Materiaalbeheer** - materialen uit voorraad koppelen aan werkorders
- 🆕 **History Viewer** - volledige geschiedenis van werkorder zien
- 🆕 **Timestamp Tracking** - zie wanneer taken zijn aangemaakt, toegewezen, gestart en voltooid
- 🆕 **Relatieve tijd weergave** - "2 dagen geleden", "5 uur geleden"
- 🆕 **Sorteerbare werkorders** - werkorders worden automatisch gesorteerd op indexnummer
- 🆕 **Compacte/Uitgebreide weergave toggle** - Schakel tussen compacte (alleen omschrijving) en uitgebreide (volledige details) weergave

**Voor Admin:**
- ✅ **Volledig overzicht** van alle werkorders (dropdown "Alle medewerkers")
- 🆕 **Gegroepeerd per medewerker** - bij "Alle medewerkers" krijgt elke medewerker een eigen sectie
- 🆕 **Overzichtelijke weergave** - zie direct per medewerker wat er nog te doen is
- ✅ Nieuwe werkorders aanmaken en toewijzen
- ✅ Werkorders aan specifieke medewerkers toewijzen
- ✅ Alle werkorders bewerken en verwijderen
- ✅ Overzicht filteren per medewerker
- ✅ Klant koppeling
- ✅ **Wachtstatus beheer** - reden opgeven waarom een werkorder in wacht staat
- ✅ **Materiaalbeheer** - materialen uit voorraad toewijzen aan werkorders
- ✅ **Voorraad integratie** - automatische voorraad controle en aftrek bij voltooiing
- 🆕 **Audit Trail** - volledige tracking van wie wat wanneer heeft gedaan
- 🆕 **History in Edit Modal** - zie volledige geschiedenis bij bewerken
- 🆕 **Uitklapbare geschiedenis** - timeline van alle wijzigingen
- 🆕 **Werkorder Indexering Systeem** - prioriteit en sortering met nummers:
  - **Handmatig nummer toewijzen** - kies zelf het volgnummer (1, 2, 3, etc.)
  - **Automatische nummering** - krijgt automatisch volgend nummer als je niets invult
  - **Herschikken mogelijk** - pas indexnummer aan na aanmaken
  - **Visuele weergave** - zie nummer in card (bijv. "#3")
  - **Sortering** - werkorders gesorteerd op indexnummer (laagste eerst)
  - **Flexibele prioritering** - geef belangrijke taken een laag nummer voor bovenaan
- 🆕 **Compacte/Uitgebreide weergave toggle** - Toggle boven werkorders om tussen compacte en uitgebreide weergave te schakelen:
  - **Compacte weergave**: Alleen indexnummer en omschrijving (ideaal voor snel overzicht)
  - **Uitgebreide weergave**: Volledige card met alle details (titel, beschrijving, materialen, uren, status, etc.)
  - **Beide klikbaar** - Compacte en uitgebreide cards zijn dubbelklikbaar voor details
- 🔄 Digitaal aftekenen door monteur
- 🔄 Fotobewijs bij werkzaamheden
- ✅ Tijd registreren per werkbon
- ✅ **Status workflow**: To Do → In Progress → Completed (of To Do → Pending → In Progress → Completed)
- ✅ **Materialen toewijzen** - benodigde materialen uit voorraad koppelen
- ✅ **Automatische voorraad update** - bij voltooien werkorder wordt voorraad automatisch bijgewerkt
- 🆕 **Automatische factuur conversie** - Voltooide werkorders worden automatisch omgezet naar facturen in Boekhouding
- 🔄 Automatische rapportages
- ✅ Koppeling met voorraad & klantgegevens

**🆕 History Viewer Functionaliteit:**

**Timestamp Summary (voor iedereen zichtbaar):**
- 🆕 Aangemaakt - wanneer werkorder is aangemaakt
- 🆕 Geconverteerd - indien vanuit offerte/factuur (met link)
- 🆕 Toegewezen - wanneer aan medewerker toegewezen
- 🆕 Gestart - wanneer status gewijzigd naar "In Uitvoering"
- 🆕 Voltooid - wanneer werkorder is afgerond

**Uitklapbare Volledige Geschiedenis:**
- 🆕 Alle acties met tijdstip en uitvoerder
- 🆕 Status wijzigingen tracking
- 🆕 Toewijzing wijzigingen (van X naar Y)
- 🆕 Iconen per actie type (🆕 created, 👤 assigned, 📊 status, etc.)
- 🆕 "X dagen/uren geleden" weergave (hover voor exacte tijd)
- 🆕 Maximum 260px hoogte met scroll voor lange histories

**Voordelen:**
- ✅ **Transparantie** - iedereen ziet wanneer taken zijn toegewezen
- ✅ **Verantwoordelijkheid** - wie heeft wat wanneer gedaan
- ✅ **Analyse** - inzicht in doorlooptijden en bottlenecks
- ✅ **Communicatie** - duidelijke historie voor team en klanten
- ✅ **Compliance** - audit trail voor kwaliteitsborging

### 5. **Boekhouding, Offertes & Facturen** 🆕 **VOLLEDIG UITGEBREID + WERKORDER INTEGRATIE V4.0 + CLONE FUNCTIE V4.6**

**Transacties Tab:**
- ✅ Overzicht transacties (inkomsten/uitgaven)
- ✅ Filter op type (alle/inkomsten/uitgaven)
- ✅ KPI cards (totale inkomsten, uitgaven, netto winst)
- ✅ Transactie historie met datum

**Offertes Tab:** 🆕 **UITGEBREID MET OVERZICHT MODALS V4.7**
- ✅ **Offertes maken en beheren** met meerdere items
- ✅ **Items uit voorraad selecteren** - Dropdown met alle voorraad items inclusief prijzen
- ✅ **Custom items toevoegen** - Voor items die niet in voorraad staan
- ✅ **Werkuren toevoegen (optioneel)** - Uren, uurtarief en automatische berekening
- ✅ **BTW berekeningen** - Instelbaar BTW percentage (standaard 21%)
- ✅ **Duidelijke prijsweergave:**
  - Subtotaal (excl. BTW)
  - BTW bedrag
  - Totaal (incl. BTW)
- ✅ **Automatische berekeningen** - Real-time updates bij aanpassingen
- ✅ Status tracking: draft → sent → approved/rejected
- ✅ Klant koppeling
- ✅ Geldig tot datum
- ✅ Items tonen voorraad koppeling (indien van toepassing)
- ✅ Notities per offerte
- ✅ Status updaten (admin)
- ✅ **Omzetten naar factuur** - Geaccepteerde offertes direct converteren
- 🆕 **Omzetten naar werkorder** - Geaccepteerde offertes worden werkorder met alle details
- 🆕 **Werkorder status tracking** - Zie de status van gekoppelde werkorder in offerte
- 🆕 **Live synchronisatie** - Wijzigingen in offerte worden doorgevoerd naar werkorder
- 🆕 **Voltooiing indicator** - Visueel zien wanneer werkorder voltooid is
- 🆕 **Offerte clonen** - Dupliceer bestaande offerte met automatisch nieuw ID en datum 🔄 **V4.6**
- 🆕 **Aanpasbaar tijdens clonen** - Wijzig klant, items, prijzen tijdens het clonen 🔄 **V4.6**
- 🆕 **Offerte statistieken** - Totaal geoffreerd, geaccepteerd, verzonden, verlopen (klikbaar)
- 🆕 **Overzicht Modals** - Bij klikken op statistiek badges:
  - Filter op klantnaam, datum, bedrag
  - Zie alle offertes in gefilterde lijst
  - ✏️ Bewerken knop bij elke offerte
  - 📋 Clonen knop bij elke offerte
  - 📤 Naar Werkorder knop (alleen voor approved/sent zonder werkorder)

**Facturen Tab:** 🆕 **NIEUW TOEGEVOEGD + WERKORDER INTEGRATIE V4.0 + OVERZICHT MODAL V4.7**
- ✅ **Volledig factuurbeheer systeem**
- ✅ **4 Statistiek Cards:**
  - Totaal Gefactureerd (€ alle facturen) - Klikbaar → Overzicht modal
  - Betaald (€ en aantal) - Klikbaar → Overzicht modal
  - Uitstaand (€ en aantal verzonden/verlopen) - Klikbaar → Overzicht modal
  - Verlopen (€ en aantal met rode alert) - Klikbaar → Overzicht modal
- 🆕 **Overzicht Modals** - Bij klikken op statistiek cards:
  - Filter op klantnaam, datum, bedrag
  - Zie alle facturen in gefilterde lijst
  - ✏️ Bewerken knop bij elke factuur
  - 📋 Clonen knop bij elke factuur
  - 📤 Naar Werkorder knop (alleen voor sent/draft zonder werkorder)
- ✅ **Automatische factuurnummer generatie** (2025-001, 2025-002, etc.)
- ✅ **Handmatig facturen aanmaken:**
  - Items uit voorraad selecteren
  - Custom items toevoegen
  - Werkuren optioneel toevoegen
  - BTW berekening
  - Factuurdatum en vervaldatum
  - Betalingsvoorwaarden (14/30 dagen)
- ✅ **Offertes omzetten naar facturen:**
  - Paarse knop "🧾 Omzetten naar Factuur" bij geaccepteerde offertes
  - Automatische conversie van alle items en werkuren
  - Link naar originele offerte behouden
  - Betalingstermijn automatisch berekenen
- ✅ **Status beheer:**
  - Draft → Verzenden → Betaald
  - Overdue status voor verlopen facturen
  - Annuleren functionaliteit
- ✅ **Betalings tracking:**
  - Factuurdatum (issue date)
  - Vervaldatum (due date)
  - Betaaldatum (paid date) - automatisch bij markeren als betaald
- ✅ **Visuele indicatoren:**
  - Rode border voor verlopen facturen
  - Groene status voor betaalde facturen
  - Blauwe link naar originele offerte
  - Status badges met kleuren
- ✅ **Factuur details:**
  - Items met voorraad koppeling
  - Werkuren indien van toepassing
  - Subtotaal, BTW, Totaal duidelijk weergegeven
  - Notities per factuur
  - Betalingsvoorwaarden zichtbaar
- 🆕 **Omzetten naar werkorder** - Verzonden facturen worden werkorder
- 🆕 **Werkorder status tracking** - Zie de status van gekoppelde werkorder in factuur
- 🆕 **Live synchronisatie** - Wijzigingen in factuur worden doorgevoerd naar werkorder
- 🆕 **Voltooiing indicator** - Visueel zien wanneer werkorder voltooid is
- 🆕 **Tussentijdse aanpassing** - Facturen en werkorders blijven gesynchroniseerd
- 🆕 **Automatische factuur generatie** - Voltooide werkorders worden automatisch omgezet naar facturen
- 🔄 Digitale goedkeuring door klant
- 🔄 PDF generatie
- 🔄 Email verzending
- 🔄 Automatische herinneringen onbetaalde facturen
- 🔄 Uren, materialen en kilometers factureren
- 🔄 Facturen splitsen (materiaal + arbeid)

**NIEUWE V4.0 Features - Werkorder Integratie:**

**1. Offerte/Factuur → Werkorder Conversie**
- 🆕 Knop "📋 Maak Werkorder" bij geaccepteerde offertes
- 🆕 Knop "📋 Maak Werkorder" bij verzonden facturen
- 🆕 Automatische werkorder aanmaken met:
  - Titel van offerte/factuur
  - Klant automatisch gekoppeld
  - Alle items als benodigde materialen
  - Werkuren als geschatte tijd
  - Status: To Do (klaar om te starten)
  - Referentie naar originele offerte/factuur

**2. Werkorder Status Weergave**
- 🆕 **Status Badge** in offerte/factuur card:
  - 🔵 "Werkorder: To Do" (blauw)
  - 🟡 "Werkorder: In Wacht" (geel)
  - 🟢 "Werkorder: In Uitvoering" (groen)
  - ✅ "Werkorder: Voltooid" (groen met vinkje)
- 🆕 **Link naar werkorder** - Klik om direct naar workboard te gaan
- 🆕 **Real-time updates** - Status wordt automatisch bijgewerkt

**3. Tussentijdse Aanpassing & Synchronisatie**
- 🆕 **"✏️ Bewerk & Update Werkorder" knop** in offertes/facturen
- 🆕 **Bidirectionele synchronisatie:**
  - Wijzig items in offerte → Materialen in werkorder worden bijgewerkt
  - Wijzig werkuren in offerte → Geschatte tijd in werkorder wordt bijgewerkt
  - Voeg materiaal toe/verwijder → Werkorder wordt automatisch aangepast
- 🆕 **Waarschuwingen bij conflicten:**
  - Als werkorder al gestart is, waarschuwing tonen
  - Als werkorder voltooid is, blokkeer aanpassingen (behalve notities)
- 🆕 **Audit trail** - Alle wijzigingen worden gelogd

**4. Voltooiings Workflow**
- 🆕 **Groen Voltooiings Badge** bij afgeronde werkorders
- 🆕 **Automatische factuur update** - Betaal knop wordt actief
- 🆕 **Gewerkte uren tonen** - Daadwerkelijke vs. geschatte uren
- 🆕 **Materiaalgebruik overzicht** - Werkelijk vs. gepland

**5. Visuele Indicatoren**
- 🆕 **Groene border** rond offerte/factuur met voltooide werkorder
- 🆕 **Status icon** in header (🔧 = in uitvoering, ✅ = voltooid)
- 🆕 **Progress indicator** - % voltooid in werkorder sectie
- 🆕 **Tijdlijn weergave** - Van offerte → werkorder → voltooiing

### 5.5. **Boekhouding & Dossier** 🆕 **NIEUWE MODULE - MKB-READY, NL-COMPLIANT** 🆕 **V5.4: KASSA VERKOPEN TAB & KLIKBARE FACTUREN**
**Volledig Digitaal Boekhouddossier - Alles wat een boekhouder nodig heeft**

**Doel:**
- ✅ Geen fouten in BTW-aangifte
- ✅ Volledig digitaal dossier per klant/leverancier
- ✅ Direct klaar voor controle (Belastingdienst, accountant)
- ✅ Geen handmatig overtypen uit facturen/pakbonnen

**6 Kernfuncties:**

**1. Grootboekrekeningen (Standaard MKB-Set)**
- ✅ **10 Standaard rekeningen** ingesteld (niet aanpasbaar):
  - 1300 – Debiteuren (openstaande facturen)
  - 1400 – Voorraad
  - 4000 – Inkoop grondstoffen
  - 4400 – Inkoop diensten
  - 8000 – Omzet goederen (21% BTW)
  - 8010 – Omzet diensten (9% BTW)
  - 8020 – Omzet vrijgesteld (0%)
  - 1600 – Crediteuren (openstaande inkoop)
  - 2200 – BTW hoog (21%)
  - 2210 – BTW laag (9%)
- ✅ **Export functionaliteit** - Exporteer grootboek naar CSV (voor Exact, Twinfield, etc.)
- ✅ **Tabel overzicht** - Alle rekeningen met type, categorie en omschrijving

**2. Factuur & Pakbon Archief (Digitaal Dossier)** 🆕 **V5.4: KLIKBARE FACTUREN MET DETAIL MODAL**
- ✅ **Automatisch archief** - Elke factuur wordt automatisch toegevoegd aan archief
- ✅ **Per document informatie:**
  - Factuurnummer (auto: 2025-001)
  - Datum uitgifte / vervaldatum
  - Klant / Leverancier
  - Totaal excl. / BTW / incl.
  - Status: Betaald / Openstaand / Herinnering / Vervallen
  - Koppeling aan: Werkorder / Pakbon / Kassa
- ✅ **Zoeken & Filteren:**
  - Zoek op nummer, klant, datum
  - Filter op status (Openstaand / Betaald / Vervallen)
- ✅ **Klikbare facturen** 🆕 - Klik op elke factuur om volledige details te zien
- ✅ **Detail modal (read-only)** 🆕 - Volledige factuurdetails in overzichtelijke modal:
  - Factuurnummer, status, klant, datums
  - Items tabel (omschrijving, aantal, prijs, totaal)
  - Werkuren tabel (indien aanwezig)
  - Totaaloverzicht (subtotaal, BTW, totaal)
  - Notities (indien aanwezig)
- ✅ **Clone functionaliteit** 🆕 - Vanuit detail modal:
  - 📋 Klonen naar Factuur - Maak nieuwe factuur met status 'draft'
  - 📄 Klonen naar Offerte - Maak nieuwe offerte met status 'draft'
  - Automatische nummering voor nieuwe facturen/offertes
  - Notitie: "Gekloond van factuur XXX"
- ✅ **Acties per factuur:**
  - 📄 PDF download (placeholder)
  - 📧 Herinnering sturen (placeholder)
  - ✓ Markeer als betaald (direct in archief)
- ✅ **Visuele status indicatoren:**
  - Rode border voor verlopen facturen
  - Groene badge voor betaalde facturen
  - Gele badge voor openstaande facturen
  - Cursor pointer en hover-effecten voor duidelijkheid

**3. Kassa Verkopen** 🆕 **V5.4: NIEUWE TAB VOOR KASSA TRANSACTIES**
- 🆕 **Aparte tab** - "🛒 Kassa Verkopen" in Boekhouding & Dossier module
- 🆕 **Automatische filtering** - Toont alle facturen via kassasysteem:
  - Herkend aan "Kassa verkoop" in notes
  - Of customerName "Particulier (Kassa)"
- 🆕 **Direct betaalde facturen** - Alle kassa verkopen hebben status 'paid'
- 🆕 **Betaalmethode weergave** - Toont betaalmethode (Contant, PIN, iDEAL, Creditcard)
- 🆕 **Groene styling** - Visuele indicatie dat deze direct betaald zijn
- 🆕 **Klikbaar** - Klik op elke kassa verkoop om details te zien
- 🆕 **Zelfde detail modal** - Gebruikt dezelfde read-only modal als Factuur Archief
- 🆕 **Clone functionaliteit** - Kan ook gekloond worden naar factuur of offerte

**4. BTW-Overzicht (Aangifte-Ready)**
- ✅ **Automatische berekening** per maand/kwartaal
- ✅ **Periode rapport met:**
  - Omzet 21% → BTW af te dragen
  - Omzet 9% → BTW af te dragen
  - Omzet 0% → BTW (vrijgesteld)
  - Totaal af te dragen
  - Voorbelasting (inkoop) - placeholder
  - Te betalen (totaal)
- ✅ **Export knoppen:**
  - 📥 Export XML (placeholder - voor Belastingdienst portaal)
  - 📄 Print PDF (beschikbaar)
- ✅ **Dynamische data** - Automatisch berekend uit facturen
- ✅ **Periode selectie** - Kies maand/kwartaal voor rapport

**5. Klant- & Leveranciersdossiers**
- ✅ **Alles op één plek** - Zoals een fysiek dossierkast
- ✅ **Per relatie informatie:**
  - Naam, adres, KvK, BTW-nummer
  - Openstaand saldo
  - Alle facturen (verkoop + inkoop)
  - Pakbonnen (placeholder)
  - Offertes / Werkorders (placeholder)
  - Notities ("Betaalt altijd laat", etc.)
  - Credit-limiet (voor B2B)
- ✅ **Tabbladen structuur:**
  - Facturen
  - Pakbonnen (placeholder)
  - Offertes (placeholder)
  - Notities (placeholder)
- ✅ **Zoekfunctionaliteit** - Zoek klant of leverancier

**6. Transactieregistratie (Journaal)**
- ✅ **Volledig automatisch** - Elke factuur genereert journaalpost
- ✅ **Journaalstructuur:**
  - Journaalnummer (JRN-2025-001, etc.)
  - Datum en omschrijving
  - Referentie (factuurnummer)
  - Bron type (POS / Pakbon / Factuur / Inkoop / Handmatig)
- ✅ **Journaalregels (Debet/Credit):**
  - Debet: 1300 Debiteuren (totaal bedrag)
  - Credit: 8000/8010/8020 Omzet (excl. BTW)
  - Credit: 2200/2210 BTW (BTW bedrag)
- ✅ **Automatische grootboek toewijzing:**
  - BTW 21% → Rekening 2200
  - BTW 9% → Rekening 2210
  - Omzet goederen → Rekening 8000
  - Omzet diensten → Rekening 8010
  - Omzet vrijgesteld → Rekening 8020
- ✅ **Handmatig toevoegen** - Knop voor handmatige journaalposten (placeholder)
- ✅ **Zoeken & Filteren** - Op omschrijving, referentie, datum
- ✅ **Export functionaliteit** - Exporteer journaal naar CSV (placeholder)

**Permissions Systeem:**
- ✅ **Admin/Boekhouder** - Volledige toegang (grootboek, facturen, BTW, journaal, dossiers)
- ✅ **Verkoper/Inkoop** - Alleen dossiers tab (klant- en leveranciersdossiers)
- ✅ **Monteur** - Geen toegang

**Integratie met Bestaande Modules:**
- ✅ **POS / Kassa** → Automatische factuur + journaalpost + kassa verkopen tab
- ✅ **Pakbon (B2B)** → Wordt factuur bij "Markeer als gefactureerd"
- ✅ **Voorraad** → Inkoopfactuur → voorraad + crediteuren
- ✅ **CRM** → Klantgegevens automatisch in dossier
- ✅ **Accounting Module** → Facturen automatisch in archief
- 🆕 **Kassa Verkopen** → Direct zichtbaar in aparte tab met betaalmethode

**Technische Details:**
- ✅ Nieuwe types: `LedgerAccount`, `JournalEntry`, `JournalEntryLine`, `VATReport`, `CustomerDossier`, `SupplierDossier`, `InvoiceArchiveItem`, `DossierNote`
- ✅ Automatische journaalpost generatie vanuit facturen
- ✅ Automatische BTW berekening per periode
- ✅ Automatisch factuurarchief vanuit Accounting module
- ✅ Tabbladen structuur voor overzichtelijke navigatie
- ✅ Responsive design voor mobile en desktop

**Voordelen:**
- ✅ **MKB-Ready** - Standaard MKB grootboekset ingebouwd
- ✅ **NL-Compliant** - BTW per tarief (21%, 9%, 0%) gesplitst
- ✅ **Aangifte-Ready** - BTW-rapport klaar voor accountant/belastingdienst
- ✅ **Geen handmatig werk** - Automatisch journaal en BTW-berekening
- ✅ **Volledig digitaal** - Alle facturen en dossiers op één plek
- ✅ **Traceerbaar** - Elke transactie gekoppeld aan bron
- ✅ **Controle-ready** - Direct klaar voor Belastingdienst controle

**Toekomstige Uitbreidingen:**
- 🔄 XML export voor BTW-aangifte (Belastingdienst portaal)
- 🔄 PDF generatie voor facturen
- 🔄 Herinneringen systeem voor openstaande facturen
- 🔄 Inkoopfacturen integratie
- 🔄 Voorbelasting berekening vanuit inkoopfacturen
- 🔄 Volledige dossiers met tabbladen functionaliteit
- 🔄 Handmatige journaalposten toevoegen UI

### 6. **CRM (Klantrelatiebeheer)** 🆕 **VOLLEDIG VERNIEUWD**
**Professioneel CRM Systeem:**

**Dashboard Tab:**
- ✅ **KPI Cards** - Real-time statistieken en conversie rates
- ✅ Leads tracking (totaal/actief/gewonnen/verloren)
- ✅ Conversie percentage (lead naar klant)
- ✅ Pipeline waarde overzicht
- ✅ Klanten statistieken (zakelijk/particulier)
- ✅ Activiteiten overzicht (interacties/follow-ups/taken)
- ✅ Recente activiteiten timeline
- ✅ Verlopen taken waarschuwingen

**Leads & Pipeline Tab:**
- ✅ **Lead management** - Volledige lead tracking
- ✅ **7-fase Pipeline** - Kanban-stijl board (Nieuw → Contact → Gekwalificeerd → Voorstel → Onderhandeling → Gewonnen/Verloren)
- ✅ Lead informatie (naam, email, telefoon, bedrijf)
- ✅ Herkomst tracking (website, referral, cold-call, advertisement, etc.)
- ✅ Geschatte waarde per lead
- ✅ Follow-up datums
- ✅ Status flow met knoppen voor voortgang
- ✅ **Lead conversie** - Converteer gewonnen leads naar klanten
- ✅ Pipeline waarde per fase
- ✅ Drag & drop tussen fasen (visueel)

**Klanten Tab:**
- ✅ Klantgegevens beheer (naam, email, telefoon, adres)
- ✅ **Klanttypes: zakelijk en particulier**
- ✅ **Herkomst tracking** - Weet waar klanten vandaan komen
- ✅ Bedrijfsnaam (voor zakelijke klanten)
- ✅ Klant sinds datum
- ✅ **Verkoop historie** per klant
- ✅ **Interactie geschiedenis** - Aantal contactmomenten
- ✅ Totaal besteed bedrag
- ✅ Aantal orders per klant
- ✅ Visuele klant cards met avatar
- ✅ **Notities per klant** - Voeg interne notities toe voor klanthistorie 🆕
- ✅ **Klanten bewerken** - Wijzig klantgegevens en notities 🆕
- ✅ Add/Edit/Delete functionaliteit 🆕
- 🆕 **Facturen in klantoverzicht** - Klik op klant → Financiën → Zie alleen betaalde en openstaande facturen
- 🆕 **Factuur acties** - Bij elke factuur in klantoverzicht:
  - ✏️ Bewerken - Open factuur in edit modal
  - 📋 Clonen - Maak kopie van factuur met nieuw nummer
  - 📤 Naar Werkorder - Converteer factuur naar werkorder (met user selectie)
- 🆕 **Clone & Edit modals** - Volledig bewerkbare formulieren met items/labor beheer
- 🆕 **Werkorder conversie** - Factuur naar werkorder met specifieke user toewijzing

**Interacties Tab:**
- ✅ **Communicatie geschiedenis** - Alle contactmomenten vastleggen
- ✅ 5 Interactie types (📞 Call, 📧 Email, 🤝 Meeting, 📝 Note, 💬 SMS)
- ✅ Koppeling aan leads of klanten
- ✅ Subject en beschrijving
- ✅ Datum en tijd tracking
- ✅ Medewerker die contact heeft gehad
- ✅ **Follow-up systeem** - Automatische herinneringen
- ✅ Follow-up datum tracking
- ✅ Timeline weergave (chronologisch)
- ✅ Visuele iconen per interactie type

**Taken Tab:**
- ✅ **Taken/follow-ups** per klant
- ✅ Prioriteit levels (laag/gemiddeld/hoog)
- ✅ Status tracking (todo/in_progress/done)
- ✅ Deadline management met verlopen waarschuwing
- ✅ Klant koppeling (optioneel)
- ✅ Visuele status indicators
- ✅ Add/Delete/Update functionaliteit

### 7. **HRM (Personeelsbeheer)** 🆕 **VOLLEDIG UITGEBREID**
- ✅ Medewerker beheer (CRUD)
- ✅ Functie/rol overzicht
- ✅ Contactgegevens
- ✅ Diensttijd berekening (automatisch)
- ✅ Verlof dagen tracking (totaal/gebruikt)
- ✅ Beschikbaarheid status (available/unavailable/vacation)
- ✅ Statistieken (totaal medewerkers, functies, gem. diensttijd)
- 🆕 **Wachtwoord beheer** - Wachtwoord instellen bij nieuwe medewerker
- 🆕 **Admin rechten** - Checkbox om admin rechten toe te wijzen bij aanmaken
- 🆕 **Medewerkers bewerken** - Volledige edit functionaliteit (naam, functie, email, telefoon, wachtwoord, admin rechten)
- 🆕 **Persoonlijk dossier** - Klik op medewerker om dossier te openen
- 🆕 **Notities systeem** - Verschillende notitie types:
  - ⏰ Te laat
  - ❌ Afwezig
  - 🎯 Milestone
  - 📊 Prestatie
  - ⚠️ Waarschuwing
  - ⭐ Compliment
  - ✅ Aanwezigheid
  - 📝 Algemeen
- 🆕 **Notities toevoegen/verwijderen** - Admin kan notities toevoegen met datum, titel en beschrijving
- 🆕 **Admin badge** - Medewerkers met admin rechten krijgen 👑 badge
- 🔄 Prestatie monitoring
- 🔄 Planning en roosters

### 8. **Planning & Agenda**
- ✅ **Volledige kalender module** met dag/week/maand views
- ✅ Evenementen toevoegen (werkorder/meeting/vakantie/overig)
- ✅ Medewerker toewijzing aan evenementen
- ✅ Klant koppeling
- ✅ Start en eind tijd
- ✅ Beschrijving per evenement
- ✅ Navigatie tussen datums
- ✅ "Vandaag" knop voor quick access
- ✅ Visuele kleurcodering per event type
- ✅ Delete functionaliteit (admin)
- 🔄 Drag & drop voor afspraken
- 🔄 Project deadlines
- 🔄 Leverdata tracking

### 9. **Rapportages & Analyse**
**4 Rapport Types:**

**Verkoop Rapport:**
- ✅ Totale omzet, gemiddelde verkoop, verkochte items
- ✅ Top 5 producten met omzet
- ✅ Verkopen per datum timeline

**Voorraad Rapport:**
- ✅ Totale voorraadwaarde
- ✅ Lage voorraad items
- ✅ Niet op voorraad alerts
- ✅ Volledige voorraad tabel met status

**Offertes Rapport:**
- ✅ Totale offertes waarde
- ✅ Geaccepteerde waarde
- ✅ **Conversie rate** berekening
- ✅ Status breakdown (draft/sent/approved/rejected/expired)

**Werkorders Rapport:**
- ✅ Totaal orders, afgerond count
- ✅ Totaal gewerkte uren
- ✅ Gemiddelde uren per order
- ✅ Status breakdown (pending/in progress/completed)
- ✅ Recent afgeronde orders met uren

- ✅ Realtime dashboards
- 🔄 Export naar Excel/PDF
- ✅ Waarschuwingen bij afwijkingen
- 🔄 Budget overschrijding alerts

### 10. **Webshop Beheer** 🆕 **NIEUWE MODULE - VOLLEDIG GEÏMPLEMENTEERD**
**Professioneel E-commerce Beheer Systeem:**

**Dashboard:**
- ✅ Real-time statistieken (actieve producten, bestellingen, omzet)
- ✅ KPI cards met visuele indicatoren
- ✅ Overzicht van webshop performance

**Product Beheer Tab:**
- ✅ **Volledige Product CRUD** - Maak, bewerk, verwijder en archiveer producten
- ✅ **Uitgebreid Product Formulier** met georganiseerde secties:
  - 📝 Basis Informatie (naam, slug, SKU, beschrijvingen)
  - 💰 Prijs & Voorraad (verkoopprijs, wasprijs, inkoopprijs, voorraad tracking)
  - 🏷️ Categorieën (multi-select met primaire categorie)
  - 👁️ Status & Zichtbaarheid (draft/active/archived, public/private/hidden)
  - 🚚 Verzending (gewicht, afmetingen, verzendcategorie, digitaal product)
  - 🔍 SEO & Marketing (meta title/description, tags)
  - ⚙️ Extra Opties (BTW tarief, reviews, admin notities)
- ✅ **Inventory Koppeling** - Koppel producten aan voorraad items voor automatische synchronisatie
- ✅ **Image Upload Voorbereiding** - Structuur klaar voor frontend integratie
- ✅ **Automatische Generatie:**
  - URL slug uit productnaam (SEO-vriendelijk)
  - SKU nummering (PRD-0001, PRD-0002, etc.)
- ✅ **Zoeken & Filteren:**
  - Zoek op naam, SKU, beschrijving, tags
  - Filter op status (actief/concept/gearchiveerd)
  - Filter op categorie
  - Grid/List view toggle
- ✅ **Product Varianten** - Structuur aanwezig voor kleuren, maten, etc. (voorbereid voor frontend)
- ✅ **Voorraad Management:**
  - Directe voorraad tracking
  - Lage voorraad drempelwaarde
  - Automatische synchronisatie met Inventory module
  - Visuele voorraad indicatoren
- ✅ **Prijzen Management:**
  - Verkoopprijs
  - Wasprijs (voor strikethrough)
  - Inkoopprijs (voor winstberekening)
- ✅ **Status Workflow:**
  - Draft → Active (publiceren)
  - Active → Archived (archiveren)
  - Quick toggle knoppen

**Categorieën Tab:**
- ✅ **Volledig Categorie Beheer** (CRUD)
- ✅ **Hiërarchische Structuur** - Parent/child categorieën
- ✅ **Multi-categorie Support** - Producten kunnen in meerdere categorieën
- ✅ **Primaire Categorie** - Selecteer hoofd categorie voor product cards
- ✅ **Sorteerbare Volgorde** - Bepaal weergave volgorde
- ✅ **SEO Velden** - Meta title en description per categorie
- ✅ **Product Count** - Zie hoeveel producten per categorie
- ✅ **Visuele Hiërarchie** - Subcategorieën duidelijk geïndenteerd
- ✅ **Actief/Inactief Toggle** - Verberg categorieën zonder verwijderen

**Bestellingen Tab:**
- ✅ **Volledig Order Overzicht** - Alle bestellingen met details
- ✅ **Zoeken & Filteren:**
  - Zoek op ordernummer, klantnaam, email
  - Filter op order status (pending, processing, shipped, delivered, cancelled, refunded)
- ✅ **Order Status Tracking:**
  - Openstaand → In Behandeling → Verzonden → Afgeleverd
  - Quick action buttons voor status updates
- ✅ **Payment Status Tracking:**
  - Niet betaald → Betaald
  - Betaling referenties
  - Betaaldatum tracking
- ✅ **Order Detail Modal:**
  - Volledige klant informatie
  - Bestelde items tabel met prijzen
  - Verzend- en factuuradres
  - Tracking nummer en vervoerder
  - Klant en admin notities
  - Betalingsmethode informatie
  - Order totalen breakdown (subtotal, BTW, verzendkosten, korting, totaal)
- ✅ **Status Updates:**
  - Markeer als "In Behandeling"
  - Markeer als "Verzonden"
  - Markeer als "Betaald"
  - Annuleer bestelling
- ✅ **Visuele Indicatoren:**
  - Kleurgecodeerde status badges
  - Payment status indicators
  - Order totalen highlight

**Design & UX Principes:**
- ✅ **Progressive Disclosure** - Georganiseerde secties met duidelijke headers
- ✅ **Color Coding** - Verschillende kleuren per sectie voor snelle scanning
- ✅ **Error Prevention** - Automatische generatie, validatie, confirmation dialogs
- ✅ **Feedback Loops** - Directe visuele feedback bij alle acties
- ✅ **Responsive Design** - Volledig werkend op mobile, tablet en desktop
- ✅ **Intuïtieve Navigatie** - Duidelijke tabs en actie buttons
- ✅ **Consistent Patterns** - Herkenbare UI patterns door hele module

**Frontend Voorbereiding:**
- ✅ **SEO-Ready** - Slugs, meta titles, descriptions voor alle producten
- ✅ **Image Structure** - Image arrays en featured images voorbereid
- ✅ **Variant System** - Structuur voor product varianten (kleuren, maten)
- ✅ **Shopping Cart Types** - WebshopCartItem, ShoppingCart types gedefinieerd
- ✅ **Coupon System** - Coupon types voor kortingscodes
- ✅ **Address Structure** - Volledige adres structuur voor checkout
- ✅ **Review System** - Allow reviews flag en rating structure
- ✅ **Statistics Ready** - View count, purchase count, wishlist count voorbereid

**Inventory Integratie:**
- ✅ Koppeling met Inventory module
- ✅ Dropdown selectie van voorraad items
- ✅ Synchronisatie voorbereid (voorraad sync in toekomstige versie)
- ✅ Duidelijke indicatie van koppeling

🔄 Product varianten beheer (UI)
🔄 Bulk product acties
🔄 Product templates
🔄 Automatische voorraad synchronisatie met Inventory
🔄 Export/import functionaliteit

### 11. **Admin Instellingen** 🆕 **UITGEBREID MET ANALYTICS & DATABASE DIAGNOSTICS**
- ✅ Modules in-/uitschakelen per module
- ✅ Beschrijving per module
- ✅ Visuele indicators (actief/inactief)
- ✅ Per module toggle functionaliteit
- ✅ Waarschuwing over impact
- ✅ Alleen toegankelijk voor admins
- 🆕 **Systeem Analytics & Optimalisatie Tab** - Lean Six Sigma analyse dashboard:
  - Key metrics (totale events, actieve gebruikers, gebruikstijd, efficiency)
  - Module gebruik statistieken met grafieken en tabellen
  - Proces efficiëntie metrics (cyclus tijd, error rates, bottlenecks)
  - Gebruiker efficiency scores met visualisaties
  - Automatische optimalisatie aanbevelingen gebaseerd op gebruikspatronen
  - Periode filters (dag/week/maand/kwartaal/jaar)
  - Reset functionaliteit voor analytics data
- 🆕 **Database Diagnostics Tab** - Baseline diagnostics voor managed databases:
  - 20+ voorgedefinieerde database issues (Connection, Auth, Performance, Schema, Config, Platform, SDK, Security, Misc)
  - Severity distributie (High/Medium/Low) met statistieken
  - Categorie filter functionaliteit
  - Gedetailleerde issue cards met:
    - Diagnostische stappen per issue
    - Voorgestelde oplossingen
    - Platform-specifieke informatie (Supabase, NeonDB, PlanetScale)
    - Test action buttons (klaar voor backend integratie)
  - Issues per categorie overzicht
  - Vendor-specific informatie voor populaire managed databases
  - Latency en occurrences data voor performance issues
  - Responsive design met mobile-optimized layout

### 11. **Notificaties Systeem**
- ✅ **Notificaties bel** in header met badge counter
- ✅ Dropdown met ongelezen meldingen
- ✅ 4 types: info, warning, error, success
- ✅ Markeren als gelezen functionaliteit
- ✅ "Alles markeren als gelezen" knop
- ✅ Notificaties paneel in Dashboard
- ✅ Badge in Sidebar bij nieuwe meldingen
- ✅ Automatische meldingen bij lage voorraad
- ✅ Meldingen bij offerte acceptatie

**Legenda:**
- ✅ Volledig geïmplementeerd en werkend
- 🆕 Nieuw in versie 4.0 (Werkorder Integratie)
- 🔄 In ontwikkeling / Geplanned
- ❌ Niet nodig (voorlopig)

---

## 👥 Gebruikersrollen

### Admin (Manager Productie)
**Volledige Toegang:**
- ✅ Alle modules beheren en in-/uitschakelen
- ✅ **Alle werkorders van alle medewerkers zien**
- ✅ Dropdown optie "Alle medewerkers" in workboard
- ✅ Nieuwe werkorders aanmaken en toewijzen
- ✅ Gebruikers en rechten beheren
- ✅ Alle CRUD operaties (Create, Read, Update, Delete)
- ✅ Toegang tot rapportages en analyses
- ✅ Admin Instellingen module
- ✅ Offertes beheren en status updaten
- ✅ **Offertes omzetten naar facturen** 
- ✅ **Facturen aanmaken en beheren**
- ✅ **Betalingen registreren**
- ✅ Taken toewijzen aan medewerkers
- 🆕 **Offertes/Facturen omzetten naar werkorders**
- 🆕 **Werkorder status realtime volgen vanuit offertes/facturen**
- 🆕 **Tussentijdse aanpassingen doorvoeren met synchronisatie**

### User / Medewerker
**Beperkte Toegang:**
- ✅ **Persoonlijk workboard** met alleen eigen taken
- ✅ Eigen werkorders beheren (status updaten)
- ✅ **Uren registreren** op eigen taken
- ✅ **Taken van collega's bekijken** (read-only via dropdown)
- ✅ Beperkte bewerkingsrechten (alleen eigen items)
- ✅ Alleen relevante modules zichtbaar
- ✅ Kan toegewezen taken uitvoeren
- 🆕 **Werkorders vanuit offertes/facturen uitvoeren**
- 🆕 **Status updates reflecteren in gekoppelde offerte/factuur**
- ❌ Geen toegang tot Admin Instellingen
- ❌ Kan geen nieuwe werkorders aanmaken
- ❌ Kan geen taken van anderen bewerken
- ❌ Geen toegang tot facturen module

---

## ⚡ Belangrijke Features

### Werkorder Integratie Workflow 🆕 **NIEUW IN V4.0**

**Complete End-to-End Workflow:**

```
1. OFFERTE FASE
   ├─ Maak offerte met items en werkuren
   ├─ Verstuur naar klant
   └─ Klant accepteert
   
2. WERKORDER CREATIE
   ├─ Klik "📋 Maak Werkorder"
   ├─ Werkorder automatisch aangemaakt:
   │  ├─ Titel: "[Klant] - [Offerte titel]"
   │  ├─ Materialen: Alle items uit offerte
   │  ├─ Geschatte uren: Werkuren uit offerte
   │  ├─ Status: To Do
   │  └─ Link: Referentie naar offerte
   └─ Badge in offerte: "🔵 Werkorder: To Do"

3. UITVOERING
   ├─ Medewerker ziet taak in workboard
   ├─ Start werkorder (Status: In Uitvoering)
   ├─ Offerte toont: "🟢 Werkorder: In Uitvoering"
   └─ Admin kan real-time volgen

4. TUSSENTIJDSE WIJZIGINGEN
   ├─ Klant wil extra items
   ├─ Admin klikt "✏️ Bewerk & Update Werkorder"
   ├─ Voegt items toe aan offerte
   └─ Werkorder materialen automatisch bijgewerkt

5. VOLTOOIING
   ├─ Medewerker voltooit werkorder
   ├─ Voorraad automatisch afgetrokken
   ├─ Offerte toont: "✅ Werkorder: Voltooid"
   └─ Groene border rond offerte card

6. FACTURATIE
   ├─ Klik "🧾 Omzetten naar Factuur"
   ├─ Factuur bevat daadwerkelijke gewerkte uren
   ├─ Materiaalgebruik uit voltooide werkorder
   └─ Link naar werkorder en offerte behouden

7. BETALING
   └─ Markeer factuur als betaald → Cyclus compleet
```

**Key Features van Integratie:**

**Bidirectionele Synchronisatie:**
- 🆕 Wijzig offerte → Werkorder wordt automatisch bijgewerkt
- 🆕 Voltooi werkorder → Offerte toont voltooiingsstatus
- 🆕 Update factuur → Gekoppelde werkorder aangepast
- 🆕 Materiaalverbruik → Real-time synchronisatie

**Smart Business Logic:**
- 🆕 **Voorraad controle** bij conversie (waarschuwing bij tekort)
- 🆕 **Status guards** (blokkeer bewerking bij voltooide werkorder)
- 🆕 **Conflict detectie** (waarschuwing bij overlappende wijzigingen)
- 🆕 **Audit trail** (alle wijzigingen worden gelogd)

**Visuele Feedback:**
- 🆕 **Real-time status badges** in offertes/facturen
- 🆕 **Kleurgecodeerde borders** (groen = voltooid, blauw = actief)
- 🆕 **Progress indicators** (percentage voortgang)
- 🆕 **Direct links** naar gekoppelde werkorders

**Gebruikersgemak:**
- 🆕 **Eén klik conversie** (offerte → werkorder → factuur)
- 🆕 **Automatische materiaal toewijzing**
- 🆕 **Gewerkte vs geschatte uren** vergelijking
- 🆕 **Snelle status updates** via badges

### Factuur Workflow (Basis - Bestaand)
**Volledige Factuur Levenscyclus:**
1. **Offerte Fase**: Maak offerte voor klant
2. **Acceptatie**: Klant accepteert offerte
3. **Conversie**: Klik "🧾 Omzetten naar Factuur" (paarse knop)
4. **Factuur Aangemaakt**: Automatische generatie met:
   - Uniek factuurnummer (2025-001, 2025-002, etc.)
   - Alle items en werkuren van offerte
   - Link naar originele offerte
   - Factuurdatum (vandaag)
   - Vervaldatum (vandaag + 14 dagen)
   - Status: Draft
5. **Verzending**: Status updaten naar "Verzonden"
6. **Betaling**: Markeren als "Betaald" (betalingsdatum wordt automatisch ingevuld)
7. **Tracking**: Altijd overzicht van uitstaande en verlopen facturen

**Of handmatig factuur aanmaken:**
1. Klik "+ Nieuwe Factuur" in Facturen tab
2. Vul klant, datums, betalingstermijn in
3. Voeg items uit voorraad of custom items toe
4. Voeg optioneel werkuren toe
5. Sla op → factuur krijgt automatisch nummer

**Factuur Features:**
- ✅ Automatische factuurnummer generatie per jaar
- ✅ Link naar originele offerte (indien geconverteerd)
- ✅ Status tracking (draft/sent/paid/overdue/cancelled)
- ✅ Betalingsdatum automatisch bij betaling
- ✅ Verlopen facturen krijgen rode border
- ✅ Real-time statistieken dashboard
- ✅ Uitstaand bedrag overzicht
- ✅ Betaling historie

### Login & Authenticatie
- ✅ **Volledig login systeem** met email + wachtwoord
- ✅ Quick login knoppen voor demo
- ✅ Automatische rol detectie (admin/user)
- ✅ **Logout functionaliteit** met veilige sessie beëindiging
- ✅ Gebruiker info in header (naam, rol, avatar)
- ✅ User menu met profiel details

### Mobiele Toegankelijkheid 📱 **VOLLEDIG GEOPTIMALISEERD V4.5**
- ✅ **Volledig responsive design** voor smartphone, tablet en desktop
- ✅ **Hamburger menu** op mobiel met slide-in sidebar
- ✅ **Touch-optimized controls** - grotere knoppen en swipe gestures
- ✅ **Mobile-first formulieren** met gestapelde layouts
- ✅ **Responsive tabellen** met horizontale scroll en compacte weergave
- ✅ **Aangepaste font sizes** voor optimale leesbaarheid op kleine schermen
- ✅ **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- ✅ **Gebruiksvriendelijk voor monteurs** in het veld met één hand bediening
- ✅ **Optimized voor verschillende schermformaten** - iPhone, Android, iPad

### Beveiliging & Privacy
- ✅ Rolgebaseerde toegang (admin/user)
- ✅ Login authenticatie
- ✅ Wachtwoord beveiliging
- 🔄 Audit trail / logboek functionaliteit
- 🔄 AVG/GDPR compliance voorbereidingen
- ✅ Veilige data opslag (in-memory voor demo)

### Notificaties & Alerts
- ✅ **Real-time notificaties systeem**
- ✅ Lage voorraad waarschuwingen
- ✅ Offerte acceptatie meldingen
- ✅ Taak deadline waarschuwingen
- ✅ Werkorder status updates
- 🔄 Budget overschrijding alerts
- 🔄 Onbetaalde facturen herinneringen

### Data Export & Rapportage
- ✅ Realtime dashboards met KPI's
- ✅ 4 verschillende rapport types
- ✅ Overzichtelijke rapporten met statistieken
- ✅ Conversie rate berekeningen
- ✅ Factuur statistieken dashboard
- 🔄 Excel export functionaliteit
- 🔄 PDF generatie

### Digitalisering
- 🔄 Fotobewijs uploads
- 🔄 Digitale handtekeningen
- ✅ Elektronische offertes
- ✅ **Digitale facturen**
- ✅ Paperless workflow
- ✅ Digital task management

---

## 📱 Mobile Optimalisatie Guide

### Responsive Breakpoints
Het project gebruikt Tailwind CSS breakpoints:
- **sm**: 640px en groter (grote smartphones landscape)
- **md**: 768px en groter (tablets portrait)
- **lg**: 1024px en groter (tablets landscape, kleine laptops)
- **xl**: 1280px en groter (desktops)

### Mobile-First Principes

**1. Hamburger Menu**
- Op schermen < 1024px verschijnt een hamburger menu icoon in de header
- Sidebar schuift in vanaf links met smooth animatie
- Click buiten sidebar sluit het menu automatisch
- Touch-friendly met grote knoppen (min 44x44px)

**2. Touch Optimalisaties**
- Alle knoppen hebben `touch-manipulation` voor betere responsiviteit
- Minimum button size van 44x44px voor vingertoppen
- Active states voor directe feedback bij tap
- Swipe gestures voor sidebar

**3. Responsive Layouts**
```tsx
// Desktop: 3 kolommen, Tablet: 2 kolommen, Mobile: 1 kolom
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Verberg op mobile, toon op desktop
<span className="hidden lg:block">Desktop tekst</span>

// Toon op mobile, verberg op desktop
<button className="lg:hidden">Mobile knop</button>

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive font sizes
<h1 className="text-xl sm:text-2xl lg:text-3xl">
```

**4. Formulieren**
- Input font-size: 16px (voorkomt zoom op iOS)
- Stack layout op mobile, side-by-side op desktop
- Touch-friendly spacing tussen velden

**5. Tabellen**
- Horizontale scroll op mobile
- Compacte weergave met essentiële kolommen
- Responsive column hiding:
```tsx
<td className="hidden md:table-cell">Desktop only kolom</td>
```

**6. Modals & Dropdowns**
- Full-screen op mobile (< 640px)
- Centered op desktop
- Touch-dismissable overlay

### Performance Tips
- Lighter shadows op mobile voor betere performance
- Reduced motion support voor accessibility
- Lazy loading voor images in lange lijsten
- Debounced scroll events

### Testing Checklist
✅ Test op iPhone (portrait + landscape)
✅ Test op Android (verschillende schermgroottes)
✅ Test op iPad (portrait + landscape)  
✅ Test hamburger menu functionaliteit
✅ Test touch gestures en swipes
✅ Test formulieren (geen zoom bij focus)
✅ Test tabellen (horizontale scroll)
✅ Test notificaties en dropdowns
✅ Test met één hand bediening

### Browser DevTools
Test responsive design in Chrome DevTools:
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Selecteer verschillende devices
4. Test portrait en landscape modes

### Veelvoorkomende Mobile Issues & Oplossingen

**Issue**: Sidebar blijft zichtbaar na navigatie op mobile
**Fix**: `onClick={onMobileClose}` toegevoegd aan alle NavLinks

**Issue**: Inputs zoomen in op iOS
**Fix**: Font-size minimum 16px in inputs

**Issue**: Knoppen te klein voor vingers
**Fix**: `min-height: 44px` en `touch-manipulation`

**Issue**: Horizontale scroll op hele pagina
**Fix**: `overflow-x: hidden` op body

**Issue**: Sidebar overlay blokkeert clicks
**Fix**: Proper z-index layering (overlay: z-40, sidebar: z-50)

---

## 🛠 Technische Stack

### Frontend
- **React 19** - UI Framework met latest features
- **TypeScript** - Type safety en betere DX
- **React Router 7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Vite 6** - Lightning fast build tool

### State Management
- React Hooks (useState, useMemo, useEffect)
- Centralized state in App component
- Props drilling voor data flow
- Context API ready voor toekomstige scaling

### Authentication
- Simple email/password authentication
- Role-based access control (RBAC)
- Session management met React state
- Secure logout functionaliteit

### Architectuur
- **Modulair design** - Elke module is los in/uit te schakelen
- **Component-based** - Herbruikbare componenten
- **Type-safe** - TypeScript interfaces voor alle data
- **Responsive** - Mobile-first benadering
- **Role-based** - Admin en user rollen met verschillende rechten

### Bestandsstructuur
```
Bedrijfsbeheer2.0/
├── components/          # Herbruikbare UI componenten
│   ├── icons/          # Icon componenten
│   ├── AdminSettings.tsx
│   ├── Header.tsx
│   ├── Login.tsx       # Login component
│   └── Sidebar.tsx
├── pages/              # Module pagina's
│   ├── Dashboard.tsx   # Met notificaties
│   ├── Inventory.tsx
│   ├── POS.tsx
│   ├── WorkOrders.tsx  # Volledig vernieuwd workboard
│   ├── Accounting.tsx  # Met offertes en facturen tabs + werkorder integratie
│   ├── CRM.tsx         # Met taken tab
│   ├── HRM.tsx
│   ├── Planning.tsx    # Kalender module
│   └── Reports.tsx     # 4 rapport types
├── data/               # Mock data en database modellen
│   └── mockData.ts     # Incl. mock facturen
├── App.tsx             # Met login flow en invoice state
├── constants.ts        # Module definities
├── types.ts            # TypeScript types (incl. Invoice + WorkOrder koppeling)
└── index.tsx           # Entry point
```

---

## 🚧 Niet Geïmplementeerd (Voorlopig)

De volgende functionaliteiten zijn **niet** opgenomen of worden voorlopig uitgesteld:

- ❌ Webshop voor producten
- ❌ Webshop-voorraad koppeling
- ❌ Bestellingen volgen (door klanten)
- ❌ Externe boekhoudpakket koppeling
- ❌ Meerdere magazijnen of opslaglocaties
- ❌ Barcode/QR scanning
- ❌ Tweefactorauthenticatie (2FA)
- ❌ Volledige tijdklokken/pauzesregistratie
- ❌ Externe planning-tools koppelingen
- ❌ Database backend (gebruikt momenteel in-memory state)
- ❌ API endpoints
- ❌ Email notificaties
- ❌ SMS notificaties
- ❌ PDF factuur generatie (nog niet)
- ❌ Automatische betalingsherinneringen (nog niet)

---

## 🔮 Toekomstige Ontwikkelingen

### Fase 1: Kernfunctionaliteiten ✅ **VOLTOOID**
- ✅ Basis modules (Dashboard, Inventory, POS, Work Orders, CRM, HRM)
- ✅ Admin functionaliteit
- ✅ Rapportages basis
- ✅ Login systeem
- ✅ Notificaties systeem
- ✅ Offertes module
- ✅ **Facturen module**
- ✅ Planning & Agenda
- ✅ Persoonlijk workboard

### Fase 2: Uitbreiding ✅ **VOLTOOID**
- ✅ Taken management (CRM)
- ✅ Kalender/agenda functionaliteit
- ✅ Uren registratie per werkorder
- ✅ Gebruikersrollen met workboard
- ✅ **Offerte naar factuur conversie**
- ✅ **Factuur status tracking**
- 🔄 PDF factuur generatie
- 🔄 Email facturen versturen
- 🔄 Automatische betalingsherinneringen
- 🔄 Fotobewijs en uploads
- 🔄 Digitale handtekeningen
- 🔄 Excel/PDF export
- 🔄 Email notificaties

### Fase 3: Werkorder Integratie ✅ **VOLTOOID IN V4.0**
- ✅ **Offerte → Werkorder conversie**
- ✅ **Factuur → Werkorder conversie**
- ✅ **Real-time status tracking in offertes/facturen**
- ✅ **Bidirectionele synchronisatie**
- ✅ **Tussentijdse aanpassingen met update naar werkorder**
- ✅ **Voltooiings indicatoren**
- ✅ **Materiaalverbruik tracking**
- ✅ **Gewerkte vs geschatte uren vergelijking**

### Fase 4: Advanced Features (Gepland)
- 🔄 Klantenportaal (login voor klanten)
- 🔄 Klanten kunnen facturen online inzien
- 🔄 Klanten kunnen werkorder voortgang volgen 🆕
- 🔄 Online betaling integraties (Mollie/Stripe)
- 🔄 Automatische inkooporders bij lage voorraad
- 🔄 Geavanceerde rapportages met grafieken
- 🔄 Cashflow analyse
- 🔄 Debiteurenbeheer
- 🔄 Communicatie module (interne berichten)
- 🔄 API voor externe integraties
- 🔄 Mobile apps (iOS/Android)
- 🔄 Push notificaties
- 🔄 Real-time collaboration
- 🔄 Offerte templates 🆕
- 🔄 Werkorder history per klant 🆕

### Fase 5: Optimalisatie & Scaling (Lange termijn)
- 🔄 Performance optimalisatie
- 🔄 Backend database integratie (PostgreSQL/MongoDB)
- 🔄 REST API of GraphQL
- 🔄 Cloud deployment (AWS/Azure)
- 🔄 Real-time synchronisatie met WebSockets
- 🔄 Multi-tenant architecture
- 🔄 Advanced security (2FA, rate limiting)
- 🔄 Audit logs en compliance
- 🔄 Backup en disaster recovery
- 🔄 Boekhoudpakket integraties (Exact, Twinfield)

---

## 📝 Gebruikershandleiding

### Nieuwe Klant Aanmaken 👥 ✅ **BESCHIKBAAR**

**Uitgebreide handleiding beschikbaar!**

Voor complete stap-voor-stap instructies over het aanmaken van nieuwe klanten in de CRM module, zie:
📄 **[NIEUWE_KLANT_HANDLEIDING.md](./NIEUWE_KLANT_HANDLEIDING.md)**

**Quick Start:**
1. Login als **Admin** (sophie@bedrijf.nl / 1234)
2. Ga naar **CRM** module → Tab **"👥 Klanten"**
3. Klik **"+ Nieuwe Klant"** (rechtsboven)
4. Vul **verplichte velden** in (Naam + Email)
5. Vul **optionele velden** in (Telefoon, Type, Bedrijf, Bron, Adres)
6. Klik **"Toevoegen"**
7. **Klant is direct beschikbaar** in alle modules!

**Features:**
- ✅ Verplichte velden: Naam + Email
- ✅ Klant types: Zakelijk en Particulier
- ✅ Herkomst tracking
- ✅ Automatische ID en datum toekenning
- ✅ Statistieken per klant (Omzet, Orders, Contact)
- ✅ Direct beschikbaar in POS, Werkorders, Offertes, Facturen

**Let op:**
- ❌ Geen edit functionaliteit (verwijderen en opnieuw aanmaken)
- ⚠️ Verwijderen is permanent
- 🔄 Edit functie komt in toekomstige versie

---

### Werkorder Integratie Gebruiken 🆕 **NIEUW IN V4.0**

#### Offerte Omzetten naar Werkorder

**Stap 1: Offerte Accepteren**
1. Ga naar "Boekhouding, Offertes & Facturen" module
2. Klik op tab "📋 Offertes"
3. Zoek offerte met status "Verzonden"
4. Klik "Accepteren" knop → status wordt "Geaccepteerd"

**Stap 2: Werkorder Aanmaken**
1. Bij geaccepteerde offerte verschijnt oranje knop: **"📋 Maak Werkorder"**
2. Klik op deze knop
3. Systeem:
   - Genereert automatisch werkorder met titel: "[Klant] - [Offerte titel]"
   - Kopieert alle items als benodigde materialen
   - Zet werkuren als geschatte tijd
   - Status: To Do (klaar om te starten)
   - Koppelt klant automatisch
   - Behoudt referentie naar offerte
4. Bevestiging: "Werkorder WO123 succesvol aangemaakt!"
5. Badge verschijnt in offerte: **"🔵 Werkorder: To Do"**

**Stap 3: Werkorder Uitvoeren**
1. Ga naar Werkorders module
2. Medewerker ziet nieuwe taak in "To Do" kolom
3. Klik "▶ Start Werkorder"
4. Offerte toont nu: **"🟢 Werkorder: In Uitvoering"**

**Stap 4: Real-time Volgen (Admin)**
1. Blijf in Offertes tab
2. Status badge update automatisch:
   - 🔵 To Do
   - 🟡 In Wacht (met reden)
   - 🟢 In Uitvoering
   - ✅ Voltooid
3. Klik op badge → Spring direct naar werkorder in workboard

**Stap 5: Tussentijdse Aanpassing**
*Scenario: Klant wil extra item tijdens uitvoering*

1. **In Offerte:**
   - Klik **"✏️ Bewerk & Update Werkorder"** knop
   - Systeem controleert werkorder status
   - Waarschuwing als werkorder al voltooid is

2. **Voeg Item Toe:**
   - Klik "+ Uit Voorraad" of "+ Custom Item"
   - Selecteer extra materiaal
   - Voer aantal in
   - Systeem controleert voorraad

3. **Synchronisatie:**
   - Klik "💾 Opslaan & Update Werkorder"
   - Materiaal wordt automatisch toegevoegd aan werkorder
   - Medewerker ziet update in workboard
   - Notificatie: "Werkorder bijgewerkt met nieuwe materialen"

4. **Bevestiging:**
   - Groene melding: "Offerte en werkorder gesynchroniseerd!"
   - Badge blijft status tonen

**Stap 6: Voltooiing**
1. Medewerker voltooit werkorder
2. Voorraad automatisch afgetrokken
3. Offerte toont: **"✅ Werkorder: Voltooid"**
4. Groene border rond offerte card
5. Gewerkte uren zichtbaar: "Gewerkt: 8.5u (Geschat: 8u)"

**Stap 7: Factuur Maken**
1. Klik "🧾 Omzetten naar Factuur" (paarse knop)
2. Factuur bevat:
   - Alle items uit offerte
   - **Daadwerkelijke gewerkte uren** (8.5u in plaats van 8u)
   - Materiaalverbruik uit voltooide werkorder
   - Link naar werkorder en offerte
3. Factuur status: Draft
4. Badge in factuur: **"✅ Werkorder: Voltooid"**

#### Factuur Omzetten naar Werkorder

**Voor situaties waar je direct factureert (zonder offerte):**

**Stap 1: Factuur Aanmaken**
1. Ga naar Facturen tab
2. Klik "+ Nieuwe Factuur"
3. Voeg klant, items en werkuren toe
4. Status: Draft

**Stap 2: Werkorder Creëren**
1. Update factuur status naar "Verzonden"
2. Oranje knop verschijnt: **"📋 Maak Werkorder"**
3. Klik op knop
4. Werkorder aangemaakt met:
   - Alle items als materialen
   - Werkuren als geschatte tijd
   - Status: To Do
5. Badge in factuur: **"🔵 Werkorder: To Do"**

**Stap 3: Synchronisatie Tijdens Uitvoering**
*Zelfde flow als bij offertes*

#### Conflicten & Waarschuwingen Afhandelen

**Scenario 1: Aanpassing bij Actieve Werkorder**
```
Gebruiker probeert: Materiaal toevoegen aan offerte
Werkorder status: In Uitvoering
Systeem toont: ⚠️ Waarschuwing

Bericht:
"Deze werkorder is momenteel actief. 
Weet je zeker dat je wijzigingen wilt doorvoeren? 
De toegewezen medewerker ontvangt een notificatie."

Opties:
[Annuleren] [✓ Ja, Update Werkorder]
```

**Scenario 2: Aanpassing bij Voltooide Werkorder**
```
Gebruiker probeert: Offerte bewerken
Werkorder status: Voltooid
Systeem toont: 🔒 Blokkade

Bericht:
"Deze werkorder is al voltooid. 
Materialen en uren kunnen niet meer worden aangepast.
Je kunt alleen notities toevoegen."

Opties:
[Sluiten] [Notities Toevoegen]
```

**Scenario 3: Onvoldoende Voorraad**
```
Gebruiker probeert: Extra materiaal toevoegen
Voorraad: 5 stuks beschikbaar
Aanvraag: 10 stuks
Systeem toont: ❌ Fout

Bericht:
"Onvoldoende voorraad voor Staal plaat. 
Beschikbaar: 5 stuks
Nodig: 10 stuks

Suggestie: Pas het aantal aan of voeg voorraad toe."

Opties:
[Voorraad Aanpassen] [Aantal Aanpassen] [Annuleren]
```

#### Status Badge Interpretatie

**Badge Kleuren & Betekenis:**

| Badge | Betekenis | Actie |
|-------|-----------|-------|
| 🔵 **Werkorder: To Do** | Werkorder aangemaakt, wacht op start | Normaal, medewerker kan starten |
| 🟡 **Werkorder: In Wacht** | Werkorder gepauzeerd (+ reden) | Check reden, mogelijk actie nodig |
| 🟢 **Werkorder: In Uitvoering** | Actief aan het werk | Monitoring, wacht op voltooiing |
| ✅ **Werkorder: Voltooid** | Werk klaar, klaar voor facturatie | Factuur maken of betaling verwerken |
| 🔴 **Geen Werkorder** | Nog niet omgezet | Actie: Maak werkorder |

**Klikbaar:** Alle badges zijn klikbaar en springen naar de werkorder in het workboard.

#### Gewerkte vs Geschatte Uren

**Weergave na Voltooiing:**
```
In Offerte/Factuur Card:
┌─────────────────────────────────────┐
│ ✅ Werkorder: Voltooid              │
│ ⏱️  Gewerkt: 8.5u (Geschat: 8u)     │
│ 📊 Verschil: +0.5u (106%)           │
└─────────────────────────────────────┘
```

**Kleuren:**
- Groen: Binnen 110% van schatting (goed!)
- Oranje: 110-125% van schatting (redelijk)
- Rood: >125% van schatting (check wat er gebeurde)

#### Materiaalverbruik Tracking

**Weergave bij Voltooide Werkorder:**
```
Materialen Sectie in Werkorder:
┌─────────────────────────────────────┐
│ Gepland      Gebruikt    Verschil   │
│ 10 stuks  →  10 stuks    ✓ 0        │
│ 5 meter   →  6 meter     ⚠️ +1      │
│ 2 kg      →  2 kg        ✓ 0        │
└─────────────────────────────────────┘

Voorraad automatisch afgetrokken: 10 stuks, 6 meter, 2 kg
```

**Acties bij Verschil:**
- Positief verschil (meer gebruikt): Check of dit gefactureerd moet worden
- Negatief verschil (minder gebruikt): Materiaal terug in voorraad

### Automatische Factuur Conversie bij Voltooide Werkorders 🆕 **NIEUW IN V4.8**

#### Hoe Het Werkt

Wanneer een werkorder wordt voltooid, wordt **automatisch** een factuur aangemaakt of bijgewerkt in de Boekhouding module. Geen handmatige actie meer nodig!

**Automatische Workflow:**
```
1. Medewerker voltooit werkorder
   ↓
2. Voorraad wordt automatisch afgetrokken
   ↓
3. Factuur wordt automatisch aangemaakt/bijgewerkt
   ↓
4. Factuur verschijnt in Boekhouding module (status: Draft)
   ↓
5. Admin verzendt factuur naar klant
```

#### Wat Er Gebeurt Bij Voltooiing

**Scenario 1: Nieuwe Factuur Aanmaken**
- Werkorder heeft nog geen factuur
- Systeem maakt automatisch nieuwe factuur aan:
  - Factuurnummer: Automatisch gegenereerd (bijv. 2025-015)
  - Items: Alle benodigde materialen uit werkorder
  - Werkuren: Werkelijke gewerkte uren (`hoursSpent`)
  - BTW: 21% (of van offerte indien gekoppeld)
  - Datum: Vandaag
  - Vervaldatum: +14 dagen
  - Status: Draft (klaar om te verzenden)
  - Link: `workOrderId` en `quoteId` (indien aanwezig)

**Scenario 2: Bestaande Factuur Bijwerken**
- Werkorder heeft al een factuur (bijv. vanuit offerte)
- Systeem werkt bestaande factuur bij:
  - Werkuren worden bijgewerkt met werkelijke uren
  - Totaalbedrag wordt herberekend
  - History entry wordt toegevoegd
  - Geen dubbele factuur

**Scenario 3: Offerte Factuur Bijwerken**
- Werkorder komt van een offerte die al een factuur heeft
- Systeem werkt die factuur bij met werkelijke gewerkte uren
- Items blijven hetzelfde (van offerte)
- Alleen werkuren worden aangepast

#### Wat Je Ziet

**Na Voltooiing Werkorder:**
- ✅ Melding: "Factuur 2025-015 automatisch aangemaakt voor voltooide werkorder WO123!"
- ✅ Factuur verschijnt in Boekhouding module
- ✅ Status: Draft
- ✅ Werkorder krijgt `invoiceId` koppeling
- ✅ Factuur krijgt `workOrderId` koppeling

**In Boekhouding Module:**
- Factuur staat in "Facturen" tab
- Status: Draft (gele badge)
- Link naar werkorder zichtbaar
- Werkelijke uren ingevuld (niet geschat)
- Alle items en materialen opgenomen

#### Wat Je Moet Doen

**Direct Na Voltooiing:**
- ✅ Niets! Factuur is al aangemaakt
- ✅ Ga naar Boekhouding module
- ✅ Controleer factuur (items, bedragen, klant)

**Voor Verzending:**
1. Open factuur in Boekhouding module
2. Controleer bedragen en items
3. Pas aan indien nodig (admin)
4. Klik "Verzenden" knop
5. Status wordt "Verzonden"

**Voor Betaling:**
1. Wanneer klant betaalt
2. Klik "✓ Markeer als Betaald"
3. Betaaldatum wordt automatisch ingevuld
4. Status wordt "Betaald"

#### Voordelen

✅ **Tijd Besparen** - Geen handmatige factuur aanmaak meer  
✅ **Minder Fouten** - Automatische berekeningen  
✅ **Werkelijke Uren** - Facturen bevatten echte gewerkte tijd  
✅ **Volledige Koppeling** - Alle links behouden  
✅ **Seamless Workflow** - Van werkorder naar factuur in één stap  

#### Tips & Best Practices

**Voor Admins:**
- ✅ Controleer automatisch aangemaakte facturen voordat je ze verzendt
- ✅ Pas indien nodig werkuren of items aan
- ✅ Gebruik werkelijke uren voor accurate facturatie
- ✅ Check koppelingen (werkorder/offerte links)
- ✅ Documenteer eventuele afwijkingen in notities

**Voor Medewerkers:**
- ✅ Zorg dat je uren correct zijn ingevuld (`hoursSpent`)
- ✅ Bij voltooiing wordt automatisch factuur aangemaakt
- ✅ Je hoeft niets te doen, admin verzorgt facturatie

**Let Op:**
- ⚠️ Factuur krijgt status "Draft" - controleer altijd voordat je verzendt
- ⚠️ Als factuur al bestaat, wordt deze bijgewerkt (geen nieuwe)
- ⚠️ Werkelijke uren overschrijven geschatte uren in factuur
- ⚠️ BTW percentage komt van offerte indien gekoppeld, anders 21%

### Facturen Beheren (Basis - Bestaand)

#### Offerte Omzetten naar Factuur (Aanbevolen Methode)

**Stap 1: Offerte Accepteren**
1. Ga naar "Boekhouding, Offertes & Facturen" module
2. Klik op tab "📋 Offertes"
3. Zoek offerte met status "Verzonden"
4. Klik "Accepteren" knop → status wordt "Geaccepteerd"

**Stap 2: Conversie naar Factuur**
1. Bij geaccepteerde offerte verschijnt paarse knop: **"🧾 Omzetten naar Factuur"**
2. Klik op deze knop
3. Systeem:
   - Genereert automatisch uniek factuurnummer (bijv. 2025-001)
   - Kopieert alle items en werkuren
   - Behoudt link naar originele offerte
   - Stelt factuurdatum in op vandaag
   - Berekent vervaldatum (14 dagen standaard)
   - Status: Draft
4. Bevestiging: "Factuur 2025-001 succesvol aangemaakt!"
5. Je wordt automatisch doorgestuurd naar Facturen tab

**Stap 3: Factuur Verzenden**
1. In Facturen tab, zoek de nieuwe factuur (status: Draft)
2. Klik "Verzenden" knop
3. Status wordt "Verzonden"
4. Factuur is nu uitstaand

**Stap 4: Betaling Registreren**
1. Wanneer klant betaalt, klik "✓ Markeer als Betaald"
2. Systeem vult automatisch betaaldatum in
3. Status wordt "Betaald"
4. Groene status badge verschijnt
5. Statistieken worden bijgewerkt

#### Handmatig Factuur Aanmaken

**Voor situaties zonder offerte:**

1. Ga naar Facturen tab
2. Klik "+ Nieuwe Factuur" knop rechtsboven
3. **Vul basis informatie in:**
   - Selecteer klant uit dropdown
   - Kies factuurdatum (issue date)
   - Kies vervaldatum (due date)
   - Betalingstermijn (bijv. "14 dagen" of "30 dagen")

4. **Voeg items toe:**
   
   *Optie A - Uit Voorraad:*
   - Klik "+ Uit Voorraad" (blauw)
   - Selecteer item: "Staal plaat (STL-001) - €45.50"
   - Voer aantal in
   - Prijs en totaal automatisch berekend
   
   *Optie B - Custom Item:*
   - Klik "+ Custom Item" (grijs)
   - Vul beschrijving in
   - Voer aantal en prijs per stuk in
   - Totaal wordt berekend

5. **Werkuren toevoegen (optioneel):**
   - Klik "+ Werkuren Toevoegen" (groen)
   - Beschrijving: "Montage en installatie"
   - Uren: 8
   - Uurtarief: €65.00
   - Totaal: €520.00 (automatisch)

6. **BTW instellen:**
   - Standaard 21%, aanpasbaar per factuur
   - BTW wordt automatisch berekend

7. **Notities toevoegen (optioneel):**
   - Voeg opmerkingen toe in tekstveld

8. **Controleer totalen:**
   - Subtotaal (excl. BTW): €X.XXX,XX
   - BTW (21%): €XXX,XX
   - **Totaal (incl. BTW): €X.XXX,XX**

9. **Klik "Factuur Aanmaken"**
   - Factuur krijgt automatisch nummer
   - Status: Draft
   - Klaar voor verzending

#### Facturen Dashboard Lezen

**4 Statistiek Cards:**
1. **Totaal Gefactureerd** (🧾)
   - Som van alle facturen
   - Inclusief betaald en uitstaand
   
2. **Betaald** (✅)
   - Totaal bedrag betaald
   - Aantal betaalde facturen
   - Groen = positief
   
3. **Uitstaand** (⏳)
   - Facturen verzonden maar nog niet betaald
   - Aantal facturen + bedrag
   - Geel = wacht op betaling
   
4. **Verlopen** (⚠️)
   - Facturen voorbij vervaldatum
   - Aantal + bedrag
   - Rood = aandacht nodig!

#### Factuur Status Begrijpen

**Status Workflow:**
```
Draft (Concept)
  ↓ Verzenden
Sent (Verzonden)
  ↓ Betaling ontvangen        ↓ Vervaldatum voorbij
Paid (Betaald) ✅         Overdue (Verlopen) ⚠️
                              ↓ Betaling alsnog ontvangen
                          Paid (Betaald) ✅
```

**Status Kleuren:**
- 🟡 **Draft**: Geel - Concept, nog niet verzonden
- 🔵 **Sent**: Blauw - Verzonden, wacht op betaling
- 🟢 **Paid**: Groen - Betaald, afgerond
- 🔴 **Overdue**: Rood - Verlopen, actie vereist
- ⚫ **Cancelled**: Grijs - Geannuleerd

#### Verlopen Facturen Afhandelen

**Wat gebeurt er:**
- Systeem detecteert automatisch als vervaldatum voorbij is
- Status wordt "Overdue"
- Rode border verschijnt rond factuur card
- Telt mee in "Verlopen" statistiek

**Actie ondernemen:**
1. Herinner klant (handmatig, nog geen auto-herinneringen)
2. Bij betaling: Klik "✓ Markeer als Betaald"
3. Of annuleer: Klik "Annuleren" knop
4. Factuur blijft zichtbaar in historie

#### Tips & Best Practices

**Voor Admins:**
- ✅ Gebruik altijd offerte → factuur conversie workflow (voorkomt fouten)
- ✅ Controleer facturen wekelijks op verlopen status
- ✅ Noteer altijd betalingsvoorwaarden duidelijk
- ✅ Bewaar link naar offerte (automatisch bij conversie)
- ✅ Check statistieken dashboard voor cashflow overzicht
- 🆕 Maak werkorder aan voor productie/service facturen
- 🆕 Controleer werkorder status voor voltooiing
- 🆕 Vergelijk gewerkte vs geschatte uren
- ⚠️ Let op uitstaand bedrag - te hoog = liquiditeitsprobleem

**Voor Werkorder Integratie:**
- ✅ Accepteer offerte → Maak werkorder → Start uitvoering → Voltooi → Factureer
- ✅ Gebruik real-time status badges om voortgang te volgen
- ✅ Bij tussentijdse wijzigingen altijd "✏️ Bewerk & Update Werkorder" gebruiken
- ✅ Check materiaalverbruik na voltooiing voor eventuele meerwerk
- ✅ Vergelijk geschatte vs gewerkte uren voor toekomstige offertes
- ⚠️ Blokkeer aanpassingen aan voltooide werkorders (behalve notities)

**Factuurnummers:**
- Formaat: JAAR-NNN (bijv. 2025-001, 2025-002)
- Automatisch oplopend per jaar
- Reset bij nieuw jaar (2026-001, etc.)
- Uniek en niet aanpasbaar (voor audit trail)

**BTW:**
- Standaard 21% (Nederlands tarief)
- Aanpasbaar per factuur indien nodig
- 9% voor verlaagd tarief (niet standaard)
- 0% voor export (handmatig instellen)

**Betalingstermijn:**
- Standaard: "14 dagen"
- Alternatief: "30 dagen" voor vaste klanten
- Maatwerk: "Direct betalen" of "Bij oplevering"
- Wordt getoond op factuur

### Werkorder Indexering Gebruiken 🆕 **NIEUW IN V4.3**

**Wat is werkorder indexering?**

Met het werkorder indexering systeem kun je werkorders een nummer geven om de volgorde en prioriteit te bepalen. Werkorders worden automatisch gesorteerd op dit nummer, waarbij lagere nummers bovenaan staan.

**Bij het Aanmaken van een Werkorder:**

1. **Ga naar Werkorders module** (als admin)
2. **Klik "+ Nieuwe Werkorder"**
3. **Vul de basis informatie in:**
   - Titel, medewerker, klant, etc.
4. **Bij het veld "Indexnummer (optioneel)":**
   - **Optie A - Handmatig nummer:**
     - Voer een getal in (1-999)
     - Bijv. "1" voor hoogste prioriteit
     - Bijv. "5" voor normale prioriteit
   - **Optie B - Automatisch nummer:**
     - Laat het veld leeg
     - Systeem geeft automatisch het volgende nummer
     - Bijv. als hoogste = 10, krijgt nieuwe taak #11
5. **Klik "Toevoegen"**

**Indexnummer Na Aanmaken Wijzigen:**

1. **Open werkorder card**
2. **Klik op bewerk icoon (🖉️ blauw potlood)**
3. **Vind het veld "Indexnummer"**
4. **Wijzig het nummer:**
   - Verlaag voor hogere prioriteit (bijv. 10 → 2)
   - Verhoog voor lagere prioriteit (bijv. 2 → 10)
   - Laat leeg voor automatisch volgnummer
5. **Klik "Opslaan"**
6. **Werkorder wordt automatisch op nieuwe positie gesorteerd**

**Praktische Voorbeelden:**

**Scenario 1: Urgente Taak Bovenaan (MET AUTOMATISCHE SWAP)**
```
Situatie: Je hebt 5 werkorders (#1, #2, #3, #4, #5)
Nieuw: Urgente reparatie voor belangrijke klant

Actie: Geef nieuwe werkorder #1

Wat gebeurt er automatisch:
  ❌ Oude #1 wordt automatisch #6 (naar beneden opgeschoven)
  ✅ Nieuwe #1 - Urgente reparatie (BOVENAAN)
  ✅ #2 - Blijft #2
  ✅ #3 - Blijft #3
  ✅ #4 - Blijft #4
  ✅ #5 - Blijft #5
  🆕 #6 - Was #1 (automatisch opgeschoven)
```

**Scenario 2: Herschikken na Wijziging (MET AUTOMATISCHE SWAP)**
```
Situatie: Taak #5 wordt ineens urgenter dan #2

Actie: 
1. Bewerk werkorder #5
2. Wijzig indexnummer van 5 naar 2
3. Opslaan

Wat gebeurt er automatisch:
  ✅ #1 - Blijft #1 (hoogste prioriteit)
  ❌ Oude #2 wordt automatisch #6 (opgeschoven)
  ✅ #2 - Nu urgent (was #5) ⬆️
  ✅ #3 - Blijft #3
  ✅ #4 - Blijft #4
  ❌ Oude #5 is nu #2 (omhoog verplaatst)
  🆕 #6 - Was #2 (automatisch opgeschoven)

Resultaat: Geen dubbele #2, alles netjes herschikt!
```

**Scenario 3: Automatische Nummering**
```
Situatie: Je wilt geen handmatige nummers beheren

Actie: Bij elke nieuwe werkorder veld leeg laten

Resultaat:
  Werkorder 1: Automatisch #1
  Werkorder 2: Automatisch #2
  Werkorder 3: Automatisch #3
  Werkorder 4: Automatisch #4
  (etc.)
```

**Scenario 4: Kettingreactie Swap (NIEUW IN V4.4)**
```
Situatie: Je hebt werkorders #1, #2, #3
Je wilt #3 naar #1 verplaatsen

Actie:
1. Bewerk werkorder #3
2. Wijzig van 3 naar 1
3. Opslaan

Kettingreactie:
  ❌ Oude #1 heeft conflict met nieuwe #1
  ➡️ Oude #1 zoekt eerste vrije nummer → wordt #4
  ❌ Oude #2 blijft #2 (geen conflict)
  ❌ Oude #3 is nu #1
  
  EINDRESULTAAT:
  ✅ #1 - Was #3 (omhoog verplaatst) ⬆️
  ✅ #2 - Blijft #2 (ongewijzigd)
  ✅ #4 - Was #1 (automatisch opgeschoven) ⬇️
  
Voordeel: Systeem regelt automatisch, geen handmatig genummer!
```

**Scenario 5: Meerdere Medewerkers - Geen Interferentie**
```
Situatie: 
  Jan heeft: #1, #2, #3
  Maria heeft: #1, #2, #3

Actie: Wijzig Jan's #2 naar #1

Wat gebeurt er:
  JAN:
    ❌ Oude #1 wordt #4 (opgeschoven)
    ✅ #1 - Was #2 (omhoog)
    ✅ #2 - Blijft #2
    ✅ #3 - Blijft #3
    🆕 #4 - Was #1
    
  MARIA (GEEN WIJZIGING):
    ✅ #1 - Blijft #1 ✨
    ✅ #2 - Blijft #2 ✨
    ✅ #3 - Blijft #3 ✨
    
Resultaat: Swap werkt per medewerker, geen interferentie!
```

**Visuele Weergave:**

Elke werkorder card toont het indexnummer als badge linksboven:

```
┌───────────────────────────┐
│ #3           [🖉️] [❌]    │  <- Badge met nummer
│                            │
│ Werkorder Titel            │
│ Beschrijving...            │
│                            │
│ [...details...]            │
└───────────────────────────┘
```

**Best Practices:**

✅ **Voor Urgente Taken:**
- Gebruik lage nummers (1, 2, 3)
- Zo staan ze altijd bovenaan

✅ **Voor Normale Taken:**
- Laat systeem automatisch nummeren
- Of gebruik hogere nummers (10+)

✅ **Voor Planning:**
- Geef taken nummers in gewenste volgorde
- Bijv. #1 = eerst, #2 = daarna, #3 = als laatste

✅ **Per Medewerker:**
- Elke medewerker heeft eigen nummering
- #1 van Jan is los van #1 van Maria

⚠️ **Vermijd:**
- Dezelfde nummers hergebruiken (kan verwarring geven)
- Te grote sprongen (bijv. 1, 100, 200)
- Handmatig nummers toewijzen als automatisch voldoet

**Tips:**

💡 **Snelle Prioritering:**
Geef nieuwe urgente taak gewoon #1, oudere taken schuiven vanzelf op.

💡 **Batch Planning:**
Maak alle taken aan met automatische nummering, herschik daarna alleen urgente.

💡 **Groepering:**
Gebruik ranges: 1-10 = urgent, 11-20 = deze week, 21+ = volgende week

### Werkorders Gegroepeerd per Medewerker (Admin) 🆕 **NIEUW IN V4.2**

**Voor Admins - Overzicht per Medewerker:**

Wanneer je als admin "Alle medewerkers" selecteert in het werkorders overzicht, worden alle werkorders nu gegroepeerd per medewerker in aparte secties. Dit geeft je een duidelijk overzicht van wat er per medewerker nog te doen is.

**Hoe werkt het:**

1. **Ga naar Werkorders module**
2. **Selecteer "Alle medewerkers"** in de dropdown
3. **Zie gegroepeerd overzicht:**
   - Elke medewerker krijgt een eigen sectie met header
   - Per medewerker zie je de 4 Kanban kolommen (To Do / In Wacht / In Uitvoering / Afgerond)
   - Statistieken per medewerker (aantal taken per status)
   - Duidelijke scheiding tussen medewerkers

**Voordelen:**
- ✅ **Overzichtelijk** - Direct zien wie hoeveel werk heeft
- ✅ **Werklastverdeling** - Eenvoudig balans checken tussen medewerkers
- ✅ **Planning** - Snel zien wie beschikbaar is voor nieuwe taken
- ✅ **Monitoring** - Per persoon volgen hoe werk vordert

**Individuele Medewerker Bekijken:**

Wil je alleen één specifieke medewerker bekijken?
- Selecteer de naam van de medewerker in de dropdown
- Zie alleen taken van die persoon
- Ideaal voor one-on-one besprekingen

**Voorbeeld Scenario:**

```
👤 Jan de Vries (Productiemedewerker)
[To Do: 2] [In Wacht: 1] [In Uitvoering: 1] [Afgerond: 5]

👤 Maria Jansen (Lasser)
[To Do: 3] [In Wacht: 0] [In Uitvoering: 2] [Afgerond: 8]

👤 Peter Bakker (Spuiter)
[To Do: 1] [In Wacht: 0] [In Uitvoering: 1] [Afgerond: 4]
```

Zo zie je in één oogopslag:
- Jan heeft 1 taak in wacht (mogelijk materiaal probleem)
- Maria heeft de meeste openstaande taken (3 To Do + 2 In Progress)
- Peter heeft weinig werk, kan nieuwe taken aan

### Materiaalbeheer in Werkorders (Bestaand)

**Voor Admins - Materialen Toewijzen:**
1. Bij nieuwe werkorder: Scroll naar "Benodigde Materialen" sectie (blauwe achtergrond)
2. Selecteer materiaal uit dropdown (toont huidige voorraad)
3. Voer aantal in
4. Klik "+ Materiaal Toevoegen"
5. Herhaal voor meerdere materialen
6. Verwijder materiaal met rode X-knop indien nodig
7. Systeem controleert automatisch voorraad bij opslaan
8. Bij voltooien werkorder wordt voorraad automatisch afgetrokken

**Wachtstatus Instellen (Optioneel):**
1. Vink checkbox aan: "Werkorder in wacht zetten (optioneel)"
2. Gele sectie verschijnt met reden invoerveld
3. Voer reden in waarom werkorder in wacht staat
4. Laat checkbox uit als werkorder direct kan starten
5. Reden is alleen zichtbaar/verplicht als checkbox aangevinkt is

**Bij Bewerken Werkorder:**
1. Klik op bewerk-icoon (blauw potlood)
2. Scroll naar "Benodigde Materialen" sectie
3. Voeg materialen toe of verwijder bestaande
4. Voorraad wordt real-time gecontroleerd

**Voorraad Integratie:**
- ✅ Bij toewijzen: Systeem controleert of genoeg voorraad beschikbaar is
- ✅ Bij voltooien: Voorraad wordt automatisch afgetrokken
- ❌ Bij tekort: Werkorder kan niet worden voltooid (rode waarschuwing)

**Visuele Indicatoren:**
- **Groen/Grijs tekst**: Voldoende voorraad beschikbaar
- **Rode tekst**: Niet genoeg voorraad (toont beschikbare hoeveelheid)
- **Blauwe sectie**: Materiaalbeheer gebied in cards en formulieren
- **Grijze kolom**: To Do status (nieuwe taken)
- **Gele kolom**: Pending status (taken in wacht)
- **Blauwe kolom**: In Progress status (actieve taken)
- **Groene kolom**: Completed status (afgeronde taken)

### Eerste Keer Inloggen
1. Open `http://localhost:5173`
2. Kies een demo account of voer handmatig in:
   - **Admin**: sophie@bedrijf.nl / 1234
   - **User**: jan@bedrijf.nl / 1234
3. Klik op "Inloggen"
4. Je wordt doorgestuurd naar het Dashboard

### Als Admin
1. **Dashboard**: Zie volledig overzicht met alle statistieken
2. **Werkorders**: Klik op dropdown → selecteer "Alle medewerkers"
3. 🆕 **Werkorders per medewerker**: Bij "Alle medewerkers" zie je elke medewerker in een eigen sectie met hun taken
4. **Admin Instellingen**: Schakel modules in/uit
5. **Nieuwe Werkorder**: Klik "+ Nieuwe Werkorder" en wijs toe
6. **Rapportages**: Bekijk alle 4 rapport types
7. **Facturen**: Beheer volledige facturatie proces
8. 🆕 **Werkorder Integratie**: Converteer offertes/facturen naar werkorders

**Voor Medewerkers:**
```
1. Login → Zie workboard met 4 kolommen
2. "To Do" kolom bevat nieuwe toegewezen taken
3. Klik "▶ Start Werkorder" om te beginnen
4. Of klik "⏸ In Wacht Zetten" als materiaal ontbreekt
5. Werk uitvoeren → Klik "✓ Voltooi"
6. Bij voltooiing: Voorraad wordt automatisch bijgewerkt
```

### Als Medewerker
1. **Dashboard**: Zie persoonlijke statistieken
2. **Werkorders (Mijn Workboard)**: Zie alleen eigen taken in 4 kolommen
3. **Taken Starten**: 
   - "To Do" kolom: Klik "▶ Start Werkorder" om te beginnen
   - Of klik "⏸ In Wacht Zetten" als je moet wachten
4. **Taken Beheren**: Gebruik knoppen voor status updates
5. **Uren Registreren**: Klik "Bewerk" bij uren → vul in → opslaan
6. **Collega's Bekijken**: Dropdown → selecteer collega (read-only)
7. **Materialen Bekijken**: Zie welke materialen nodig zijn voor je taken
8. 🆕 **Status Reflectie**: Jouw werk-updates zijn zichtbaar in offertes/facturen
9. ❌ Geen toegang tot Facturen module

### Uitloggen
1. Klik op je naam/avatar rechtsboven
2. Klik "Uitloggen"
3. Je wordt teruggestuurd naar het login scherm

### History Viewer Gebruiken 🆕 **NIEUW IN V4.1**

**Voor Alle Gebruikers (Medewerkers & Admins):**

De History Viewer toont automatisch in elke werkorder card en geeft inzicht in de volledige tijdlijn.

#### Timestamp Summary Lezen

**In Werkorder Card:**
Onderaan elke werkorder zie je een grijze sectie met timestamps:

```
┌─────────────────────────────────────┐
│ 🆕 Aangemaakt: 2 dagen geleden     │
│ 👤 Toegewezen: 2 dagen geleden     │
│ ▶️ Gestart: 5 uur geleden          │
└─────────────────────────────────────┘
```

**Tijdstippen die kunnen verschijnen:**
- 🆕 **Aangemaakt** - Altijd aanwezig bij elke werkorder
- 🔄 **Geconverteerd** - Alleen als werkorder vanuit offerte/factuur komt
- 👤 **Toegewezen** - Wanneer aan medewerker toegewezen (update bij hertoewijzing)
- ▶️ **Gestart** - Wanneer status naar "In Uitvoering" ging
- ✅ **Voltooid** - Wanneer werkorder is afgerond

**Tip:** Hover met je muis over "X dagen geleden" om de exacte datum en tijd te zien!

#### Relatieve Tijd Interpreteren

**Tijd weergave formaten:**
- `Zojuist` = Minder dan 1 minuut geleden
- `5 min geleden` = Recente wijziging (binnen het uur)
- `3 uur geleden` = Vandaag gebeurd
- `Gisteren` = 1 dag geleden
- `3 dagen geleden` = Deze week
- `22 okt 2024, 14:30` = Oudere wijzigingen (>7 dagen)

#### Volledige Geschiedenis Bekijken

**Stap 1: Uitklappen**
1. Scroll naar onder in werkorder card
2. Zoek de grijze knop: **"Volledige Geschiedenis (X)"**
3. Klik op de knop
4. Geschiedenis klapt uit met animatie

**Stap 2: History Entries Lezen**
```
┌──────────────────────────────────────┐
│ 🆕  Werkorder aangemaakt door Sophie   │
│     22 okt 2024, 09:00                │
├──────────────────────────────────────┤
│ 👤  Toegewezen aan Jan de Vries        │
│     door Sophie van Dam            │
│     22 okt 2024, 09:05                │
├──────────────────────────────────────┤
│ 📊  Status: To Do → In Progress      │
│     door Jan de Vries               │
│     24 okt 2024, 08:15                │
└──────────────────────────────────────┘
```

**Elke entry bevat:**
- 🎨 **Icoon** - Visuele indicator van actie type
- 📝 **Details** - Beschrijving van wat er gebeurde
- 👤 **Wie** - Naam van medewerker die actie uitvoerde
- ⏰ **Wanneer** - Exacte datum en tijd

**Stap 3: Scrollen door Lange Histories**
- Bij meer dan 8-10 entries verschijnt een scrollbar
- Scroll omhoog/omlaag om alle entries te zien
- Maximum hoogte: 260px

**Stap 4: Inklappen**
- Klik nogmaals op "Volledige Geschiedenis (X)"
- Geschiedenis klapt in met animatie

#### Actie Iconen Begrijpen

**Icoon Legenda:**
| Icoon | Actie Type | Betekenis |
|-------|------------|----------|
| 🆕 | Created | Werkorder is aangemaakt |
| 🔄 | Converted | Geconverteerd van offerte/factuur |
| 👤 | Assigned | Toegewezen aan medewerker |
| 📊 | Status Changed | Status is gewijzigd |
| ✅ | Completed | Werkorder is voltooid |
| 📝 | Other | Andere wijzigingen |

#### History in Edit Modal (Admin Only)

**Voor Admins bij bewerken:**

1. Klik op bewerk-icoon (🖉️ blauw potlood) in werkorder
2. Scroll naar beneden in edit modal
3. Na de notities sectie zie je: **"Werkorder Geschiedenis"**
4. Volledige History Viewer is zichtbaar:
   - Timestamp summary bovenaan
   - Uitklapbare geschiedenis eronder
5. Gebruik deze info om context te begrijpen voor je bewerking

#### Praktische Gebruiksscenario's

**Scenario 1: Medewerker Controleert Toewijzing**
```
Jan (medewerker) vraagt zich af:
"Wanneer is deze taak aan mij toegewezen?"

Actie:
1. Open workboard
2. Bekijk werkorder card
3. Zie timestamp: "👤 Toegewezen: 2 dagen geleden"
4. Hover voor exacte tijd: "22 okt 2024, 09:05"
5. Klik "Volledige Geschiedenis" voor details:
   "Toegewezen aan Jan door Sophie"
```

**Scenario 2: Admin Analyseert Doorlooptijd**
```
Sophie (admin) wil weten:
"Hoelang duurde deze werkorder?"

Actie:
1. Open voltooide werkorder
2. Bekijk timestamps:
   - 🆕 Aangemaakt: 22 okt, 09:00
   - ▶️ Gestart: 24 okt, 08:15
   - ✅ Voltooid: 25 okt, 16:30
3. Berekening:
   - Wachttijd: 1 dag 23 uur
   - Werktijd: 1 dag 8 uur
   - Totaal: 3 dagen 8 uur
4. Conclusie: Identificeer vertraging in start
```

**Scenario 3: Klant Vraagt Om Update**
```
Klant belt: "Wat is de status van mijn opdracht?"

Admin bekijkt history:
1. Klik "Volledige Geschiedenis"
2. Zie laatste entries:
   - 📊 "Status: In Progress" (Gisteren, 08:00)
   - 👤 "Toegewezen aan Maria Jansen"
3. Antwoord aan klant:
   "Uw opdracht is sinds gisteren in uitvoering
    door onze specialist Maria Jansen."
```

**Scenario 4: Hertoewijzing Traceren**
```
Werkorder is meerdere keren hertoegewezen.
Admin wil weten waarom:

1. Open geschiedenis
2. Zie entries:
   - 👤 "Toegewezen aan Jan" (22 okt)
   - 👤 "Opnieuw toegewezen van Jan naar Peter" (23 okt)
   - 👤 "Opnieuw toegewezen van Peter naar Maria" (24 okt)
3. Context: Jan was ziek, Peter had voorrang opdracht
4. Actie: Documenteer in notities voor toekomstig
```

#### Tips & Best Practices

**Voor Medewerkers:**
- ✅ Check timestamps bij nieuwe taken om prioriteit te bepalen
- ✅ Gebruik relatieve tijd voor quick glance ("5 uur geleden")
- ✅ Hover voor exacte tijd als je precies wil weten
- ✅ Bekijk geschiedenis als je context mist
- ⚠️ Rapporteer onverwachte timestamps aan admin

**Voor Admins:**
- ✅ Gebruik geschiedenis voor performance analyse
- ✅ Identificeer bottlenecks in werkorder flow
- ✅ Documenteer patronen voor proces verbetering
- ✅ Check geschiedenis bij hertoewijzingen
- ✅ Gebruik audit trail voor compliance rapportages
- ⚠️ Let op: Geschiedenis is permanent (kan niet worden aangepast)

**Voor Analyse:**
- ✅ Vergelijk "Aangemaakt" en "Gestart" voor wachttijd
- ✅ Vergelijk "Gestart" en "Voltooid" voor werktijd
- ✅ Check aantal hertoewijzingen als kwaliteitsindicator
- ✅ Gebruik timestamps voor accurate tijdregistratie

**Veel Voorkomende Vragen:**

Q: *Kan ik geschiedenis bewerken of verwijderen?*
A: Nee, geschiedenis is permanent voor audit trail doeleinden.

Q: *Waarom zie ik geen "Gestart" timestamp?*
A: Werkorder is nog niet gestart (status nog To Do of Pending).

Q: *Kan ik geschiedenis exporteren?*
A: Momenteel niet, maar staat op planning voor toekomstige update.

Q: *Wie kan geschiedenis zien?*
A: Alle gebruikers (medewerkers en admins) kunnen geschiedenis zien van werkorders waar ze toegang toe hebben.

Q: *Hoe weet ik of geschiedenis nieuw is?*
A: Check relatieve tijd - "5 min geleden" is zeer recent!

---

## 🏆 Changelog

### Versie 5.4.0 🆕 **KASSA VERKOPEN TAB & KLIKBARE FACTUREN MET CLONE**
**Nieuwe Features:**

**1. Kassa Verkopen Tab**
- 🆕 **Nieuwe tab** - "🛒 Kassa Verkopen" in Boekhouding & Dossier module
- 🆕 **Automatische filtering** - Toont alle facturen aangemaakt via kassasysteem
- 🆕 **Direct betaalde facturen** - Alle kassa verkopen hebben status 'paid'
- 🆕 **Betaalmethode weergave** - Toont betaalmethode (💵 Contant, 💳 PIN, 🏦 iDEAL, 💳 Creditcard)
- 🆕 **Groene styling** - Visuele indicatie voor direct betaalde transacties
- 🆕 **Klikbaar** - Elke kassa verkoop is klikbaar voor details

**2. Klikbare Facturen (Factuur Archief & Kassa Verkopen)**
- 🆕 **Klikbare items** - Alle facturen in Factuur Archief zijn nu klikbaar
- 🆕 **Detail modal** - Volledige factuurdetails in read-only modal:
  - Header info (factuurnummer, status, klant, datums)
  - Items tabel (omschrijving, aantal, prijs per eenheid, totaal)
  - Werkuren tabel (indien aanwezig)
  - Totaaloverzicht (subtotaal excl. BTW, BTW bedrag, totaal incl. BTW)
  - Notities (indien aanwezig)
- 🆕 **Read-only** - Alle velden zijn alleen-lezen (niet aanpasbaar)
- 🆕 **Visuele feedback** - Cursor pointer en hover-effecten

**3. Clone Functionaliteit**
- 🆕 **Klonen naar Factuur** - Maak nieuwe factuur met status 'draft':
  - Automatisch nieuw factuurnummer
  - Factuurdatum = vandaag
  - Vervaldatum = +14 dagen
  - Notitie: "Gekloond van factuur XXX"
  - Status: Draft (klaar om te bewerken)
- 🆕 **Klonen naar Offerte** - Maak nieuwe offerte met status 'draft':
  - Automatisch nieuw offertenummer
  - Aanmaakdatum = vandaag
  - Geldigheidsdatum = +30 dagen
  - Notitie: "Gekloond van factuur XXX"
  - Status: Draft
- 🆕 **Bevestigingsmodal** - Vraagt bevestiging voordat gekloond wordt
- 🆕 **Succesmelding** - Duidelijke feedback na clonen

**4. Extra Functionaliteit**
- 🆕 **Betaal-knop in archief** - Openstaande facturen kunnen direct als betaald worden gemarkeerd
- 🆕 **Props toegevoegd** - `setInvoices` en `setQuotes` aan Bookkeeping component
- 🆕 **App.tsx bijgewerkt** - Nieuwe props doorgegeven aan Bookkeeping

**Voordelen:**
- ✅ **Overzichtelijk** - Kassa verkopen apart van andere facturen
- ✅ **Volledige details** - Zie alle factuurinformatie zonder te bewerken
- ✅ **Clone workflow** - Eenvoudig facturen/offertes dupliceren
- ✅ **Terugkerende klanten** - Clone vorige facturen voor nieuwe opdrachten
- ✅ **Snelle acties** - Direct betaal markeren vanuit archief

**Technische Updates:**
- 🆕 `posInvoices` useMemo voor filtering kassa verkopen
- 🆕 `openInvoiceDetail` functie voor modal openen
- 🆕 `handleCloneToInvoice` en `handleCloneToQuote` functies
- 🆕 Detail modal component met read-only weergave
- 🆕 Clone confirmation modal
- 🆕 Props uitgebreid in Bookkeeping component

### Versie 5.3.0 🆕 **COMPACTE WERKORDER WEERGAVE**
**Nieuwe Features:**

**1. Compacte/Uitgebreide Weergave Toggle**
- 🆕 **Toggle switch** boven werkorders - Schakel tussen compacte en uitgebreide weergave
- 🆕 **Compacte weergave:**
  - Alleen indexnummer (#) en omschrijving
  - Kleinere cards met minimale padding
  - Beperkte hoogte (max 2 regels tekst)
  - Visuele hint (👆) dat klikbaar is
  - Perfect voor snel overzicht van veel werkorders
- 🆕 **Uitgebreide weergave:**
  - Volledige card met alle details (zoals nu)
  - Titel, beschrijving, materialen, uren, status, etc.
  - Alle functionaliteit behouden
- 🆕 **Beide versies interactief:**
  - Klikbaar en dubbelklikbaar voor detail modal
  - Details altijd toegankelijk
  - Smooth transition tussen views

**Voordelen:**
- ✅ **Meer werkorders in één overzicht** - Zie meer taken tegelijk
- ✅ **Sneller scannen** - Compacte view voor snel overzicht
- ✅ **Flexibel gebruik** - Schakel tussen views wanneer nodig
- ✅ **Details altijd beschikbaar** - Dubbelklik voor volledige informatie

**Technische Updates:**
- 🆕 `compactView` state toegevoegd aan WorkOrders component
- 🆕 `compactView` prop toegevoegd aan WorkOrderCard component
- 🆕 Conditionele rendering voor compacte vs uitgebreide weergave
- 🆕 Toggle UI met visuele feedback

### Versie 5.2.0 🆕 **BOEKHOUDING & DOSSIER MODULE - MKB-READY, NL-COMPLIANT**
**Nieuwe Module:**

**1. Boekhouding & Dossier (Volledig Geïmplementeerd)**
- 🆕 **Nieuwe module toegevoegd** - Volledig digitaal boekhouddossier systeem
- 🆕 **5 Kernfuncties:**
  1. Grootboekrekeningen (Standaard MKB-Set)
  2. Factuur & Pakbon Archief (Digitaal Dossier)
  3. BTW-Overzicht (Aangifte-Ready)
  4. Klant- & Leveranciersdossiers
  5. Transactieregistratie (Journaal)

**2. Grootboekrekeningen**
- 🆕 **10 Standaard MKB-rekeningen** ingesteld (1300, 1400, 4000, 4400, 8000, 8010, 8020, 1600, 2200, 2210)
- 🆕 **CSV export** - Exporteer grootboek naar CSV voor Exact, Twinfield, etc.
- 🆕 **Tabel overzicht** - Alle rekeningen met type, categorie en omschrijving

**3. Factuur & Pakbon Archief**
- 🆕 **Automatisch archief** - Elke factuur wordt automatisch toegevoegd
- 🆕 **Zoeken & filteren** - Op nummer, klant, datum, status
- 🆕 **Acties per factuur** - PDF download, herinnering sturen, markeer als betaald
- 🆕 **Visuele status indicatoren** - Rode/groene/gele badges

**4. BTW-Overzicht**
- 🆕 **Automatische berekening** per maand/kwartaal
- 🆕 **Periode rapport** - Omzet per BTW-tarief (21%, 9%, 0%)
- 🆕 **Te betalen berekening** - Totaal af te dragen minus voorbelasting
- 🆕 **Export knoppen** - XML export (placeholder) en Print PDF
- 🆕 **Dynamische data** - Automatisch berekend uit facturen

**5. Klant- & Leveranciersdossiers**
- 🆕 **Alles op één plek** - Volledig dossier per klant/leverancier
- 🆕 **Financiële informatie** - Openstaand saldo, credit-limiet
- 🆕 **Documenten koppeling** - Facturen, pakbonnen, offertes, werkorders
- 🆕 **Notities systeem** - Voeg notities toe per relatie
- 🆕 **Tabbladen structuur** - Facturen, Pakbonnen, Offertes, Notities

**6. Transactieregistratie (Journaal)**
- 🆕 **Volledig automatisch** - Elke factuur genereert journaalpost
- 🆕 **Journaalregels** - Debet/Credit met correcte grootboek toewijzing
- 🆕 **Automatische BTW splitsing** - BTW 21% → 2200, BTW 9% → 2210
- 🆕 **Automatische omzet toewijzing** - Goederen → 8000, Diensten → 8010, Vrijgesteld → 8020
- 🆕 **Zoeken & filteren** - Op omschrijving, referentie, datum
- 🆕 **Handmatig toevoegen** - Knop voor handmatige journaalposten (placeholder)

**7. Permissions Systeem**
- 🆕 **Admin/Boekhouder** - Volledige toegang (grootboek, facturen, BTW, journaal, dossiers)
- 🆕 **Verkoper/Inkoop** - Alleen dossiers tab
- 🆕 **Monteur** - Geen toegang

**8. Integratie met Bestaande Modules**
- 🆕 **POS/Kassa** → Automatische factuur + journaalpost
- 🆕 **Pakbon (B2B)** → Wordt factuur bij "Markeer als gefactureerd"
- 🆕 **Voorraad** → Inkoopfactuur → voorraad + crediteuren
- 🆕 **CRM** → Klantgegevens automatisch in dossier
- 🆕 **Accounting Module** → Facturen automatisch in archief

**Technische Updates:**
- 🆕 `ModuleKey.BOOKKEEPING` toegevoegd
- 🆕 `LedgerAccount`, `JournalEntry`, `JournalEntryLine`, `VATReport` types
- 🆕 `CustomerDossier`, `SupplierDossier`, `InvoiceArchiveItem`, `DossierNote` types
- 🆕 `BookkeepingIcon` component
- 🆕 Volledige `Bookkeeping.tsx` pagina component (600+ regels)
- 🆕 Automatische journaalpost generatie vanuit facturen
- 🆕 Automatische BTW berekening per periode
- 🆕 Automatisch factuurarchief vanuit Accounting module
- 🆕 Routing geconfigureerd in App.tsx

**Voordelen:**
- ✅ **MKB-Ready** - Standaard MKB grootboekset ingebouwd
- ✅ **NL-Compliant** - BTW per tarief (21%, 9%, 0%) gesplitst
- ✅ **Aangifte-Ready** - BTW-rapport klaar voor accountant/belastingdienst
- ✅ **Geen handmatig werk** - Automatisch journaal en BTW-berekening
- ✅ **Volledig digitaal** - Alle facturen en dossiers op één plek
- ✅ **Traceerbaar** - Elke transactie gekoppeld aan bron
- ✅ **Controle-ready** - Direct klaar voor Belastingdienst controle

### Versie 4.9.0 🆕 **DATABASE DIAGNOSTICS & ANALYTICS DASHBOARD**

**Nieuwe Features:**

**1. Systeem Analytics & Optimalisatie Dashboard (Lean Six Sigma)**
- 🆕 **Analytics Tab in Admin Instellingen** - Volledig analytics dashboard voor data-driven optimalisatie
- 🆕 **Key Metrics Cards** - Totale events, actieve gebruikers, gebruikstijd, efficiency verandering
- 🆕 **Module Gebruik Statistieken:**
  - Bar charts voor sessies, acties en fouten per module
  - Uitgebreide tabellen met trends (increasing/decreasing/stable)
  - Totale sessies en tijd per module
- 🆕 **Proces Efficiëntie Metrics:**
  - Gemiddelde cyclus tijd per proces
  - Completion rate, error rate, rework rate
  - Bottleneck detectie met wachttijden
  - Bar charts voor cyclus tijd visualisatie
- 🆕 **Gebruiker Efficiency Scores:**
  - Efficiency scores (0-100) per gebruiker
  - Horizontal bar chart voor visuele vergelijking
  - Meest gebruikte modules per gebruiker
- 🆕 **Automatische Optimalisatie Aanbevelingen:**
  - Prioriteit levels (high/medium/low)
  - Categorieën (process/feature/usability/automation/quality)
  - ROI scores en impact inschatting
  - Aanbevolen acties per aanbeveling
  - Kleurgecodeerde priority badges
- 🆕 **Periode Filters** - Analyse per dag/week/maand/kwartaal/jaar
- 🆕 **Analytics Tracking:**
  - Automatische navigation tracking (via AnalyticsTracker component)
  - Action tracking voor invoice/quote creation, validations, payments
  - Work order tracking (creation, status updates, completions)
  - Task completion tracking met duration
  - LocalStorage voor data persistentie

**2. Database Diagnostics Dashboard**
- 🆕 **Database Diagnostics Tab in Admin Instellingen** - Baseline diagnostics voor managed databases
- 🆕 **20+ Voorgedefinieerde Issues:**
  - Connection issues (timeouts, pool exhaustion, latency)
  - Authentication issues (invalid keys, RLS blocking)
  - Performance issues (slow queries, cold starts, N+1 problems)
  - Schema issues (migration failures, missing indexes)
  - Configuration issues (SSL, timezone)
  - Platform limits (storage quota, rate limits)
  - SDK compatibility issues
  - Security issues (exposed keys, weak passwords)
- 🆕 **Severity Distributie:**
  - Statistics cards voor High/Medium/Low severity
  - Bar chart voor visuele verdeling
  - Total issues counter
- 🆕 **Categorie Filtering:**
  - Filter op categorie (Connection, Auth, Performance, etc.)
  - "Alle Categorieën" optie
  - Klikbare categorie cards voor snelle filtering
- 🆕 **Gedetailleerde Issue Cards:**
  - Severity badges (kleurgecodeerd)
  - Category badges
  - Latency indicators (indien beschikbaar)
  - Occurrences counters
  - Diagnostische stappen (lijst met checkpoints)
  - Voorgestelde oplossingen (actie-items)
  - Platform-specifieke informatie (Supabase/NeonDB/PlanetScale)
  - Test action buttons (klaar voor backend integratie)
- 🆕 **Vendor-Specific Informatie:**
  - Supabase-specifieke details (connection limits, pooling, etc.)
  - NeonDB-specifieke details (serverless cold starts, provisioned compute)
  - PlanetScale-specifieke details (branching, deploy requests)
- 🆕 **Responsive Design:**
  - Mobile-optimized layout
  - Scrollable tabs voor kleine schermen
  - Touch-friendly cards en buttons
  - Adaptive grid layouts

**Technische Updates:**
- 🆕 `AnalyticsEvent`, `ModuleUsageStats`, `UserActivityStats`, `ProcessMetrics`, `OptimizationRecommendation`, `AnalyticsDashboard` types
- 🆕 `utils/analytics.ts` - Analytics tracking en dashboard building functionaliteit
- 🆕 `components/AnalyticsTracker.tsx` - Automatische navigation en session tracking
- 🆕 `data/databaseDiagnostics.json` - Baseline diagnostics data (20 issues)
- 🆕 Recharts integratie voor analytics visualisaties
- 🆕 LocalStorage voor analytics data persistentie
- 🆕 Process flows definities voor metric berekeningen
- 🆕 Recommendation engine met regels voor automatische aanbevelingen

**Voordelen:**
- ✅ **Data-Driven Optimalisatie** - Beslissingen gebaseerd op echte gebruikspatronen
- ✅ **Proactieve Probleem Detectie** - Identificeer bottlenecks voordat ze kritiek worden
- ✅ **Database Health Monitoring** - Preventief database issues detecteren
- ✅ **Performance Insights** - Begrijp waar gebruikers tijd aan besteden
- ✅ **ROI Tracking** - Zie welke optimalisaties de meeste impact hebben
- ✅ **Lean Six Sigma Principes** - Wasted reduction en value stream mapping
- ✅ **Compliance Ready** - Audit trail voor alle systeem activiteiten

### Versie 5.0.0 🆕 **WEBSHOP MODULE - VOLLEDIG GEÏMPLEMENTEERD**

**Nieuwe Module:**

**1. Webshop Beheer Systeem**
- 🆕 **Nieuwe module toegevoegd** - Volledig e-commerce beheer systeem
- 🆕 **3 Main Tabs:**
  - 📦 Producten - Volledig product beheer
  - 🏷️ Categorieën - Hiërarchisch categorie systeem
  - 📋 Bestellingen - Order beheer en tracking

**2. Product Beheer (Volledig CRUD)**
- 🆕 **Uitgebreid Product Formulier** met georganiseerde secties:
  - Basis informatie (naam, slug, SKU, beschrijvingen)
  - Prijs & voorraad (verkoop/was/inkoopprijs, voorraad tracking)
  - Categorieën (multi-select met primaire categorie)
  - Status & zichtbaarheid (draft/active/archived, public/private/hidden)
  - Verzending (gewicht, afmetingen, verzendcategorie, digitaal product)
  - SEO & marketing (meta title/description, tags)
  - Extra opties (BTW tarief, reviews, admin notities)
- 🆕 **Automatische Generatie:**
  - URL slug uit productnaam (SEO-vriendelijk)
  - SKU nummering (PRD-0001, PRD-0002, etc.)
- 🆕 **Inventory Koppeling** - Koppel producten aan voorraad items
- 🆕 **Image Upload Voorbereiding** - Structuur klaar voor frontend
- 🆕 **Product Varianten Structuur** - Voorbereid voor kleuren, maten, etc.
- 🆕 **Zoeken & Filteren:**
  - Zoek op naam, SKU, beschrijving, tags
  - Filter op status en categorie
  - Grid/List view toggle
- 🆕 **Status Management:**
  - Draft, Active, Archived statussen
  - Quick toggle knoppen
  - Visibility settings (public, private, hidden)

**3. Categorieën Beheer**
- 🆕 **Volledig Categorie CRUD**
- 🆕 **Hiërarchische Structuur** - Parent/child categorieën met visuele indicatie
- 🆕 **Multi-categorie Support** - Producten in meerdere categorieën
- 🆕 **Primaire Categorie** - Hoofd categorie selectie
- 🆕 **Sorteerbare Volgorde** - Bepaal weergave volgorde
- 🆕 **SEO Velden** - Meta title en description per categorie
- 🆕 **Product Count** - Zie hoeveel producten per categorie
- 🆕 **Actief/Inactief Toggle**

**4. Bestellingen Beheer**
- 🆕 **Order Overzicht** - Volledige lijst met filters
- 🆕 **Zoeken & Filteren** - Ordernummer, klantnaam, email, status
- 🆕 **Order Detail Modal:**
  - Klant informatie
  - Bestelde items tabel
  - Verzend- en factuuradres
  - Tracking informatie
  - Klant en admin notities
  - Order totalen breakdown
- 🆕 **Status Tracking:**
  - Order status (pending → processing → shipped → delivered)
  - Payment status (pending → paid)
  - Quick action buttons
- 🆕 **Status Updates:**
  - Markeer als "In Behandeling"
  - Markeer als "Verzonden"
  - Markeer als "Betaald"
  - Annuleer bestelling

**5. UX/UI Design Principes**
- 🆕 **Progressive Disclosure** - Georganiseerde secties met headers
- 🆕 **Color Coding** - Verschillende kleuren per functie
- 🆕 **Error Prevention** - Automatische generatie, validatie
- 🆕 **Feedback Loops** - Directe visuele feedback
- 🆕 **Responsive Design** - Mobile-first approach
- 🆕 **Intuïtieve Navigatie** - Duidelijke tabs en buttons

**6. Frontend Voorbereiding**
- 🆕 **SEO-Ready Structure** - Slugs, meta titles, descriptions
- 🆕 **Image Arrays** - Voorbereid voor product galleries
- 🆕 **Variant System** - Structuur voor kleuren, maten
- 🆕 **Shopping Cart Types** - WebshopCartItem, ShoppingCart
- 🆕 **Coupon System Types** - Percentage en fixed amount kortingen
- 🆕 **Address Structure** - Volledige adres structuur
- 🆕 **Review System** - Allow reviews flag en ratings
- 🆕 **Statistics Ready** - View count, purchase count, wishlist count

**Technische Updates:**
- 🆕 `WebshopProduct`, `ProductCategory`, `ProductVariant`, `ProductImage` types
- 🆕 `Order`, `OrderItem`, `Address` types
- 🆕 `ShoppingCart`, `WebshopCartItem`, `Coupon` types
- 🆕 `ModuleKey.WEBSHOP` toegevoegd
- 🆕 WebshopIcon component
- 🆕 Volledige Webshop pagina component (2000+ regels)
- 🆕 Routing geconfigureerd in App.tsx

**Voordelen:**
- ✅ **Gebruiksvriendelijk Admin Interface** - Makkelijk producten beheren
- ✅ **Voorbereid voor Frontend** - Alle data structuren aanwezig
- ✅ **SEO Optimalisatie** - Slugs, meta tags, descriptions
- ✅ **Schaalbaar Design** - Klaar voor groei
- ✅ **Inventory Integratie** - Koppeling met bestaand voorraad systeem
- ✅ **Professional Workflow** - Van product tot bestelling volledig afgehandeld

### Versie 4.8.0 🆕 **AUTOMATISCHE FACTUUR CONVERSIE BIJ VOLTOOIDE WERKORDERS**

**Nieuwe Features:**

**1. Automatische Factuur Generatie**
- 🆕 **Automatische conversie** - Wanneer een werkorder wordt voltooid, wordt automatisch een factuur aangemaakt
- 🆕 **Slimme logica:**
  - Als er al een factuur bestaat → wordt bijgewerkt met werkelijke gewerkte uren
  - Als er een offerte is met factuur → wordt die factuur bijgewerkt met werkelijke uren
  - Anders → nieuwe factuur aangemaakt met werkorder items en uren
- 🆕 **Items conversie:**
  - Benodigde materialen uit werkorder → factuur items
  - Gewerkte uren (`hoursSpent`) → factuur werkuren
  - Gebruikt offertedata als basis indien beschikbaar
- 🆕 **Automatische berekeningen:**
  - Subtotaal (items + werkuren)
  - BTW (21% standaard, of van offerte indien gekoppeld)
  - Totaal bedrag
- 🆕 **Factuur details:**
  - Factuurnummer automatisch gegenereerd
  - Factuurdatum = vandaag
  - Vervaldatum = +14 dagen
  - Link naar werkorder en offerte (indien aanwezig)
  - Status: Draft (klaar om te verzenden)
- 🆕 **Koppeling bewaren:**
  - Werkorder krijgt `invoiceId` link naar factuur
  - Factuur krijgt `workOrderId` link naar werkorder
  - Bidirectionele relatie voor tracking

**2. Smart Update Logic**
- 🆕 **Bestaande facturen bijwerken** - Voorkomt dubbele facturen
- 🆕 **Werkelijke uren gebruiken** - Facturen bevatten daadwerkelijk gewerkte uren, niet geschat
- 🆕 **Offerte integratie** - Gebruikt items en prijzen uit offerte indien beschikbaar
- 🆕 **Voorraad items** - Converteert benodigde materialen naar factuur items met prijzen

**3. UX Verbeteringen**
- 🆕 **Bevestigingsmelding** - Duidelijke melding wanneer factuur is aangemaakt
- 🆕 **Direct zichtbaar** - Factuur verschijnt direct in Boekhouding module
- 🆕 **Volledig traceerbaar** - Alle links en geschiedenis behouden
- 🆕 **Geen handmatige actie nodig** - Volledig automatisch proces

**Technische Updates:**
- 🆕 `setInvoices` prop toegevoegd aan WorkOrders component
- 🆕 `convertCompletedWorkOrderToInvoice()` functie geïmplementeerd
- 🆕 Helper functies voor factuurnummer generatie
- 🆕 Factuur history tracking
- 🆕 Automatische trigger in `updateStatus()` bij status 'Completed'

**Workflow:**
```
Werkorder Voltooid
  ↓
Voorraad Afgetrokken
  ↓
Automatisch Factuur Aangemaakt/Bijgewerkt
  ↓
Factuur Klaar in Boekhouding Module
  ↓
Verzenden en Betaling Registreren
```

**Voordelen:**
- ✅ **Tijd besparen** - Geen handmatige factuur aanmaak meer nodig
- ✅ **Minder fouten** - Automatische berekeningen en koppelingen
- ✅ **Volledige traceerbaarheid** - Alle links behouden
- ✅ **Werkelijke uren** - Facturen bevatten echte gewerkte tijd
- ✅ **Seamless workflow** - Van werkorder naar factuur in één stap

### Versie 4.7.0 🆕 **CRM FACTUREN & HRM PERSOONLIJK DOSSIER**

**Nieuwe Features:**

**1. CRM - Facturen in Klantoverzicht**
- 🆕 **Financiën modal** - Klik op klant → Financiën → Zie alle facturen en offertes
- 🆕 **Filter op betaalde en openstaande facturen** - Alleen relevante facturen getoond
- 🆕 **Factuur acties in tabel:**
  - ✏️ Bewerken - Open factuur in edit modal met volledige items/labor beheer
  - 📋 Clonen - Maak kopie met nieuw nummer en datum
  - 📤 Naar Werkorder - Converteer naar werkorder met user selectie
- 🆕 **Clone modal** - Volledig bewerkbare formulieren (klant, items, labor, datums)
- 🆕 **Edit modal** - Bewerk bestaande facturen met items/labor wijzigingen
- 🆕 **User selectie modal** - Kies medewerker voor werkorder toewijzing

**2. HRM - Gebruikersbeheer Uitbreidingen**
- 🆕 **Wachtwoord veld** - Stel wachtwoord in bij nieuwe medewerker
- 🆕 **Admin checkbox** - Vink aan voor admin rechten bij nieuwe medewerker
- 🆕 **Bewerk functionaliteit** - Volledig medewerker bewerken (naam, functie, email, telefoon, wachtwoord, admin)
- 🆕 **Persoonlijk dossier** - Klik "📋 Dossier" knop om dossier te openen
- 🆕 **Notities systeem** met 8 types:
  - ⏰ Te laat (geel)
  - ❌ Afwezig (rood)
  - 🎯 Milestone (blauw)
  - 📊 Prestatie (paars)
  - ⚠️ Waarschuwing (oranje)
  - ⭐ Compliment (groen)
  - ✅ Aanwezigheid (teal)
  - 📝 Algemeen (grijs)
- 🆕 **Notities toevoegen** - Admin kan notities toevoegen met type, datum, titel en beschrijving
- 🆕 **Notities verwijderen** - Admin kan notities verwijderen
- 🆕 **Timeline weergave** - Notities gesorteerd op datum (nieuwste eerst)
- 🆕 **Admin badge** - 👑 badge bij medewerkers met admin rechten

**Technische Updates:**
- 🆕 `EmployeeNote` en `EmployeeNoteType` types toegevoegd
- 🆕 `Employee.notes` array voor persoonlijk dossier
- 🆕 `Employee.isAdmin` veld toegevoegd
- 🆕 Props uitgebreid in CRM voor werkorders, inventory, setInvoices
- 🆕 Helper functies voor factuur beheer in CRM
- 🆕 Clone/edit modals met volledige items/labor beheer

**UX Verbeteringen:**
- ✅ Direct toegang tot facturen vanuit klantoverzicht
- ✅ Filter op relevante facturen (betaald/openstaand)
- ✅ Snelle acties (bewerken, clonen, werkorder) bij elke factuur
- ✅ Volledig dossier systeem voor HR tracking
- ✅ Visuele badges voor admin rechten
- ✅ Kleurgecodeerde notities voor snelle herkenning

### Versie 4.6.0 🆕 **CLONE FUNCTIONALITEIT VOOR OFFERTES & FACTUREN**

**Nieuwe Features:**

**1. Offerte Clonen**
- 🆕 **"Clonen" knop** bij elke offerte
- 🆕 **Automatisch nieuw ID** - Krijgt uniek Q-nummer (Q1234 wordt Q5678)
- 🆕 **Automatische datum** - Aanmaakdatum wordt op vandaag gezet
- 🆕 **Aanpasbaar tijdens clonen:**
  - Wijzig klant
  - Pas items aan (toevoegen/verwijderen)
  - Wijzig hoeveelheden en prijzen
  - Update notities
  - Wijzig geldigheidsdatum
- 🆕 **Status reset** - Geclonede offerte krijgt status "draft"
- 🆕 **Geen werkorder koppeling** - Werkorder link wordt niet meegekopieerd

**2. Factuur Clonen**
- 🆕 **"Clonen" knop** bij elke factuur
- 🆕 **Automatisch nieuw factuurnummer** - Krijgt volgend beschikbaar nummer (2025-001, 2025-002, etc.)
- 🆕 **Datum aanpassing** - Factuurdatum wordt vandaag, vervaldatum +14 dagen
- 🆕 **Aanpasbaar tijdens clonen:**
  - Wijzig klant
  - Pas items aan (toevoegen/verwijderen)
  - Wijzig hoeveelheden en prijzen
  - Update betalingsvoorwaarden
  - Wijzig datums
  - Update notities
- 🆕 **Status reset** - Geclonede factuur krijgt status "draft"
- 🆕 **Geen koppelingen** - Offerte en werkorder links worden niet meegekopieerd
- 🆕 **Betalingsdatum wissen** - Geclonede factuur heeft geen betaaldatum

**UI Implementatie:**
- 🆕 **Clone knop in card** - Groene 📋 knop bij elke offerte/factuur
- 🆕 **Clone formulier** - Identiek aan aanmaak formulier maar vooraf ingevuld
- 🆕 **Visuele feedback** - Succesbericht na clonen met nieuw nummer
- 🆕 **Scroll naar nieuw item** - Automatisch scrollen naar geclonede offerte/factuur

**Gebruik Cases:**
- ✅ **Terugkerende klanten** - Clone vorige offerte voor nieuwe opdracht
- ✅ **Standaard offertes** - Maak template offerte en clone voor elke klant
- ✅ **Factuur correcties** - Clone en pas aan in plaats van origineel wijzigen
- ✅ **Seizoenswerk** - Clone offerte van vorig jaar en update prijzen
- ✅ **Snelle duplicatie** - Bespaar tijd bij vergelijkbare opdrachten

**Backend Wijzigingen:**
- 🆕 `cloneQuote()` functie in AccountingNew.tsx
- 🆕 `cloneInvoice()` functie in AccountingNew.tsx
- 🆕 Automatische ID generatie logica
- 🆕 Datum reset functionaliteit
- 🆕 Link stripping (werkorder/offerte koppelingen)

**UX Verbeteringen:**
- 🆕 **Eenvoudige workflow** - Één klik op Clone, bewerk indien nodig, opslaan
- 🆕 **Geen fouten** - Automatische validatie zoals bij nieuwe offerte/factuur
- 🆕 **Volledig aanpasbaar** - Alle velden zijn bewerkbaar
- 🆕 **Consistente nummering** - Volgt bestaande nummer schema's

### Versie 4.5.0 (Huidige Versie) 📱 **VOLLEDIGE MOBILE OPTIMALISATIE**

**Mobile-First Features:**

**1. Hamburger Menu & Sidebar**
- 🆕 **Responsive hamburger menu** op schermen < 1024px
- 🆕 **Slide-in sidebar animatie** vanaf links met overlay
- 🆕 **Auto-close functionaliteit** - sidebar sluit bij navigatie en bij click buiten
- 🆕 **Touch-optimized** met grote knoppen en smooth transitions
- 🆕 **Z-index layering** - overlay (z-40), sidebar (z-50)

**2. Responsive Header**
- 🆕 **Compact design** op mobile met flexibele layout
- 🆕 **Hamburger icoon** links voor sidebar toggle
- 🆕 **Responsive notificatie dropdown** - full-width op mobile
- 🆕 **Adaptive user menu** - verberg details op kleine schermen
- 🆕 **Touch-friendly buttons** met 44x44px minimum size

**3. Login Scherm Verbeteringen**
- 🆕 **Responsive layout** met aangepaste padding en font sizes
- 🆕 **Touch-optimized inputs** met 16px font (voorkomt iOS zoom)
- 🆕 **Active states** voor directe tap feedback
- 🆕 **Compacte demo knoppen** op kleine schermen

**4. Mobile-First CSS**
- 🆕 **index.css met mobile optimalisaties:**
  - Tap highlight color disabled
  - Smooth scrolling op iOS
  - Touch-friendly form inputs
  - Responsive table scrolling
  - Performance optimized shadows
  - Custom scrollbars
  - Safe area support voor notched devices
  - Reduced motion support
  - Print styles

**5. Responsive Breakpoints**
- 🆕 **sm**: 640px (smartphones landscape)
- 🆕 **md**: 768px (tablets portrait)
- 🆕 **lg**: 1024px (tablets landscape/laptops)
- 🆕 **xl**: 1280px (desktops)

**UX Verbeteringen:**
- ✅ **Één hand bediening** mogelijk op smartphones
- ✅ **Touch gestures** voor natuurlijke navigatie
- ✅ **No zoom inputs** - voorkomt iOS zoom bij focus
- ✅ **Smooth animaties** met hardware acceleration
- ✅ **Adaptive layouts** voor portrait/landscape
- ✅ **Accessible** met focus states en reduced motion

**Developer Experience:**
- ✅ **Tailwind responsive utilities** overal consistent
- ✅ **Mobile-first approach** - start met mobile, schaal op
- ✅ **Component-level responsive props** voor betere controle
- ✅ **CSS custom properties** voor theming
- ✅ **Performance optimized** met lighter shadows op mobile

**Testing & Compatibility:**
- ✅ Getest op iPhone (portrait + landscape)
- ✅ Getest op Android (verschillende schermgroottes)
- ✅ Getest op iPad (portrait + landscape)
- ✅ Touch gestures werkend
- ✅ Formulieren zonder zoom
- ✅ Tabellen met horizontale scroll

**Technische Details:**
- State management voor sidebar toggle in App.tsx
- Props `isMobileOpen` en `onMobileClose` voor Sidebar
- Prop `onMobileMenuToggle` voor Header
- CSS transforms voor smooth slide-in animaties
- Fixed positioning met proper z-index stacking
- Tailwind utility classes voor alle responsive breakpoints

### Versie 4.4.0 🆕 **AUTOMATISCHE SWAP/REORDER FUNCTIONALITEIT**

**Nieuwe Features:**

**1. Intelligente Werkorder Herschikking**
- 🆕 **Automatische swap bij indexering** - Wanneer je indexnummer wijzigt, worden andere werkorders automatisch opgeschoven
- 🆕 **Conflictresolutie** - Als je indexnummer 2 naar 1 wijzigt, wordt de oude #1 automatisch #2
- 🆕 **Kettingreactie** - Bij meerdere conflicten worden alle getroffen werkorders netjes opgeschoven
- 🆕 **Per medewerker** - Swap werkt alleen binnen dezelfde medewerker (Jan's #1 blijft Jan's #1)
- 🆕 **Intelligente nummering** - Systeem zoekt automatisch eerste vrije nummer bij conflict
- 🆕 **Behoud uniekheid** - Geen dubbele indexnummers meer binnen één medewerker

**2. Verbeterde Gebruikerservaring**
- 🆕 **Realtime updates** - Zie direct de nieuwe volgorde na wijziging
- 🆕 **Geen handmatig herschikken** - Systeem regelt alles automatisch
- 🆕 **Voorkom fouten** - Onmogelijk om dubbele nummers te hebben
- 🆕 **Soepele workflow** - Verander prioriteiten zonder zorgen over conflicten

### Versie 4.3.0 **WERKORDER INDEXERING SYSTEEM**

**Nieuwe Features:**

**1. Werkorder Indexering & Sortering**
- 🆕 **Indexnummer veld** - Elk werkorder kan een indexnummer krijgen
- 🆕 **Handmatige nummering** - Kies zelf welk nummer je aan een werkorder wilt geven (1-999)
- 🆕 **Automatische nummering** - Laat veld leeg voor automatisch volgnummer
- 🆕 **Aanpasbaar na aanmaken** - Verander indexnummer later in edit modal
- 🆕 **Visuele badge** - Zie indexnummer als "#3" linksboven in werkorder card
- 🆕 **Automatische sortering** - Werkorders gesorteerd op indexnummer (laagste eerst)
- 🆕 **Prioritering systeem** - Geef belangrijke taken lage nummers (1, 2, 3) voor bovenaan

**2. UI Verbeteringen**
- 🆕 **Index badge** - Compacte #-nummer weergave linksboven elke card
- 🆕 **Optioneel veld** - Indexnummer niet verplicht, systeem wijst automatisch toe
- 🆕 **Smart defaults** - Nieuw nummer is altijd hoogste + 1
- 🆕 **Validatie** - Alleen positieve getallen toegestaan
- 🆕 **Tooltip hints** - Helptekst bij indexnummer veld

**Gebruik Cases:**
- ✅ **Prioriteit bepalen** - Taak #1 = hoogste prioriteit, komt bovenaan
- ✅ **Volgorde plannen** - Bepaal in welke volgorde taken uitgevoerd worden
- ✅ **Herschikken** - Pas nummers aan om volgorde te wijzigen
- ✅ **Overzicht behouden** - Consistente nummering per medewerker
- ✅ **Flexibiliteit** - Mix van handmatig en automatisch nummeren

**Technische Details:**
- 🆕 `sortIndex` veld toegevoegd aan WorkOrder type
- 🆕 Automatische berekening van volgend nummer
- 🆕 Sortering in useMemo hooks voor performance
- 🆕 Input validatie met number type

### Versie 4.2.0 🆕 **WERKORDERS GEGROEPEERD PER MEDEWERKER**

**Nieuwe Features:**

**1. Werkorders Groepering per Medewerker (Admin)**
- 🆕 **Gegroepeerd overzicht** - Bij "Alle medewerkers" krijgt elke medewerker een eigen sectie
- 🆕 **Employee Section Header** - Duidelijke header met naam, rol en avatar per medewerker
- 🆕 **Statistieken per medewerker** - Zie direct aantal taken per status per persoon
- 🆕 **4 Kanban kolommen per medewerker** - To Do, In Wacht, In Uitvoering, Afgerond
- 🆕 **Visuele scheiding** - Duidelijk onderscheid tussen verschillende medewerkers

**UX Verbeteringen:**
- 🆕 **Voor Admins:** Direct overzicht van werklastverdeling
- 🆕 **Werklastverdeling** - Eenvoudig zien wie veel/weinig werk heeft
- 🆕 **Planning optimalisatie** - Snel identificeren wie beschikbaar is
- 🆕 **Monitoring per persoon** - Gedetailleerd volgen van voortgang per medewerker

**Voordelen:**
- ✅ **Overzichtelijk** - Geen lange lijst meer, maar gestructureerd per persoon
- ✅ **Efficiënt** - Sneller beslissingen nemen over taakverdeling
- ✅ **Transparant** - Iedereen ziet wie wat doet
- ✅ **Schaalbaar** - Werkt met onbeperkt aantal medewerkers

### Versie 4.1.0 🆕 **HISTORY VIEWER & AUDIT TRAIL**

**Nieuwe Features:**

**1. History Viewer Component**
- 🆕 **HistoryViewer component** voor volledige transparantie
- 🆕 **Timestamp summary sectie** met belangrijkste tijdstippen
- 🆕 **Relatieve tijd weergave** ("2 dagen geleden", "5 uur geleden")
- 🆕 **Hover functie** - toon exacte timestamp bij hover
- 🆕 **Uitklapbare geschiedenis** met alle wijzigingen
- 🆕 **Iconen per actie** (🆕 created, 👤 assigned, 📊 status_changed, etc.)

**2. Timestamp Tracking**
- 🆕 **Created timestamp** - wanneer werkorder is aangemaakt
- 🆕 **Converted timestamp** - wanneer vanuit offerte/factuur geconverteerd
- 🆕 **Assigned timestamp** - wanneer toegewezen (en hertoewijzingen)
- 🆕 **Started timestamp** - wanneer status naar "In Progress" ging
- 🆕 **Completed timestamp** - wanneer werkorder is afgerond

**3. History Entries (Audit Trail)**
- 🆕 **Created entry** - wie heeft werkorder aangemaakt
- 🆕 **Converted entry** - conversie van offerte/factuur met details
- 🆕 **Assigned entry** - toewijzing met van/naar informatie
- 🆕 **Status changed entry** - alle status wijzigingen met oude/nieuwe status
- 🆕 **Reassignment tracking** - hertoewijzingen volledig gelogd

**4. UI Implementaties**
- 🆕 **History Viewer in WorkOrderCard** - onderaan elke card
- 🆕 **History Viewer in Edit Modal** - volledige geschiedenis bij bewerken
- 🆕 **Compacte timestamp grid** - 2-kolommen layout
- 🆕 **Uitklap animatie** - smooth transition met pijl icoon
- 🆕 **Scroll functionaliteit** - max height 260px voor lange histories

**5. Smart Time Formatting**
- 🆕 **Zojuist** - <1 minuut geleden
- 🆕 **X min geleden** - recente wijzigingen (<60 min)
- 🆕 **X uur geleden** - vandaag (<24 uur)
- 🆕 **Gisteren** - 1 dag geleden
- 🆕 **X dagen geleden** - deze week (<7 dagen)
- 🆕 **Volledige datum** - oudere wijzigingen (22 okt 2024, 14:30)

**Backend Wijzigingen:**
- 🆕 `timestamps` object in WorkOrder type
- 🆕 `history` array in WorkOrder type
- 🆕 `WorkOrderHistoryEntry` interface
- 🆕 `assignedBy` en `convertedBy` velden
- 🆕 Automatische history entry creatie bij alle acties
- 🆕 Timestamp updates bij status wijzigingen

**UX Verbeteringen:**
- 🆕 **Voor Medewerkers:** Zie direct wanneer taken zijn toegewezen en gestart
- 🆕 **Voor Admins:** Volledige audit trail van alle wijzigingen
- 🆕 **Voor het Bedrijf:** Compliance en traceerbaarheid gegarandeerd
- 🆕 **Visuele feedback:** Duidelijke iconen en kleuren per actie type

**Voordelen:**
- ✅ **Transparantie** - Iedereen ziet de volledige tijdlijn
- ✅ **Verantwoordelijkheid** - Wie heeft wat wanneer gedaan is altijd duidelijk
- ✅ **Analyse** - Identificeer bottlenecks in werkorder doorlooptijd
- ✅ **Communicatie** - Duidelijke geschiedenis voor klantcommunicatie
- ✅ **Compliance** - Voldoe aan audit vereisten met volledige logging

### Versie 4.0.0 🆕 **WERKORDER INTEGRATIE**

**Nieuwe Features:**

**1. Offerte/Factuur → Werkorder Conversie**
- 🆕 **"📋 Maak Werkorder" knop** bij geaccepteerde offertes
- 🆕 **"📋 Maak Werkorder" knop** bij verzonden facturen
- 🆕 **Automatische werkorder generatie:**
  - Titel: "[Klant] - [Offerte/Factuur titel]"
  - Klant automatisch gekoppeld
  - Items → Benodigde materialen
  - Werkuren → Geschatte tijd
  - Status: To Do
  - Referentie naar bron behouden

**2. Real-time Status Tracking**
- 🆕 **Live status badges** in offertes en facturen:
  - 🔵 "Werkorder: To Do"
  - 🟡 "Werkorder: In Wacht"
  - 🟢 "Werkorder: In Uitvoering"
  - ✅ "Werkorder: Voltooid"
- 🆕 **Klikbare badges** → Spring naar werkorder
- 🆕 **Automatische updates** bij status wijzigingen
- 🆕 **Visuele indicatoren:**
  - Groene border bij voltooide werkorders
  - Status icon in header

**3. Bidirectionele Synchronisatie**
- 🆕 **"✏️ Bewerk & Update Werkorder" knop**
- 🆕 **Live sync functies:**
  - Items toevoegen/verwijderen → Materialen bijgewerkt
  - Werkuren aanpassen → Geschatte tijd aangepast
  - Notities wijzigen → Werkorder notities gesynchroniseerd
- 🆕 **Smart validation:**
  - Voorraad controle bij materiaal toevoeging
  - Waarschuwing bij actieve werkorder
  - Blokkade bij voltooide werkorder

**4. Voltooiings Workflow**
- 🆕 **Voltooiings badge** met groene checkmark
- 🆕 **Uren vergelijking:**
  - Geschatte uren vs Gewerkte uren
  - Percentage verschil
  - Kleurcodering (groen/oranje/rood)
- 🆕 **Materiaalverbruik tracking:**
  - Gepland vs Gebruikt
  - Afwijkingen weergave
  - Voorraad automatisch bijgewerkt

**5. Nieuwe UI Componenten**
- 🆕 Status badge component met kleuren
- 🆕 Werkorder info sectie in offertes/facturen
- 🆕 Synchronisatie knoppen en iconen
- 🆕 Progress indicators
- 🆕 Tijdlijn weergave (offerte → werkorder → voltooiing)

**Backend Wijzigingen:**
- 🆕 Nieuwe relatie: `Quote.workOrderId` en `Invoice.workOrderId`
- 🆕 Nieuwe relatie: `WorkOrder.quoteId` en `WorkOrder.invoiceId`
- 🆕 Sync functionaliteit in state management
- 🆕 Bidirectionele updates tussen modules
- 🆕 Voorraad validatie bij conversie

**UX Verbeteringen:**
- 🆕 Één-klik conversie workflow
- 🆕 Real-time visuele feedback
- 🆕 Intuïtieve status badges
- 🆕 Direct navigatie tussen gekoppelde items
- 🆕 Duidelijke waarschuwingen en blokkades

**Technische Updates:**
- 🆕 TypeScript types uitgebreid met koppelingen
- 🆕 Nieuwe helper functies voor synchronisatie
- 🆕 Event listeners voor status updates
- 🆕 Validation logic voor conflicten

### Versie 3.2.0 🆕 **FACTUREN MODULE**
**Nieuwe Features:**
- ✅ **Volledig factuurbeheer systeem**
- ✅ **Automatische factuurnummer generatie** (2025-001, 2025-002, etc.)
- ✅ **Offerte naar factuur conversie** met één klik
- ✅ **Factuur statistieken dashboard** (4 KPI cards)
- ✅ **Status beheer**: Draft → Sent → Paid (of Overdue)
- ✅ **Betalings tracking** met automatische datum registratie
- ✅ **Verlopen facturen detectie** met visuele waarschuwing
- ✅ **Handmatig facturen aanmaken** zonder offerte
- ✅ **Link naar originele offerte** behouden bij conversie
- ✅ **Betalingsvoorwaarden** per factuur (14/30 dagen)

**Factuur Dashboard:**
- Totaal Gefactureerd (€ en aantal)
- Betaald (€ en aantal)
- Uitstaand (€ en aantal)
- Verlopen (€ en aantal)

**Factuur Status Flow:**
```
Draft → Sent → Paid
         ↓
      Overdue → Paid
         ↓
    Cancelled
```

**Nieuwe Types & Interfaces:**
- `Invoice` interface met alle velden
- `InvoiceStatus` type (draft/sent/paid/overdue/cancelled)
- Mock facturen data (3 voorbeelden)

**State Management:**
- `invoices` state in App.tsx
- `setInvoices` voor updates
- Props doorgifte naar Accounting component

**Accounting Module Updates:**
- Nieuwe tab "🧾 Facturen"
- Factuur formulier (vergelijkbaar met offertes)
- Conversie knop bij geaccepteerde offertes
- Status update knoppen per factuur
- Delete functionaliteit

### Versie 3.1.0
**Offerte Module Volledig Uitgebreid:**
- ✅ **Items uit voorraad selecteren** - Dropdown met alle voorraad items inclusief SKU en prijzen
- ✅ **Custom items toevoegen** - Voor items die niet in voorraad staan
- ✅ **Werkuren toevoegen (optioneel)** - Uren, uurtarief en automatische berekening
- ✅ **BTW berekeningen** - Instelbaar BTW percentage (standaard 21%)
- ✅ **Duidelijke prijsweergave** - Subtotaal (excl. BTW), BTW bedrag, Totaal (incl. BTW)
- ✅ **Real-time berekeningen** - Automatische updates bij wijzigingen
- ✅ **Voorraad integratie** - Items uit voorraad hebben nu verkoopprijzen
- ✅ **Eenheden beheer** - Stuk, meter, kg, liter, m², doos voor voorraad items
- ✅ **Verbeterde offerte weergave** - Duidelijk onderscheid tussen items en werkuren

**Voorraad Verbeteringen:**
- ✅ **Prijzen per voorraad item** - Verkoopprijs per eenheid toegevoegd
- ✅ **Eenheid selectie** - 6 standaard eenheden beschikbaar
- ✅ **Prijs weergave in tabel** - €XX.XX per eenheid
- ✅ **Offertes koppeling** - Voorraad items direct selecteerbaar bij offerte maken

### Versie 3.0.0
**CRM Module Volledig Vernieuwd:**
- ✅ Dashboard met KPIs en real-time statistieken
- ✅ Lead Management met 7-fase pipeline systeem
- ✅ Interactie Tracking met volledige communicatie geschiedenis
- ✅ Lead Conversie - automatisch leads naar klanten converteren
- ✅ Follow-up Systeem met herinneringen
- ✅ Herkomst Tracking voor leads/klanten
- ✅ Pipeline Waarde tracking
- ✅ Activiteiten Timeline

### Versie 2.2.0
**Nieuwe Features:**
- ✅ "To Do" Status voor werkorders
- ✅ 4-kolommen Kanban Board
- ✅ Verbeterde Workflow
- ✅ Optionele Wachtstatus met checkbox
- ✅ Dubbele Actie Knoppen (Start/Wacht)

### Versie 2.1.0
**Nieuwe Features:**
- ✅ Materiaalbeheer in Werkorders
- ✅ Materialen toewijzen bij werkorders
- ✅ Automatische voorraad controle
- ✅ Voorraad aftrek bij voltooiing
- ✅ Visuele voorraad indicatoren

### Versie 2.0.0
**Nieuwe Features:**
- ✅ Login systeem met authenticatie
- ✅ Gebruikersrollen (admin/user)
- ✅ Persoonlijk workboard per gebruiker
- ✅ Kanban-stijl werkbeheer
- ✅ Uren registratie per taak
- ✅ Collega taken bekijken
- ✅ Notificaties systeem
- ✅ Offertes management
- ✅ Taken module in CRM
- ✅ Planning & Agenda module
- ✅ Uitgebreide rapportages (4 types)

### Versie 5.1.0 🆕 **BATCH OPERATIONS & UX VERBETERINGEN**
**Nieuwe Features:**
- ✅ **Batch Operations voor Offertes** - Selecteer meerdere offertes en voer bulk acties uit:
  - Meerdere offertes omzetten naar werkorders
  - Meerdere concept offertes verzenden
  - Visuele selectie met checkboxes
  - Teller met aantal geselecteerde items
- ✅ **Batch Operations voor Facturen** - Selecteer meerdere facturen en voer bulk acties uit:
  - Meerdere facturen als betaald markeren
  - Meerdere concept facturen verzenden
  - Visuele selectie met checkboxes
  - Teller met aantal geselecteerde items
- ✅ **Verbeterde Werkorder Detail Modal** - Volledig herontworpen met:
  - Visuele blokken/cards voor duidelijke structuur
  - Contextuele iconen voor snelle herkenning
  - Betere typografie en kleuren hiërarchie
  - Fade-in en slide-in animaties
  - Click-outside-to-close functionaliteit
  - Verbeterde button styling met iconen
- ✅ **Fix voor Werkorder Klik Functionaliteit** - Alle statussen (To Do, In Wacht, In Uitvoering, Afgerond) kunnen nu worden geklikt om details te zien
- ✅ **POS Verbetering** - Handmatig item prijsveld gebruikt nu placeholder in plaats van vaste "0" waarde
- ✅ **Header Fix** - JSX structuur gecorrigeerd voor betere compatibiliteit

**UX Verbeteringen:**
- ✅ Visuele hiërarchie met cards en subtiele schaduwen
- ✅ Contextuele iconen (📋, 👤, 🏢, 🗓️, 📍, ⏱️, 💰, 📝, ⚠️, 🧱, 🕒, 📄, 📎)
- ✅ Emotionele beleving met zachte achtergrondtinten en afgeronde hoeken
- ✅ Interactie & focus met animaties en betere knoppen
- ✅ Batch selectie modus met duidelijke visuele feedback

**Technische Updates:**
- ✅ Nieuwe `ContextualRelatedItems` component voor gerelateerde items
- ✅ Nieuwe `UnifiedSearch` component voor globale zoekfunctionaliteit
- ✅ Nieuwe `smartNotifications` utility voor contextuele notificaties
- ✅ Nieuwe `workflowValidation` utility voor workflow guardrails
- ✅ CSS animaties voor modal fade-in en slide-in effecten
- ✅ Verbeterde event handling met stopPropagation voor betere UX

### Versie 1.0.0
- Basis modules (Dashboard, Inventory, POS, etc.)
- Admin instellingen
- CRUD operaties
- Mock data

---

## 🎯 Quick Start Guide

### Snel aan de slag in 3 stappen:

1. **Installeer en start**:
   ```bash
   npm install && npm run dev
   ```

2. **Login als Admin**:
   - Email: sophie@bedrijf.nl
   - Wachtwoord: 1234

3. **Verken de modules**:
   - Dashboard → Zie overzicht
   - Werkorders → Beheer taken (volledig overzicht)
   - **Facturen en Offerte** → Offertes & Facturen
   - **Boekhouding & Dossier** → Grootboek, BTW-aangifte, Journaal, Dossiers
   - Admin Instellingen → Schakel modules in/uit
   - **Admin Instellingen → Systeem Analytics** → Data-driven optimalisatie dashboard
   - **Admin Instellingen → Database Diagnostics** → Database health monitoring

**Of login als User** (jan@bedrijf.nl / 1234) om het persoonlijke workboard te testen!

### Werkorder Integratie Demo Flow 🆕 **NIEUW IN V4.0**

**Probeer de volledige werkorder integratie:**

1. **Login als Admin** (sophie@bedrijf.nl / 1234)
2. **Ga naar Boekhouding, Offertes & Facturen**
3. **Tab "Offertes":**
   - Zoek offerte Q001 (status: Geaccepteerd)
   - Klik oranje knop **"📋 Maak Werkorder"**
   - Werkorder WO001 is aangemaakt!
4. **Bekijk Status Badge:**
   - Offerte toont nu: 🔵 "Werkorder: To Do"
   - Klik op badge → Spring naar workboard
5. **Ga naar Werkorders Module:**
   - Zie nieuwe taak in "To Do" kolom
   - Klik "▶ Start Werkorder"
6. **Terug naar Offertes:**
   - Badge is nu: 🟢 "Werkorder: In Uitvoering"
   - Real-time update!
7. **Tussentijdse Aanpassing:**
   - Klik **"✏️ Bewerk & Update Werkorder"**
   - Voeg extra materiaal toe
   - Klik "💾 Opslaan & Update Werkorder"
   - Check workboard → Materiaal is toegevoegd!
8. **Voltooiing:**
   - Ga naar workboard
   - Voltooi werkorder
   - Terug naar offerte: ✅ "Werkorder: Voltooid"
   - Groene border verschijnt!
9. **Facturatie:**
   - Klik "🧾 Omzetten naar Factuur"
   - Factuur bevat gewerkte uren (niet geschat)
   - Link naar werkorder behouden

### Facturen Demo Flow (Basis)

**Probeer de volledige factuur workflow:**

1. **Login als Admin** (sophie@bedrijf.nl / 1234)
2. **Ga naar Boekhouding, Offertes & Facturen**
3. **Klik op tab "Offertes"**
4. **Zoek offerte Q001** (status: Geaccepteerd)
5. **Klik paarse knop** "🧾 Omzetten naar Factuur"
6. **Zie nieuwe factuur** in Facturen tab (2025-001 of volgende nummer)
7. **Update status**: Draft → Verzenden → Betaald
8. **Bekijk statistieken** bovenaan pagina

**Of maak handmatig factuur:**
1. Klik "+ Nieuwe Factuur"
2. Selecteer klant en datums
3. Voeg items/werkuren toe
4. Sla op en beheer

---

## 📞 Support & Contact

Voor vragen, bugs of feature requests:
- Open een issue in het project repository
- Contacteer het development team
- Raadpleeg de documentatie

---

## 📄 Licentie

Dit project is ontwikkeld voor intern gebruik. Alle rechten voorbehouden.

---

**Laatste update**: December 2024  
**Versie**: 5.4.0 (Kassa Verkopen Tab & Klikbare Facturen met Clone)
**Status**: Productie-ready met intelligente werkorder herschikking, volledige werkorder synchronisatie, transparante audit trail, gegroepeerd overzicht, conflictvrije prioritering, **volledig responsive mobile-first design**, **factuurbeheer vanuit CRM**, **persoonlijk dossier systeem**, **automatische factuur generatie bij voltooide werkorders**, **Lean Six Sigma analytics dashboard**, **database diagnostics systeem**, **volledig webshop beheer systeem met producten, categorieën en bestellingen**, **batch operations voor offertes en facturen**, **verbeterde UX/UI met moderne modal design**, **volledig boekhouding & dossier systeem (MKB-ready, NL-compliant)**, **compacte/uitgebreide werkorder weergave toggle**, en **kassa verkopen tab met klikbare facturen en clone functionaliteit**

---

**Veel succes met het Bedrijfsbeheer Dashboard! 🚀**

**✨ Nieuw in V5.4: Kassa Verkopen Tab & Klikbare Facturen - zie alle kassa transacties apart en clone facturen/offertes! 🛒 ✨**
**✨ Kassa Verkopen tab - apart overzicht van alle direct betaalde verkopen! ✨**
**✨ Klikbare facturen - zie volledige details zonder te bewerken! ✨**
**✨ Clone functionaliteit - dupliceer facturen/offertes voor terugkerende klanten! ✨**
**✨ Nieuw in V5.3: Compacte Werkorder Weergave - schakel tussen compact en uitgebreid voor optimaal overzicht! 📋 ✨**
**✨ Compacte view: alleen omschrijving - zie meer werkorders tegelijk! ✨**
**✨ Uitgebreide view: alle details - volledige informatie wanneer nodig! ✨**
**✨ Beide klikbaar - details altijd toegankelijk via dubbelklik! ✨**
**✨ Nieuw in V5.2: Boekhouding & Dossier Module - volledig digitaal boekhouddossier, grootboek, BTW-aangifte en journaal! 📊 ✨**
**✨ MKB-Ready grootboekrekeningen met automatische journaalposten! ✨**
**✨ BTW-overzicht aangifte-ready met automatische berekening per periode! ✨**
**✨ Volledig digitaal dossier per klant/leverancier - alles op één plek! ✨**
**✨ Nieuw in V5.1: Batch Operations & UX Verbeteringen - werk efficiënter met bulk acties en verbeterde gebruikerservaring! 🎯 ✨**
**✨ Batch selectie voor offertes en facturen - voer meerdere acties tegelijk uit! ✨**
**✨ Volledig herontworpen werkorder detail modal met moderne card-based design! ✨**
**✨ Verbeterde klikfunctionaliteit - alle werkorder statussen zijn nu volledig interactief! ✨**
**✨ Nieuw in V5.0: Webshop Module - volledig e-commerce beheer systeem met producten, categorieën en bestellingen! 🛒 ✨**
**✨ Product beheer met automatische slug/SKU generatie, SEO velden, en inventory koppeling! ✨**
**✨ Hiërarchisch categorieën systeem met multi-categorie support! ✨**
**✨ Bestellingen beheer met volledige order tracking en status management! ✨**
**✨ Nieuw in V4.9: Database Diagnostics Dashboard - monitor database health voor Supabase, NeonDB, PlanetScale en meer! 🗄️ ✨**
**✨ Nieuw in V4.8: Voltooide werkorders worden automatisch omgezet naar facturen - geen handmatige actie meer nodig! ✨**
**✨ Nieuw in V4.7: Facturen vanuit klantoverzicht beheren - bewerk, clone en stuur naar werkorder! ✨**
**✨ Persoonlijk dossier per medewerker - track te laat komen, milestones en meer! ✨**
**✨ V4.6: Clone functionaliteit - dupliceer offertes en facturen met één klik! ✨**
**✨ V4.5: Volledig responsive design - werk overal, altijd, op elk apparaat! 📱 ✨**
**✨ Hamburger menu, touch-optimized, perfect voor monteurs in het veld! ✨**
**✨ V4.4: Automatische swap/reorder - wijzig indexnummers zonder conflicten! ✨**
**✨ V4.3: Werkorder indexering - prioriteer en sorteer taken met nummers! ✨**
**✨ V4.2: Werkorders gegroepeerd per medewerker - direct overzicht van werklastverdeling! ✨**
**✨ V4.1: Volledige transparantie met History Viewer - zie precies wie wat wanneer heeft gedaan! ✨**
**✨ V4.0: Van offerte tot voltooiing - alles gekoppeld en gesynchroniseerd! ✨**
