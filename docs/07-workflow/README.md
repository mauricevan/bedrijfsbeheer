# Git Workflow & Development Process

**Versie:** 1.0.0
**Laatst bijgewerkt:** 14 november 2024

---

## 📋 Inhoudsopgave

1. [Branch Strategy](#branch-strategy)
2. [Commit Conventions](#commit-conventions)
3. [Pull Request Workflow](#pull-request-workflow)
4. [Code Review Guidelines](#code-review-guidelines)
5. [Release Process](#release-process)

---

## 🌿 Branch Strategy

### Branch Types

```
main                    # Production-ready code
└── refactor/accounting-module    # Feature branches
└── feature/customer-export       # New features
└── bugfix/invoice-calculation    # Bug fixes
└── hotfix/critical-security      # Emergency fixes
```

### Branch Naming Convention

```bash
<type>/<short-description>

# Types:
feature/    # Nieuwe functionaliteit
bugfix/     # Bug fix (non-critical)
hotfix/     # Kritieke bug fix (production)
refactor/   # Code refactoring (geen functionaliteit wijziging)
docs/       # Documentatie updates
test/       # Test additions/updates
chore/      # Build, tooling, dependencies

# Examples:
feature/advanced-material-search
bugfix/balance-calculation
hotfix/security-vulnerability
refactor/accounting-module
docs/adr-creation
test/accounting-unit-tests
chore/update-dependencies
```

### Branch Workflow

```bash
# 1. Start nieuwe feature
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Work on feature
git add .
git commit -m "feat: add feature description"

# 3. Push to remote
git push -u origin feature/my-feature

# 4. Create Pull Request op GitHub

# 5. Na approval: merge naar main
# (via GitHub PR interface)

# 6. Cleanup local branch
git checkout main
git pull origin main
git branch -d feature/my-feature
```

---

## 📝 Commit Conventions

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Gebruik | Voorbeeld |
|------|---------|-----------|
| `feat` | Nieuwe feature | `feat: add material search filters` |
| `fix` | Bug fix | `fix: correct balance calculation` |
| `refactor` | Code refactoring | `refactor: extract accounting services` |
| `docs` | Documentatie | `docs: add ADR for state management` |
| `test` | Tests toevoegen/wijzigen | `test: add unit tests for calculateBalance` |
| `chore` | Build/tooling | `chore: update vite to v5` |
| `style` | Code formatting | `style: format with prettier` |
| `perf` | Performance verbetering | `perf: optimize customer list rendering` |

### Scope (optioneel)

```bash
feat(accounting): add balance calculation
fix(customers): resolve email validation
refactor(inventory): extract product service
docs(adr): add feature-based architecture decision
```

### Subject Rules

```bash
✅ DO:
- Use imperative mood ("add" not "added")
- Start with lowercase
- No period at the end
- Max 72 characters
- Be specific and descriptive

❌ DON'T:
- "fix stuff"
- "update"
- "changes"
- "WIP"
```

### Body (optioneel, maar aanbevolen)

```bash
feat: add V5.10 advanced material search & filters

## Changes:
- Searchable dropdown with real-time filtering
- Category filter dropdown
- Stock status filter (all/in-stock/low-stock)
- Sort functionality (A-Z, stock, price)
- Reset filters button

## Technical:
- Added categories prop to EmailWorkOrderEditModal
- Multi-stage filtering: search → category → stock → sort
- useRef + useEffect for click-outside detection
```

### Footer

```bash
# Breaking changes
BREAKING CHANGE: renamed `setMaterials` to `updateMaterials`

# Issue references
Closes #123
Fixes #456
Relates to #789
```

### Examples

```bash
# Simple feature
feat: add customer export to CSV

# Feature met body
feat: add V5.10 advanced material search & filters

Implemented searchable dropdown with category and stock filters.
Users can now quickly find materials by name, filter by category,
and sort by various criteria.

Closes #234

# Bug fix
fix: correct invoice tax calculation

Tax was calculated on pre-discount price instead of discounted price.
Now correctly applies tax after discount.

Fixes #567

# Refactoring
refactor: extract accounting module to features/

Moved 665-line hook to modular structure:
- hooks/ (state management)
- services/ (business logic)
- utils/ (helpers)
- types/ (TypeScript definitions)

Relates to ADR-002

# Documentation
docs: add architecture decision records

Created ADR structure and initial decisions:
- ADR-001: Feature-based architecture
- ADR-002: Accounting module refactoring
- ADR-003: No state management library
```

---

## 🔀 Pull Request Workflow

### PR Template

```markdown
## 📋 Beschrijving
[Korte beschrijving van de wijzigingen]

## 🎯 Type wijziging
- [ ] Bug fix (non-breaking change)
- [ ] Nieuwe feature (non-breaking change)
- [ ] Breaking change (bestaande functionaliteit wijzigt)
- [ ] Refactoring (geen functionaliteit wijziging)
- [ ] Documentatie update

## ✅ Checklist
- [ ] Code volgt project style guide
- [ ] Self-review uitgevoerd
- [ ] Comments toegevoegd aan complexe code
- [ ] Documentatie bijgewerkt
- [ ] Geen nieuwe warnings
- [ ] Tests toegevoegd/bijgewerkt
- [ ] Tests slagen lokaal
- [ ] Geen merge conflicts

## 🧪 Hoe te testen?
1. Checkout deze branch
2. Run `npm install`
3. Run `npm run dev`
4. [Specifieke test stappen]

## 📸 Screenshots (indien UI wijziging)
[Screenshots toevoegen]

## 🔗 Gerelateerd
- Closes #[issue number]
- Related to #[issue number]
```

### PR Workflow

```bash
# 1. Create Pull Request op GitHub
[feature/my-feature] → [main]

# 2. Fill in PR template

# 3. Request review van team member(s)

# 4. Address review comments
git add .
git commit -m "fix: address review comments"
git push

# 5. Na approval: Squash & Merge
# (GitHub UI - "Squash and merge" button)

# 6. Delete branch na merge
# (GitHub UI - "Delete branch" button)
```

---

## 👀 Code Review Guidelines

### Voor Reviewer

#### Review Checklist

```markdown
### Code Kwaliteit
- [ ] Code is leesbaar en begrijpelijk
- [ ] Geen code duplicatie
- [ ] Functies hebben één verantwoordelijkheid
- [ ] Naming is duidelijk en consistent
- [ ] Geen magic numbers/strings

### TypeScript
- [ ] Geen `any` types
- [ ] Interfaces/types voor alle data structures
- [ ] Props types voor componenten
- [ ] Return types voor functies

### React Best Practices
- [ ] Functional components
- [ ] Immutable state updates
- [ ] useCallback voor event handlers
- [ ] useMemo voor derived state
- [ ] Key props in lijsten

### Architectuur
- [ ] Component < 300 regels
- [ ] Hook < 200 regels
- [ ] Service < 250 regels
- [ ] Barrel files gebruikt
- [ ] Correct feature directory

### Security
- [ ] Input validation
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] Geen plain-text passwords
- [ ] Sanitized user input

### Testing
- [ ] Unit tests voor nieuwe business logic
- [ ] Integration tests waar nodig
- [ ] Tests slagen
- [ ] Edge cases gedekt

### Performance
- [ ] Geen onnodige re-renders
- [ ] Lazy loading waar zinvol
- [ ] Optimized images/assets
- [ ] Efficient algorithms

### Documentatie
- [ ] Complex logic heeft comments
- [ ] README bijgewerkt (indien feature)
- [ ] ADR geschreven (indien architecture change)
- [ ] Type annotations aanwezig
```

#### Review Process

1. **First pass: High-level**
   - Begrijp de context en goal van PR
   - Check of approach logisch is
   - Kijk naar file structure en organization

2. **Second pass: Detail**
   - Line-by-line code review
   - Check logic en edge cases
   - Verify tests coverage

3. **Third pass: Testing**
   - Checkout branch lokaal
   - Run tests
   - Test handmatig in browser

4. **Feedback geven**
   ```markdown
   ## 🎯 Overall
   [High-level feedback]

   ## ✅ Strengths
   - Well-structured code
   - Good test coverage
   - Clear commit messages

   ## 💡 Suggestions
   **L45-50**: Consider extracting this to a separate function
   **L102**: Missing error handling for API call
   **L234**: Could use useMemo here for performance

   ## ❌ Required Changes
   **L67**: This introduces a breaking change - needs migration guide
   **L89**: Security: user input not sanitized

   ## Decision: Request Changes / Approve / Comment
   ```

### Voor Author

#### PR Best Practices

```bash
✅ DO:
- Keep PR small (<400 lines if possible)
- One logical change per PR
- Self-review before requesting review
- Add tests for new code
- Update documentation
- Respond to comments promptly
- Thank reviewers

❌ DON'T:
- Mix refactoring with new features
- Submit work-in-progress code
- Ignore reviewer feedback
- Force-push after review started
- Merge without approval
```

#### Responding to Review

```bash
# Goede responses:
"Good catch! Fixed in commit abc123"
"I agree, refactored to extract function in commit def456"
"Interesting point. I kept it as-is because [reason]. WDYT?"
"Added tests in commit ghi789, coverage now 85%"

# Te vermijden:
"It works fine"
"Will do later"
"[geen response]"
"Not important"
```

---

## 🚀 Release Process

### Versioning (Semantic Versioning)

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  (patch: bug fix)
1.0.1 → 1.1.0  (minor: new feature, backward compatible)
1.1.0 → 2.0.0  (major: breaking change)
```

### Release Checklist

```markdown
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Build succesvol
- [ ] Deployment succesvol
```

### Release Commands

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Run tests
npm run test
npm run build

# 3. Bump version
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# 4. Push with tags
git push origin main --tags

# 5. Create GitHub Release
# (via GitHub UI with release notes)
```

---

## 📚 Gerelateerde Documentatie

- [ADRs](../02-architecture/adr/README.md) - Architecture decisions
- [Refactoring Plan](../02-architecture/refactoring-plan.md) - Implementation details
- [Code Review Checklist](./code-review-checklist.md) - Detailed checklist

---

## ✅ Quality Checklist

- [x] Clear title (H1)
- [x] Versie en laatste update datum
- [x] Inhoudsopgave met navigatie
- [x] Branch naming conventions uitgelegd
- [x] Commit message format met voorbeelden
- [x] PR template provided
- [x] Code review checklist
- [x] Release process gedocumenteerd
- [x] Practical examples
- [x] Cross-links naar gerelateerde docs
- [x] Consistent formatting
- [x] No broken links

---

**Happy collaborating! 🚀**
