# Class 12 Commerce – AI Powered Sample Paper & Study Platform

A production-ready educational platform designed exclusively for Class 12 Commerce students to explore board sample papers, study verified step-by-step model answers, and engage with **Study Chat Bot** (powered by NVIDIA Nemotron AI architecture).

---

## 1. Features Overview

### Student Academic Platform
- **Class 12 Commerce Specialization:** Exclusively covers:
  - **OCM** (Organization of Commerce and Management)
  - **BK** (Book Keeping and Accountancy)
  - **ECO** (Economics)
  - **SP** (Secretarial Practice)
  - **ENG** (English)
  - **IT** (Information Technology)
- **Year-Wise Sample Papers:** Filterable across academic examination years (2024, 2025, 2026).
- **Dual Resource Delivery:** Both original question paper PDFs and verified answer documents are provided.
- **Structured Model Answers:** Complete question numbers, sub-questions, mark allocations, mathematical calculations for Accountancy, and tables.
- **Dedicated Subject Dashboards:** Clean routes for each subject (`/sample-papers/ocm`, `/sample-papers/bk`, `/sample-papers/eco`, etc.).
- **Study Chat Bot:**
  - Automated sample paper intent detection (`"Show me sample papers"`, `"I want OCM papers"`).
  - Deterministic database-driven subject and year selector buttons.
  - Multi-turn conversation state remembering the selected paper and subject.
  - Deep curriculum explanations via NVIDIA Nemotron AI.
  - Persistent chat history across sessions for logged-in students.
- **Google OAuth Sign In:** Seamless passwordless login with HTTP-only cookies and CSRF protection.

### Secure Administrator Portal (`/admin`)
- **Server-Side Role-Based Access Control:** Restricted exclusively to users with `role: "ADMIN"`. Client-side tampering is prevented.
- **Real-Time Analytics Dashboard:** Live student counts, sample papers, subjects, conversations, and audit activity trail.
- **Subject Management:** Create, rename, re-code, reorder, or activate/deactivate subjects without code changes.
- **Sample Paper Management:**
  - Server-side PDF binary validation (verifies `%PDF-` magic bytes, MIME types, and 15MB limits).
  - Dual document attachment (Question Paper PDF & Model Answer PDF).
  - Instant publish / draft toggle.
- **Question & Answer Editor:**
  - Rich Markdown, LaTeX math, and table support for Accountancy ledger balances.
  - One-click bulk JSON import for rapid digitized curriculum onboarding.
- **User Management:** Audit registered students and admins, search by name/email, toggle account status, and modify roles.
- **Chatbot & System Settings:**
  - Dynamic system prompt modification.
  - Model identifier configuration.
  - Rate limiting controls (per minute per IP/user).
  - Maintenance mode toggle.
  - Homepage title and introduction live editing.

### Developer Profile (`/developer`)
- Dedicated, minimalist profile for **Dhruv** (Age: 17, Class: 12, Role: Website Developer).

---

## 2. Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Markdown, Remark GFM.
- **Backend:** Next.js Server-Side Route Handlers, Node.js runtime.
- **Database:** PostgreSQL (with dual SQLite compatibility for instant local development), Prisma ORM.
- **Authentication:** NextAuth.js (Auth.js) with Google OAuth Provider and Admin Credentials fallback.
- **AI Integration:** NVIDIA Nemotron 3.5 / Llama-3.1-Nemotron NIM Chat Completion API.
- **Security:** Zod schema validation, sliding-window rate limiting, input sanitization, IDOR verification on conversations, binary magic-byte PDF validation, audit logging.

---

## 3. Directory Structure

