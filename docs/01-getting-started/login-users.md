# Login & Gebruikers

## Login Systeem

Het Bedrijfsbeheer Dashboard heeft een volledig werkend authenticatie systeem met rol-gebaseerde toegangscontrole.

## Login Features

- ✅ **Email + wachtwoord authenticatie** - Standaard login met credentials
- ✅ **Quick login knoppen** - Voor snelle demo toegang
- ✅ **Modern login scherm** - Met gradient achtergrond
- ✅ **Automatische rol detectie** - Admin vs User rechten
- ✅ **Veilige logout functionaliteit** - Session management
- ✅ **Gebruiker info in header** - Met avatar en naam
- ✅ **Wachtwoord verbergen/tonen** - Toggle voor wachtwoord zichtbaarheid

## Authenticatie Flow

### Login Process
1. Gebruiker opent applicatie
2. Wordt doorverwezen naar login scherm (indien niet ingelogd)
3. Voert credentials in of gebruikt quick login
4. Systeem valideert credentials
5. Bij success: redirect naar dashboard
6. Bij failure: error boodschap tonen

### Session Management
- Session wordt opgeslagen in Redux state
- Blijft actief tot logout
- Automatische redirect naar login bij unauthorized access

### Logout Process
1. Gebruiker klikt op logout knop (in gebruikersmenu)
2. Redux state wordt gereset
3. Redirect naar login scherm

## Gebruikersrollen

Het systeem kent twee hoofdrollen:

### 1. Admin (Manager)
- Volledige toegang tot alle modules
- Kan modules in- en uitschakelen
- Kan medewerkers beheren en rechten toewijzen
- Ziet alle werkorders van alle medewerkers
- Kan nieuwe items/klanten/werkorders aanmaken

### 2. User (Medewerker)
- Persoonlijk workboard met eigen toegewezen taken
- Kan eigen werkorders beheren en status updaten
- Kan uren registreren op eigen taken
- Kan taken van collega's bekijken (read-only)
- Beperkte toegang tot bepaalde modules

## Wachtwoord Beheer

### Admin Wachtwoord Wijzigen
Alleen admins kunnen wachtwoorden wijzigen:
1. Ga naar HRM module
2. Selecteer medewerker
3. Klik op "Bewerken"
4. Voer nieuw wachtwoord in
5. Sla op

### User Wachtwoord
- Users kunnen momenteel hun eigen wachtwoord niet wijzigen
- Neem contact op met admin voor wachtwoord reset

## Beveiliging

### Huidige Implementatie
- Password-based authentication
- Role-based access control (RBAC)
- Session management via Redux

### Toekomstige Verbeteringen
- [ ] Wachtwoord sterkte vereisten
- [ ] 2-factor authenticatie (2FA)
- [ ] Password reset functionaliteit voor users
- [ ] Session timeout
- [ ] Login attempt limiting

## Demo Accounts

Zie [Demo Accounts](./demo-accounts.md) voor alle test credentials.

## Gerelateerde Documentatie

- [User Roles & Permissions](../04-features/user-roles.md) - Gedetailleerd rechten overzicht
- [HRM Module](../03-modules/hrm.md) - Personeelsbeheer en wachtwoord management
- [Security](../02-architecture/security.md) - Beveiligingsarchitectuur
