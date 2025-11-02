# 👥 Nieuwe Klant Aanmaken - Handleiding

## ✅ Functionaliteit Beschikbaar in CRM Module

De CRM module heeft een **volledige klantenbeheer functionaliteit** waarmee admins eenvoudig nieuwe klanten kunnen toevoegen aan het systeem.

---

## 🚀 Snel Overzicht

**Locatie:** CRM Module → Tab "👥 Klanten"  
**Toegang:** Alleen voor Admins  
**Knop:** "+ Nieuwe Klant" (rechtsboven)

---

## 📝 Stap-voor-Stap Instructies

### Stap 1: Naar CRM Module
1. Log in als **Admin** (sophie@bedrijf.nl / 1234)
2. Klik op **"CRM - Klantrelatiebeheer"** in de sidebar
3. Selecteer tab **"👥 Klanten"** bovenaan

### Stap 2: Nieuwe Klant Formulier Openen
1. Klik op de groene knop **"+ Nieuwe Klant"** rechtsboven
2. Formulier klapt uit met alle benodigde velden

### Stap 3: Verplichte Velden Invullen

**Naam** * (verplicht)
- Voor- en achternaam van de klant
- Of bedrijfsnaam bij zakelijke klanten
- Voorbeeld: "Jan de Vries" of "Bouwbedrijf Amsterdam"

**Email** * (verplicht)
- Email adres van de klant
- Uniek per klant
- Voorbeeld: jan@bouwbedrijf.nl

### Stap 4: Optionele Velden Invullen

**Telefoon** (optioneel)
- Telefoonnummer
- Voorbeeld: 06-12345678 of 020-1234567

**Type** (verplicht - standaard: zakelijk)
- 🏢 **Zakelijk** - Voor B2B klanten
- 👤 **Particulier** - Voor consumenten/particulieren

**Bedrijf** (optioneel)
- Bedrijfsnaam (vooral relevant bij zakelijke klanten)
- Verschijnt prominent in klant card
- Voorbeeld: "Bouwbedrijf de Vries BV"

**Bron** (verplicht - standaard: website)
- Waar komt de klant vandaan?
- Opties:
  - **website** - Via online kanalen
  - **referral** - Doorverwijzing door bestaande klant
  - **cold-call** - Telefonische acquisitie
  - **advertisement** - Via advertenties
  - **event** - Op evenement/beurs ontmoet
  - **partner** - Via business partner
  - **other** - Overig

**Adres** (optioneel)
- Volledig adres van de klant
- Handig voor levering en facturatie
- Voorbeeld: "Hoofdstraat 123, 1234 AB Amsterdam"

### Stap 5: Klant Opslaan
1. Controleer of alle gegevens correct zijn ingevuld
2. Klik op de groene knop **"Toevoegen"**
3. Bevestiging verschijnt: klant is toegevoegd!

**Wat gebeurt er automatisch:**
- ✅ Uniek klant ID wordt toegekend (bijv. c1730458234567)
- ✅ "Klant sinds" datum wordt ingesteld op vandaag
- ✅ Klant verschijnt direct in de klanten grid
- ✅ Klant is beschikbaar in alle modules (POS, Werkorders, Offertes, etc.)

### Stap 6: Annuleren (optioneel)
- Klik op de grijze knop **"Annuleren"** om terug te gaan zonder op te slaan

---

## 📊 Klant Card Weergave

Na toevoegen zie je de nieuwe klant als een professionele card:

```
┌─────────────────────────────────────┐
│  [J]  Jan de Vries                  │
│  🏢 Zakelijk • Sinds 01-11-2024     │
│                                      │
│  🏢 Bedrijf: Bouwbedrijf de Vries   │
│  📧 jan@bouwbedrijf.nl              │
│  📞 06-12345678                      │
│  📍 Hoofdstraat 123, Amsterdam      │
│  📍 Bron: referral                  │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Omzet    Orders    Contact   │   │
│  │ €5.420     12        8       │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Verwijder Klant] (admin only)     │
└─────────────────────────────────────┘
```

**De card toont:**
- **Avatar** met eerste letter van naam
- **Naam** en **Type** (zakelijk/particulier)
- **Klant sinds** datum
- **Bedrijfsnaam** (indien ingevuld)
- **Contactgegevens** (email, telefoon, adres)
- **Bron** waar klant vandaan komt
- **Statistieken:**
  - **Omzet**: Totaal besteed bedrag (uit POS sales)
  - **Orders**: Aantal verkopen
  - **Contact**: Aantal interacties (calls, emails, meetings)

