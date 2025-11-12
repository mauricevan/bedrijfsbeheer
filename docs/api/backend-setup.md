# Backend Setup Guide

**Versie:** 1.0.0
**Voor:** Backend implementatie van Bedrijfsbeheer Dashboard
**Stack:** Express.js + PostgreSQL + Prisma

---

## 📋 Inhoudsopgave

1. [Stack Decisions](#stack-decisions)
2. [Project Structure](#project-structure)
3. [Database Setup](#database-setup)
4. [Security Implementation](#security-implementation)
5. [API Patterns](#api-patterns)
6. [Error Handling](#error-handling)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)

---

## 🎯 Stack Decisions

### Why These Technologies?

**Express.js (NOT NestJS/Fastify)**
- ✅ Eenvoudig en flexibel
- ✅ Grote community
- ✅ Perfecte match voor mid-size apps
- ✅ Easy integration met Prisma

**PostgreSQL (NOT MongoDB)**
- ✅ Relationele data (Quotes ↔ WorkOrders ↔ Invoices)
- ✅ Foreign key constraints (data integriteit)
- ✅ ACID transactions
- ✅ Better voor financial data

**Prisma (NOT Sequelize/TypeORM)**
- ✅ Type-safe database client
- ✅ Auto-generated types
- ✅ Excellent migration system
- ✅ Performance optimized

**JWT (NOT Sessions)**
- ✅ Stateless (schaalbaar)
- ✅ Mobile-friendly
- ✅ Cross-origin support
- ✅ Easy refresh token implementation

**Joi (NOT Zod/Yup)**
- ✅ Runtime validation
- ✅ Excellent error messages
- ✅ Express middleware support
- ✅ Battle-tested

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # Prisma client instantie
│   ├── env.js               # Environment variabele validatie
│   └── security.js          # CORS, helmet, rate limiting
│
├── controllers/             # Request handlers
│   ├── authController.js    # Login, register, logout, refresh
│   ├── quoteController.js   # CRUD voor quotes
│   ├── invoiceController.js # CRUD voor invoices
│   ├── workOrderController.js
│   ├── customerController.js
│   └── inventoryController.js
│
├── models/                  # Database schema
│   └── schema.prisma        # Alle models hier (NIET aparte files)
│
├── routes/
│   ├── api/
│   │   ├── index.js         # Main API router
│   │   ├── auth.js          # POST /api/auth/login, /register
│   │   ├── quotes.js        # GET/POST/PUT/DELETE /api/quotes
│   │   ├── invoices.js
│   │   ├── workOrders.js
│   │   └── ...
│   └── index.js             # Root router
│
├── middleware/
│   ├── authenticate.js      # JWT verification
│   ├── authorize.js         # Role-based access (requireAdmin)
│   ├── validate.js          # Joi validation middleware
│   ├── errorHandler.js      # Global error handler
│   └── rateLimiter.js       # Rate limiting per endpoint
│
├── utils/
│   ├── jwt.js               # Token generation/verification
│   ├── logger.js            # Winston logger
│   ├── email.js             # Email sending (future)
│   └── pagination.js        # Pagination helpers
│
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   │   ├── quoteController.test.js
│   │   │   └── authController.test.js
│   │   ├── middleware/
│   │   └── utils/
│   └── integration/
│       └── api/
│           ├── quotes.test.js
│           └── auth.test.js
│
├── .env.example             # Template voor environment vars
├── .env                     # NIET in Git!
├── server.js                # Express app entry point
└── package.json
```

---

## 🗄️ Database Setup

### Installation

```bash
# Install PostgreSQL
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql

# Windows
# Download installer from postgresql.org
```

### Prisma Setup

```bash
# Install Prisma
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# Edit .env:
DATABASE_URL="postgresql://user:password@localhost:5432/bedrijfsbeheer?schema=public"
```

### Schema Example

```prisma
// models/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  isAdmin      Boolean  @default(false) @map("is_admin")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  quotes       Quote[]
  invoices     Invoice[]
  workOrders   WorkOrder[]

  @@map("users")
}

// Quote model
model Quote {
  id          String   @id
  customerId  String   @map("customer_id")
  userId      String   @map("user_id")
  status      String   // draft, approved, rejected
  subtotal    Decimal  @db.Decimal(10, 2)
  vatRate     Decimal  @map("vat_rate") @db.Decimal(5, 2)
  vatAmount   Decimal  @map("vat_amount") @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)
  notes       String?  @db.Text
  validUntil  String?  @map("valid_until")
  workOrderId String?  @unique @map("work_order_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  user        User       @relation(fields: [userId], references: [id])
  customer    Customer   @relation(fields: [customerId], references: [id])
  workOrder   WorkOrder? @relation(fields: [workOrderId], references: [id])
  items       QuoteItem[]

  // Indexes voor performance
  @@index([customerId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("quotes")
}

// Quote Item model
model QuoteItem {
  id                String  @id @default(uuid())
  quoteId           String  @map("quote_id")
  inventoryItemId   String? @map("inventory_item_id")
  name              String
  description       String?
  quantity          Int
  unitPrice         Decimal @db.Decimal(10, 2) @map("unit_price")
  total             Decimal @db.Decimal(10, 2)

  quote             Quote   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  inventoryItem     InventoryItem? @relation(fields: [inventoryItemId], references: [id])

  @@index([quoteId])
  @@map("quote_items")
}

// WorkOrder model
model WorkOrder {
  id            String    @id
  title         String
  description   String?   @db.Text
  status        String    // todo, in_progress, completed
  assignedTo    String    @map("assigned_to")
  assignedBy    String    @map("assigned_by")
  customerId    String    @map("customer_id")
  quoteId       String?   @unique @map("quote_id")
  invoiceId     String?   @unique @map("invoice_id")
  estimatedHours Int?     @map("estimated_hours")
  actualHours   Int?      @map("actual_hours")
  startedAt     DateTime? @map("started_at")
  completedAt   DateTime? @map("completed_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  user          User      @relation(fields: [assignedTo], references: [id])
  customer      Customer  @relation(fields: [customerId], references: [id])
  quote         Quote?
  invoice       Invoice?
  materials     WorkOrderMaterial[]

  @@index([assignedTo])
  @@index([status])
  @@index([createdAt])
  @@map("work_orders")
}

// ... other models (Invoice, Customer, InventoryItem, etc.)
```

### Migration Commands

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

---

## 🔒 Security Implementation

### Authentication Middleware

```javascript
// middleware/authenticate.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Geen toegang - login vereist'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request
    req.user = decoded; // { id, email, isAdmin }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token verlopen - login opnieuw'
      });
    }
    return res.status(401).json({
      error: 'Ongeldige token'
    });
  }
};
```

### Authorization Middleware

```javascript
// middleware/authorize.js
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authenticatie vereist'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: 'Alleen admins hebben toegang tot deze actie'
    });
  }

  next();
};

