# Architecture & Implementation Guide

This document outlines the new production-ready architecture implemented for the SenNoflaay management application.

## Overview

The application has been refactored from a monolithic SQLite-based setup to a modern, scalable cloud-ready architecture with PostgreSQL, JWT authentication, and modular API structure.

```
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend (React 19 + Vite)                    │
│                  (localhost:5173 dev, :3000 prod)               │
└─────────────────────→ HTTP/REST ←──────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js/Express Server                       │
│                    (New: server-new.ts)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Routes (Modular)                                           │ │
│  │  ├─ /api/auth (Register, Login, Verify JWT)              │ │
│  │  ├─ /api/data (Load all data)                            │ │
│  │  ├─ /api/members (CRUD operations)                       │ │
│  │  ├─ /api/finance (Payments, Objectives, Expenses)        │ │
│  │  ├─ /api/events (Events management)                      │ │
│  │  ├─ /api/bills (Bills management)                        │ │
│  │  ├─ /api/users (User management)                         │ │
│  │  └─ /api/settings (Configuration & Tasks)                │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Middleware                                                 │ │
│  │  ├─ Logger (requestLogger, errorHandler)                 │ │
│  │  ├─ Auth (JWT verification, role-based access)           │ │
│  │  ├─ Validation (Input sanitization, format checks)       │ │
│  │  └─ CORS (Cross-origin support)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Database Layer (db.ts)                                     │ │
│  │  └─ Type-safe queries to Supabase PostgreSQL             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                     │
│  ├─ Associations (multi-tenant)                               │
│  ├─ Members (users of associations)                           │
│  ├─ Users (admin/staff accounts)                              │
│  ├─ Payments, Expenses, Objectives (finance)                 │
│  ├─ Events, Bills (operations)                                │
│  ├─ Tasks, Settings (configuration)                           │
│  └─ Audit Logs (compliance)                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Improvements

### 1. Data Persistence Layer

**Before**: SQLite (file-based)
- ❌ Not suitable for production
- ❌ No multi-user concurrency
- ❌ Corruption risk with file operations  
- ❌ Can't scale horizontally

**After**: PostgreSQL via Supabase
- ✅ Enterprise-grade reliability
- ✅ ACID compliance
- ✅ Concurrent users support
- ✅ Backups, replication, failover
- ✅ Scales to millions of records
- ✅ Cloud-ready with minimal ops

### 2. API Structure

**Before**: Inline routes in `server.ts` (800+ lines)
- ❌ Monolithic, hard to maintain
- ❌ No separation of concerns
- ❌ Difficult to test

**After**: Modular route system
```
src/server/
├─ db.ts (Database queries, Supabase client)
├─ middleware/
│  ├─ auth.ts (JWT, authorization)
│  ├─ logger.ts (Logging, error handling)
│  └─ validation.ts (Input sanitization, checks)
└─ routes/
   ├─ auth.ts (Register, login, verify)
   ├─ data.ts (Data loading)
   ├─ members.ts (Member CRUD)
   ├─ finance.ts (Payments, objectives, expenses)
   ├─ events.ts (Events management)
   ├─ bills.ts (Bills management)
   ├─ users.ts (User/admin management)
   └─ settings.ts (Settings & tasks)
```

**Benefits**:
- ✅ Each route 50-100 lines (vs 800)
- ✅ Easy to test individual routes
- ✅ Clear responsibility separation
- ✅ Reusable middleware
- ✅ Easy to add new features

### 3. Security

**Before**: 
- ❌ Passwords stored as plain text
- ❌ No token-based auth (just password check)
- ❌ No input validation
- ❌ No rate limiting

**After**:
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ JWT token-based authentication (24h expiry)
- ✅ Input validation and sanitization
- ✅ Role-based access control (RBAC)
- ✅ Audit logging for all actions
- ✅ SQL injection prevention

```typescript
// Example: Secure password handling
import bcrypt from 'bcrypt';

// On registration
const hashedPassword = await bcrypt.hash(password, 10);

// On login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);

// JWT token
const token = generateToken(username, associationId, role);
```

### 4. Error Handling & Logging

**Before**: try-catch scattered, minimal logging

**After**: Centralized error handling and logging

```typescript
// requestLogger middleware logs all requests
// Format: [timestamp] METHOD PATH - STATUS (durationms)
// Example: [2026-03-09T10:30:45.123Z] POST /api/members - 201 (45ms)