---

## 💡 Tips & Best Practices

### ✅ Voor Zakelijke Klanten
- Selecteer type **"Zakelijk"**
- Vul altijd **bedrijfsnaam** in (verschijnt prominent)
- Voeg **volledig adres** toe voor facturen/leveringen
- Noteer **bron** voor marketing analyse

### ✅ Voor Particuliere Klanten
- Selecteer type **"Particulier"**
- **Email is verplicht** voor communicatie
- **Telefoon handig** voor quick contact
- **Adres optioneel** (tenzij levering nodig)

### ✅ Lead Conversie (Automatisch)
Gewonnen leads worden **automatisch** klant:
1. Ga naar **CRM → Leads & Pipeline**
2. Zoek de lead die gewonnen is
3. Klik **"✓ Gewonnen"** of **"Converteer naar Klant"**
4. **Systeem doet automatisch:**
   - Maakt klant aan met alle lead gegevens
   - Kopieert alle interacties
   - Behoudt communicatie geschiedenis
   - Zet lead status op "Gewonnen"
5. **Klant direct beschikbaar** in alle modules!

### ⚠️ Validatie
- **Naam en Email zijn verplicht**
- Systeem controleert op lege velden
- Alert toont bij ontbrekende verplichte velden
- Formulier wordt niet verzonden zonder verplichte velden

---

## 🔧 Klant Bewerken

❌ **Let op:** Er is momenteel **geen directe edit functionaliteit** voor klanten

**Alternatieven:**
1. **Verwijder** oude klant
2. **Maak nieuwe** klant aan met correcte gegevens
3. Of: Voeg **notitie** toe in interacties met correcties

🔄 **Toekomst:** Edit functionaliteit staat op de roadmap voor toekomstige versie

---

## 🗑️ Klant Verwijderen

**Alleen voor Admins:**

1. Zoek de klant in de klanten grid
2. Scroll naar beneden in de klant card
3. Klik **"Verwijder Klant"** knop (rood)
4. Bevestig in popup: "Weet je zeker dat je deze klant wilt verwijderen?"
5. Klant wordt verwijderd

**⚠️ Let op - Wat gebeurt er:**
- ✅ Klant gegevens worden verwijderd
- ⚠️ **Orders blijven bestaan** (maar zonder klant koppeling)
- ⚠️ **Interacties blijven bestaan** (voor historie)
- ⚠️ **Taken blijven bestaan** (voor logging)

**⚠️ Waarschuwing:** Verwijderen is **permanent**! Overweeg goed voor je verwijdert.

---

## 🔗 Klant Gebruiken in Andere Modules

Na aanmaken is de klant **direct beschikbaar** in:

| Module | Gebruik |
|--------|---------|
| 💰 **POS** | Selecteer klant bij verkoop (dropdown) |
| 📋 **Werkorders** | Koppel klant aan werkorder (dropdown) |
| 📊 **Offertes** | Selecteer klant voor offerte (dropdown) |
| 🧾 **Facturen** | Kies klant voor facturatie (dropdown) |
| 💬 **CRM Interacties** | Log contactmomenten met klant |
| ✓ **CRM Taken** | Maak taken voor specifieke klant |

---

## 📚 Praktische Scenario's

### Scenario 1: Nieuwe Zakelijke Klant
```
Situatie: 
Bouwbedrijf belt voor offerte

Actie:
1. CRM → Klanten → + Nieuwe Klant
2. Invullen:
   - Naam: Jan de Vries
   - Email: jan@bouwbedrijf.nl
   - Telefoon: 06-12345678
   - Type: Zakelijk ✓
   - Bedrijf: Bouwbedrijf de Vries
   - Bron: cold-call ✓
   - Adres: Hoofdstraat 123, Amsterdam
3. Toevoegen
4. Direct offerte maken:
   Boekhouding → Offertes → Klant selecteren

Resultaat: 
✅ Klant in systeem
✅ Direct offerte kunnen maken
✅ Herkomst vastgelegd voor analyse
```

