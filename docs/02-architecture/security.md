# Beveiliging & Privacy

## Overzicht

Het Bedrijfsbeheer Dashboard implementeert verschillende beveiligingslagen om gebruikersgegevens en bedrijfsinformatie te beschermen. Dit document beschrijft de huidige beveiligingsmaatregelen, privacy overwegingen en toekomstige verbeteringen.

---

## Authenticatie Systeem

### Login Mechanisme

Het systeem gebruikt een email en wachtwoord gebaseerde authenticatie:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;  // In productie: gehashed met bcrypt/argon2
  role: 'admin' | 'user';
  department?: string;
  avatar?: string;
}
```

#### Login Flow

1. **Gebruiker invoer** - Email en wachtwoord
2. **Validatie** - Controleer of velden niet leeg zijn
3. **Authenticatie** - Vergelijk credentials met database
4. **Sessie creatie** - Stel currentUser state in
5. **Redirect** - Navigeer naar dashboard

```typescript
const handleLogin = (email: string, password: string) => {
  // Zoek gebruiker in database
  const user = users.find(u => u.email === email);

  // Valideer credentials
  if (!user || user.password !== password) {
    setError('Ongeldige inloggegevens');
    return;
  }

  // Stel sessie in
  setCurrentUser(user);
  setIsLoggedIn(true);

  // Redirect naar dashboard
  navigate('/dashboard');
};
```

### Demo Accounts

Het systeem bevat 4 test accounts voor demonstratie doeleinden:

| Naam           | Email             | Rol                 | Admin  | Wachtwoord |
| -------------- | ----------------- | ------------------- | ------ | ---------- |
| Sophie van Dam | sophie@bedrijf.nl | Manager Productie   | ✅ Ja  | 1234       |
| Jan de Vries   | jan@bedrijf.nl    | Productiemedewerker | ❌ Nee | 1234       |
| Maria Jansen   | maria@bedrijf.nl  | Lasser              | ❌ Nee | 1234       |
| Peter Bakker   | peter@bedrijf.nl  | Spuiter             | ❌ Nee | 1234       |

**Let op:** In productie moeten wachtwoorden altijd gehashed worden opgeslagen.

### Quick Login Feature

Voor demo doeleinden zijn er snelle login knoppen beschikbaar:

```typescript
<button onClick={() => handleQuickLogin('sophie@bedrijf.nl')}>
  Login als Admin
</button>
<button onClick={() => handleQuickLogin('jan@bedrijf.nl')}>
  Login als Medewerker
</button>
```

**Veiligheidsoverweging:** Quick login is alleen geschikt voor demo/development omgevingen en moet worden uitgeschakeld in productie.

---

## Rolgebaseerde Toegangscontrole (RBAC)

### Gebruikersrollen

Het systeem kent twee primaire rollen:

#### **Admin** (Manager Productie)

**Rechten:**
- ✅ Volledige toegang tot alle modules
- ✅ Modules in- en uitschakelen
- ✅ Gebruikers beheren
- ✅ Admin instellingen
- ✅ Alle werkorders inzien (van alle medewerkers)
- ✅ Systeem configuratie
- ✅ Klanten en voorraad beheren
- ✅ Offertes en facturen aanmaken/bewerken
- ✅ Rapportages genereren

#### **User** (Medewerker)

**Rechten:**
- ✅ Persoonlijk workboard (alleen eigen taken)
- ✅ Taken van collega's bekijken (read-only)
- ✅ Eigen werkorders bijwerken
- ✅ Uren registreren
- ✅ Materiaalverbruik registreren
- ❌ Geen toegang tot admin settings
- ❌ Geen modules aan/uit schakelen
- ❌ Beperkte CRM toegang
- ❌ Geen HRM toegang

### Role Checking Implementatie

```typescript
// Component level role checking
const AdminSettings: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDenied />;
  }

  return <div>{/* Admin content */}</div>;
};

