<div align="center">
  <img src="https://pbs.twimg.com/profile_images/1068539411451781120/_ZjEfa7q_400x400.jpg" alt="SQB Bank Logo" height="80" />
  
  <h1>iABS "Uchet Arenda" | SQB Bank Hackathon 2026</h1>
  <h3>Team Antigravity</h3>
  <p><b>Enterprise-Grade Lease Management, Automated Accounting & AI Copilot</b></p>

  <p>
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js_22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/PostgreSQL_15-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Language-English_%7C_%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9_%7C_O'zbek-003366?style=flat-square" alt="Supported Languages" />
  </p>
</div>

---

## The Vision

Currently, bank lease operations (renting out ATMs, leasing branch spaces, IT equipment) are managed through fragmented Excel sheets. This leads to broken audit trails, manual typing errors in 20-digit account numbers, and massive compliance risks under Central Bank regulations.

**iABS Uchet Arenda** is a full-stack, enterprise-ready module designed to integrate directly into the bank's iABS core system. We replace manual data entry with strict state machines, automated double-entry Memo Orders, CBU Resolution 3336 compliance, and Zero-Trust security.

---

## Team Antigravity

| Role | Name |
|------|------|
| Full-Stack Developer | Rakhim Nuraliyev |
| Backend Developer | Muhammadaziz Xabibullayev |
| AI Engineer | Dildora Nodirova |
| Project Manager | Alimjan Abdullayev |

---

## Core Enterprise Features

### 1. Automated Accounting (Memo Orders)

Contracts move strictly through the lifecycle: **INTRODUCED --> APPROVED --> RETURNED**. Upon approval, the Node.js backend automatically executes an atomic database transaction (`$transaction`) to generate the double-entry Memo Order. No human ever types a 20-digit account code or performs manual balance calculations again.

**How it works:**

```
Operator creates lease (status: INTRODUCED)
        |
Controller clicks "Approve"
        |
Backend: prisma.$transaction() -->
    1. Update lease status to APPROVED
    2. Auto-generate MemoOrder {
         debit_account_20:  transit account,
         credit_account_20: income/expense account,
         amount:            contract amount
       }
        |
Immutable audit log entry created
```

### 2. CBU Resolution 3336 Compliance Engine

Built-in regulatory validation. When a new transit or income account is added to the Dictionaries, the system verifies the first 5 digits (COA prefix) against the official Central Bank of Uzbekistan registry. Invalid account codes are rejected before they can enter the database.

**Key COA codes enforced:**

| COA Code | Description | Type |
|----------|-------------|------|
| 16310 | Operating lease income | INCOME |
| 16320 | Financial lease income | INCOME |
| 25302 | Operating lease expenses | EXPENSE |
| 25304 | Financial lease expenses | EXPENSE |
| 22602 | Transit accounts for lease payments | TRANSIT |
| 10100 | Cash and equivalents | INCOME |
| 10301 | Nostro accounts | TRANSIT |

### 3. Google Gemini AI Integrations

Three production AI modules powered by `@google/genai` with automatic multi-model fallback:

