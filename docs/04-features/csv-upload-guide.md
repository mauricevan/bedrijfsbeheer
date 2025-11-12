# CSV Upload Handleiding - Bedrijfsbeheer 2.0

> **Versie:** 1.0  
> **Laatst bijgewerkt:** December 2024  
> **Auteur:** Bedrijfsbeheer Development Team

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Voorbeeld CSV Bestanden Downloaden](#voorbeeld-csv-bestanden-downloaden)
3. [CSV Bestand Voorbereiden](#csv-bestand-voorbereiden)
4. [CSV Uploaden](#csv-uploaden)
5. [Kolom Formaten](#kolom-formaten)
6. [Veelvoorkomende Fouten](#veelvoorkomende-fouten)
7. [Voor Developers](#voor-developers)

---

## 🎯 Overzicht

De CSV upload functionaliteit maakt het mogelijk om grote hoeveelheden data in één keer te importeren in het Bedrijfsbeheer systeem. Dit bespaart tijd bij:

- ✅ Initiële setup van voorraad
- ✅ Bulk import van klanten
- ✅ Meerdere medewerkers aanmaken
- ✅ Werkorders in bulk aanmaken

**Ondersteunde modules:**
- 📦 **Voorraad** (Inventory)
- 👥 **Klanten** (CRM)
- 👔 **Medewerkers** (HRM)
- 🔧 **Werkorders** (Work Orders)

---

## 📥 Voorbeeld CSV Bestanden Downloaden

Om te beginnen, download een voorbeeld CSV bestand voor de module waar je data wilt importeren:

### In de Applicatie

1. **Ga naar de gewenste module:**
   - Voorraad → Tab "📦 Voorraad Items"
   - CRM → Tab "👥 Klanten"
   - HRM → Tab "👔 Medewerkers"
   - Werkorders → "🔧 Werkorders"

2. **Zoek de "CSV Import" sectie** (meestal bovenaan de pagina)

3. **Klik op "📥 Download Voorbeeld CSV"** knop

4. **Selecteer het gewenste voorbeeld:**
   - Voorraad Items
   - Klanten
   - Medewerkers
   - Werkorders

5. **CSV bestand wordt gedownload** naar je Downloads map

### Voorbeeld Bestanden

**voorbeeld_voorraad.csv** - 3 voorraad items
```csv
Naam,SKU Leverancier,Aangepaste SKU,Locatie,Hoeveelheid,Eenheid,...
Staal Plaat 1000x1000mm,SP-1000,STAAL-001,Rek A1,50,stuk,...
Boutset M8x50 (100st),BS-M8-50,BOUT-008,Lade B12,25,doos,...
```

**voorbeeld_klanten.csv** - 3 klanten
```csv
Naam,Email,Telefoon,Type,Bedrijfsnaam,...
Jan de Vries,jan@example.com,0612345678,particulier,,...
Pietersen Metaalbewerking,info@pietersen.nl,0201234567,zakelijk,Pietersen Metaalbewerking BV,...
```

**voorbeeld_medewerkers.csv** - 3 medewerkers
```csv
Naam,Email,Telefoon,Functie,Wachtwoord,Admin,...
Peter Bakker,peter@bedrijf.nl,0612345678,Lasser,TempPass123!,nee,...
Sophie van Dam,sophie@bedrijf.nl,0687654321,Manager Productie,AdminPass456!,ja,...
```

**voorbeeld_werkorders.csv** - 3 werkorders
```csv
Titel,Beschrijving,Klantnaam,Toegewezen Aan,Locatie,...
Laswerk stalen constructie,Lassen van stalen frame...,Pietersen Metaalbewerking,Maria Jansen,Werkplaats Hal 2,...
```

---

## 📝 CSV Bestand Voorbereiden

### Stap 1: Open Voorbeeld Bestand

1. **Download het voorbeeld CSV** (zie hierboven)
2. **Open met Excel of Google Sheets:**
   - Excel: Bestand → Openen → Selecteer CSV
   - Google Sheets: Bestand → Importeren → Upload bestand

### Stap 2: Bewerk de Data

**Belangrijk:**

✅ **Wijzig GEEN kolomnamen** - de eerste rij moet exact blijven zoals in het voorbeeld  
✅ **Verwijder de voorbeelddata** - regels 2, 3 en 4 mogen weg  
✅ **Voeg je eigen data toe** vanaf rij 2  
✅ **Bewaar als CSV** bestand (niet Excel .xlsx!)

**Voorbeeld workflow in Excel:**

1. Open voorbeeld_voorraad.csv
2. Verwijder rijen 2-4 (voorbeelddata)
3. Voer je eigen voorraad items in vanaf rij 2
4. Bestand → Opslaan Als → CSV (door komma's gescheiden) (*.csv)

### Stap 3: Controleer de Data

**Voor Voorraad:**
- ✅ Naam is ingevuld
- ✅ Hoeveelheid is een getal
- ✅ Minimum voorraad is een getal
- ✅ Prijzen zijn getallen met decimale punt (45.50, niet 45,50)
- ✅ Eenheid is één van: stuk, meter, kg, liter, m², doos

**Voor Klanten:**
- ✅ Naam is ingevuld
- ✅ Email is geldig formaat (naam@domein.nl)
- ✅ Type is "particulier" of "zakelijk"
- ✅ Telefoon heeft Nederlands formaat (0612345678)

**Voor Medewerkers:**
- ✅ Naam is ingevuld
- ✅ Email is geldig en uniek
- ✅ Functie is ingevuld
- ✅ Admin is "ja" of "nee"
- ✅ Wachtwoord is ingevuld (min. 4 tekens)

**Voor Werkorders:**
- ✅ Titel is ingevuld
- ✅ Beschrijving is ingevuld
- ✅ Klantnaam bestaat al in systeem
- ✅ Toegewezen medewerker bestaat al
- ✅ Datum heeft formaat YYYY-MM-DD (2025-01-15)
- ✅ Geschatte uren is een getal

---

## 📤 CSV Uploaden

### Methode 1: Drag & Drop

1. **Ga naar de gewenste module**
2. **Vind de CSV Upload zone** (blauw omkaderd vak met upload icoon)
3. **Sleep je CSV bestand** naar de upload zone
4. **Laat los** wanneer de zone blauw oplicht
5. **Wacht op verwerking** (spinner verschijnt)
6. **Bekijk resultaten** in de popup

### Methode 2: Klik om te Selecteren

1. **Ga naar de gewenste module**
2. **Klik op de CSV Upload zone**
3. **Selecteer je CSV bestand** in de bestandsverkenner
4. **Klik "Openen"**
5. **Wacht op verwerking**
6. **Bekijk resultaten**

### Upload Resultaten

Na uploaden zie je een overzicht modal met:

**✅ Succesvolle Import:**
```
✅ Import Succesvol!

Totaal rijen: 25
Succesvol: 23
Fouten: 2

Details:
• Rij 12: Ongeldige email: "janexample.com"
• Rij 18: Verplichte veld 'Naam' is leeg

23 items zijn succesvol geïmporteerd!
```

**❌ Import met Fouten:**
```
⚠️ Import met Fouten

Totaal rijen: 10
Succesvol: 7
Fouten: 3

Details:
• Rij 3: Prijs moet een getal zijn: "vijftig"
• Rij 5: Verplichte kolom 'Hoeveelheid' ontbreekt
• Rij 8: Email formaat ongeldig

7 items zijn geïmporteerd, 3 overgeslagen.
```

### Wat te Doen bij Fouten?

1. **Noteer de foutmeldingen** (screenshot of schrijf op)
2. **Open je CSV bestand** opnieuw
3. **Corrigeer de aangegeven rijen**
4. **Bewaar het bestand**
5. **Upload opnieuw**

---

## 📊 Kolom Formaten

### Voorraad Items

| Kolom | Verplicht | Format | Voorbeeld |
|-------|-----------|--------|-----------|
| Naam | ✅ Ja | Tekst | "Staal Plaat 1000x1000mm" |
| SKU Leverancier | ❌ Nee | Tekst | "SP-1000" |
| Aangepaste SKU | ❌ Nee | Tekst | "STAAL-001" |
| Locatie | ❌ Nee | Tekst | "Rek A1" |
| Hoeveelheid | ✅ Ja | Getal (≥0) | "50" |
| Eenheid | ✅ Ja | stuk/meter/kg/liter/m²/doos | "stuk" |
| Minimum Voorraad | ❌ Nee | Getal (≥0) | "10" |
| Leverancier | ❌ Nee | Tekst | "Staal Groothandel BV" |
| Categorie | ❌ Nee | Tekst | "Metaal" |
| Verkoopprijs | ❌ Nee | Getal (€) | "45.50" |
| Inkoopprijs | ❌ Nee | Getal (€) | "30.00" |
| Notities | ❌ Nee | Tekst | "Standaard plaatmateriaal" |

**Let op:**
- Prijzen met **punt** als decimaal scheidingsteken (45.50, niet 45,50)
- Automatische SKU wordt gegenereerd (INV-0001, INV-0002, etc.)

### Klanten

| Kolom | Verplicht | Format | Voorbeeld |
|-------|-----------|--------|-----------|
| Naam | ✅ Ja | Tekst | "Jan de Vries" |
| Email | ✅ Ja | Email | "jan@example.com" |
| Telefoon | ❌ Nee | NL nummer | "0612345678" |
| Type | ✅ Ja | particulier/zakelijk | "particulier" |
| Bedrijfsnaam | ❌ Nee | Tekst | "Pietersen BV" |
| Adres | ❌ Nee | Tekst | "Hoofdstraat 123" |
| Postcode | ❌ Nee | 1234AB | "1234AB" |
| Plaats | ❌ Nee | Tekst | "Amsterdam" |
| Herkomst | ❌ Nee | Tekst | "website" |
| Notities | ❌ Nee | Tekst | "Vaste klant" |

**Let op:**
- Email moet geldig formaat hebben
- Type moet exact "particulier" of "zakelijk" zijn
- Telefoonnummer zonder spaties of streepjes

### Medewerkers

| Kolom | Verplicht | Format | Voorbeeld |
|-------|-----------|--------|-----------|
| Naam | ✅ Ja | Tekst | "Peter Bakker" |
| Email | ✅ Ja | Email (uniek!) | "peter@bedrijf.nl" |
| Telefoon | ❌ Nee | NL nummer | "0612345678" |
| Functie | ✅ Ja | Tekst | "Lasser" |
| Wachtwoord | ✅ Ja | Min 4 tekens | "TempPass123!" |
| Admin | ✅ Ja | ja/nee | "nee" |
| Verlofdagen | ❌ Nee | Getal | "25" |
| Gebruikte Verlofdagen | ❌ Nee | Getal | "0" |
| Beschikbaarheid | ❌ Nee | available/unavailable/vacation | "available" |

**Let op:**
- Email moet uniek zijn (geen duplicaten)
- Admin moet exact "ja" of "nee" zijn (niet "yes" of "1")
- Wachtwoord min. 4 tekens (temp wachtwoord, later te wijzigen)

### Werkorders

| Kolom | Verplicht | Format | Voorbeeld |
|-------|-----------|--------|-----------|
| Titel | ✅ Ja | Tekst | "Laswerk stalen constructie" |
| Beschrijving | ✅ Ja | Tekst | "Lassen van stalen frame..." |
| Klantnaam | ✅ Ja | Bestaande klant | "Jan de Vries" |
| Toegewezen Aan | ✅ Ja | Bestaande medewerker | "Maria Jansen" |
| Locatie | ❌ Nee | Tekst | "Werkplaats Hal 2" |
| Geplande Datum | ❌ Nee | YYYY-MM-DD | "2025-01-15" |
| Geschatte Uren | ❌ Nee | Getal | "8" |
| Status | ❌ Nee | To Do/In Wacht/In Uitvoering | "To Do" |
| Materialen | ❌ Nee | Item (aantal); Item (aantal) | "Staal Plaat (10); Bouten (2)" |
| Notities | ❌ Nee | Tekst | "Klant heeft haast" |

**Let op:**
- Klantnaam moet **exact** overeenkomen met bestaande klant
- Toegewezen medewerker moet **exact** overeenkomen met naam in systeem
- Datum in formaat YYYY-MM-DD (jaar-maand-dag)
- Materialen gescheiden door puntkomma (;)
- Materiaal formaat: "Itemnaam (aantal)"

---

## ⚠️ Veelvoorkomende Fouten

### Fout 1: Verkeerd Decimaal Scheidingsteken

**❌ Fout:**
```csv
Verkoopprijs
45,50
```

**✅ Correct:**
```csv
Verkoopprijs
45.50
```

**Oplossing:** Gebruik punt (.) in plaats van komma (,) voor decimale getallen

---

### Fout 2: Ongeldige Eenheid

**❌ Fout:**
```csv
Eenheid
stuks
pieces
```

**✅ Correct:**
```csv
Eenheid
stuk
meter
```

**Oplossing:** Gebruik exact: stuk, meter, kg, liter, m², doos

---

### Fout 3: Onjuist Email Formaat

**❌ Fout:**
```csv
Email
janexample.com
jan@example
jan @example.com
```

**✅ Correct:**
```csv
Email
jan@example.com
```

**Oplossing:** Email moet formaat hebben: naam@domein.extensie

---

### Fout 4: Verkeerde Datum Formaat

**❌ Fout:**
```csv
Geplande Datum
15-01-2025
01/15/2025
15 januari 2025
```

**✅ Correct:**
```csv
Geplande Datum
2025-01-15
```

**Oplossing:** Gebruik formaat YYYY-MM-DD (jaar-maand-dag met streepjes)

---

### Fout 5: Niet-bestaande Klant of Medewerker

**❌ Fout:**
```csv
Klantnaam,Toegewezen Aan
Jan de Vries,Peter Bakker
```
*Jan de Vries bestaat niet in systeem*

**✅ Correct:**
1. Eerst klant "Jan de Vries" aanmaken in CRM
2. Dan pas werkorder importeren met deze klant

**Oplossing:** Zorg dat klanten en medewerkers eerst bestaan voordat je werkorders importeert

---

### Fout 6: Spaties in Kolomnamen

**❌ Fout:**
```csv
Naam ,Email, Telefoon
```
*Let op spaties na "Naam" en voor "Telefoon"*

**✅ Correct:**
```csv
Naam,Email,Telefoon
```

**Oplossing:** Geen spaties voor of na kolomnamen

---

### Fout 7: Excel Heeft Type Gewijzigd

**Probleem:** Excel maakt soms automatisch van "0612345678" → wetenschappelijke notatie

**Oplossing:**
1. Selecteer de kolom in Excel
2. Klik rechts → "Cellen opmaken"
3. Kies "Tekst" als type
4. Voer getallen opnieuw in

---

## 👨‍💻 Voor Developers

### CSV Upload Implementeren

**Stap 1: Import Dependencies**

```typescript
import { CSVUpload } from '@/components/common';
import { parseCSV, CSVColumnMapping } from '@/utils/csvParser';
import { csvValidators, csvTransformers } from '@/utils/csvParser';
```

**Stap 2: Definieer Column Mappings**

```typescript
const inventoryColumnMappings: CSVColumnMapping[] = [
  {
    csvHeader: 'Naam',
    dataKey: 'name',
    required: true,
  },
  {
    csvHeader: 'Hoeveelheid',
    dataKey: 'quantity',
    required: true,
    validator: csvValidators.isPositiveNumber,
    transformer: csvTransformers.toNumber,
  },
  {
    csvHeader: 'Verkoopprijs (€)',
    dataKey: 'sellingPrice',
    required: false,
    validator: csvValidators.isPositiveNumber,
    transformer: csvTransformers.toNumber,
  },
  // ... meer kolommen
];
```

**Stap 3: Gebruik CSVUpload Component**

```typescript
function InventoryPage() {
  const [showImportModal, setShowImportModal] = useState(false);

  const handleCSVParsed = (result: CSVParseResult<InventoryItem>) => {
    if (result.errors.length > 0) {
      // Toon fouten aan gebruiker
      setImportErrors(result.errors);
    }

    if (result.data.length > 0) {
      // Voeg items toe aan state
      setInventory(prev => [...prev, ...result.data]);
    }

    // Toon resultaten modal
    setShowImportModal(true);
  };

  return (
    <div>
      <h2>CSV Importeren</h2>
      
      <CSVUpload
        onDataParsed={handleCSVParsed}
        columnMappings={inventoryColumnMappings}
        title="Upload Voorraad CSV"
        description="Sleep CSV bestand hierheen"
      />

      {/* Download Voorbeeld Knop */}
      <button onClick={() => downloadInventoryExampleCSV()}>
        📥 Download Voorbeeld CSV
      </button>
    </div>
  );
}
```

**Stap 4: Resultaten Modal**

```typescript
{showImportModal && (
  <div className="modal">
    <h3>
      {result.errors.length === 0 ? '✅ Import Succesvol!' : '⚠️ Import met Fouten'}
    </h3>
    
    <div className="stats">
      <p>Totaal rijen: {result.totalRows}</p>
      <p>Succesvol: {result.successRows}</p>
      <p>Fouten: {result.errors.length}</p>
    </div>

    {result.errors.length > 0 && (
      <div className="errors">
        <h4>Details:</h4>
        <ul>
          {result.errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    )}

    <button onClick={() => setShowImportModal(false)}>Sluiten</button>
  </div>
)}
```

### Custom Validators Toevoegen

```typescript
const customValidators = {
  isValidSKU: (value: string): boolean => {
    // SKU moet beginnen met letters, gevolgd door cijfers
    return /^[A-Z]{2,4}-\d{3,6}$/.test(value);
  },

  isValidPostcode: (value: string): boolean => {
    // Nederlandse postcode formaat
    return /^\d{4}\s?[A-Z]{2}$/i.test(value);
  },
};

// Gebruik in mapping:
{
  csvHeader: 'SKU Leverancier',
  dataKey: 'supplierSku',
  required: false,
  validator: customValidators.isValidSKU,
}
```

### Custom Transformers Toevoegen

```typescript
const customTransformers = {
  dutchDateToISODate: (value: string): string => {
    // Converteer "15-01-2025" naar "2025-01-15"
    const [day, month, year] = value.split('-');
    return `${year}-${month}-${day}`;
  },

  cleanPhoneNumber: (value: string): string => {
    // Verwijder spaties, streepjes en haakjes
    return value.replace(/[\s\-()]/g, '');
  },
};

// Gebruik in mapping:
{
  csvHeader: 'Geplande Datum',
  dataKey: 'scheduledDate',
  transformer: customTransformers.dutchDateToISODate,
}
```

### Error Handling Best Practices

```typescript
const handleCSVParsed = (result: CSVParseResult<T>) => {
  // Geen data en geen fouten = leeg bestand
  if (result.data.length === 0 && result.errors.length === 0) {
    showNotification('CSV bestand is leeg', 'warning');
    return;
  }

  // Alleen fouten = niets geïmporteerd
  if (result.data.length === 0 && result.errors.length > 0) {
    showNotification(`Import mislukt: ${result.errors.length} fouten`, 'error');
    setImportErrors(result.errors);
    return;
  }

  // Gedeeltelijk succes
  if (result.data.length > 0 && result.errors.length > 0) {
    showNotification(
      `${result.successRows} items geïmporteerd, ${result.errors.length} fouten`,
      'warning'
    );
    setImportedData(result.data);
    setImportErrors(result.errors);
    return;
  }

  // Volledig succes
  showNotification(`${result.successRows} items succesvol geïmporteerd!`, 'success');
  setImportedData(result.data);
};
```

---

## 📚 Extra Bronnen

**CSV Format Specificatie:**
- [RFC 4180 - Common Format and MIME Type for CSV Files](https://tools.ietf.org/html/rfc4180)

**Excel naar CSV:**
- [Microsoft: CSV bestanden opslaan](https://support.microsoft.com/nl-nl/office/csv-bestanden-opslaan-met-excel)

**Google Sheets naar CSV:**
- [Google Sheets: Exporteren naar CSV](https://support.google.com/docs/answer/183965)

---

## 💬 Hulp Nodig?

Bij problemen met CSV import:

1. **Check de voorbeeld CSV** - download opnieuw om zeker te zijn van correct formaat
2. **Controleer foutmeldingen** - lees ze zorgvuldig en corrigeer aangegeven rijen
3. **Test met kleine hoeveelheid** - importeer eerst 2-3 regels om formaat te testen
4. **Contacteer support** - bij aanhoudende problemen

---

**Laatste update:** December 2024  
**Versie:** 1.0  
**Status:** ✅ Volledig Geïmplementeerd

---

**Veel succes met het importeren van je data! 🚀**
