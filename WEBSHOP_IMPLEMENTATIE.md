# Webshop BESA-Style Implementatie 🛒

## Overzicht

De webshop is uitgebreid met geavanceerde filtering en productbeheer geïnspireerd door BESA-sloten.be. Deze implementatie bevat alle belangrijke features die nodig zijn voor een professionele B2B/B2C webshop met technische producten.

## 🎯 Geïmplementeerde Features

### 1. Product Attributen Systeem
- **Flexibel filtering** zoals bij BESA (backset, materiaal, afmetingen, etc.)
- **Verschillende attribute types**:
  - `checkbox` / `multiselect` - Voor meerdere selecties (bijv. materialen)
  - `select` - Voor enkelvoudige keuze
  - `range` - Voor bereik filters (bijv. 20-150mm)
  - `number` - Voor exacte waardes
  - `color` - Voor kleur selectie met hex codes

### 2. Product Badge Systeem
- **Automatische badges**:
  - 🆕 **NEW** - Automatisch voor producten < 30 dagen oud
  - 🔥 **SALE** - Automatisch wanneer `compareAtPrice` > `price`
  - ⚠️ **LOW STOCK** - Automatisch bij weinig voorraad
- **Handmatige badges**:
  - ⭐ **FEATURED** - Uitgelichte producten
  - 🏆 **BESTSELLER** - Populaire producten
  - Aangepaste badges met eigen kleur en tekst

### 3. Geavanceerde Filter Sidebar
- **Hiërarchische categorieën** - Hoofdcategorieën en subcategorieën
- **Prijs filter** - Min/max bereik
- **Voorraad filter** - Alleen op voorraad tonen
- **Badge filters** - Filter op NEW, SALE, FEATURED, etc.
- **Product attributen** - Dynamische filters per categorie
- **Clear all filters** - Reset alle actieve filters in één keer
- **Active filter count** - Visuele indicator van aantal actieve filters

### 4. Product Variant Management
- **Volledige variant support** zoals bij BESA
- Variant-specifieke:
  - SKU's
  - Prijzen
  - Voorraad
  - Afbeeldingen
  - Gewicht
- **Optie systeem** - Key-value pairs (kleur: rood, maat: groot)
- **Activatie toggle** - Varianten aan/uit zetten
- **Voorraad tracking** per variant

### 5. Sorteer Functionaliteit
- 🌟 **Featured** - Uitgelichte producten eerst
- 🆕 **Nieuwste** - Nieuwst toegevoegde producten
- 🔤 **Naam** - Alfabetisch (A-Z / Z-A)
- 💰 **Prijs** - Van laag naar hoog / hoog naar laag

### 6. Weergave Modi
- **Grid view** (▦) - Productkaarten in raster
- **List view** (☰) - Producten in lijst met meer details

### 7. Responsive Design
- **Mobile-first** approach
- Collapsible filters voor mobile
- Responsive grid/list layouts
- Touch-friendly UI

## 📁 Bestanden Structuur

```
/pages
  ├── Webshop.tsx               # Originele webshop (behouden)
  └── WebshopEnhanced.tsx       # Nieuwe BESA-style webshop ⭐

/components
  ├── ProductFilters.tsx        # Geavanceerde filter sidebar
  ├── ProductBadge.tsx          # Badge systeem component
  └── ProductVariantManager.tsx # Variant management UI

/types.ts
  └── Nieuwe types:
      ├── ProductAttribute
      ├── AttributeOption
      ├── ProductAttributeValue
      ├── ProductBadge
      └── FilterState
```

## 🚀 Gebruik

### Stap 1: Import de nieuwe component

In `App.tsx` of `AppInner.tsx`:

```tsx
import { WebshopEnhanced } from './pages/WebshopEnhanced';

// Gebruik WebshopEnhanced in plaats van Webshop
{activeModule === ModuleKey.WEBSHOP && (
  <WebshopEnhanced
    inventory={inventory}
    customers={customers}
    isAdmin={currentUser?.isAdmin || false}
    webshopProducts={webshopProducts}
    setWebshopProducts={setWebshopProducts}
  />
)}
```

### Stap 2: Demo Data Toevoegen

Voeg demo producten toe met attributen en badges:

```tsx
const demoProducts: WebshopProduct[] = [
  {
    id: '1',
    name: 'Profielcilinder RVS 30/40mm',
    slug: 'profielcilinder-rvs-30-40',
    description: 'Hoogwaardige profielcilinder van roestvrij staal',
    shortDescription: 'RVS cilinder voor maximale veiligheid',
    sku: 'CIL-001',
    price: 45.50,
    compareAtPrice: 59.99, // SALE badge!
    stockQuantity: 25,
    lowStockThreshold: 10,
    trackInventory: true,
    categoryIds: ['2'], // Cilinders
    images: [],
    status: 'active',
    visibility: 'public',
    tags: ['beveiliging', 'cilinder', 'rvs'],
    shippingRequired: true,
    requireShipping: true,
    digitalProduct: false,
    allowReviews: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // NIEUWE FEATURES:
    attributes: [
      {
        attributeId: 'backset',
        value: ['30', '40'], // Multiselect values
      },
      {
        attributeId: 'material',
        value: ['stainless_steel'],
      },
      {
        attributeId: 'length',
        value: 70, // 30mm + 40mm
      },
    ],
    badges: [
      {
        type: 'featured', // Handmatig toegevoegd
        priority: 2,
      },
    ],
  },
];
```

### Stap 3: Categorieën met Iconen

