# Mobile Optimalisatie

Het Bedrijfsbeheer Dashboard is volledig geoptimaliseerd voor gebruik op smartphones, tablets en desktops. Deze documentatie beschrijft alle mobile-first principes, responsive breakpoints, en best practices voor een optimale mobiele ervaring.

**Versie:** 4.5 en hoger
**Status:** Volledig geoptimaliseerd en getest

---

## Overzicht

### Waarom Mobile Optimization?

Medewerkers in het veld moeten:
- ✅ Werkorders bekijken en updaten vanaf smartphone
- ✅ Uren registreren tijdens het werk
- ✅ Status van taken wijzigen zonder laptop
- ✅ Voorraad checken onderweg
- ✅ Klant informatie opzoeken op locatie

### Belangrijkste Features

- 📱 **Volledig responsive design** - Werkt op elk scherm formaat
- 🍔 **Hamburger menu** - Intuïtieve navigatie op mobiel
- 👆 **Touch-optimized** - Grote knoppen en swipe gestures
- 📐 **Mobile-first formulieren** - Gestapelde layouts voor eenvoudig invullen
- 📊 **Responsive tabellen** - Horizontale scroll en compacte weergave
- 🔤 **Aangepaste font sizes** - Optimale leesbaarheid zonder zoomen
- ⚡ **Snelle performance** - Geen vertraging op mobiele netwerken
- 🤚 **Eén hand bediening** - Alle belangrijke functies bereikbaar

---

## Responsive Breakpoints

Het project gebruikt **Tailwind CSS** breakpoints voor consistent responsive gedrag:

### Breakpoint Overzicht

| Breakpoint | Pixel Width | Apparaat Type | Gebruik |
|------------|-------------|---------------|---------|
| **Default** | < 640px | Smartphones portrait | Mobile-first basis styling |
| **sm** | ≥ 640px | Large smartphones landscape | Eerste optimalisatie stap |
| **md** | ≥ 768px | Tablets portrait | Tablet-specifieke layouts |
| **lg** | ≥ 1024px | Tablets landscape, kleine laptops | Desktop navigatie verschijnt |
| **xl** | ≥ 1280px | Desktops, grote schermen | Volledige desktop ervaring |

### Voorbeelden

```tsx
// Mobile-first styling
<div className="p-4 sm:p-6 lg:p-8">
  // Padding: 16px op mobile, 24px op sm+, 32px op lg+
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  // 1 kolom op mobile, 2 op tablet, 3 op desktop
</div>

// Conditional visibility
<span className="hidden lg:block">Desktop only tekst</span>
<button className="lg:hidden">Mobile only knop</button>
```

---

## Mobile-First Principes

### 1. Hamburger Menu

**Gedrag:**
- **Desktop (≥ 1024px):** Sidebar altijd zichtbaar
- **Mobile (< 1024px):** Hamburger menu icoon in header

**Functionaliteit:**

```tsx
Hamburger Menu Features:
├─ Icoon in top-left van header (☰)
├─ Slide-in animatie van links
├─ Full-height sidebar overlay
├─ Touch-friendly knoppen (min 44x44px)
├─ Click buiten sidebar sluit menu
├─ ESC toets sluit menu
├─ Navigatie item click sluit menu automatisch
└─ Smooth animatie (300ms transition)
```

**CSS Implementatie:**

```css
/* Hamburger button - alleen op mobile */
.hamburger-menu {
  display: block;
  padding: 12px;
  min-width: 44px;
  min-height: 44px;
  touch-action: manipulation;
}

@media (min-width: 1024px) {
  .hamburger-menu {
    display: none;
  }
}

/* Sidebar slide-in */
.mobile-sidebar {
  position: fixed;
  left: -280px;
  top: 0;
  height: 100vh;
  width: 280px;
  transition: transform 0.3s ease-in-out;
  z-index: 50;
}

.mobile-sidebar.open {
  transform: translateX(280px);
}

/* Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
}
```

**User Experience:**