export const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resource = req.resource; // Set by controller

    if (!resource) {
      return res.status(404).json({ error: 'Resource niet gevonden' });
    }

    // Admin can access everything
    if (req.user.isAdmin) {
      return next();
    }

    // User can only access their own resources
    if (resource[resourceField] !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze resource'
      });
    }

    next();
  };
};
```

### Input Validation

```javascript
// middleware/validate.js
import Joi from 'joi';

export const validateQuote = (req, res, next) => {
  const schema = Joi.object({
    customerId: Joi.string().uuid().required(),
    items: Joi.array().items(
      Joi.object({
        inventoryItemId: Joi.string().uuid().allow(null),
        name: Joi.string().max(200).required(),
        description: Joi.string().max(500).allow(''),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required(),
      })
    ).min(1).required(),
    notes: Joi.string().max(5000).allow(''),
    validUntil: Joi.date().iso().min('now').allow(null),
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false // Geef alle errors terug
  });

  if (error) {
    return res.status(400).json({
      error: 'Validatie mislukt',
      details: error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });
  }

  req.body = value; // Use validated data
  next();
};

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message
    });
  }

  next();
};
```

### Password Hashing

```javascript
// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email adres is al geregistreerd'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        isAdmin: false // Default to non-admin
      }
    });

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Ongeldige inloggegevens'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        error: 'Ongeldige inloggegevens'
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🛣️ API Patterns

### REST Conventions

