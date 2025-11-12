# Projectstructuur - Bedrijfsbeheer 2.0

> **Laatst bijgewerkt:** `2025-04-05`  
> **Genereerd door:** Cursor AI (refactoring guard)  
> **Doel:** Voorkom toekomstige refactoring door strikte structuur.
> src/
> ├── components/ # UI-componenten (geen business logic)
> │ ├── common/ # Herbruikbare UI
> │ │ ├── modals/ # ConfirmModal, OverviewModal
> │ │ ├── forms/ # InventoryItemSelector, LaborInput
> │ │ ├── charts/ # LineChart, BarChart
> │ │ └── index.ts
> │ ├── accounting/ # Accounting-specifieke UI
> │ │ ├── dashboard/ # AccountingDashboard, DashboardStats
> │ │ ├── quotes/ # QuoteList, QuoteForm, QuoteItemRow
> │ │ ├── invoices/ # InvoiceList, InvoiceForm
> │ │ ├── transactions/ # TransactionList
> │ │ └── index.ts
> │ ├── crm/
> │ └── index.ts
> │
> ├── features/ # Business logic per domein
> │ └── accounting/
> │ ├── hooks/ # useQuotes, useInvoices, useQuoteForm
> │ │ └── index.ts
> │ ├── services/ # quoteService, invoiceService
> │ │ └── index.ts
> │ ├── utils/ # calculations, formatters, validators
> │ │ └── index.ts
> │ ├── types/ # accounting.types.ts
> │ └── index.ts
> │
> ├── pages/ # Orchestratie (max 300 regels)
> │ ├── Accounting.tsx # Tab-navigatie + component rendering
> │ ├── CRM.tsx
> │ └── index.ts
> │
> ├── hooks/ # Globale custom hooks
> │ ├── useLocalStorage.ts
> │ ├── useDebounce.ts
> │ └── index.ts
> │
> ├── utils/ # Algemene helpers
> │ ├── analytics.ts
> │ ├── email/
> │ ├── fileHelpers.ts # list_directory, pages_directory
> │ └── index.ts
> │
> └── types/ # Globale TypeScript types
> ├── index.ts
> └── global.d.ts
> text**Cursor AI moet dit bestand altijd updaten bij nieuwe mappen.**

2. utils/fileHelpers.ts (Veilige list_directory)
   ts// src/utils/fileHelpers.ts
   import fs from 'fs';
   import path from 'path';

/\*\*

- Veilig lijst bestanden/mappen op in een directory
- Gebruikt in plaats van directory_tree → voorkomt overbelasting
  \*/
  export const list_directory = async (dirPath: string): Promise<string[]> => {
  try {
  const items = await fs.promises.readdir(dirPath);
  return items.filter(item => {
  const fullPath = path.join(dirPath, item);
  const stat = fs.statSync(fullPath);
  return stat.isDirectory() || stat.isFile();
  });
  } catch (error) {
  console.warn(`[list_directory] Kon map niet lezen: ${dirPath}`);
  return [];
  }
  };

/\*\*

- Lijst alleen pagina's op (pages/ map)
  \*/
  export const pages_directory = async (): Promise<string[]> => {
  const pagesPath = path.join(process.cwd(), 'src', 'pages');
  return list_directory(pagesPath);
  };

3. .cursor/rules.md (AI Regels — Cursor AI moet dit altijd volgen)
   md# Cursor AI Regels - Bedrijfsbeheer 2.0

## ALTIJD VOLGEN

1. **Nooit** `directory_tree` gebruiken → gebruik `list_directory` of `pages_directory`
2. **Nooit** `read_file` → gebruik `edit_file` of `str_replace`
3. **Altijd** `project_structure.md` updaten bij:
   - Nieuwe map
   - Verplaatste map
   - Verwijderde map
4. **Altijd** `README.md` synchroniseren met `project_structure.md`
5. **Max 1 bestand wijzigen per prompt** (tenzij bulk replace)
6. **Gebruik barrel files** (`index.ts`) in elke map
7. **Geen component > 300 regels**
8. **Geen hook > 200 regels**
9. **Alle services zijn pure functies** (geen React, geen state)
10. **Gebruik `React.memo` bij lijsten**
11. **Gebruik `useCallback` bij event handlers in lijsten**
12. **Geen inline styles** → gebruik Tailwind classes
13. **Gebruik `type` in plaats van `interface` voor props**
14. **Alle nieuwe bestanden moeten in `project_structure.md`**

## VOORBEELD IMPORTS

````ts
// Goed
import { useQuotes } from '@/features/accounting/hooks';
import { ConfirmModal } from '@/components/common/modals';

// Slecht
import { useQuotes } from '../../features/accounting/hooks/useQuotes';
FOUTAFHANDELING

Gebruik try/catch in alle async operaties
Log warnings, nooit errors

text---

## 4. VS Code Snippet: Snelle Structuur Update

Ga naar: **VS Code → Settings → User Snippets → markdown.json**

```json
{
  "Update Project Structure": {
    "prefix": "upstruct",
    "body": [
      "> **Laatst bijgewerkt:** `${1:$(date '+%Y-%m-%d')}`",
      "> **Genereerd door:** Cursor AI (refactoring guard)",
      "",
      "```",
      "src/",
      "${2:├── components/}",
      "${3:│   └── accounting/}",
      "${4:│       └── quotes/}",
      "├── features/",
      "│   └── accounting/",
      "│       ├── hooks/",
      "│       ├── services/",
      "│       └── utils/",
      "├── pages/",
      "└── types/",
      "```",
      "",
      "**Cursor AI moet dit bestand altijd updaten bij nieuwe mappen.**"
    ],
    "description": "Update project_structure.md met huidige structuur"
  }
}
Gebruik: Typ upstruct in project_structure.md → automatisch bijwerken.

5. Automatisch Sync Script (Bonus)
Maak: scripts/sync-structure.js
js// scripts/sync-structure.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src');
const OUTPUT = path.join(__dirname, '..', 'project_structure.md');

function buildTree(dir, prefix = '') {
  const items = fs.readdirSync(dir).filter(i => i !== '.git' && i !== 'node_modules');
  const dirs = items.filter(i => fs.statSync(path.join(dir, i)).isDirectory());
  const tree = [];

  dirs.forEach((name, index) => {
    const isLast = index === dirs.length - 1;
    tree.push(`${prefix}${isLast ? '└──' : '├──'} ${name}/`);
    tree.push(...buildTree(path.join(dir, name), `${prefix}${isLast ? '   ' : '│  '}`));
  });

  return tree;
}

const tree = [
  '# Projectstructuur - Bedrijfsbeheer 2.0\n',
  `> **Laatst bijgewerkt:** ${new Date().toISOString().split('T')[0]}\n`,
  '> **Genereerd door:** Automatisch script\n',
  '```\nsrc/',
  ...buildTree(ROOT).map(line => line.replace(/src\//, '')),
  '```\n',
  '**Cursor AI moet dit bestand altijd updaten bij nieuwe mappen.**'
].join('\n');

fs.writeFileSync(OUTPUT, tree);
console.log('project_structure.md bijgewerkt!');
Run met:
bashnode scripts/sync-structure.js

Samenvatting: Jouw Anti-Refactor Systeem





























BestandDoelproject_structure.mdVisuele blauwdrukutils/fileHelpers.tsVeilige file ops.cursor/rules.mdAI gedragsregelsVS Code SnippetSnelle updatessync-structure.jsAutomatisch genereren
````