// Global error handler catches and logs all errors
// Safely returns errors without leaking sensitive info in production
```

### 5. Deployment

**Before**: Docker with SQLite file mount (only works locally)

**After**: Multi-stage Docker build + multiple deployment options

- ✅ Works with any cloud provider (Render, Railway, Heroku, AWS, etc.)
- ✅ No local file dependencies
- ✅ Health check endpoint
- ✅ Automatic scaling support
- ✅ GitHub Actions CI/CD pipeline

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19 | UI components |
| **Build Tool** | Vite | 6.2 | Fast dev server & builds |
| **Styling** | Tailwind CSS | 4.1 | Utility CSS |
| **Backend** | Express.js | 4.21 | HTTP server |
| **Runtime** | Node.js | 20 | JavaScript runtime |
| **Language** | TypeScript | 5.8 | Type safety |
| **Database** | PostgreSQL | 15+ | Data persistence |
| **ORM** | Supabase SDK | 2.97 | Database client |
| **Auth** | bcrypt + JWT | 5.1 | Secure authentication |
| **Containerization** | Docker | - | Deployment |
| **Orchestration** | Docker Compose | - | Local dev environment |

## Database Schema

### Multi-Tenant Design

The schema supports multiple independent associations (organizations) sharing the same database:

```sql
-- All tables have association_id for tenant isolation
CREATE TABLE members (
  ...
  association_id TEXT NOT NULL,
  ...
  FOREIGN KEY (association_id) REFERENCES associations(id)
);

-- Ensure data isolation via database layer
SELECT * FROM members WHERE association_id = $1;
```

### Key Tables

1. **associations**: Organizations (companies/groups)
2. **users**: Admin and staff accounts
3. **members**: People in the association
4. **payments**: Financial transactions
5. **objectives**: Financial goals
6. **expenses**: Spending records
7. **events**: Organization events
8. **bills**: Invoice/bill management
9. **audit_logs**: Compliance & security
10. **settings**: Configuration (key-value pairs)
11. **tasks**: Task management
12. **membership_fee_configs**: Fee structure

**Relationships**:
```
associations (1) ──→ (N) users
associations (1) ──→ (N) members
members (1) ──→ (N) payments
objectives (1) ──→ (N) payments
objectives (1) ──→ (N) expenses
```

## Authentication Flow

### Registration

```
Client                          Server                    Database
  │                              │                            │
  │──1. POST /api/auth/register─→│                            │
  │    {id, name,                │                            │
  │     adminUsername,           │                            │
  │     adminPassword}           │                            │
  │                              │─2. Validate inputs         │
  │                              │─3. Hash password (bcrypt)  │
  │                              │─4. INSERT association      │
  │                              │     INSERT user            │─→│
  │←────── 201 Created ──────────│                            │
  │    {associationId, ...}      │                            │
```

### Login

```
Client                    Server                        Database
  │                        │                              │
  │─1. POST /api/auth/login
  │   {associationId,     │                              │
  │    username,           │                              │
  │    password}           │                              │
  │                        │─2. SELECT user              │
  │                        │   WHERE username = ? AND      │
  │                        │   association_id = ?         ──→│
  │                        │←─ User record ─────────────────│
  │                        │─3. bcrypt.compare(password)  │
  │                        │─4. Generate JWT token        │
  │←─ 200 OK ────────────  │                              │
  │   {token, user}        │                              │
  │                                                       │
  │─5. Store token (localStorage)
```

### Protected Routes

```
Client                Server                          Database
  │                      │                              │
  │─1. Authorization: Bearer <token>
  │   GET /api/data     │                              │
  │─→                   │─2. Verify JWT                │
  │                     │   (decode, check expiry)     │
  │                     │─3. Extract user info         │
  │                     │─4. Check user.role           │
  │                     │─5. SELECT * FROM tables      │
  │                     │   WHERE association_id = ?   ──→│
  │                     │←─ Data rows ──────────────────│
  │←─ 200 OK ──────────│                              │
  │   {members, events,
  │    payments, ...}  │                              │