- **AI Copilot (Yordamchi):** Ask questions about CBU 3336 regulations, lease rules, and account codes. Supports English, Russian, and Uzbek languages.
- **AI Analytics (Tahlil):** Executives type natural language queries like "Show me inbound lease costs for Q3," and the AI generates safe, read-only SQL to render dashboard charts instantly.
- **Real Estate Matchmaker (Ko'chmas mulk):** Describe the property you need in natural language, and the AI parses structured JSON parameters to search integrated property databases.

**Automatic Model Fallback:** When rate limits are hit on one model, the system automatically switches to the next available model in the chain: `gemini-2.5-flash` --> `gemini-2.5-flash-lite` --> `gemini-3-flash` --> `gemini-3.1-flash-lite` --> `gemini-2.0-flash`.

### 4. Zero-Trust Cybersecurity Fortress

- **Anti-CSRF Tokens:** All state-changing actions require cryptographic tokens to prevent Cross-Site Request Forgery.
- **Granular RBAC:** Permissions are not generic. SuperAdmins attach specific button-level access (e.g., `can_approve_lease`, `can_execute_payment`) to individual employee Timesheet IDs.
- **Immutable Audit Log:** Every single API request is intercepted by middleware, recording who (Tabel ID), what (action), and when (timestamp) into an unalterable PostgreSQL audit trail.
- **JWT Authentication:** Stateless authentication via Employee Tabel ID with bcrypt-hashed passwords.

---

## System Previews

The application features a glassmorphic, enterprise-banking interface utilizing SQB's corporate Navy Blue and Red color palette. Full tri-lingual support (English, Russian, Uzbek).

### Dashboard & Management Hub

Real-time KPIs for active leases, pending approvals, and inbound payment totals. Includes Asset Liquidity Forecast charts (Monthly/Quarterly) and a live audit trail feed.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123329.png" alt="Dashboard and Management Hub" width="800" />
</div>

<br/>

### Outbound Leases (Chiquvchi ijara)

Management of bank-owned assets for external rent. Features strict state machine controls (Approve, Return, Delete), protocol generation, and CSV/PDF export.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123357.png" alt="Outbound Leases" width="800" />
</div>

<br/>

### Inbound Leases (Kiruvchi ijara)

Assets rented by the bank from third parties. Includes a real-time Pending Payments panel, Upcoming Payments sidebar, and a payment execution gateway supporting Immediate (24/7) and Scheduled (next Bank Working Day) modes.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123417.png" alt="Inbound Leases" width="800" />
</div>

<br/>

### Dictionaries (Ma'lumotnomalar)

Centralized Master Data Management. Three sub-modules: Clients (Mijozlar), Accounts (Hisoblar), and CBU Registry (MB Reestri). All entries are validated against CBU Resolution 3336 before persistence.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123437.png" alt="Dictionaries - Client Management" width="800" />
</div>

<br/>

### AI Copilot (AI Yordamchi)

Contextual AI assistant powered by Gemini 2.5 Flash. Understands CBU regulations, iABS terminology, and answers in the user's language.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123459.png" alt="AI Copilot" width="800" />
</div>

<br/>

### AI Analytics (AI Tahlil)

Natural language to SQL query engine. Type business questions and get instant chart visualizations from live database data.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123518.png" alt="AI Analytics" width="800" />
</div>

<br/>

### Real Estate Matchmaker (Ko'chmas mulk)

AI-powered property search via natural language. Integrated with Comet API for real-time property database lookups.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123539.png" alt="Real Estate Matchmaker" width="800" />
</div>

<br/>

### Settings & Access Control (Sozlamalar)

Role-based access control with User Management, Permission Matrix, and System Info panels. Supports Admin, Controller, and Operator roles with granular button-level permissions.

<div align="center">
  <img src="screenshots/Screenshot 2026-04-26 123558.png" alt="Settings and Access Control" width="800" />
</div>

---

## Technical Architecture

### iABS Uchet Arenda System Architecture

The module is built as a five-layer enterprise system designed to map seamlessly to the iABS N-Tier architecture:

<div align="center">
  <img src="screenshots/iABS Uchet Arenda module - visual selection.png" alt="iABS Uchet Arenda System Architecture" width="700" />
</div>

<br/>

```mermaid
mindmap
  root((iABS Uchet<br/>Arenda System))
    Database Layer
      PostgreSQL 15
      Prisma ORM
      Leases
      Dictionaries
      Memo Orders
      ACID Compliance
    Frontend Layer
      React 19
      Vite
      Tailwind CSS
      TanStack Query
    AI Integration Layer
      Google GenAI
      Multi-Model Fallback Chain
      AI Copilot
      Analytics
      Real Estate Matchmaker
    Security & Middleware Layer
      Nginx Reverse Proxy
      Node.js Middlewares
      JWT Authentication
      Anti-CSRF Token Validation
      Immutable Audit Logging
    Backend Application Layer
      Express.js API
      N-Tier Architecture
      Controllers
      Services
      Repositories
```

### Entity-Relationship Diagram

<div align="center">
  <img src="screenshots/erDiagram.drawio.png" alt="Entity-Relationship Diagram" width="900" />
</div>

<br/>

```mermaid
erDiagram
    USER {
        uuid id PK
        string tabel_id UK
        string password_hash
        string role "Admin, Controller, Operator"
    }

    CLIENT {
        uuid id PK
        string code UK
        string name
        string subject "P (Physical), J (Juridical)"
        string inn UK
        string code_filial
    }

    ACCOUNT {
        uuid id PK
        uuid client_id FK
        string code_20_digit UK
        string code_coa_5_digit FK
        string currency
    }

    CBU_REGISTRY {
        string coa_code_5_digit PK
        string description
        string account_type "INCOME, EXPENSE, TRANSIT"
    }

    LEASE {
        uuid id PK
        string type "INBOUND, OUTBOUND"
        string status "INTRODUCED, APPROVED, RETURNED"
        decimal amount
        uuid tenant_id FK
        uuid lessor_id FK
        string transit_account_20
        string income_expense_account_20
    }

    MEMO_ORDER {
        uuid id PK
        uuid lease_id FK
        string debit_account_20
        string credit_account_20
        decimal amount
        datetime execution_date
    }

    AUDIT_LOG {
        uuid id PK
        string tabel_id FK
        string action
        string target_entity
        json payload
        datetime timestamp
    }

    CLIENT ||--o{ ACCOUNT : "owns"
    CBU_REGISTRY ||--o{ ACCOUNT : "validates"
    CLIENT ||--o{ LEASE : "acts as tenant/lessor"
    LEASE ||--o{ MEMO_ORDER : "generates upon approval"
    USER ||--o{ AUDIT_LOG : "performs actions tracked in"
```

### Stack Breakdown

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TypeScript 5.8, Tailwind CSS v4, TanStack Query, React Hook Form, Recharts |
| Backend | Node.js 22, Express.js, N-Tier (Controllers -> Services -> Repositories) |
| Database | PostgreSQL 15, Prisma ORM 7.8 (type-safe queries, migrations, seeding) |
| AI Engine | `@google/genai` (Gemini 2.5 Flash, with automatic fallback chain) |
| Auth | JWT via Employee Tabel ID, bcrypt password hashing, middleware-driven RBAC |
| Security | Anti-CSRF tokens, immutable audit logging, input validation |
| Infrastructure | Docker Compose, Nginx reverse proxy, multi-stage builds |
| Localization | i18next (English, Russian, Uzbek) |

---

## Setup Instructions

### Prerequisites

- Docker Desktop installed
- Git installed
- A Google Cloud AI API key (for Gemini features)

### 1. Clone the Repository

```bash
git clone https://github.com/raximnuraliyev/iABS-demo-BuildWithAI.git
cd iABS-demo-BuildWithAI
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Google Cloud SQL)
# URL Encoded Password: C3JJKS%5Eq~P%24U%7Bn%3Da
DATABASE_URL="postgresql://postgres:C3JJKS%5Eq~P%24U%7Bn%3Da@104.197.86.119:5432/uchet_arenda?schema=public&sslmode=require"

# Server
PORT=3000
JWT_SECRET="sqb_hackathon_super_secret_2026"

# Google AI (Gemini) - Required for AI features
GOOGLE_AI_API_KEY="your_google_ai_api_key"
```

### 3. Run with Docker Compose

Spin up the entire application (Database + Backend API + Frontend):

```bash
docker-compose up --build -d
```

### 4. Apply Database Migrations

Push the Prisma schema to the database and seed initial data:

```bash
docker exec -it iabsdemobuildwithai-backend-1 sh -c "npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts"
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend (Nginx) | http://localhost:8080 |
| Backend API | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

### Default Login Credentials

| Tabel ID | Password | Role |
|----------|----------|------|
| 0012 | admin123 | Admin (Full Access) |
| 14552 | admin123 | Controller (Approve + Pay) |
| 8891 | admin123 | Operator (Create Leases) |

---

## Project Structure

```
iABS-demo-BuildWithAI/
|-- server/                     # Backend (Node.js + Express)
|   |-- controllers/            # Request handlers
|   |-- services/               # Business logic
|   |-- repositories/           # Data access layer (Prisma)
|   |-- middlewares/             # Auth, RBAC, CSRF, Audit
|   |-- routes/                 # API route definitions
|   |-- app.ts                  # Express application entry
|   `-- prismaClient.ts         # Shared Prisma instance
|-- src/                        # Frontend (React + Vite)
|   |-- components/             # Reusable UI components
|   |-- pages/                  # Route pages
|   |-- lib/                    # API client, utilities
|   `-- i18n/                   # Localization files (EN/RU/UZ)
|-- prisma/
|   |-- schema.prisma           # Database schema
|   `-- seed.ts                 # Initial data seeding
|-- screenshots/                # System preview images
|-- docker-compose.yml          # Multi-container orchestration
|-- Dockerfile.backend          # Backend container image
|-- Dockerfile.frontend         # Frontend container image (Nginx)
|-- nginx.conf                  # Nginx reverse proxy config
`-- .env                        # Environment variables
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Employee login via Tabel ID |
| GET | `/api/v1/auth/me` | Get current user info |

### Leases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/leases?type=OUTBOUND` | List outbound leases |
| GET | `/api/v1/leases?type=INBOUND` | List inbound leases |
| POST | `/api/v1/leases` | Create new lease |
| POST | `/api/v1/leases/:id/approve` | Approve lease (generates Memo Order) |
| POST | `/api/v1/leases/:id/return` | Return lease |
| POST | `/api/v1/leases/:id/pay` | Execute payment (Immediate/Scheduled) |

### Dictionaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/clients` | Client management |
| GET/POST | `/api/v1/accounts` | Account management (COA validated) |
| GET/POST | `/api/v1/cbu-registry` | CBU Registry management |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/copilot` | AI assistant for CBU regulations |
| POST | `/api/v1/ai/analytics` | Natural language to SQL |
| POST | `/api/v1/ai/matchmaker` | Property search via AI |
| GET | `/api/v1/ai/model-status` | Current AI model status |

---

## License

This project was built for the SQB Bank Hackathon 2026 (#BuildWithAI). All rights reserved by Team Antigravity.