**URL Structure:**
```
GET    /api/quotes              # List all (with pagination)
GET    /api/quotes/:id          # Get single quote
POST   /api/quotes              # Create new quote
PUT    /api/quotes/:id          # Full update (replace)
PATCH  /api/quotes/:id          # Partial update
DELETE /api/quotes/:id          # Delete quote

# Nested resources
GET    /api/quotes/:id/items    # Get quote items
POST   /api/quotes/:id/convert  # Convert to invoice
```

### Controller Pattern

```javascript
// controllers/quoteController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List quotes
export const listQuotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, customerId } = req.query;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    // Non-admin can only see their own quotes
    if (!req.user.isAdmin) {
      where.userId = req.user.id;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Query
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: true,
          items: true,
          workOrder: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.quote.count({ where })
    ]);

    res.json({
      data: quotes,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single quote
export const getQuote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        workOrder: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Offerte niet gevonden' });
    }

    // Check ownership
    if (!req.user.isAdmin && quote.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze offerte'
      });
    }

    res.json(quote);
  } catch (error) {
    next(error);
  }
};

// Create quote
export const createQuote = async (req, res, next) => {
  try {
    const { customerId, items, notes, validUntil } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) =>
      sum + (item.quantity * item.unitPrice), 0
    );
    const vatRate = 21; // NL BTW
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    // Create quote with items
    const quote = await prisma.quote.create({
      data: {
        id: `Q${Date.now()}`,
        customerId,
        userId: req.user.id,
        status: 'draft',
        subtotal,
        vatRate,
        vatAmount,
        total,
        notes,
        validUntil,
        items: {
          create: items.map(item => ({
            inventoryItemId: item.inventoryItemId,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        items: true,
        customer: true
      }
    });

    res.status(201).json(quote);
  } catch (error) {
    next(error);
  }
};

// Update quote
export const updateQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check exists & ownership
    const existing = await prisma.quote.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Offerte niet gevonden' });
    }

    if (!req.user.isAdmin && existing.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze offerte'
      });
    }

    // Update
    const quote = await prisma.quote.update({
      where: { id },
      data: updates,
      include: {
        items: true,
        customer: true
      }
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
};

// Delete quote
export const deleteQuote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check exists & ownership
    const existing = await prisma.quote.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Offerte niet gevonden' });
    }

    if (!req.user.isAdmin && existing.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze offerte'
      });
    }

    // Delete (cascade delete items)
    await prisma.quote.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

### Route Setup

```javascript
// routes/api/quotes.js
import express from 'express';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { validateQuote } from '../../middleware/validate.js';
import * as quoteController from '../../controllers/quoteController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List & Create
router.get('/', quoteController.listQuotes);
router.post('/', requireAdmin, validateQuote, quoteController.createQuote);

// Single resource
router.get('/:id', quoteController.getQuote);
router.put('/:id', requireAdmin, validateQuote, quoteController.updateQuote);
router.delete('/:id', requireAdmin, quoteController.deleteQuote);

export default router;
```

```javascript
// routes/api/index.js
import express from 'express';
import authRoutes from './auth.js';
import quoteRoutes from './quotes.js';
import invoiceRoutes from './invoices.js';
import workOrderRoutes from './workOrders.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/quotes', quoteRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/work-orders', workOrderRoutes);

export default router;
```

---

## 🚨 Error Handling

### Error Handler Middleware

```javascript
// middleware/errorHandler.js
import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  // Log error
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Dit record bestaat al',
        field: err.meta?.target
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Record niet gevonden'
      });
    }
  }

  // Validation errors (from Joi)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validatie mislukt',
      details: err.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Ongeldige token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token verlopen'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Er is een fout opgetreden'
  });
};
```

### Controller Error Handling

**ALTIJD gebruik try/catch in controllers:**
```javascript
export const someController = async (req, res, next) => {
  try {
    // Controller logic
    res.json(result);
  } catch (error) {
    next(error); // Let error middleware handle it
  }
};
```

---

## 🧪 Testing Strategy

### Test Structure

```
tests/
├── unit/
│   ├── controllers/
│   │   ├── quoteController.test.js
│   │   └── authController.test.js
│   ├── middleware/
│   │   ├── authenticate.test.js
│   │   └── validate.test.js
│   └── utils/
│       └── jwt.test.js
└── integration/
    └── api/
        ├── quotes.test.js
        └── auth.test.js
