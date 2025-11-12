# Admin Rechten Overzicht

Dit document beschrijft welke rechten een **Admin** (Manager Productie) heeft ten opzichte van een **gewone User** (medewerker).

---

## 🔐 Algemene Admin Rechten

### Toegang tot Modules
- ✅ **Admin Instellingen module** - Alleen admins hebben toegang
- ✅ **Modules in- en uitschakelen** - Alleen admins kunnen modules activeren/deactiveren
- ✅ **Volledige CRUD operaties** op alle data

---

## 📊 Dashboard Module

### Admin
- ✅ Volledig overzicht van alle statistieken (alle medewerkers)
- ✅ Alle notificaties zien en beheren
- ✅ Complete bedrijfsdata overzicht

### User
- ✅ Persoonlijke statistieken alleen
- ✅ Eigen notificaties alleen

---

## 📦 Voorraadbeheer (Inventory)

### Admin
- ✅ **Nieuwe items toevoegen** ("+ Nieuw Item" knop)
- ✅ **Items bewerken** (naam, SKU, voorraad, leverancier, etc.)
- ✅ **Items verwijderen**
- ✅ **Voorraadniveaus aanpassen**
- ✅ **Herbestelniveaus instellen**

### User
- ✅ **Alleen bekijken** (read-only)
- ❌ Kan geen items toevoegen
- ❌ Kan geen items bewerken
- ❌ Kan geen items verwijderen

---

## 👥 CRM Module

### Admin
- ✅ **Nieuwe klanten toevoegen** ("+ Nieuwe Klant" knop)
- ✅ **Klanten bewerken** (naam, email, telefoon, adres, notities)
- ✅ **Klanten verwijderen**
- ✅ **Nieuwe leads toevoegen**
- ✅ **Leads beheren** (status wijzigen, bewerken)
- ✅ **Leads verwijderen**
- ✅ **Taken toevoegen**
- ✅ **Taken beheren** (status wijzigen, toewijzen)
- ✅ **Facturen beheren vanuit klantoverzicht** (clonen, bewerken, naar werkorder sturen)
- ✅ **Offertes beheren vanuit klantoverzicht** (clonen, bewerken, naar werkorder sturen)

### User
- ✅ **Klanten bekijken** (read-only)
- ✅ **Leads bekijken** (read-only)
- ✅ **Taken bekijken** (read-only)
- ❌ Kan geen klanten toevoegen/bewerken/verwijderen
- ❌ Kan geen leads beheren
- ❌ Kan geen taken toevoegen

---

## 🧾 Boekhouding & Facturen (Accounting)

### Admin
- ✅ **Nieuwe facturen aanmaken** ("+ Nieuwe Factuur" knop)
- ✅ **Facturen bewerken** (items, arbeid, klant, bedrag, etc.)
- ✅ **Facturen verwijderen**
- ✅ **Facturen naar werkorders sturen**
- ✅ **Betalingen registreren** (status wijzigen naar "Betaald")
- ✅ **Factuur status beheren** (draft, sent, paid, overdue)
- ✅ **Nieuwe offertes aanmaken** ("+ Nieuwe Offerte" knop)
- ✅ **Offertes bewerken**
- ✅ **Offertes verwijderen**
- ✅ **Offertes naar werkorders sturen**
- ✅ **Offerte status beheren** (draft, sent, approved, rejected, expired)
- ✅ **Dashboard met alle financiële inzichten**

### User
- ✅ **Facturen bekijken** (read-only)
- ✅ **Offertes bekijken** (read-only)
- ❌ Kan geen facturen/offertes aanmaken
- ❌ Kan geen facturen/offertes bewerken
- ❌ Kan geen betalingen registreren
- ❌ Geen toegang tot Accounting module (waarschijnlijk niet zichtbaar in menu)

---

## 🔧 Werkorders (WorkOrders)

### Admin
- ✅ **Alle werkorders van alle medewerkers zien** ("Alle medewerkers" dropdown optie)
- ✅ **Nieuwe werkorders aanmaken** ("+ Nieuwe Werkorder" knop)
- ✅ **Werkorders toewijzen** aan medewerkers
- ✅ **Werkorders bewerken** (titel, beschrijving, materiaal, status)
- ✅ **Werkorders verwijderen**
- ✅ **Status van alle werkorders wijzigen**
- ✅ **Gegroepeerd overzicht** per medewerker (bij "Alle medewerkers")
- ✅ **Werkorders vanuit offertes/facturen aanmaken**
- ✅ **Tussentijdse aanpassingen** doorvoeren met synchronisatie

