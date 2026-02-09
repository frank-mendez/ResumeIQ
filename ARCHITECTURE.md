# ResumeIQ Architecture Documentation

## Overview

ResumeIQ is a production-ready AI resume analyzer built with modern web technologies. This document explains the architecture, data flow, and key design decisions.

## Technology Stack

### Frontend
- **React 19**: Latest React with concurrent features
- **TanStack Router**: File-based routing with type safety
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **TanStack Start**: Full-stack React framework with SSR
- **Server Functions**: Type-safe server actions
- **Vinxi**: Build tool and development server

### Database & Storage
- **Supabase PostgreSQL**: Relational database with RLS
- **Supabase Storage**: File storage for resumes
- **Supabase Auth**: Authentication with JWT

### External Services
- **Stripe**: Payment processing and subscriptions
- **OpenAI** (stubbed): AI-powered resume analysis

## Project Structure

```
ResumeIQ/
├── app/
│   ├── components/        # React components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── lib/              # Core library code
│   │   ├── supabase.client.ts    # Browser Supabase client
│   │   ├── supabase.server.ts    # Server Supabase client
│   │   └── stripe.server.ts      # Stripe configuration
│   │
│   ├── routes/           # File-based routes
│   │   ├── __root.tsx                      # Root layout
│   │   ├── index.tsx                       # Home page
│   │   ├── login.tsx                       # Login page
│   │   ├── signup.tsx                      # Signup page
│   │   ├── pricing.tsx                     # Pricing page
│   │   ├── _authenticated.tsx              # Auth layout
│   │   └── _authenticated.dashboard.*      # Dashboard routes
│   │
│   ├── styles/           # Global styles
│   │   └── globals.css
│   │
│   ├── types/            # TypeScript types
│   │   ├── index.ts      # App types
│   │   └── supabase.ts   # Database types
│   │
│   ├── utils/            # Server actions
│   │   ├── auth.server.ts     # Authentication
│   │   ├── resume.server.ts   # Resume operations
│   │   └── stripe.server.ts   # Stripe operations
│   │
│   ├── client.tsx        # Client entry point
│   ├── router.tsx        # Router configuration
│   ├── routeTree.gen.ts  # Generated route tree
│   └── ssr.tsx           # SSR entry point
│
├── supabase/
│   └── migrations/       # Database migrations
│       ├── 001_initial_schema.sql
│       └── 002_storage_setup.sql
│
├── .env.example          # Environment variables template
├── .gitignore
├── app.config.ts         # App configuration
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Data Flow

### Authentication Flow

1. **Sign Up/Sign In**
   ```
   User → Client Form → signUp/signIn() → Supabase Auth → Set Cookies → Dashboard
   ```

2. **Protected Routes**
   ```
   User Request → _authenticated.tsx → Check Auth → Allow/Redirect
   ```

3. **Session Management**
   ```
   Server Request → Read Cookies → Verify JWT → Get User → RLS Policies
   ```

### Resume Analysis Flow

1. **Upload**
   ```
   User → File Input → Client Validation → Supabase Storage → uploadResume()
   ```

2. **Text Extraction** (Stubbed)
   ```
   Resume ID → extractResumeText() → PDF/DOCX Parser → Save to DB
   ```

3. **AI Analysis** (Stubbed)
   ```
   Resume Text → analyzeResume() → OpenAI API → Parse Results → Save to DB
   ```

4. **Display**
   ```
   Resume ID → getResumeAnalyses() → Format Data → React Components
   ```

### Subscription Flow

1. **Checkout**
   ```
   User → Select Plan → createCheckoutSession() → Stripe Checkout → Success/Cancel
   ```

2. **Webhook Processing** (Stubbed)
   ```
   Stripe Event → handleStripeWebhook() → Verify Signature → Update DB
   ```

3. **Access Control**
   ```
   User Request → getUserSubscription() → Check Plan → Allow/Restrict Features
   ```

## Database Schema

### Tables

#### `resumes`
- Stores uploaded resume metadata and extracted text
- Fields: id, user_id, filename, file_path, file_type, file_size, extracted_text, created_at, updated_at
- RLS: Users can only access their own resumes

#### `analyses`
- Stores AI analysis results
- Fields: id, resume_id, user_id, ats_score, strengths, weaknesses, suggestions, keywords, raw_analysis, created_at
- RLS: Users can only access their own analyses

#### `subscriptions`
- Manages user subscriptions
- Fields: id, user_id, stripe_subscription_id, stripe_customer_id, status, plan_type, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at
- RLS: Users can only access their own subscription

#### `payments`
- Records payment history
- Fields: id, user_id, subscription_id, stripe_payment_intent_id, amount, currency, status, created_at
- RLS: Users can only access their own payments

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to read their own data
- Allow users to insert their own data
- Allow users to update their own data
- Restrict access to other users' data
- Use `auth.uid()` for user identification

### Storage

- **Bucket**: `resumes`
- **Path Structure**: `{user_id}/{timestamp}-{filename}`
- **Policies**: Users can only access files in their own folder

## Server Functions

### Authentication (`auth.server.ts`)

- `signUp({ email, password })` - Create new user account
- `signIn({ email, password })` - Authenticate user
- `signOut()` - End user session
- `getCurrentUser()` - Get authenticated user

### Resume Operations (`resume.server.ts`)

- `uploadResume({ filename, fileType, fileSize, filePath })` - Save resume metadata
- `extractResumeText({ resumeId })` - Extract text from uploaded file (stubbed)
- `analyzeResume({ resumeId })` - Analyze resume with AI (stubbed)
- `getUserResumes()` - Get all user's resumes
- `getResumeAnalyses({ resumeId })` - Get analyses for a resume

### Stripe Operations (`stripe.server.ts`)

- `createCheckoutSession({ planType })` - Create Stripe checkout (stubbed)
- `handleStripeWebhook()` - Process Stripe webhooks (stubbed)
- `getUserSubscription()` - Get user's current subscription
- `cancelSubscription()` - Cancel user's subscription

## Security Considerations

### Authentication
- JWT tokens stored in HTTP-only cookies
- Server-side validation on every request
- Protected routes check authentication before rendering

### Authorization
- Row Level Security enforces data access
- Server functions verify user ownership
- Service role key used only for admin operations

### File Upload
- Client-side file type validation
- Server-side file size limits
- Files scoped to user directories
- Storage policies enforce access control

### API Keys
- Server-only environment variables
- Never exposed to client
- Separate keys for development/production

### Payment Processing
- Stripe webhook signature verification (stubbed)
- Payment events processed server-side only
- No sensitive payment data stored

## Extensibility Points

### Adding AI Analysis

Location: `app/utils/resume.server.ts` - `analyzeResume()`

```typescript
// Replace stubbed implementation with:
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are a resume analysis expert..."
    },
    {
      role: "user",
      content: resume.extracted_text
    }
  ]
})

