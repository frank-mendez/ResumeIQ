# ResumeIQ

AI-powered resume analyzer built with TanStack Start, Supabase, and TypeScript. Evaluates ATS compatibility, identifies gaps, and provides actionable resume improvements using modern LLMs.

## Features

- 🚀 **TanStack Start** - Modern React framework with SSR
- 🔐 **Supabase Auth** - Secure authentication with protected routes
- 📊 **Dashboard** - Intuitive user interface for managing resumes
- 📤 **Resume Upload** - Support for PDF and DOCX files
- 🤖 **AI Analysis** - Stubbed AI-powered resume analysis (ready for integration)
- 💳 **Stripe Integration** - Subscription management with webhook support
- 🗄️ **PostgreSQL** - Full database schema for resumes, analyses, subscriptions
- 🎨 **Tailwind CSS** - Modern, responsive styling
- 📦 **TypeScript** - Full type safety throughout the application

## Tech Stack

- **Frontend**: React 19, TanStack Router, TanStack Query
- **Backend**: TanStack Start (SSR), Server Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Project Structure

```
app/
├── components/          # React components
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   └── LoadingSpinner.tsx
├── lib/                # Core library code
│   ├── supabase.client.ts
│   ├── supabase.server.ts
│   └── stripe.server.ts
├── routes/             # TanStack Router routes
│   ├── __root.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── pricing.tsx
│   └── _authenticated.dashboard.*
├── styles/             # Global styles
├── types/              # TypeScript type definitions
├── utils/              # Server actions
│   ├── auth.server.ts
│   ├── resume.server.ts
│   └── stripe.server.ts
├── client.tsx          # Client entry point
├── router.tsx          # Router configuration
└── ssr.tsx             # SSR entry point

supabase/
└── migrations/         # Database migrations
    ├── 001_initial_schema.sql
    └── 002_storage_setup.sql
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/frank-mendez/ResumeIQ.git
   cd ResumeIQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
   - `OPENAI_API_KEY` - Your OpenAI API key (for AI analysis)

4. **Set up Supabase**
   
   a. Create a new Supabase project
   
   b. Run the migrations in the Supabase SQL editor:
   ```sql
   -- Run supabase/migrations/001_initial_schema.sql
   -- Run supabase/migrations/002_storage_setup.sql
   ```

5. **Set up Stripe**
   
   a. Create products and prices in Stripe dashboard
   
   b. Update the price IDs in `app/lib/stripe.server.ts`
   
   c. Set up webhook endpoint pointing to `/api/webhooks/stripe`

6. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Database Schema

The application uses the following main tables:

- **resumes** - Stores uploaded resume metadata and extracted text
- **analyses** - Stores AI analysis results for resumes
- **subscriptions** - Manages user subscription information
- **payments** - Records payment history

Row Level Security (RLS) policies ensure users can only access their own data.

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in existing user
- `POST /api/auth/signout` - Sign out current user
- `GET /api/auth/user` - Get current user

### Resume Management
- `POST /api/resumes/upload` - Upload resume file
- `GET /api/resumes` - Get user's resumes
- `POST /api/resumes/extract` - Extract text from resume
- `POST /api/resumes/analyze` - Analyze resume with AI
- `GET /api/resumes/:id/analyses` - Get analyses for a resume

### Stripe
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/stripe/subscription` - Get user's subscription
- `POST /api/stripe/cancel` - Cancel subscription

## Extending the Application

### Adding AI Analysis

The AI analysis is currently stubbed. To integrate actual AI:

1. Update `app/utils/resume.server.ts` in the `analyzeResume` function
2. Uncomment the OpenAI integration code
3. Add your preferred AI provider (OpenAI, Anthropic, etc.)

```typescript
// Example OpenAI integration
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
```

### Adding Text Extraction

The text extraction is currently stubbed. To implement:

1. Update `app/utils/resume.server.ts` in the `extractResumeText` function
2. Use `pdf-parse` for PDFs and `mammoth` for DOCX files

```typescript
// Example PDF extraction
import pdf from 'pdf-parse'
const dataBuffer = // download from Supabase Storage
const data = await pdf(dataBuffer)
const extractedText = data.text
```

### Implementing Stripe Webhooks

Uncomment the webhook handling code in `app/utils/stripe.server.ts` to process:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

The application is ready to deploy to any platform that supports Node.js applications:

1. Connect your repository
2. Set environment variables
3. Deploy

### Stripe Webhook Setup

After deployment, configure your Stripe webhook:
1. Add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
2. Select events to listen to
3. Copy webhook secret to environment variables

## Security Considerations

- All server actions validate user authentication
- Row Level Security (RLS) enforces data access policies
- Sensitive operations require service role key
- File uploads are scoped to user directories
- API keys are server-only (not exposed to client)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the maintainers

## Roadmap

- [ ] Implement actual AI resume analysis
- [ ] Add PDF/DOCX text extraction
- [ ] Complete Stripe webhook processing
- [ ] Add resume comparison features
- [ ] Export analysis reports (PDF)
- [ ] Email notifications
- [ ] Resume templates
- [ ] Batch analysis for recruiters