1. Gebruiker tikt hamburger icoon
2. Sidebar schuift soepel in vanaf links
3. Overlay verschijnt over content (50% transparant zwart)
4. Gebruiker kan:
   - Navigatie item kiezen → menu sluit automatisch
   - Buiten sidebar tikken → menu sluit
   - ESC drukken → menu sluit
5. Smooth animatie bij sluiten

---

### 2. Touch Optimalisaties

**Minimum Touch Targets**

Alle interactieve elementen voldoen aan **44x44px minimum** (Apple & Google guidelines):

```tsx
// Knoppen
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Click me
</button>

// Links
<a className="block py-3 px-4 min-h-[44px]">
  Navigation item
</a>

// Checkboxes en radio buttons
<input type="checkbox" className="w-6 h-6" />  // 24px basis
<label className="pl-3 py-2">  // Extra padding voor grotere hit area
```

**Touch Manipulation**

```css
/* Alle interactieve elementen */
button, a, input, select, textarea {
  touch-action: manipulation;
  /* Voorkomt dubbel-tap zoom, verbetert responsiviteit */
}

/* Active states voor directe feedback */
button:active {
  transform: scale(0.98);
  transition: transform 0.1s;
}

.card:active {
  background-color: rgba(0, 0, 0, 0.05);
}
```

**Swipe Gestures**

```tsx
// Sidebar swipe to close
const handleSwipe = (direction) => {
  if (direction === 'left' && sidebarOpen) {
    closeSidebar();
  }
};

// Card swipe actions (toekomstig)
const handleCardSwipe = (direction, item) => {
  if (direction === 'right') {
    markAsComplete(item);
  } else if (direction === 'left') {
    deleteItem(item);
  }
};
```

---

### 3. Responsive Layouts

**Grid Systemen**

```tsx
// Dashboard KPI cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Mobile: 1 kolom, Small: 2 kolommen, Large: 4 kolommen */}
</div>

// Werkorder kanban board
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Mobile: 1 kolom (verticaal scrollen)
      Tablet: 2 kolommen (To Do + In Progress zichtbaar)
      Desktop: 4 kolommen (alle statussen zichtbaar) */}
</div>

// Product grid
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
  {/* Mobile: 2 kolommen, geleidelijk meer op grotere schermen */}
</div>
```

**Flexbox Layouts**

```tsx
// Header met responsive spacing
<header className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
  <div className="flex items-center gap-2 sm:gap-4">
    {/* Mobile: kleine gap, Desktop: grotere gap */}
  </div>
</header>

// Form met stack/side-by-side
<div className="flex flex-col sm:flex-row gap-4">
  {/* Mobile: gestapeld, Desktop: naast elkaar */}
  <input type="text" className="flex-1" />
  <input type="text" className="flex-1" />
</div>
```

**Conditional Visibility**

```tsx
// Desktop only
<span className="hidden lg:block">Volledige tekst voor desktop</span>

// Mobile only
<button className="lg:hidden">Mobile menu</button>

// Tablet and up
<div className="hidden md:block">Tablet en desktop content</div>

// Mobile and tablet
<div className="md:hidden">Alleen op kleine schermen</div>
```

**Responsive Padding & Spacing**

```tsx
// Container padding
<div className="px-4 sm:px-6 lg:px-8">
  {/* 16px → 24px → 32px */}
</div>

// Section spacing
<section className="py-8 sm:py-12 lg:py-16">
  {/* 32px → 48px → 64px */}
</section>

// Element gap
<div className="space-y-4 sm:space-y-6 lg:space-y-8">
  {/* Vertical spacing: 16px → 24px → 32px */}
</div>
```

---

### 4. Formulieren

**Mobile-First Form Design**

