# Code Review Checklist

**Versie:** 1.0.0
**Laatst bijgewerkt:** 14 november 2024

---

## 📋 Hoe te gebruiken

Deze checklist gebruiken bij elke Pull Request review:

1. **Copy checklist** naar PR comment
2. **Check items** terwijl je code reviewt
3. **Add comments** bij items die aandacht nodig hebben
4. **Approve/Request Changes** gebaseerd op checklist resultaten

---

## ✅ Complete Review Checklist

### 1. TypeScript

```markdown
- [ ] Geen `any` types gebruikt
- [ ] Interfaces gedefinieerd voor alle data structures
- [ ] Props types voor alle React componenten
- [ ] Return types voor alle functies
- [ ] Type imports gebruiken `import type { ... }`
- [ ] Enums of union types voor constante waardes
- [ ] Generic types waar herbruikbaar
- [ ] No type assertions (`as`) tenzij noodzakelijk
```

**Waarom belangrijk:** Type safety voorkomt runtime errors en verbetert IDE autocomplete.

**Voorbeelden:**
```typescript
// ❌ BAD
const user: any = getUserData();
function calculate(data) { ... }

// ✅ GOOD
interface User {
  id: string;
  name: string;
}

const user: User = getUserData();
function calculate(data: number[]): number { ... }
```

---

### 2. React Best Practices

```markdown
- [ ] Functional components only (geen class components)
- [ ] Immutable state updates (spread operators)
- [ ] useCallback voor event handlers
- [ ] useMemo voor derived state of expensive calculations
- [ ] React.memo voor performance optimalisatie (waar zinvol)
- [ ] Key props in alle lijst renderings
- [ ] Proper cleanup in useEffect (return cleanup function)
- [ ] Dependencies array compleet in useEffect/useCallback/useMemo
```

**Waarom belangrijk:** React best practices zorgen voor betere performance en voorspelbaar gedrag.

**Voorbeelden:**
```typescript
// ❌ BAD
const handleClick = () => { ... };  // Re-created every render
items.push(newItem);  // Direct mutation
const total = calculateTotal(items);  // Calculated every render

// ✅ GOOD
const handleClick = useCallback(() => { ... }, [deps]);
setItems(prev => [...prev, newItem]);  // Immutable
const total = useMemo(() => calculateTotal(items), [items]);
```

---

### 3. Project Structure

```markdown
- [ ] Component files < 300 regels
- [ ] Hook files < 200 regels
- [ ] Service files < 250 regels
- [ ] Barrel files (`index.ts`) gebruikt voor exports
- [ ] Correct feature directory (features/[name]/)
- [ ] Separate folders: hooks/, services/, utils/, types/
- [ ] README.md in feature directory (indien nieuwe feature)
- [ ] File naming conventions gevolgd
```

**Waarom belangrijk:** Consistente structuur maakt codebase navigeerbaar en schaalbaar.

**Conventies:**
```
features/[feature]/
├── hooks/useFeature.ts       # camelCase met 'use' prefix
├── services/featureService.ts # camelCase met suffix
├── utils/validators.ts        # camelCase, beschrijvend
├── types/feature.types.ts     # camelCase met '.types' suffix
└── index.ts                   # Barrel export
```

---

### 4. Code Quality

```markdown
- [ ] Code is leesbaar en begrijpelijk
- [ ] Geen code duplicatie (DRY principle)
- [ ] Functies hebben één verantwoordelijkheid (Single Responsibility)
- [ ] Duidelijke en consistente naming
- [ ] Geen magic numbers of strings (gebruik constants)
- [ ] Complexe logic heeft comments
- [ ] No commented-out code (verwijder of explain waarom)
- [ ] Consistent formatting (Prettier)
```

**Waarom belangrijk:** Leesbare code is maintainable code.

**Voorbeelden:**
```typescript
// ❌ BAD
const x = data.filter(d => d.s === 1 && d.a > 100).map(d => d.p);
if (status === 2) { ... }  // Magic number

// ✅ GOOD
const ACTIVE_STATUS = 1;
const MIN_AMOUNT = 100;

const activePrices = data
  .filter(item => item.status === ACTIVE_STATUS && item.amount > MIN_AMOUNT)
  .map(item => item.price);

const PENDING_STATUS = 2;
if (status === PENDING_STATUS) { ... }
```

---

### 5. Security

