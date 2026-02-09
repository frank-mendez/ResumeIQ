# Copilot Instructions for ResumeIQ

These instructions define how Copilot should work in this repository. Follow them for all edits, reviews, and suggestions.

## 1. Project Goals and Non-Goals

### Goals

- Build a production-grade AI resume analyzer focused on ATS compatibility and honest, actionable guidance.
- Prioritize accuracy, reliability, and security over UI polish.
- Keep AI analysis structured, deterministic, and auditable.

### Non-Goals

- Do not fabricate resume content or inflate scores.
- Do not claim metrics or insights without evidence.
- Do not create a "one-click perfect resume" experience.
- Do not move AI logic or payments to the client.

## 2. Tech Stack (Locked)

### Required Stack

- TanStack Start (SSR)
- TypeScript (strict)
- Supabase (Auth, Postgres, Storage)
- Stripe (payments)
- Tailwind CSS

### Rules

- No unapproved framework swaps or rewrites.
- No JavaScript files; use TypeScript only.
- No client-side secrets.

## 3. Architecture Rules

### Server/Client Boundaries

- AI analysis logic is server-only.
- Stripe logic is server-only.
- Do not place business logic in UI components.

### Folder Responsibilities

- app/routes/: route handlers, loaders, and UI
- app/utils/: server actions and business logic
- app/lib/: shared clients and configuration
- app/types/: type definitions

### Data Flow Expectations

- Typed service layers for external integrations.
- UI components receive prepared data, not raw business logic.

## 4. AI Usage Guidelines (Critical)

### Prompt and Analysis Structure

- Use multi-step analysis, not a single mega-prompt.
- Require strict JSON outputs from the model.
- Validate outputs with schemas (Zod preferred).

### Guardrails

- No hallucinated metrics.
- Bias-aware analysis and neutral language.
- Use deterministic scoring ranges and document how they are computed.

## 5. Data and Database Rules

- Supabase is the system of record for resumes and analyses.
- RLS is required on all tables.
- Users may only access their own data.
- Resume analyses are versioned and immutable once stored.
- No destructive migrations without explicit approval.

## 6. Payments and Entitlements

- Stripe is the payment source of truth.
- Supabase is the access/entitlement source of truth.
- Webhooks are required for state changes.
- Never trust the frontend for payment status.
- Implement a grace period for expired subscriptions.

## 7. Security and Privacy

- Treat resume data as sensitive.
- Never log PII or resume content.
- Do not store resume content in analytics.
- Use signed URLs for sharing where required.
- Rate limit AI endpoints.

## 8. Error Handling and Reliability

- Validate AI JSON strictly and handle parse failures.
- Retry AI calls with caps and backoff.
- Enforce cost caps per user and per request.
- Provide graceful fallbacks for analysis failures.

## 9. Code Style and Quality Bar

- Strict TypeScript only; avoid any.
- Use Zod for validation.
- Prefer small, testable functions.
- Clear naming and explicit data shapes.
- Avoid silent refactors; explain intent in PRs.

## 10. Contribution Rules

- PRs must describe user-facing behavior changes.
- Commit messages: <type>: <short description>
  - Examples: feat: add resume analysis schema, fix: handle stripe webhook replay
- Discuss schema changes, payment changes, and AI changes before implementation.
- No silent refactors that alter behavior.

## 11. What Not To Build (Anti-Scope)

- Resume auto-fabrication or content generation that implies facts.
- Fake metrics or unverifiable scores.
- Client-side AI calls.
- Dark-pattern paywalls.

## 12. Versioning and Change Management

- Prompt changes are versioned and recorded with outputs.
- Database migrations follow a forward-only policy.
- Breaking changes require a clear migration path and announcement.

## 13. Repo Context Pointers

- Project overview: README.md
- Architecture: ARCHITECTURE.md
- Setup: SETUP.md
- Summary: SUMMARY.md
- Migrations: supabase/migrations/
