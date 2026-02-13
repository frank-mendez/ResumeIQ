# 🚀 ResumeIQ

AI-powered resume analysis platform designed to help candidates optimize their resumes for Applicant Tracking Systems (ATS) and recruiter expectations.

Built with modern SaaS architecture using Supabase, AI integrations, and secure database design.

## ✨ Features

- 🔐 Supabase Authentication (JWT-based)
- 📄 Resume Upload (PDF/DOCX)
- 🗂 Versioned Resume System
- 🤖 AI-Powered Resume Analysis
- 📊 Structured ATS Scoring
- 💳 Stripe Subscription Support (planned / in progress)
- 💰 Usage & Credit Tracking
- 🔒 Row-Level Security (RLS) enforced
- 🧪 Unit Testing with Coverage Enforcement
- ☁️ SonarCloud Quality Gate CI

## 🏗 Architecture Overview

Frontend (React + TanStack Router)  
↓  
Supabase Auth + Storage  
↓  
Supabase Postgres (RLS enforced)  
↓  
Backend API (AI + Billing Logic)  
↓  
OpenAI / Stripe

### Principles

- No direct DB exposure
- RLS on every table
- Backend handles billing + AI secrets
- Deterministic CI builds
- Production-grade schema constraints

## 🧰 Tech Stack

### Frontend

- React
- TanStack Router
- TypeScript
- Vitest (unit testing)

### Backend

- Node.js (planned modular service layer)
- Supabase (Postgres + Auth + Storage)
- OpenAI (AI analysis)
- Stripe (billing)

### Infrastructure

- Supabase
- GitHub Actions
- SonarCloud

## ⚡ Quick Start

```bash
git clone https://github.com/frank-mendez/ResumeIQ
cd ResumeIQ
cp .env.example .env
npm install
npm run dev
```

Make sure environment variables are configured before running.

## 🔐 Environment Variables

Create a `.env` file:

```env
# Supabase (Frontend)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Backend Only
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

⚠ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.

## ☁️ Supabase Setup

1. Create a Supabase project.
2. Enable Row Level Security on all tables.
3. Create a storage bucket named:

```txt
resumes
```

4. Apply migrations from `/supabase/migrations`.
5. Ensure RLS policies are enabled.

## 🗄 Database Schema Overview

Core tables:

- `profiles`
- `resumes`
- `resume_versions`
- `resume_analyses`
- `user_credits`
- `subscriptions`
- `payments`
- `usage_logs`

### Design Highlights

- Foreign keys are NOT NULL
- Stripe IDs are unique
- One active version per resume
- Soft delete support
- AI analysis status tracking
- Credit-based usage control
- Strict RLS enforcement

## 📄 Resume Upload Flow

1. Validate file type (PDF/DOCX)
2. Validate file size (max 5MB)
3. Upload to Supabase Storage
4. Insert metadata in `resumes`
5. Create initial `resume_version`
6. Trigger AI processing (backend)

Storage path format:

```txt
user_id/resume_id/original_filename
```

## 🧠 AI Processing Flow

Frontend → Backend → OpenAI → Store Analysis → Deduct Credits

- Status tracked (`pending`, `processing`, `completed`, `failed`)
- Token usage logged
- Cost tracking supported
- Credits updated transactionally

## 💳 Billing Model

- Stripe subscriptions
- Payment intents logged
- Status validation enforced
- Financial tables backend-controlled
- Users can view but not mutate financial records

## 🧪 Testing

Run tests:

```bash
npm run test
```

Run with coverage:

```bash
npm run test:coverage
```

Coverage is required for CI and SonarCloud Quality Gate.
Pre-commit also enforces coverage thresholds.

## 🔁 CI / Quality Gate

CI runs:

- Lint
- Unit tests
- Coverage
- Build
- SonarCloud analysis

Quality Gate enforces:

- Coverage on new code
- No critical vulnerabilities
- Maintainability standards

## 🔒 Security Model

- RLS enabled on all user-owned tables
- Financial and credit tables are backend-write only
- No service role key exposed client-side
- Strict storage path isolation
- Stripe webhook validation required

## 📊 Scalability Considerations

Ready for:

- 10k+ users
- Credit-based monetization
- AI cost tracking
- Admin dashboards
- Subscription tiers

## 🛣 Roadmap

- Resume parsing improvements
- Multi-language resume support
- Team / organization accounts
- AI resume rewriting
- Interview prep module

## 📄 License

MIT License

## 👨‍💻 Author

Built by Frank Mendez.