```markdown
- [ ] User input wordt gevalideerd
- [ ] No SQL injection risks (parameterized queries)
- [ ] No XSS vulnerabilities (sanitize HTML)
- [ ] No CSRF vulnerabilities (tokens waar nodig)
- [ ] Passwords worden gehashed (bcrypt, nooit plain-text)
- [ ] Sensitive data niet in client-side code
- [ ] No hardcoded credentials/API keys
- [ ] Rate limiting voor API calls (waar applicable)
```

**Waarom belangrijk:** Security vulnerabilities kunnen leiden tot data leaks en hacks.

**Voorbeelden:**
```typescript
// ❌ BAD
const password = 'admin123';  // Hardcoded
const html = `<div>${userInput}</div>`;  // XSS risk
db.query(`SELECT * FROM users WHERE id = ${userId}`);  // SQL injection

// ✅ GOOD
const password = await bcrypt.hash(userPassword, 10);
const html = DOMPurify.sanitize(`<div>${userInput}</div>`);
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

---

### 6. Error Handling

```markdown
- [ ] Try-catch voor async operations
- [ ] Error boundaries voor React component crashes (waar zinvol)
- [ ] User-friendly error messages
- [ ] Errors worden gelogd (console.error minimaal)
- [ ] No silent failures (catch zonder handling)
- [ ] Fallback UI bij errors
- [ ] Retry logic voor netwerk errors (waar zinvol)
```

**Waarom belangrijk:** Goede error handling verbetert user experience en debugging.

**Voorbeelden:**
```typescript
// ❌ BAD
const data = await fetchData();  // No error handling
catch (error) { }  // Silent failure

// ✅ GOOD
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  showErrorMessage('Could not load data. Please try again.');
}
```

---

### 7. Performance

```markdown
- [ ] Geen onnodige re-renders
- [ ] Lazy loading voor grote componenten (React.lazy)
- [ ] Code splitting waar zinvol
- [ ] Images zijn geoptimaliseerd
- [ ] Efficient algorithms (no O(n²) waar O(n) kan)
- [ ] Debounce/throttle voor frequent events (scroll, resize)
- [ ] useMemo voor expensive calculations
- [ ] useCallback om dependency changes te voorkomen
```

**Waarom belangrijk:** Performance beïnvloedt user experience direct.

**Voorbeelden:**
```typescript
// ❌ BAD
{items.map(item => items.filter(i => i.category === item.category))}  // O(n²)

// ✅ GOOD
const itemsByCategory = useMemo(() => {
  return items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});
}, [items]);  // O(n)
```

---

### 8. Testing

```markdown
- [ ] Unit tests voor nieuwe business logic
- [ ] Integration tests voor feature flows
- [ ] Tests slagen allemaal
- [ ] Edge cases worden getest
- [ ] Error scenarios worden getest
- [ ] Coverage threshold gehaald (70%+ voor units)
- [ ] Test names zijn descriptive ("should calculate balance correctly when...")
- [ ] No flaky tests (tests die random falen)
```

**Waarom belangrijk:** Tests voorkomen regressions en documenteren gedrag.

**Voorbeelden:**
```typescript
// ✅ GOOD Test Structure
describe('calculateBalance', () => {
  it('should return 0 when no entries exist', () => {
    expect(calculateBalance([])).toBe(0);
  });

  it('should calculate positive balance with income only', () => {
    const entries = [{ type: 'income', amount: 100 }];
    expect(calculateBalance(entries)).toBe(100);
  });

  it('should handle negative balance with expenses', () => {
    const entries = [
      { type: 'income', amount: 100 },
      { type: 'expense', amount: 150 }
    ];
    expect(calculateBalance(entries)).toBe(-50);
  });
});
```

---

### 9. Documentation

```markdown
- [ ] Complex logic heeft comments
- [ ] README.md bijgewerkt (indien nieuwe feature)
- [ ] ADR geschreven (indien architecture change)
- [ ] JSDoc comments voor public APIs
- [ ] Type annotations aanwezig (TypeScript)
- [ ] Examples in README voor nieuwe functies
- [ ] CHANGELOG bijgewerkt (indien release)
```

**Waarom belangrijk:** Documentatie helpt toekomstige developers (inclusief jezelf over 6 maanden).

**Voorbeelden:**
```typescript
/**
 * Calculates the total balance from accounting entries.
 *
 * @param entries - Array of accounting entries
 * @returns The calculated balance (income - expenses)
 *
 * @example
 * ```typescript
 * const entries = [
 *   { type: 'income', amount: 100 },
 *   { type: 'expense', amount: 50 }
 * ];
 * calculateBalance(entries); // Returns 50
 * ```
 */