// Parse and save results
```

### Adding Text Extraction

Location: `app/utils/resume.server.ts` - `extractResumeText()`

```typescript
// For PDF files:
import pdf from 'pdf-parse'

const { data: file } = await supabase.storage
  .from('resumes')
  .download(resume.file_path)

const buffer = await file.arrayBuffer()
const data = await pdf(Buffer.from(buffer))
const extractedText = data.text

// For DOCX files:
import mammoth from 'mammoth'

const result = await mammoth.extractRawText({ buffer })
const extractedText = result.value
```

### Adding Stripe Webhooks

Location: `app/utils/stripe.server.ts` - `handleStripeWebhook()`

Uncomment the production implementation and handle:
- `checkout.session.completed` - Create subscription
- `customer.subscription.updated` - Update subscription
- `customer.subscription.deleted` - Cancel subscription
- `payment_intent.succeeded` - Record payment

### Adding New Features

1. **Database**: Add migration in `supabase/migrations/`
2. **Types**: Update `app/types/supabase.ts`
3. **Server Function**: Create in `app/utils/*.server.ts`
4. **Route**: Add file in `app/routes/`
5. **Component**: Create in `app/components/`

## Deployment

### Environment Variables

Required for all environments:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `VITE_APP_URL`

### Build Process

```bash
npm run build
```

This creates:
- Client bundle (`.output/public`)
- Server bundle (`.output/server`)
- SSR configuration

### Platform Deployment

The application is compatible with:
- **Vercel**: Native TanStack Start support
- **Netlify**: Edge functions support
- **Railway**: Node.js deployment
- **Self-hosted**: Node.js + reverse proxy

### Post-Deployment

1. Run Supabase migrations
2. Configure Stripe webhook endpoint
3. Set up custom domain
4. Configure CDN for static assets
5. Set up monitoring and logging

## Performance Optimizations

### Server-Side Rendering (SSR)
- Initial page load is server-rendered
- Faster first contentful paint
- Better SEO

### Code Splitting
- Route-based code splitting
- Lazy loading of components
- Reduced initial bundle size

### Caching
- TanStack Query caches server data
- Automatic cache invalidation
- Optimistic updates

### Database
- Indexed columns for faster queries
- Connection pooling
- Prepared statements

## Testing Strategy

### Unit Tests
- Test server functions independently
- Mock Supabase and Stripe clients
- Test business logic

### Integration Tests
- Test route handlers
- Test database operations
- Test authentication flow

### E2E Tests
- Test complete user flows
- Test file upload and analysis
- Test payment flow

## Monitoring and Logging

### Application Logs
- Server function errors
- Authentication events
- Payment events

### Performance Metrics
- Response times
- Database query performance
- File upload times

### Error Tracking
- Client-side errors
- Server-side errors
- Failed webhook events

## Maintenance

### Database Migrations
- Create new migration files
- Test locally with Supabase CLI
- Apply in staging, then production

### Dependency Updates
- Regular security updates
- Breaking change reviews
- Test before deploying

### Backup Strategy
- Daily database backups
- Storage bucket replication
- Configuration backups

## Support and Documentation

- **User Documentation**: In-app help and tooltips
- **API Documentation**: OpenAPI spec (future)
- **Developer Documentation**: This file
- **Contributing Guide**: CONTRIBUTING.md (future)