```

## API Endpoints

### Authentication

```
POST   /api/auth/register      → Register new association
POST   /api/auth/login         → Login and get JWT token
POST   /api/auth/verify        → Verify token (protected)
```

### Data Loading

```
POST   /api/data               → Load all data for association (protected)
```

### Members

```
POST   /api/members            → Create member
PUT    /api/members/:id        → Update member
DELETE /api/members/:id        → Delete member
```

### Finance

```
POST   /api/finance/payments                    → Add payment
POST   /api/finance/objectives                  → Create objective
DELETE /api/finance/objectives/:id              → Delete objective
POST   /api/finance/expenses                    → Record expense
POST   /api/finance/corrections                 → Record correction
POST   /api/finance/membership-fee-config       → Set fee config
```

### Events

```
POST   /api/events             → Create event
PUT    /api/events/:id         → Update event
DELETE /api/events/:id         → Delete event
```

### Bills

```
POST   /api/bills              → Create bill
DELETE /api/bills/:id          → Delete bill
```

### Users & Admin

```
POST   /api/users              → Create user (admin)
PUT    /api/users/:username    → Update user
DELETE /api/users/:username    → Delete user
POST   /api/audit-logs         → Create audit log
```

### Settings

```
POST   /api/settings           → Set configuration
POST   /api/tasks              → Create task
PUT    /api/tasks/:id          → Update task
DELETE /api/tasks/:id          → Delete task
POST   /api/tasks/reorder      → Reorder tasks
```

## Sequence of Updates Made

1. ✅ Created database layer (`src/server/db.ts`) with Supabase client and type-safe queries
2. ✅ Created middleware:
   - Authentication (JWT, authorization)
   - Logging (request logging, error handling)
   - Validation (input sanitization, checks)
3. ✅ Extracted modular routes (8 route files)
4. ✅ Created new server entry point (`server-new.ts`)
5. ✅ Updated `package.json` with new dependencies (bcrypt, jsonwebtoken, uuid, cors)
6. ✅ Created Dockerfile (multi-stage build)
7. ✅ Updated docker-compose.yml with PostgreSQL
8. ✅ Created .env.example with all required variables
9. ✅ Created GitHub Actions CI/CD workflow
10. ✅ Created database migrations (SQL schema)
11. ✅ Created DEPLOYMENT_GUIDE.md (comprehensive deployment instructions)

## How to Migrate Your App

### Step 1: Create Database

```bash
# Option A: Supabase
# Go to supabase.com, create project, run migrations/001-initial-schema.sql

# Option B: Docker Compose (local dev)
docker-compose up -d
```

### Step 2: Update Environment Variables

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Step 3: Install Dependencies

```bash
npm ci  # or npm install
```

### Step 4: Switch to New Server

Since the old `server.ts` uses SQLite, I've created `server-new.ts` with the new architecture.

```bash
# Rename
mv server.ts server-old.ts
mv server-new.ts server.ts

# Update package.json start script if needed
npm start
```

### Step 5: Test Locally

```bash
npm run dev
# Access http://localhost:3000
# Try registration and login
```

### Step 6: Deploy

See `DEPLOYMENT_GUIDE.md` for platform-specific instructions.

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Database** | SQLite (file-based) | PostgreSQL (cloud-ready) |
| **Scalability** | Single user | Thousands of users |
| **Code Organization** | Monolithic (~800 lines) | Modular (50-100 lines each) |
| **Security** | Plain text passwords, no auth | Bcrypt + JWT + RBAC |
| **Deployment** | Docker only (local files) | Cloud platforms (Render, Railway, etc.) |
| **Reliability** | File corruption risk | ACID compliance, backups |
| **Monitoring** | Basic console logs | Structured logging + error tracking |
| **Development** | Manual setup | Docker Compose automation |
| **Testing** | Difficult (monolithic) | Easy (modular routes) |
| **Maintenance** | Hard to extend | Easy to add features |

## Next Steps for Your Team

1. **Read** `DEPLOYMENT_GUIDE.md` → Choose your deployment platform
2. **Follow** setup instructions for your chosen platform
3. **Run** database migrations
4. **Test** locally with docker-compose
5. **Deploy** to production
6. **Monitor** application health
7. **Iterate** on features with confidence

---

**Questions about the architecture?** Check the code comments or create an issue!