// Conditional rendering
{currentUser?.role === 'admin' && (
  <button onClick={openAdminSettings}>
    Admin Instellingen
  </button>
)}

// Route protection
<Route
  path="/admin"
  element={
    currentUser?.role === 'admin' ? (
      <AdminSettings />
    ) : (
      <Navigate to="/dashboard" />
    )
  }
/>
```

### Module Access Control

Modules kunnen worden in-/uitgeschakeld per rol:

```typescript
interface Module {
  id: string;
  name: string;
  enabled: boolean;
  requiredRole?: 'admin' | 'user';
  icon: React.ComponentType;
  path: string;
}

// Filter modules op basis van rol
const visibleModules = modules.filter(module => {
  if (!module.enabled) return false;
  if (module.requiredRole === 'admin' && currentUser?.role !== 'admin') {
    return false;
  }
  return true;
});
```

---

## Wachtwoord Beveiliging

### Huidige Implementatie (Development)

```typescript
// Demo/Development - Plain text (NIET VEILIG)
const user = {
  email: 'sophie@bedrijf.nl',
  password: '1234'
};
```

**⚠️ Waarschuwing:** Deze implementatie is alleen geschikt voor development/demo doeleinden.

### Productie Implementatie (Toekomstig)

#### Wachtwoord Hashing met bcrypt

```typescript
import bcrypt from 'bcrypt';

// Bij registratie
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Bij login
const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Voorbeeld gebruik
const handleRegistration = async (email: string, password: string) => {
  const hashedPassword = await hashPassword(password);

  const newUser = {
    email,
    password: hashedPassword, // Opslaan gehashed password
    // ... andere velden
  };

  await saveUser(newUser);
};
```

### Wachtwoord Requirements (Aanbevolen)

Voor productie implementatie:

- ✅ Minimaal 8 karakters
- ✅ Minimaal 1 hoofdletter
- ✅ Minimaal 1 cijfer
- ✅ Minimaal 1 speciaal karakter
- ✅ Geen veelgebruikte wachtwoorden (password, 123456, etc.)

```typescript
const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
};
```

---

## Sessie Management

### Huidige Implementatie

Sessies worden beheerd via React state:

```typescript
// App.tsx
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [isLoggedIn, setIsLoggedIn] = useState(false);

// Login
const handleLogin = (user: User) => {
  setCurrentUser(user);
  setIsLoggedIn(true);
};

// Logout
const handleLogout = () => {
  setCurrentUser(null);
  setIsLoggedIn(false);
  navigate('/login');
};
```

**Beperking:** State wordt gewist bij page refresh.

### Productie Implementatie (Toekomstig)

#### JWT (JSON Web Tokens)

```typescript
import jwt from 'jsonwebtoken';

// Token generatie bij login
const generateToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

// Token verificatie
const verifyToken = (token: string): User | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as User;
  } catch (error) {
    return null;
  }
};

// Token opslag
localStorage.setItem('authToken', token);

// Auto-login bij page load
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    const user = verifyToken(token);
    if (user) {
      setCurrentUser(user);
    }
  }
}, []);
```

#### Refresh Tokens

Voor langere sessies:

```typescript
interface TokenPair {
  accessToken: string;  // Kort leven (15min)
  refreshToken: string; // Lang leven (7 dagen)
}

