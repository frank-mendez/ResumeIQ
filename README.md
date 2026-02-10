# ResumeIQ

ResumeIQ shows how your resume performs in ATS systems and tells you exactly how to fix it.

## Product Scope (MVP Is)

ResumeIQ is a paid, ATS-focused resume analyzer that:

- Accepts a resume upload
- Analyzes it using ChatGPT
- Returns an honest ATS score plus actionable feedback
- Converts users via a 7-day low-friction trial

This is not a resume builder. This is diagnosis plus improvement guidance.

## Locked Tech Stack (MVP)

- Frontend / Backend: TanStack Start
- Auth and DB: Supabase (OAuth + Postgres + Storage)
- Styling: Tailwind CSS
- LLM Provider: ChatGPT (via OpenAI)
- Payments: Stripe

No framework swaps. No client-side AI.

## MVP User Flow (End-to-End)

- User signs in with OAuth
- Uploads resume (PDF or DOCX)
- Resume is parsed server-side
- AI analysis runs (multi-step)
- Results page is shown
- User is prompted to start trial
- Trial auto-renews unless canceled

## Core MVP Features (Must Ship)

### Authentication

- OAuth (Google, GitHub)
- Protected routes
- Session persistence

### Resume Upload and Parsing

- PDF and DOCX only
- Supabase Storage
- Server-side text extraction
- Versioned resume storage

### AI Resume Analysis (ChatGPT Only)

Included in MVP:

- Resume structuring
- Role and seniority inference
- ATS compatibility score (0 to 100)
- Score breakdown:
  - Formatting
  - Keywords
  - Clarity
  - Experience relevance
  - Strengths
  - High-risk issues
  - Missing information callouts

Not included:

- No resume auto-writing
- No fake metrics
- No "perfect resume" claims

### Actionable Improvements

- Bullet-level rewrite suggestions
- Clear explanation of why each rewrite is better
- "[add metric]" placeholders instead of hallucinations

### Results UI

- ATS score card
- Strengths list
- Issues list
- Improvement suggestions
- Clear verdict summary

### Payments and Access Control (Critical)

Pricing (locked):

- $2.95 for first 7 days
- Auto-renews at $19.95/month
- Cancel anytime
- Managed entirely by ResumeIQ

What is included during trial:

- Full resume analysis
- Bullet rewrite suggestions
- Results history

Stripe requirements:

- Checkout session
- Subscription handling
- Webhooks for:
  - Trial start
  - Renewal
  - Cancellation
  - Payment failure

Feature gating:

- No analysis without active trial or subscription
- Trial is one per user
- Server-side enforcement only

## Explicit Non-Goals (MVP Will Not Include)

- Resume editor
- Resume export (DOCX or PDF)
- Multiple job descriptions
- Resume templates
- Cover letters
- Team accounts
- AI chat interface

If it does not directly improve resume screening success, it is out.

## MVP Success Criteria (Ship / No-Ship)

You ship MVP when:

- Resume parsing works reliably
- ATS scores feel realistic (not inflated)
- Users understand why they got the score
- Stripe trial to renewal works end-to-end
- You can explain this app in one sentence

"ResumeIQ shows how your resume performs in ATS systems and tells you exactly how to fix it."

## Final Reality Check

This MVP:

- Is small enough to ship
- Is strong enough to charge for
- Demonstrates real AI engineering
- Looks serious to recruiters and users

Most people overbuild. You are doing the opposite, and that is why this will work.