### User
- ✅ **Alleen eigen werkorders zien** (persoonlijk workboard)
- ✅ **Eigen werkorders beheren** (status updaten, uren registreren)
- ✅ **Taken starten** ("▶ Start Werkorder" knop)
- ✅ **Taken in wacht zetten** ("⏸ In Wacht Zetten" knop)
- ✅ **Taken voltooien** ("✓ Voltooi" knop)
- ✅ **Uren registreren** op eigen taken
- ✅ **Werkorders van collega's bekijken** (via dropdown, read-only)
- ❌ Kan geen nieuwe werkorders aanmaken
- ❌ Kan geen werkorders toewijzen
- ❌ Kan werkorders van anderen niet bewerken

---

## 👤 Personeelsbeheer (HRM)

### Admin
- ✅ **Nieuwe medewerkers toevoegen** ("+ Nieuwe Medewerker" knop)
- ✅ **Medewerkers bewerken** (naam, rol, email, telefoon, wachtwoord)
- ✅ **Admin rechten toewijzen** (isAdmin checkbox)
- ✅ **Wachtwoord instellen/wijzigen** voor medewerkers
- ✅ **Medewerkers verwijderen**
- ✅ **Persoonlijk dossier bijhouden** (notities toevoegen: laat, milestone, etc.)
- ✅ **Alle medewerkers zien en beheren**

### User
- ✅ **Eigen profiel bekijken**
- ❌ Kan geen medewerkers toevoegen
- ❌ Kan geen medewerkers bewerken
- ❌ Kan geen wachtwoorden wijzigen
- ❌ Kan geen admin rechten toewijzen
- ❌ Geen toegang tot HRM module (waarschijnlijk niet zichtbaar in menu)

---

## 📅 Planning & Agenda (Planning)

### Admin
- ✅ Volledige toegang tot planning en agenda beheer
- ✅ Afspraken aanmaken en beheren
- ✅ Beschikbaarheid beheren

### User
- ✅ Eigen planning bekijken
- ❌ Beperkte bewerkingsrechten

---

## 📊 Rapportages (Reports)

### Admin
- ✅ **Alle rapport types** (Omzet, Werkorders, Voorraad, Klanten)
- ✅ **Complete data export**
- ✅ **Alle filters en analyses**

### User
- ✅ Mogelijk beperkte rapportages (eigen data alleen)
- ❌ Geen toegang tot volledige bedrijfsrapportages

---

## 💰 Kassasysteem (POS)

### Admin
- ✅ Volledige toegang tot POS
- ✅ Verkooptransacties beheren
- ✅ Producten beheren

### User
- ✅ Verkopen verwerken (mogelijk)
- ❌ Beperkte toegang

---

## 🔔 Notificaties

### Admin
- ✅ **Alle notificaties** (voor alle modules en alle gebruikers)
- ✅ **Notificaties beheren**
- ✅ **Markeren als gelezen**

### User
- ✅ **Alleen eigen notificaties**
- ✅ **Markeren als gelezen**

---

## ⚙️ Admin Instellingen

### Admin
- ✅ **Modules in- en uitschakelen**
- ✅ **Systeeminstellingen beheren**
- ✅ **Rechten en toegang beheren**

### User
- ❌ **Geen toegang** tot Admin Instellingen module

---

## 📋 Samenvatting: Belangrijkste Verschillen

| Functionaliteit | Admin | User |
|----------------|-------|------|
| **Nieuwe items/klanten/werkorders toevoegen** | ✅ | ❌ |
| **Items bewerken/verwijderen** | ✅ | ❌ |
| **Alle werkorders zien** | ✅ | ❌ (alleen eigen) |
| **Werkorders toewijzen** | ✅ | ❌ |
| **Facturen beheren** | ✅ | ❌ |
| **Medewerkers beheren** | ✅ | ❌ |
| **Admin rechten toewijzen** | ✅ | ❌ |
| **Modules in-/uitschakelen** | ✅ | ❌ |
| **Alle data zien** | ✅ | ❌ (alleen eigen) |
| **Eigen werkorders beheren** | ✅ | ✅ |
| **Uren registreren** | ✅ | ✅ |
| **Data bekijken** | ✅ | ✅ (beperkt) |

---

**Laatste update**: December 2024  
**Versie**: 4.9.0