```tsx
// Volledige breedte op mobile, max-width op desktop
<form className="w-full max-w-2xl mx-auto px-4">

  {/* Font-size minimum 16px (voorkomt iOS zoom) */}
  <input
    type="text"
    className="w-full px-4 py-3 text-base sm:text-sm"
    style={{ fontSize: '16px' }}  // Explicit voor iOS
  />

  {/* Stack op mobile, side-by-side op desktop */}
  <div className="flex flex-col sm:flex-row gap-4">
    <input type="text" className="flex-1" />
    <input type="text" className="flex-1" />
  </div>

  {/* Touch-friendly spacing tussen velden */}
  <div className="space-y-4 sm:space-y-6">
    <FormField />
    <FormField />
    <FormField />
  </div>

  {/* Large buttons op mobile */}
  <button className="w-full sm:w-auto px-6 py-3 text-lg sm:text-base">
    Opslaan
  </button>
</form>
```

**Input Types voor Mobiel**

```tsx
// Email keyboard
<input type="email" inputMode="email" />

// Numeric keyboard
<input type="number" inputMode="numeric" />

// Telefoon keyboard
<input type="tel" inputMode="tel" />

// URL keyboard
<input type="url" inputMode="url" />

// Decimal keyboard
<input type="text" inputMode="decimal" />

// Search keyboard
<input type="search" />
```

**Select Dropdowns**

```tsx
// Native select op mobile (betere UX)
<select className="w-full px-4 py-3 text-base rounded-lg">
  <option>Optie 1</option>
  <option>Optie 2</option>
</select>

// Custom select alleen op desktop (indien nodig)
<div className="hidden lg:block">
  <CustomSelectComponent />
</div>
<select className="lg:hidden">
  {/* Native op mobile */}
</select>
```

---

### 5. Tabellen

**Responsive Table Strategies**

**Strategie 1: Horizontale Scroll**

```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    <thead>
      <tr>
        <th>Kolom 1</th>
        <th>Kolom 2</th>
        <th>Kolom 3</th>
        {/* Alle kolommen behouden, horizontaal scrollen op mobile */}
      </tr>
    </thead>
  </table>
</div>
```

**Strategie 2: Kolommen Verbergen**

```tsx
<table>
  <thead>
    <tr>
      <th>Naam</th>  {/* Altijd zichtbaar */}
      <th className="hidden md:table-cell">Email</th>  {/* Tablet+ */}
      <th className="hidden lg:table-cell">Telefoon</th>  {/* Desktop */}
      <th className="hidden lg:table-cell">Functie</th>  {/* Desktop */}
      <th>Acties</th>  {/* Altijd zichtbaar */}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jan de Vries</td>
      <td className="hidden md:table-cell">jan@bedrijf.nl</td>
      <td className="hidden lg:table-cell">06-12345678</td>
      <td className="hidden lg:table-cell">Monteur</td>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

**Strategie 3: Card Layout op Mobile**

```tsx
// Desktop: Tabel
<div className="hidden lg:block">
  <table>...</table>
</div>

// Mobile: Cards
<div className="lg:hidden space-y-4">
  {items.map(item => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-sm text-gray-600">{item.email}</p>
      <p className="text-sm text-gray-600">{item.phone}</p>
      <div className="mt-3 flex gap-2">
        <button>Bewerk</button>
        <button>Verwijder</button>
      </div>
    </div>
  ))}
</div>
```

**Compacte Weergave**

```tsx
// Kleinere padding op mobile
<td className="px-2 py-2 sm:px-4 sm:py-3">
  {/* 8px padding op mobile, 16px op desktop */}
</td>

// Kleinere font op mobile
<td className="text-sm sm:text-base">
  {/* 14px op mobile, 16px op desktop */}
</td>
```

---

### 6. Modals & Dropdowns

**Modal Responsive Gedrag**

```tsx
// Full-screen op mobile, centered op desktop
<div className="fixed inset-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
  <div className="h-full w-full lg:h-auto lg:w-[600px] lg:max-h-[90vh] lg:rounded-lg">
    {/* Mobile: volledige scherm
        Desktop: centered modal met max width */}
  </div>
</div>

// Scrollable content
<div className="overflow-y-auto max-h-screen lg:max-h-[80vh] p-4 sm:p-6">
  {/* Modal content */}
</div>

// Touch-dismissable overlay
<div
  className="fixed inset-0 bg-black/50"
  onClick={closeModal}
  onTouchEnd={closeModal}
