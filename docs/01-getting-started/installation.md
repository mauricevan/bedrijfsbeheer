# Installatie

## Vereisten

- Node.js (v18 of hoger)
- npm of yarn

## Stappen

1. **Clone of download het project**

   ```bash
   git clone <repository-url>
   cd bedrijfsbeheer
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
   - Login met één van de demo accounts (zie [Demo Accounts](./demo-accounts.md))

## Build voor productie

```bash
npm run build
npm run preview
```

## Troubleshooting

### Port al in gebruik
Als poort 5173 al in gebruik is, zal Vite automatisch een andere poort kiezen.

### Dependencies installatie mislukt
Probeer de node_modules map te verwijderen en opnieuw te installeren:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
Zorg ervoor dat je Node.js versie 18 of hoger gebruikt:

```bash
node --version
```

## Volgende stappen

- [Quick Start Guide](./quick-start.md) - Begin direct met de applicatie
- [Demo Accounts](./demo-accounts.md) - Inloggegevens voor test accounts
- [Login & Users](./login-users.md) - Meer over het authenticatie systeem