### Scenario 2: Particuliere Klant via Website
```
Situatie: 
Online contact formulier ingevuld

Actie:
1. CRM → Klanten → + Nieuwe Klant
2. Invullen:
   - Naam: Maria Jansen
   - Email: maria@gmail.com
   - Telefoon: 06-87654321
   - Type: Particulier ✓
   - Bron: website ✓
3. Toevoegen
4. Registreer contact:
   CRM → Interacties → + Nieuwe Interactie
   - Type: Email
   - Gekoppeld aan: Maria Jansen
   - Subject: "Vraag via website"

Resultaat:
✅ Klant geregistreerd
✅ Eerste contact vastgelegd
✅ Klaar voor follow-up
```

### Scenario 3: Lead wordt Klant (Automatisch)
```
Situatie: 
Lead heeft offerte geaccepteerd

Actie:
1. CRM → Leads & Pipeline
2. Zoek lead in "Negotiation" of "Proposal" fase
3. Klik "✓ Gewonnen"

Systeem doet automatisch:
- ✅ Maakt klant aan
- ✅ Kopieert alle gegevens
- ✅ Koppelt interacties
- ✅ Zet lead status op "Gewonnen"

Resultaat:
✅ Lead succesvol geconverteerd
✅ Klant direct beschikbaar in alle modules
✅ Historie behouden
✅ Ready voor facturatie
```

---

## ❓ Veelgestelde Vragen (FAQ)

**Q: Kan ik klantgegevens later wijzigen?**  
A: Momenteel niet direct. Je moet klant verwijderen en opnieuw aanmaken. Edit functie komt in toekomstige versie.

**Q: Wat gebeurt er met klant data bij verwijderen?**  
A: Klant wordt verwijderd, maar orders/interacties/taken blijven bestaan (zonder klant link).

**Q: Kan ik meerdere klanten tegelijk importeren?**  
A: Momenteel niet. Elke klant moet handmatig worden toegevoegd. Bulk import staat op roadmap.

**Q: Hoe weet ik of een klant al bestaat?**  
A: Zoek visueel in de klanten grid. Automatische duplicaat detectie komt in toekomstige versie.

**Q: Kan een medewerker (niet-admin) klanten toevoegen?**  
A: Nee, alleen admins kunnen klanten toevoegen/verwijderen voor data consistentie.

**Q: Wordt de "Klant sinds" datum automatisch ingevuld?**  
A: Ja, dit is altijd de datum van aanmaken (vandaag) en kan niet worden aangepast.

**Q: Kan ik klanten sorteren of filteren?**  
A: Momenteel niet in de UI. Alle klanten worden weergegeven in cards. Filter/zoek functie staat op planning.

**Q: Wat als ik een verkeerd email adres heb ingevuld?**  
A: Verwijder de klant en maak opnieuw aan met correct email adres.

**Q: Kan ik zien welke medewerker een klant heeft aangemaakt?**  
A: Momenteel niet, maar audit trail functionaliteit is gepland voor toekomstige versie.

**Q: Hoe koppel ik een klant aan een werkorder?**  
A: Bij aanmaken werkorder selecteer je de klant in de dropdown. Alle klanten zijn beschikbaar in deze lijst.

---

## 🎯 Snelle Referentie

### Verplichte Velden
- ✅ Naam
- ✅ Email

### Optionele maar Aanbevolen Velden
- 📞 Telefoon (handig voor contact)
- 🏢 Bedrijf (bij zakelijke klanten)
- 📍 Adres (voor levering/facturatie)
- 📍 Bron (voor marketing analyse)

### Type Opties
- 🏢 Zakelijk (B2B)
- 👤 Particulier (B2C)

### Bron Opties
- website
- referral
- cold-call
- advertisement
- event
- partner
- other

### Statistieken per Klant
- 💰 Omzet (uit POS sales)
- 📦 Orders (aantal verkopen)
- 💬 Contact (aantal interacties)

---

## 🚀 Next Steps

**Na klant aanmaken:**

1. **Maak Offerte**
   - Boekhouding → Offertes → + Nieuwe Offerte
   - Selecteer de nieuwe klant

2. **Registreer Interactie**
   - CRM → Interacties → + Nieuwe Interactie
   - Koppel aan klant

3. **Maak Taak**
   - CRM → Taken → + Nieuwe Taak
   - Koppel aan klant (optioneel)

4. **Start Verkoop**
   - POS → Selecteer klant
   - Verkoop producten

---

**Laatste update:** November 2025  
**Versie:** 4.5.0  
**Status:** ✅ Volledig Functioneel

**✨ Tip:** Gebruik lead conversie waar mogelijk - het is sneller en behoudt alle communicatie historie! ✨