/>
```

**Dropdown Menus**

```tsx
// Dropdown positie aanpassen op mobile
<div className="
  absolute
  left-0 right-0 mx-4          // Mobile: bijna volledige breedte
  sm:left-auto sm:right-0 sm:w-64  // Desktop: rechts uitgelijnd, vaste breedte
  mt-2
  rounded-lg
  shadow-lg
">
  {/* Dropdown items */}
</div>

// Touch-friendly dropdown items
<button className="w-full text-left px-4 py-3 hover:bg-gray-100 active:bg-gray-200">
  {/* Minimaal 44px hoogte voor touch */}
</button>
```

---

## Typography & Readability

### Responsive Font Sizes

```tsx
// Headers
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  {/* 24px → 30px → 36px */}
</h1>

<h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
  {/* 20px → 24px → 30px */}
</h2>

<h3 className="text-lg sm:text-xl lg:text-2xl font-medium">
  {/* 18px → 20px → 24px */}
</h3>

// Body text
<p className="text-sm sm:text-base">
  {/* 14px op mobile, 16px op desktop */}
</p>

// Small text
<span className="text-xs sm:text-sm">
  {/* 12px → 14px */}
</span>
```

### Line Height & Spacing

```css
/* Grotere line-height op mobile voor leesbaarheid */
.mobile-text {
  line-height: 1.6;  /* Mobile */
}

@media (min-width: 768px) {
  .mobile-text {
    line-height: 1.5;  /* Desktop */
  }
}

/* Meer spacing tussen paragrafen op mobile */
.content p {
  margin-bottom: 1rem;  /* 16px mobile */
}

@media (min-width: 768px) {
  .content p {
    margin-bottom: 0.75rem;  /* 12px desktop */
  }
}
```

### Font Size Minimum voor iOS

```tsx
// BELANGRIJK: Minimum 16px om zoom te voorkomen op iOS
<input
  type="text"
  className="text-base"  // 16px
  style={{ fontSize: '16px' }}  // Explicit voor zekerheid
/>

<select
  className="text-base"
  style={{ fontSize: '16px' }}
/>

<textarea
  className="text-base"
  style={{ fontSize: '16px' }}
/>
```

---

## Performance Tips

### 1. Optimale Shadows

```css
/* Lichtere shadows op mobile voor betere performance */
.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);  /* Mobile: light shadow */
}

