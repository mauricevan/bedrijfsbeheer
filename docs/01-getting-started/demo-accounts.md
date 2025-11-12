# Demo Accounts

Het systeem heeft een volledig werkend login systeem met 4 test accounts:

## Account Overzicht

| Naam           | Email             | Rol                 | Admin  | Wachtwoord |
| -------------- | ----------------- | ------------------- | ------ | ---------- |
| Sophie van Dam | sophie@bedrijf.nl | Manager Productie   | ✅ Ja  | 1234       |
| Jan de Vries   | jan@bedrijf.nl    | Productiemedewerker | ❌ Nee | 1234       |
| Maria Jansen   | maria@bedrijf.nl  | Lasser              | ❌ Nee | 1234       |
| Peter Bakker   | peter@bedrijf.nl  | Spuiter             | ❌ Nee | 1234       |

## Account Details

### Sophie van Dam (Admin)
- **Rol**: Manager Productie
- **Rechten**: Volledige toegang tot alle modules
- **Kan**:
  - Nieuwe werkorders aanmaken en toewijzen
  - Modules in- en uitschakelen
  - Medewerkers beheren
  - Alle werkorders van alle medewerkers zien
  - Facturen en offertes beheren
  - Admin instellingen aanpassen

### Jan de Vries (User)
- **Rol**: Productiemedewerker
- **Rechten**: Persoonlijk workboard met eigen taken
- **Kan**:
  - Eigen werkorders beheren
  - Status van eigen taken updaten
  - Uren registreren
  - Taken van collega's bekijken (read-only)

### Maria Jansen (User)
- **Rol**: Lasser
- **Rechten**: Persoonlijk workboard met eigen taken
- **Kan**: Zelfde als Jan de Vries

### Peter Bakker (User)
- **Rol**: Spuiter
- **Rechten**: Persoonlijk workboard met eigen taken
- **Kan**: Zelfde als Jan de Vries

## Login Methods

### Standaard Login
1. Voer email adres in
2. Voer wachtwoord in (1234)
3. Klik op "Inloggen"

### Quick Login (Demo Mode)
- Gebruik de quick login knoppen onder het formulier
- Direct inloggen zonder credentials invoeren
- Ideaal voor demo doeleinden

## Meer informatie

- [User Roles](../04-features/user-roles.md) - Gedetailleerd overzicht van rechten per rol
- [Login Features](./login-users.md) - Alle login functionaliteiten