// Refresh access token
const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const { accessToken } = await response.json();
  return accessToken;
};
```

### Secure Logout

```typescript
const handleLogout = async () => {
  try {
    // 1. Clear local state
    setCurrentUser(null);
    setIsLoggedIn(false);

    // 2. Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');

    // 3. Clear sessionStorage
    sessionStorage.clear();

    // 4. Invalidate token server-side (toekomstig)
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 5. Redirect to login
    navigate('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

---

## Data Opslag Beveiliging

### Huidige Implementatie

**In-Memory Opslag:**

```typescript
// State in App.tsx - verloren bij refresh
const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
const [customers, setCustomers] = useState<Customer[]>([]);
```

**Voordelen:**
- ✅ Geen persistence = geen data lekkage risico
- ✅ Ideaal voor demo/development
- ✅ Snelle prototyping

**Nadelen:**
- ❌ Data verloren bij refresh
- ❌ Geen echte persistentie
- ❌ Niet geschikt voor productie

### Productie Implementatie (Toekomstig)

#### Backend Database

```typescript
// PostgreSQL, MongoDB, of andere database
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

// Secure connection
const pool = new Pool({
  ...databaseConfig,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-certificate.crt').toString()
  }
});
```

#### API Security

```typescript
// Secure API endpoints
app.post('/api/inventory', authenticate, authorize(['admin']), async (req, res) => {
  // Valideer input
  const { error } = validateInventoryItem(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Sanitize input
  const sanitizedData = sanitizeInput(req.body);

  // Bewaar in database
  const item = await db.inventory.create(sanitizedData);

  res.json(item);
});
```

---

## Privacy & AVG/GDPR Compliance

### Huidige Status

🔄 **In voorbereiding** - Basis privacy principes worden toegepast:

- ✅ Minimale data collectie
- ✅ Data alleen voor demo doeleinden
- ✅ Geen externe data sharing
- ✅ In-memory opslag (geen permanente opslag)

### Toekomstige AVG/GDPR Features

#### 1. Data Minimalisatie

```typescript
// Verzamel alleen noodzakelijke data
interface CustomerMinimal {
  name: string;        // Noodzakelijk
  email: string;       // Noodzakelijk
  phone?: string;      // Optioneel
  // Vermijd: geboortedatum, BSN, etc. tenzij noodzakelijk
}
```

#### 2. Toestemming Management

```typescript
interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  thirdParty: boolean;
  timestamp: Date;
}

const ConsentBanner = () => {
  const [consent, setConsent] = useState<ConsentSettings>({
    marketing: false,
    analytics: false,
    thirdParty: false,
    timestamp: new Date()
  });

  return (
    <div>
      <h3>Cookie Instellingen</h3>
      <label>
        <input
          type="checkbox"
          checked={consent.marketing}
          onChange={(e) => setConsent({
            ...consent,
            marketing: e.target.checked
          })}
        />
        Marketing cookies
      </label>
      {/* Meer opties... */}
    </div>
  );
};
```

#### 3. Recht op Vergetelheid

```typescript
// Implementeer data verwijdering
const deleteUserData = async (userId: string) => {
  // 1. Verwijder persoonlijke data
  await db.users.delete(userId);

  // 2. Anonymiseer gerelateerde data
  await db.orders.updateMany(
    { userId },
    { userId: 'DELETED_USER', customerName: 'Verwijderd' }
  );

  // 3. Log de verwijdering
  await db.auditLog.create({
    action: 'USER_DATA_DELETED',
    userId,
    timestamp: new Date()
  });
};
```

#### 4. Data Portabiliteit

```typescript
// Export gebruikersdata in machine-readable format
const exportUserData = async (userId: string): Promise<any> => {
  const userData = await db.users.findOne(userId);
  const orders = await db.orders.findMany({ userId });
  const invoices = await db.invoices.findMany({ userId });

  return {
    user: userData,
    orders,
    invoices,
    exportDate: new Date(),
    format: 'JSON'
  };
};
```

#### 5. Privacy Policy

```typescript
const PrivacyPolicy = () => {
  return (
    <div>
      <h1>Privacyverklaring</h1>
      <section>
        <h2>Welke gegevens verzamelen wij?</h2>
        <ul>
          <li>Naam en contactgegevens</li>
          <li>Bedrijfsinformatie</li>
          <li>Transactiegegevens</li>
        </ul>
      </section>
      <section>
        <h2>Hoe gebruiken wij uw gegevens?</h2>
        {/* ... */}
      </section>
      <section>
        <h2>Uw rechten</h2>
        <ul>
          <li>Recht op inzage</li>
          <li>Recht op correctie</li>
          <li>Recht op verwijdering</li>
          <li>Recht op dataportabiliteit</li>
        </ul>
      </section>
    </div>
  );
};
```

---

## Audit Trail & Logging

### Toekomstige Implementatie

#### Audit Log Structuur

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Log belangrijke acties
const logAction = async (log: AuditLog) => {
  await db.auditLogs.create(log);
};

// Voorbeeld gebruik
const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
  const oldCustomer = await db.customers.findOne(customerId);

  await db.customers.update(customerId, updates);

  await logAction({
    id: generateId(),
    timestamp: new Date(),
    userId: currentUser.id,
    action: 'UPDATE',
    resourceType: 'CUSTOMER',
    resourceId: customerId,
    changes: {
      old: oldCustomer,
      new: updates
    }
  });
};
```

#### Te Loggen Acties

- ✅ User login/logout
- ✅ Data wijzigingen (create, update, delete)
- ✅ Failed login attempts
- ✅ Permission changes
- ✅ Exports van data
- ✅ Admin acties

---

## Beveiligingsmaatregelen - Checklist

### Huidige Implementatie ✅

- ✅ Email/password authenticatie
- ✅ Role-based access control (RBAC)
- ✅ Session management
- ✅ Secure logout functionaliteit
- ✅ In-memory data storage (geen permanente data opslag risico)
- ✅ TypeScript type safety

### In Ontwikkeling 🔄

- 🔄 Audit trail / logboek functionaliteit
- 🔄 AVG/GDPR compliance voorbereidingen
- 🔄 Wachtwoord strength validatie
- 🔄 Password reset functionaliteit

### Toekomstige Verbeteringen 📋

- 📋 Wachtwoord hashing (bcrypt/argon2)
- 📋 JWT token authenticatie
- 📋 Refresh token mechanisme
- 📋 Two-factor authentication (2FA)
- 📋 Rate limiting (brute force protection)
- 📋 HTTPS enforcement
- 📋 CSRF protection
- 📋 XSS prevention
- 📋 SQL injection prevention
- 📋 Input validation & sanitization
- 📋 Encrypted data storage
- 📋 Secure session cookies
- 📋 Content Security Policy (CSP)
- 📋 Security headers (HSTS, X-Frame-Options, etc.)
- 📋 Regular security audits
- 📋 Penetration testing
- 📋 Dependency vulnerability scanning

---

## Security Best Practices

### Input Validatie

```typescript
import validator from 'validator';

// Valideer email
const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

// Sanitize input
const sanitizeInput = (input: string): string => {
  return validator.escape(input);
};

// Valideer en sanitize form data
const validateFormData = (data: any): boolean => {
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email');
  }

  data.name = sanitizeInput(data.name);
  data.company = sanitizeInput(data.company);

  return true;
};
```

### XSS Prevention

```typescript
// React's JSX automatisch escapet, maar let op:

// ❌ GEVAARLIJK - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ VEILIG - Gebruik JSX
<div>{userInput}</div>

// Of gebruik DOMPurify voor HTML content
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

### CSRF Protection

```typescript
// Generate CSRF token
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Include in forms
<form>
  <input type="hidden" name="csrfToken" value={csrfToken} />
  {/* andere velden */}
</form>

// Validate on server
const validateCSRF = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};
```

---

## Gerelateerde Documentatie

- [Technische Stack](./technical-stack.md) - Gebruikte beveiligingstechnologieën
- [Authentication Guide](../04-features/authentication.md) - Gedetailleerde authenticatie guide
- [User Management](../03-modules/hrm.md) - Gebruikers en rechten beheer
- [API Security](../05-api/security.md) - API beveiligingsmaatregelen (toekomstig)
- [Deployment Guide](../01-getting-started/deployment.md) - Veilig deployen in productie