@media (min-width: 768px) {
  .card {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  /* Desktop: medium shadow */
  }
}
```

### 2. Reduced Motion

```css
/* Respecteer gebruikers voorkeur voor reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Lazy Loading

```tsx
// Lazy load images in lange lijsten
<img
  src={item.image}
  loading="lazy"
  className="w-full h-auto"
/>

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Spinner />}>
  <HeavyComponent />
</Suspense>
```

### 4. Debounced Events

```tsx
// Debounce scroll events
const handleScroll = debounce(() => {
  // Scroll logic
}, 150);

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Debounce search input
const handleSearch = debounce((query) => {
  // Search logic
}, 300);
```

### 5. Virtualization voor Lange Lijsten

```tsx
// Voor lijsten met 100+ items
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,  // Geschatte rij hoogte
});

// Render alleen zichtbare items
{virtualizer.getVirtualItems().map(virtualRow => (
  <div key={virtualRow.index} style={{ height: virtualRow.size }}>
    {items[virtualRow.index]}
  </div>
))}
```

---

## Testing Checklist

### Apparaten & Schermen

- [ ] **iPhone SE** (375x667) - Kleinste moderne iPhone
- [ ] **iPhone 12/13/14** (390x844) - Standaard iPhone
- [ ] **iPhone 12/13/14 Pro Max** (428x926) - Grote iPhone
- [ ] **Android Small** (360x640) - Kleine Android
- [ ] **Android Medium** (412x915) - Gemiddelde Android (Pixel, Samsung)
- [ ] **iPad Mini** (768x1024) - Kleine tablet portrait
- [ ] **iPad** (810x1080) - Standaard tablet portrait
- [ ] **iPad Pro** (1024x1366) - Grote tablet portrait
- [ ] **Landscape mode** - Test alle apparaten ook landscape

### Orientatie

- [ ] **Portrait** - Staande modus (primair voor mobile)
- [ ] **Landscape** - Liggende modus (belangrijk voor tablets en kleine laptops)
- [ ] **Rotation switch** - Test smooth transition bij roteren

### Functionaliteit

- [ ] **Hamburger menu** werkt smooth
  - [ ] Opent met tap
  - [ ] Sluit met tap buiten menu
  - [ ] Sluit bij navigatie
  - [ ] Slide animatie werkt
- [ ] **Touch gestures** reageren correct
  - [ ] Swipe to close sidebar
  - [ ] Pull to refresh (indien geïmplementeerd)
  - [ ] Swipe actions op cards (indien geïmplementeerd)
- [ ] **Formulieren** zijn goed te gebruiken
  - [ ] Inputs zoomen niet in (16px font)
  - [ ] Keyboard type is correct
  - [ ] Submit button bereikbaar
  - [ ] Validatie errors zichtbaar
- [ ] **Tabellen** zijn leesbaar
  - [ ] Horizontale scroll werkt
  - [ ] Essentiële kolommen zichtbaar
  - [ ] Touch targets groot genoeg
- [ ] **Notificaties** dropdown werkt
  - [ ] Badge zichtbaar
  - [ ] Dropdown opent correct
  - [ ] Items zijn tappable
  - [ ] Sluit correct
- [ ] **Modals** zijn bruikbaar
  - [ ] Full-screen op mobile
  - [ ] Scrollable content
  - [ ] Sluit knop bereikbaar
  - [ ] Overlay werkt

### Performance

- [ ] **Laadtijd** < 3 seconden op 3G
- [ ] **Scroll performance** is smooth (60fps)
- [ ] **Animaties** zijn niet janky
- [ ] **Touch responsiveness** < 100ms
- [ ] **Geen layout shifts** tijdens laden

### Één Hand Bediening

- [ ] **Primaire acties** bereikbaar met duim
- [ ] **Navigatie** onderaan bereikbaar (hamburger menu top-left OK)
- [ ] **Belangrijke knoppen** niet te hoog op scherm
- [ ] **Swipe gestures** als alternatief voor hoog geplaatste acties

---

## Browser DevTools Testing

### Chrome DevTools

**Stap voor stap:**

1. Open Chrome DevTools (`F12` of `Cmd+Option+I`)
2. Toggle Device Toolbar (`Ctrl+Shift+M` of `Cmd+Shift+M`)
3. Selecteer device uit dropdown of gebruik custom dimensions
4. Test verschillende devices:
   - **Mobile S** - 320px
   - **Mobile M** - 375px
   - **Mobile L** - 425px
   - **Tablet** - 768px
   - **Laptop** - 1024px
   - **Laptop L** - 1440px
5. Toggle portrait/landscape met rotate button
6. Test touch events met "Toggle device toolbar" aan
7. Simuleer netwerk condities:
   - Throttling → Slow 3G
   - Test laadtijden en responsiviteit

### Responsive Mode

```
DevTools → More tools → Sensors
- Geolocation testen
- Device orientation testen
- Touch events simuleren
```

### Performance Profiling

```
DevTools → Performance tab
1. Start recording
2. Scroll door pagina
3. Open/sluit sidebar
4. Navigeer tussen modules
5. Stop recording
6. Analyseer:
   - FPS (target: 60fps)
   - CPU usage
   - Layout shifts
   - Long tasks
```

---

## Veelvoorkomende Mobile Issues & Oplossingen

### Issue 1: Sidebar blijft zichtbaar na navigatie op mobile

**Probleem:**
```tsx
// Sidebar sluit niet automatisch na klik op nav item
<NavLink to="/dashboard">Dashboard</NavLink>
```

**Oplossing:**
```tsx
// Voeg onClick handler toe
<NavLink
  to="/dashboard"
  onClick={onMobileClose}  // Sluit sidebar op mobile
>
  Dashboard
</NavLink>

// In parent component
const onMobileClose = () => {
  if (window.innerWidth < 1024) {
    setIsSidebarOpen(false);
  }
};
```

---

### Issue 2: Inputs zoomen in op iOS

**Probleem:**
```tsx
// Input met font-size < 16px
<input type="text" className="text-sm" />
// text-sm = 14px → iOS zoomt in bij focus
```

**Oplossing:**
```tsx
// Minimum 16px font-size
<input
  type="text"
  className="text-base"  // 16px
  style={{ fontSize: '16px' }}
/>

// Of globally in CSS
input, select, textarea {
  font-size: 16px !important;
}
```

---

### Issue 3: Knoppen te klein voor vingers

**Probleem:**
```tsx
// Te kleine touch target
<button className="p-1 text-sm">X</button>
// Resultaat: 20x20px button (te klein!)
```

**Oplossing:**
```tsx
// Minimum 44x44px
<button className="min-h-[44px] min-w-[44px] p-2">
  <X size={20} />
</button>

// Of met padding
<button className="px-4 py-3">  // Resulteert in > 44px hoogte
  Opslaan
</button>
```

---

### Issue 4: Horizontale scroll op hele pagina

**Probleem:**
```tsx
// Element te breed voor mobile viewport
<div className="w-[500px]">  // Fixed width > scherm breedte
  Content
</div>
```

**Oplossing:**
```tsx
// Responsive width
<div className="w-full max-w-[500px]">
  Content
</div>

// Of overflow hidden op body
body {
  overflow-x: hidden;
  max-width: 100vw;
}

// Maar fix de oorzaak, niet het symptoom!
```

---

### Issue 5: Sidebar overlay blokkeert clicks

**Probleem:**
```tsx
// Verkeerde z-index layering
.sidebar { z-index: 50; }
.overlay { z-index: 60; }  // Overlay boven sidebar!
```

**Oplossing:**
```tsx
// Correcte z-index volgorde
.overlay {
  z-index: 40;  // Onder sidebar
  background: rgba(0, 0, 0, 0.5);
}

.sidebar {
  z-index: 50;  // Boven overlay
}
```

---

### Issue 6: Modal niet scrollable op mobile

**Probleem:**
```tsx
// Modal content langer dan scherm, geen scroll
<div className="h-full">
  <div>Lange content...</div>
</div>
```

**Oplossing:**
```tsx
// Overflow-y-auto met max-height
<div className="h-full overflow-y-auto">
  <div className="p-4 sm:p-6">
    Lange content...
  </div>
</div>

// Of max-height
<div className="max-h-screen overflow-y-auto">
  Content
</div>
```

---

### Issue 7: Active states niet zichtbaar op touch

**Probleem:**
```tsx
// Alleen hover state, geen active/focus
<button className="hover:bg-blue-500">
  Click
</button>
```

**Oplossing:**
```tsx
// Voeg active en focus states toe
<button className="
  hover:bg-blue-500
  active:bg-blue-600
  focus:ring-2 focus:ring-blue-500
  transition-colors
">
  Click
</button>

// Of global
button:active {
  transform: scale(0.98);
  transition: transform 0.1s;
}
```

---

## Best Practices Samenvatting

### ✅ DO

1. **Test op echte apparaten** - DevTools is goed, maar niet perfect
2. **Minimum 44x44px touch targets** - Volg iOS/Android guidelines
3. **16px font-size in inputs** - Voorkom zoom op iOS
4. **Mobile-first CSS** - Start met mobile, build up naar desktop
5. **Touch-friendly spacing** - Geef elementen ruimte
6. **Debounce scroll/resize events** - Voorkom performance issues
7. **Lazy load images** - Verbeter initiële laadtijd
8. **Test één hand bediening** - Belangrijke acties bereikbaar
9. **Progressive enhancement** - Basis functionaliteit op alle devices
10. **Responsive images** - Gebruik srcset en sizes

### ❌ DON'T

1. **Vast breedte elementen** - Gebruik flex/grid en percentages
2. **Kleine touch targets** - Nooit < 44x44px
3. **Hover-only interacties** - Mobiel heeft geen hover
4. **Fixed positioning zonder test** - Kan layout breken op mobile
5. **Heavy animations** - Kan janky zijn op lagere-end devices
6. **Auto-zoom inputs** - Font-size minimum 16px
7. **Horizontal scroll (unintended)** - Check overflow
8. **Popup blockers negeren** - Gebruik modals ipv popups
9. **Device detection** - Gebruik feature detection
10. **Viewport zonder meta tag** - Altijd `<meta name="viewport">`

---

## Viewport Meta Tag

**Belangrijk in HTML head:**

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
/>
```

**Betekenis:**
- `width=device-width` - Gebruik device breedte
- `initial-scale=1.0` - Start zonder zoom
- `maximum-scale=5.0` - Sta zoom toe tot 5x (accessibility)
- `user-scalable=yes` - Gebruiker mag zoomen (accessibility)

**Vermijd:**
```html
<!-- NIET DOEN: Gebruiker kan niet zoomen (accessibility issue) -->
<meta name="viewport" content="user-scalable=no, maximum-scale=1.0">
```

---

## Specifieke Module Optimalisaties

### Dashboard

```tsx
// KPI cards: 1 kolom op mobile, 4 op desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KPICard />
</div>

// Charts: Responsive height
<div className="h-64 sm:h-80 lg:h-96">
  <ResponsiveChart />
</div>
```

### Workboard

```tsx
// Kanban: Verticaal scrollen op mobile, horizontaal op desktop
<div className="
  flex flex-col lg:flex-row
  gap-4
  overflow-y-auto lg:overflow-x-auto
  h-auto lg:h-[calc(100vh-200px)]
">
  <Column />
  <Column />
  <Column />
  <Column />
</div>
```

### Inventory

```tsx
// Tabel → Cards op mobile
<div className="hidden lg:block">
  <InventoryTable />
</div>

<div className="lg:hidden space-y-3">
  {items.map(item => (
    <InventoryCard item={item} />
  ))}
</div>
```

### CRM

```tsx
// Tabs: Scrollable op mobile
<div className="overflow-x-auto -mx-4 px-4">
  <div className="flex gap-2 min-w-max">
    <Tab>Klanten</Tab>
    <Tab>Leads</Tab>
    <Tab>Interacties</Tab>
    <Tab>Email</Tab>
    <Tab>Taken</Tab>
  </div>
</div>
```

---

## Toekomstige Optimalisaties

### Geplande Features

- 🔄 **PWA (Progressive Web App)** - Installeerbaar op home screen
- 🔄 **Offline mode** - Basis functionaliteit zonder internet
- 🔄 **Push notifications** - Native notificaties op mobile
- 🔄 **Swipe gestures** - Swipe to delete, swipe to complete
- 🔄 **Haptic feedback** - Trillen bij acties (iOS/Android)
- 🔄 **Dark mode** - Oogvriendelijker op mobiel
- 🔄 **Voice input** - Spraak-naar-tekst voor notities
- 🔄 **Biometric auth** - Face ID / Touch ID login

---

## Gerelateerde Documentatie

- [Dashboard Module](../02-modules/dashboard.md) - Dashboard mobile weergave
- [Workorders](../02-modules/workorders.md) - Workboard op mobiel
- [Notifications](./notifications.md) - Notificaties op mobile
- [User Roles](./user-roles.md) - Rechten beheer
- [Performance Guide](../03-technical/performance.md) - Performance optimalisatie

---

## Resources & Links

### Tools

- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [BrowserStack](https://www.browserstack.com/) - Test op echte devices

### Guidelines

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tailwind CSS

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Tailwind Breakpoints](https://tailwindcss.com/docs/breakpoints)

---

## Support & Vragen

Voor vragen over mobile optimization:

1. Bekijk deze documentatie
2. Test in Chrome DevTools
3. Test op echt apparaat indien mogelijk
4. Check [FAQ](../05-support/faq.md)
5. Neem contact op met development team

**Laatst bijgewerkt:** November 2025 (V4.5+)