```text
├── prisma/
│   ├── schema.prisma            # Active database schema (SQLite / PostgreSQL)
│   ├── schema.postgresql.prisma # Dedicated production PostgreSQL schema
│   └── seed.ts                  # Comprehensive Class 12 Commerce database seeder
├── public/
│   └── sample-papers/           # Downloadable board PDF documents
├── scripts/
│   ├── generate-pdfs.ts         # Binary PDF generator for board sample papers
│   └── test-all-features.ts     # Automated 28-point end-to-end test suite
├── src/
│   ├── app/
│   │   ├── admin/               # Secure Admin Portal (Dashboard, Papers, Subjects, QA, Users, Settings)
│   │   ├── api/                 # Secure REST API Endpoints (Auth, Chatbot, Admin, Upload, Papers)
│   │   ├── chatbot/             # Study Chat Bot interface
│   │   ├── developer/           # Dhruv developer page
│   │   ├── login/               # Sign In portal
│   │   ├── sample-papers/       # Public sample papers explorer & subject pages
│   │   ├── globals.css          # Theme system & styling
│   │   └── layout.tsx           # Global root layout with Navbar & Footer
│   ├── components/
│   │   ├── chatbot/             # ChatInterface component with history sidebar
│   │   ├── layout/              # Navbar, Footer
│   │   ├── providers/           # NextAuth SessionProvider wrapper
│   │   └── sample-papers/       # PaperCard, AnswerModal, SamplePapersExplorer
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── nvidia.ts            # NVIDIA Nemotron NIM AI client & fallback
│   │   ├── prisma.ts            # Singleton Prisma client
│   │   ├── rate-limit.ts        # Sliding-window rate limiter
│   │   ├── security.ts          # Server-side auth, role guards & audit logging
│   │   └── validation.ts        # Zod validation schemas
│   └── services/
│       ├── chatbot.service.ts   # Chatbot intent engine & workflow
│       ├── conversation.service.ts # History management with IDOR checks
│       └── sample-paper.service.ts # Academic repository queries
```

---

## 4. Quick Start & Local Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local configuration is already pre-configured for instant running:
- `DATABASE_URL="file:./dev.db"`
- `ADMIN_EMAIL="admin@commerceprep.edu"`
- `ADMIN_PASSWORD="AdminCommerce@2026"`

### Step 3: Initialize Database & Seed Real Sample Papers
```bash
# Push schema to SQLite database
npm run db:push

# Generate sample board PDF files
npm run generate-pdfs

# Populate subjects, papers, Q&As, and administrator account
npm run db:seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Automated Verification & Testing

To execute the automated test suite testing all 28 requirements (database integrity, multi-turn chatbot workflows, accountancy calculations, binary PDF validation, and security guards):
```bash
npx tsx scripts/test-all-features.ts
```

To run a full production build check:
```bash
npm run build
```

---

## 6. Administrator Access Credentials

Navigate to `/login` or `/admin`:
- **Admin Email:** `admin@commerceprep.edu`
- **Admin Password:** `AdminCommerce@2026`

*To update the admin password or email in production, change `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your production environment variables and run `npm run db:seed`.*

---

## 7. Production Deployment Guide (Vercel & PostgreSQL)

### Step 1: Provision Managed PostgreSQL Database
Create a PostgreSQL instance using any managed provider:
- **Neon:** [https://neon.tech](https://neon.tech)
- **Supabase:** [https://supabase.com](https://supabase.com)
- **Vercel Postgres:** [https://vercel.com/storage/postgres](https://vercel.com/storage/postgres)
- **AWS RDS PostgreSQL**

Copy your connection string:
```text
DATABASE_URL="postgresql://username:password@your-db-host.neon.tech/commercedb?sslmode=require"
```

### Step 2: Switch Prisma to PostgreSQL
Replace `prisma/schema.prisma` with `prisma/schema.postgresql.prisma`:
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma generate
npx prisma db push
npm run db:seed
```

### Step 3: Google OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and configure the OAuth Consent Screen.
3. Create OAuth 2.0 Client ID Credentials (Web application).
4. Add Authorized Redirect URI:
   `https://your-domain.vercel.app/api/auth/callback/google`
5. Copy the Client ID and Client Secret into your Vercel Environment Variables.

### Step 4: NVIDIA Nemotron AI Key Configuration
1. Obtain an API key from [NVIDIA NIM](https://build.nvidia.com/).
2. Configure `NVIDIA_API_KEY` and `NVIDIA_MODEL` (`nvidia/llama-3.1-nemotron-70b-instruct` or `nvidia/nemotron-4-340b-instruct`) in your environment variables.

### Step 5: Deploy to Vercel
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Add the following production environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (`https://your-domain.vercel.app`)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NVIDIA_API_KEY`
   - `NVIDIA_MODEL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
4. Deploy!