```

### Unit Test Example

```javascript
// tests/unit/controllers/quoteController.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQuote } from '../../../controllers/quoteController.js';
import { PrismaClient } from '@prisma/client';

vi.mock('@prisma/client');

describe('QuoteController', () => {
  let req, res, next, prisma;

  beforeEach(() => {
    req = {
      user: { id: 'user1', isAdmin: true },
      body: {
        customerId: 'cust1',
        items: [
          { name: 'Item 1', quantity: 2, unitPrice: 100 }
        ]
      }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();

    prisma = new PrismaClient();
    prisma.quote.create = vi.fn();
  });

  it('should create quote with correct totals', async () => {
    prisma.quote.create.mockResolvedValue({
      id: 'Q123',
      subtotal: 200,
      vatRate: 21,
      vatAmount: 42,
      total: 242
    });

    await createQuote(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'Q123',
        total: 242
      })
    );
  });

  it('should reject non-admin user', async () => {
    req.user.isAdmin = false;

    await createQuote(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('admin')
      })
    );
  });
});
```

### Integration Test Example

```javascript
// tests/integration/api/quotes.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Quotes API', () => {
  let adminToken, userToken;

  beforeAll(async () => {
    // Create test users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: await bcrypt.hash('password', 10),
        name: 'Admin',
        isAdmin: true
      }
    });

    const user = await prisma.user.create({
      data: {
        email: 'user@test.com',
        passwordHash: await bcrypt.hash('password', 10),
        name: 'User',
        isAdmin: false
      }
    });

    // Get tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    adminToken = adminRes.body.token;

    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password' });
    userToken = userRes.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/quotes', () => {
    it('should create quote for admin', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: 'cust1',
          items: [
            { name: 'Test Item', quantity: 1, unitPrice: 100 }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.total).toBe(121); // 100 + 21% VAT
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          customerId: 'cust1',
          items: [{ name: 'Test', quantity: 1, unitPrice: 100 }]
        });

      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .send({
          customerId: 'cust1',
          items: [{ name: 'Test', quantity: 1, unitPrice: 100 }]
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/quotes', () => {
    it('should list all quotes for admin', async () => {
      const res = await request(app)
        .get('/api/quotes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });

    it('should only show own quotes for user', async () => {
      const res = await request(app)
        .get('/api/quotes')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(q => q.userId === 'user-id')).toBe(true);
    });
  });
});
```

### Test Commands

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest tests/unit",
    "test:integration": "vitest tests/integration",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## 🚀 Deployment

### Environment Variables

```bash
# .env.example (commit this)
NODE_ENV=development
PORT=3001

DATABASE_URL=postgresql://user:password@localhost:5432/bedrijfsbeheer

JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

CORS_ORIGIN=http://localhost:5173

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### Server Setup

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan('combined')); // Logging

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: bedrijfsbeheer
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: bedrijfsbeheer
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: postgresql://bedrijfsbeheer:secret@postgres:5432/bedrijfsbeheer
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 📝 Checklist Voor Implementatie

**Setup:**
- [ ] PostgreSQL geïnstalleerd
- [ ] Prisma geïnitialiseerd
- [ ] .env configured
- [ ] Dependencies geïnstalleerd

**Security:**
- [ ] JWT authentication werkend
- [ ] Bcrypt password hashing
- [ ] Joi validation middleware
- [ ] CORS configured
- [ ] Helmet security headers

**API:**
- [ ] REST endpoints werkend
- [ ] Pagination implemented
- [ ] Error handling correct
- [ ] Logging configured

**Testing:**
- [ ] Unit tests voor controllers
- [ ] Integration tests voor API
- [ ] 80%+ code coverage
- [ ] CI/CD pipeline setup

**Documentation:**
- [ ] API endpoints gedocumenteerd
- [ ] Postman collection gemaakt
- [ ] README up-to-date

---

**Voor vragen of problemen:** Check `.claude/README.md` en `docs/AI_GUIDE.md`