```tsx
const categories: ProductCategory[] = [
  {
    id: '1',
    name: 'Sloten & Beveiliging',
    slug: 'sloten-beveiliging',
    icon: '🔒', // Icoon voor visuele weergave
    description: 'Complete beveiligingsoplossingen',
    order: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Cilinders',
    slug: 'cilinders',
    icon: '🔑',
    parentId: '1', // Subcategorie van Sloten & Beveiliging
    order: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

### Stap 4: Product Attributen Definiëren

```tsx
const attributes: ProductAttribute[] = [
  {
    id: 'backset',
    name: 'Backset',
    slug: 'backset',
    type: 'multiselect',
    unit: 'mm',
    categoryIds: ['2', '3'], // Alleen voor Cilinders en Meerpuntsloten
    required: false,
    showInFilters: true,
    showInProductList: true,
    order: 1,
    options: [
      { id: 'b25', label: '25mm', value: '25', order: 0 },
      { id: 'b30', label: '30mm', value: '30', order: 1 },
      { id: 'b35', label: '35mm', value: '35', order: 2 },
      // ... meer opties
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

## 🎨 Styling Aanpassingen

De nieuwe componenten gebruiken de bestaande Tailwind CSS klassen en zijn consistent met de rest van de applicatie. Kleuren kunnen aangepast worden in `index.css`:

```css
:root {
  --color-primary: #3b82f6;    /* Blue voor primaire acties */
  --color-secondary: #10b981;  /* Green voor success */
  --color-accent: #f59e0b;     /* Orange voor waarschuwingen */
}
```

## 📊 Filter Logica

De filtering werkt als volgt:

1. **Category Filter** - Toont alleen producten in geselecteerde categorie
2. **Price Range** - Filters producten binnen min/max prijs
3. **Stock Filter** - Toont alleen producten op voorraad
4. **Badge Filter** - Toont producten met specifieke badges
5. **Attribute Filters** - Dynamisch per categorie:
   - Multiselect: Product moet één van de geselecteerde waardes hebben
   - Range: Product waarde moet binnen min/max vallen
   - Select: Product moet exact de geselecteerde waarde hebben

Alle filters werken **cumulatief** (AND logica).

## 🔄 Product Varianten

Gebruik varianten voor producten met meerdere opties:

```tsx
const product: WebshopProduct = {
  // ... basis product velden
  hasVariants: true,
  variants: [
    {
      id: 'v1',
      productId: 'prod1',
      name: 'Rood - Klein',
      sku: 'PROD-RED-S',
      price: 29.99, // Overschrijft product prijs
      stockQuantity: 15,
      options: {
        kleur: 'rood',
        maat: 'klein',
      },
      active: true,
      trackInventory: true,
    },
    // ... meer varianten
  ],
};
```

## 🎯 Best Practices

### 1. Product Attributen
- Gebruik **descriptieve namen** (bijv. "Backset" i.p.v. "bs")
- Voeg **units** toe waar van toepassing (mm, kg, cm)
- Beperk attributen tot **relevante categorieën** voor betere UX
- Sorteer opties **logisch** (numeriek oplopend, alfabetisch)

### 2. Badges
- Gebruik max **2-3 badges** per product (via priority)
- Maak gebruik van **automatische badges** waar mogelijk
- Gebruik **featured** badge spaarzaam voor echte highlights

### 3. Categorieën
- Maximaal **2-3 niveaus** diep voor overzicht
- Gebruik **iconen** voor betere visuele herkenning
- Houd **producttelling** actueel voor gebruikersfeedback

### 4. Filtering
- Test filters met **realistische datasets** (100+ producten)
- Zorg dat **"Clear filters"** altijd zichtbaar is
- Toon **aantal resultaten** na elke filter actie

## 🐛 Troubleshooting

### Problem: Filters werken niet
**Oplossing**: Check of `attributeId` in product matches `id` in attributes array.

### Problem: Badges tonen niet
**Oplossing**: Check of `autoGenerateBadges()` functie wordt aangeroepen bij product render.

### Problem: Categorieën tonen niet hiërarchisch
**Oplossing**: Check of `parentId` correct is ingesteld en matches een bestaande category `id`.

### Problem: Varianten niet zichtbaar
**Oplossing**: Zet `hasVariants: true` op het product en voeg `variants` array toe.

## 📈 Toekomstige Uitbreidingen

Potentiële verbeteringen gebaseerd op BESA:

- [ ] **Multi-language support** (NL, EN, FR, DE)
- [ ] **Bulk edit** voor producten
- [ ] **Import/Export** - CSV/Excel voor bulk operations
- [ ] **Kennisbank integratie** - Product handleidingen en specs
- [ ] **B2B Prijslijsten** - Verschillende prijzen per klantgroep
- [ ] **Voorraad synchronisatie** - Real-time met Inventory module
- [ ] **Product bundels** - Combinatie producten met korting
- [ ] **Related products** - "Klanten kochten ook..."
- [ ] **Advanced search** - Met autocomplete en suggesties
- [ ] **Filter presets** - Opgeslagen filtersets
- [ ] **Product vergelijking** - Side-by-side spec comparison

## 📝 Conclusie

Deze implementatie biedt een solide basis voor een professionele B2B/B2C webshop met geavanceerde filtering zoals bij BESA. De modulaire opzet maakt het gemakkelijk om verder uit te breiden.

**Vragen?** Check de code comments in de componenten voor meer details!

---

**Versie:** 1.0.0
**Datum:** November 2025
**Geïnspireerd door:** https://besa-sloten.be/