export const calculateBalance = (entries: AccountingEntry[]): number => {
  // Implementation...
};
```

---

### 10. Git Hygiene

```markdown
- [ ] Meaningful commit messages (Conventional Commits)
- [ ] Branch naming convention gevolgd
- [ ] No merge commits (squash merge)
- [ ] No unrelated changes (stay focused)
- [ ] Resolved merge conflicts correctly
- [ ] No debugging code (console.log, debugger)
- [ ] No commented-out code tenzij explained
```

**Waarom belangrijk:** Clean git history maakt debugging en rollbacks makkelijker.

**Conventies:**
```bash
# Branch naming
feature/advanced-material-search
bugfix/balance-calculation
refactor/accounting-module

# Commit messages
feat: add advanced material search filters
fix: correct balance calculation for VAT
refactor: extract accounting services to feature module
```

---

## 🎯 Priority Levels

### 🔴 CRITICAL (must fix before merge)
- Security vulnerabilities
- Breaking changes without migration
- Type safety violations (any types)
- Failing tests
- Performance regressions

### 🟡 HIGH (should fix before merge)
- Code quality issues
- Missing tests
- Inconsistent with patterns
- Poor error handling
- Missing documentation

### 🟢 MEDIUM (nice to have)
- Minor refactoring opportunities
- Additional test cases
- Documentation improvements
- Performance optimizations

### ⚪ LOW (optional)
- Naming suggestions
- Comment style
- Code style preferences

---

## 📊 Review Decision Matrix

| Tests | Quality | Security | Documentation | Decision |
|-------|---------|----------|---------------|----------|
| ✅ | ✅ | ✅ | ✅ | **Approve** ✅ |
| ✅ | ✅ | ✅ | ❌ | **Approve with comment** 💬 |
| ✅ | ❌ | ✅ | ✅ | **Request changes** 🔄 |
| ❌ | any | any | any | **Request changes** 🔄 |
| any | any | ❌ | any | **BLOCK** ⛔ |

---

## 📝 Review Comment Template

```markdown
## 🎯 Overall Feedback
[High-level assessment van de PR]

## ✅ Strengths
- Well-structured code with clear separation of concerns
- Comprehensive test coverage (85%)
- Good use of TypeScript types
- Clear commit messages

## 💡 Suggestions
**features/accounting/services/accountingService.ts:45-50**
Consider extracting this calculation to a separate function for reusability.

**pages/AccountingPage.tsx:102**
Missing error handling for the API call. Consider adding try-catch.

**components/common/MaterialSearch.tsx:234**
Could use `useMemo` here to avoid recalculating on every render.

## ❌ Required Changes
**features/accounting/hooks/useAccounting.ts:67**
This introduces a breaking change to the API. Please add a migration guide to the PR description.

**utils/validators.ts:89**
Security issue: User input is not sanitized before rendering. Use DOMPurify.

## 🧪 Testing Notes
- [ ] Tested search functionality - works great
- [ ] Tested filter combinations - all combinations work
- [ ] Edge case: Empty search returns all items ✅
- [ ] Performance: No noticeable lag with 1000+ items ✅

## 📋 Checklist Results
TypeScript: ✅ (9/9)
React: ✅ (8/8)
Structure: ✅ (8/8)
Quality: 🟡 (6/8) - Minor issues
Security: ❌ (6/8) - **XSS vulnerability found**
Testing: ✅ (8/8)
Performance: ✅ (7/8)
Documentation: 🟡 (5/7) - Missing JSDoc

## Decision: Request Changes 🔄
Security issue must be resolved before merge. Other suggestions are optional but recommended.
```

---

## 🔗 Gerelateerde Documentatie

- [Git Workflow](./README.md) - Branch en commit conventies
- [ADRs](../02-architecture/adr/README.md) - Architecture decisions
- [Testing Strategy](../05-testing/testing-strategy.md) - Testing best practices
- [Security Best Practices](../../prompt-repo/SECURITY_BEST_PRACTICES.md) - Security guide

---

## ✅ Quality Checklist

- [x] Clear title (H1)
- [x] Versie en laatste update datum
- [x] Complete checklist items met explanations
- [x] Practical examples (DO/DON'T)
- [x] Priority levels defined
- [x] Review decision matrix
- [x] Comment template provided
- [x] Cross-links naar gerelateerde docs
- [x] Consistent formatting
- [x] Searchable keywords
- [x] No broken links

---

**Happy reviewing! 👀**

*Goede code reviews maken goede code nog beter.*
