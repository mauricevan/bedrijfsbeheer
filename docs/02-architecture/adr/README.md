# Architecture Decision Records (ADRs)

**Versie:** 1.0.0
**Laatst bijgewerkt:** 14 november 2024

---

## 📋 Wat zijn ADRs?

Architecture Decision Records (ADRs) documenteren belangrijke architecturale beslissingen in het project. Ze leggen vast:
- **Waarom** een beslissing is genomen
- **Welke alternatieven** zijn overwogen
- **Welke consequenties** de beslissing heeft
- **Context** waarin de beslissing is genomen

---

## 🎯 Waarom ADRs?

### Voordelen
- **Transparantie** - Team begrijpt waarom bepaalde keuzes zijn gemaakt
- **Onboarding** - Nieuwe teamleden kunnen snel context opbouwen
- **Historisch overzicht** - Inzicht in evolutie van architectuur
- **Voorkom herhaling** - Vermijd discussies over al genomen beslissingen
- **Documenteer trade-offs** - Leg voor- en nadelen vast

### Wanneer een ADR schrijven?
- ✅ Nieuwe technologie/framework kiezen
- ✅ Architectuur patroon wijzigen
- ✅ Grote refactoring starten
- ✅ Development workflow aanpassen
- ✅ Security/performance beslissingen
- ❌ Kleine bug fixes
- ❌ Code style wijzigingen
- ❌ Minor feature additions

---

## 📚 ADR Overzicht

| ADR | Status | Titel | Datum |
|-----|--------|-------|-------|
| [001](./001-feature-based-architecture.md) | ✅ Accepted | Feature-Based Architecture | 2024-11-14 |
| [002](./002-accounting-module-refactoring.md) | ✅ Accepted | Accounting Module Refactoring | 2024-11-14 |
| [003](./003-no-state-management-library.md) | ✅ Accepted | No External State Management Library | 2024-11-14 |
| [004](./004-src-directory-migration.md) | 🚧 Proposed | Migration to src/ Directory Structure | 2024-11-14 |

---

## 🔄 ADR Lifecycle

```
📝 Proposed    → Under review, niet geïmplementeerd
✅ Accepted    → Approved en geïmplementeerd
🚧 Deprecated  → Niet langer aanbevolen, maar nog in gebruik
❌ Superseded  → Vervangen door nieuwere ADR
```

### Status Wijzigingen
- **Proposed → Accepted**: Na team review en approval
- **Accepted → Deprecated**: Wanneer betere alternatief beschikbaar is
- **Deprecated → Superseded**: Wanneer nieuwe ADR oude vervangt

---

## 📝 ADR Template

Gebruik [template.md](./template.md) voor nieuwe ADRs.

### Structuur
```markdown
# ADR-XXX: [Titel]

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Datum:** YYYY-MM-DD
**Auteur:** [Naam]
**Tags:** [architecture, refactoring, security, etc.]

## Context
Wat is het probleem? Waarom moeten we een beslissing nemen?

## Beslissing
Wat hebben we besloten? Hoe gaan we het oplossen?

## Consequenties
### Voordelen
- Pro 1
- Pro 2

### Nadelen
- Con 1
- Con 2

## Alternatieven Overwogen
Welke andere opties zijn geëvalueerd? Waarom niet gekozen?

## Referenties
- Links naar docs
- Related ADRs
```

---

## 🔗 Gerelateerde Documentatie

- [Refactoring Plan](../refactoring-plan.md) - Implementatie details
- [Project Structure](../../01-getting-started/project-structure.md) - Huidige structuur
- [Implementation Roadmap](../../IMPLEMENTATION_ROADMAP.md) - Uitrol planning

---

## ✅ Quality Checklist

- [x] Clear title (H1)
- [x] Versie en laatste update datum
- [x] ADR overzichtstabel
- [x] Template beschikbaar
- [x] Lifecycle uitgelegd
- [x] Cross-links naar gerelateerde docs
- [x] Praktische voorbeelden
- [x] Status indicatoren (emoji)
- [x] Wanneer ADR schrijven criteria
- [x] Geen gebroken links
- [x] Consistent formatting
- [x] Searchable keywords

---

**Happy documenting! 📚**
