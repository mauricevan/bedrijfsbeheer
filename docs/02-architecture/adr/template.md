# ADR-XXX: [Korte, beschrijvende titel]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Datum:** YYYY-MM-DD
**Auteur:** [Naam van beslisser/team]
**Tags:** [architecture, refactoring, security, performance, tooling, etc.]

---

## 📋 Context

### Probleem
Beschrijf het probleem of de vraag die tot deze beslissing heeft geleid:
- Wat is de huidige situatie?
- Welke pijnpunten ervaren we?
- Waarom moeten we nu een beslissing nemen?
- Welke requirements/constraints zijn er?

### Achtergrond
Relevante context informatie:
- Projectfase waarin we zitten
- Team samenstelling/expertise
- Budget/tijd constraints
- Technische schuld of legacy code
- Compliance/security vereisten

---

## ✅ Beslissing

### Wat we hebben besloten
[Duidelijke, beknopte beschrijving van de beslissing]

### Hoe we het implementeren
```
Geef technische details:
- Welke tools/libraries?
- Welke patronen/architectuur?
- Migratiepad (indien van toepassing)
- Rollout strategie
```

### Implementatie voorbeeld
```typescript
// Concrete code voorbeelden van hoe de beslissing er in praktijk uitziet
```

---

## 📊 Consequenties

### ✅ Voordelen
- **[Voordeel 1]** - Uitleg waarom dit belangrijk is
- **[Voordeel 2]** - Impact op team/project
- **[Voordeel 3]** - Lange termijn waarde

### ⚠️ Nadelen / Trade-offs
- **[Nadeel 1]** - Mitigatie strategie
- **[Nadeel 2]** - Hoe we hiermee omgaan
- **[Nadeel 3]** - Acceptabel risico omdat...

### 🔄 Impact op Team
- **Developer Experience:** Hoe beïnvloedt dit developers?
- **Learning Curve:** Welke nieuwe kennis is nodig?
- **Onboarding:** Effect op nieuwe teamleden
- **Workflow:** Veranderingen in dagelijks werk

### 📈 Impact op Codebase
- **Migration Effort:** Hoeveel werk is de migratie?
- **Breaking Changes:** Wat breekt er?
- **Backward Compatibility:** Kunnen we oude code behouden?
- **Technical Debt:** Ontstaat er nieuwe tech debt?

---

## 🔍 Alternatieven Overwogen

### Alternatief 1: [Naam]
**Beschrijving:**
[Wat is dit alternatief?]

**Waarom niet gekozen:**
- Reden 1
- Reden 2
- Reden 3

**Wanneer wel geschikt:**
[In welke situatie zou dit alternatief beter zijn?]

### Alternatief 2: [Naam]
**Beschrijving:**
[Wat is dit alternatief?]

**Waarom niet gekozen:**
- Reden 1
- Reden 2

### Alternatief 3: Status Quo (Niets doen)
**Waarom niet gekozen:**
[Waarom is niet veranderen geen optie?]

---

## 📚 Referenties

### Gerelateerde ADRs
- [ADR-XXX: Related Decision](./XXX-related-decision.md)
- [ADR-YYY: Previous Decision](./YYY-previous-decision.md)

### Externe Resources
- [Official Documentation](https://example.com)
- [Blog Post](https://example.com)
- [GitHub Discussion](https://example.com)

### Interne Documentatie
- [Refactoring Plan](../refactoring-plan.md)
- [Implementation Roadmap](../../IMPLEMENTATION_ROADMAP.md)
- [Feature Documentation](../../03-features/README.md)

---

## ✅ Review Checklist

Voordat deze ADR wordt geaccepteerd:

- [ ] Probleem/context is duidelijk beschreven
- [ ] Beslissing is specifiek en actionable
- [ ] Alle consequenties (voor- en nadelen) zijn gedocumenteerd
- [ ] Minimaal 2 alternatieven zijn overwogen
- [ ] Implementatie voorbeelden zijn toegevoegd
- [ ] Team heeft beslissing gereviewd
- [ ] Stakeholders zijn geïnformeerd
- [ ] Referenties zijn compleet
- [ ] Tags zijn toegevoegd
- [ ] Status is correct

---

## 📝 Change Log

| Datum | Wijziging | Auteur |
|-------|-----------|--------|
| YYYY-MM-DD | ADR created (status: Proposed) | [Naam] |
| YYYY-MM-DD | ADR accepted after team review | [Naam] |

---

## 💡 Tips voor het schrijven van goede ADRs

1. **Wees specifiek** - Vage beslissingen zijn niet bruikbaar
2. **Documenteer trade-offs** - Elke beslissing heeft nadelen
3. **Denk aan toekomst** - Zal je over 6 maanden begrijpen waarom?
4. **Include voorbeelden** - Code spreekt luider dan woorden
5. **Link naar context** - Verwijs naar gerelateerde docs/issues
6. **Update bij wijzigingen** - Houd change log bij
7. **Review met team** - Meerdere ogen zien meer
8. **Schrijf voor nieuwkomers** - Onboarding tool, geen geheugensteun

---

**Template versie:** 1.0.0
**Laatst bijgewerkt:** 14 november 2024
