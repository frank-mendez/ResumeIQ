# ResumeIQ Setup Guide

This guide will help you set up ResumeIQ from scratch.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher installed
- npm, pnpm, or yarn package manager
- A Supabase account (https://supabase.com)
- A Stripe account (https://stripe.com)
- (Optional) An OpenAI account for AI features

## Step 1: Clone and Install

```bash
git clone https://github.com/frank-mendez/ResumeIQ.git
cd ResumeIQ
npm install
```

## Step 2: Supabase Setup

### 2.1 Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose an organization and fill in:
   - Project name: `resumeiq` (or your choice)
   - Database password: (generate a strong password)
   - Region: (choose closest to your users)
4. Click "Create new project"
5. Wait for the project to be created (~2 minutes)

### 2.2 Get Your Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (secret)

### 2.2.1 Enable OAuth Providers (Google + GitHub)

In your Supabase project dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Google** and **GitHub**
3. Follow Supabase’s OAuth setup guide for each provider
4. Set your redirect URLs in **Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev)
- **Redirect URLs**: add `http://localhost:3000/auth/callback`

When you deploy, add your production site URL and production callback URL too.

### 2.3 Run Database Migrations

1. Open the SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Wait for completion
6. Repeat for `supabase/migrations/002_storage_setup.sql`

### 2.4 Verify Database Setup

Check that the following tables were created:

- `resumes`
- `analyses`
- `subscriptions`
- `payments`

Check that the storage bucket was created:

- `resumes` (private bucket)

## Step 3: Stripe Setup

### 3.1 Create a Stripe Account

1. Go to https://stripe.com
2. Sign up for an account
3. Complete account verification if needed

### 3.2 Get Your API Keys

1. Go to Developers > API keys
2. Copy the following:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

### 3.3 Create Products and Prices

1. Go to Products > Add Product
2. Create "Pro" product:
   - Name: `Pro`
   - Description: `Professional resume analysis`
   - Pricing: `$19.99 / month` (recurring)
   - Copy the **Price ID** (starts with `price_`)
3. Create "Enterprise" product:
   - Name: `Enterprise`
   - Description: `Enterprise resume analysis`
   - Pricing: `$99.99 / month` (recurring)
   - Copy the **Price ID**

### 3.4 Update Price IDs in Code

Edit `app/lib/stripe.server.ts`:

```typescript
export const STRIPE_PLANS = {
  // ...
  PRO: {
    name: "Pro",
    price: 1999,
    priceId: "price_YOUR_PRO_PRICE_ID", // <-- Update this
    // ...
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 9999,
    priceId: "price_YOUR_ENTERPRISE_PRICE_ID", // <-- Update this
    // ...
  },
};
```

### 3.5 Set Up Webhook (After Deployment)

We'll come back to this after deploying the application.

## Step 4: Environment Variables

### 4.1 Create .env File

Copy the example file:

```bash
cp .env.example .env
```

### 4.2 Fill in Your Values

Edit `.env` and replace the placeholder values:

```env
# Supabase (from Step 2.2)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Stripe (from Step 3.2)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI (Optional - for future use)
OPENAI_API_KEY=sk-your-openai-key

# App
VITE_APP_URL=http://localhost:3000
```

**Important Notes:**

- Use **test mode** keys (`sk_test_`, `pk_test_`) for development
- Use **live mode** keys for production
- Never commit the `.env` file to version control
- Keep your service role key and secret keys secure

## Step 5: Run the Application

### 5.1 Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at: http://localhost:3000

### 5.2 Test the Application

1. **Home Page**: Visit http://localhost:3000
2. **Sign Up**: Create a test account
3. **Login**: Sign in with your test account
4. **Dashboard**: Verify you can access the dashboard
5. **Upload**: Try uploading a test PDF or DOCX file
6. **Pricing**: View the pricing plans

## Step 5.3: SonarCloud (Continuous Code Quality)

ResumeIQ includes SonarCloud CI scanning via `.github/workflows/sonar.yml` and root config via `sonar-project.properties`.

### 5.3.1 Create SonarCloud Project

1. Sign in to https://sonarcloud.io
2. Import and connect your GitHub repository
3. Copy the generated values for:

- `sonar.projectKey`
- `sonar.organization`

4. Update those values in `sonar-project.properties`

### 5.3.2 Add GitHub Secret

1. In GitHub, open **Settings → Secrets and variables → Actions**
2. Create a new repository secret:

- Name: `SONAR_TOKEN`
- Value: token from SonarCloud (**My Account → Security → Generate Tokens**)

### 5.3.3 Configure Quality Gate

In SonarCloud project settings, configure your quality gate so pull requests fail when code quality regresses. Minimum recommended rules:

- No new critical issues
- No new security vulnerabilities
- Code duplication threshold enforced
- Coverage threshold (optional for MVP)

The GitHub Action waits for quality gate status (`sonar.qualitygate.wait=true`), so failing gates fail CI checks on PRs and `main` pushes.

### 5.3.4 SonarLint Connected Mode (Per Developer)

Do not commit user-specific SonarLint connected mode values (`connectionId`, `projectKey`) to shared workspace settings.

Configure connected mode locally in your own VS Code settings:

```jsonc
{
  "sonarlint.connectedMode.project": {
    "connectionId": "<your-sonarcloud-connection-id>",
    "projectKey": "frank-mendez_ResumeIQ",
  },
}
```

Recommended locations:

- VS Code User Settings (preferred), or
- Local workspace settings that you do not commit.

## Step 6: Enable AI Analysis (Optional)

To enable actual AI resume analysis:

### 6.1 Get OpenAI API Key

1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to API Keys
4. Create new secret key
5. Copy the key

### 6.2 Update Environment

Add to your `.env`:

```env
OPENAI_API_KEY=sk-your-openai-key-here
```

### 6.3 Update Code

Edit `app/utils/resume.server.ts` in the `analyzeResume` function.

Replace the stubbed implementation with actual OpenAI API calls:

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `You are an expert resume analyzer. Analyze the resume and provide:
1. ATS compatibility score (0-100)
2. List of strengths
3. List of weaknesses
4. Actionable suggestions for improvement
5. Key skills and keywords found

Return your analysis in JSON format.`,
    },
    {
      role: "user",
      content: resume.extracted_text!,
    },
  ],
  response_format: { type: "json_object" },
});

const analysis = JSON.parse(completion.choices[0].message.content!);
// Use the analysis data
```

## Step 7: Enable Text Extraction (Optional)

To extract text from actual PDF and DOCX files:

### 7.1 Update Code

Edit `app/utils/resume.server.ts` in the `extractResumeText` function:

```typescript
import pdf from "pdf-parse";
import mammoth from "mammoth";

// Download file from Supabase Storage
const { data: fileData, error: downloadError } = await supabase.storage
  .from("resumes")
  .download(resume.file_path);

if (downloadError) {
  throw new Error("Failed to download file");
}

let extractedText = "";

// Extract based on file type
if (resume.file_type.includes("pdf")) {
  const buffer = Buffer.from(await fileData.arrayBuffer());
  const data = await pdf(buffer);
  extractedText = data.text;
} else if (
  resume.file_type.includes("docx") ||
  resume.file_type.includes("document")
) {
  const buffer = Buffer.from(await fileData.arrayBuffer());
  const result = await mammoth.extractRawText({ buffer });
  extractedText = result.value;
} else {
  throw new Error("Unsupported file type");
}

// Update resume with extracted text
await supabase
  .from("resumes")
  .update({ extracted_text: extractedText })
  .eq("id", data.resumeId);

return { text: extractedText };
```

## Step 8: Production Deployment

### 8.1 Build the Application

```bash
npm run build
```

### 8.2 Deploy to Vercel (Recommended)

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy:

   ```bash
   vercel
   ```

4. Follow the prompts
5. Add environment variables in Vercel dashboard
6. Redeploy with production variables

### 8.3 Deploy to Other Platforms

**Netlify:**

```bash
npm run build
netlify deploy --prod
```

**Railway:**

```bash
railway up
```

**Self-hosted:**

```bash
npm run build
npm run start
```

Use a process manager like PM2:

```bash
npm i -g pm2
pm2 start npm --name "resumeiq" -- start
```

### 8.4 Update Environment for Production

After deployment, update:

```env
# Use your production URL
VITE_APP_URL=https://your-domain.com

# Use Stripe live mode keys
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

## Step 9: Configure Stripe Webhook

After deploying to production:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret
   ```
8. Redeploy your application

### 9.1 Enable Webhook Processing

Edit `app/utils/stripe.server.ts` and uncomment the webhook handling code in `handleStripeWebhook()`.

## Step 10: Testing

### Test Checklist

- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] User can view dashboard
- [ ] User can upload resume
- [ ] Resume is stored in Supabase Storage
- [ ] User can view uploaded resumes
- [ ] (If enabled) Text extraction works
- [ ] (If enabled) AI analysis works
- [ ] User can view analysis results
- [ ] User can view pricing plans
- [ ] User can subscribe to a plan
- [ ] Subscription is recorded in database
- [ ] Webhook processes subscription events
- [ ] User can cancel subscription

### Stripe Test Cards

Use these test card numbers in development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiration date and any CVC.

## Troubleshooting

### "Missing Supabase environment variables"

- Check that `.env` file exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the development server

### "Failed to save resume"

- Check Supabase credentials
- Verify migrations were run successfully
- Check browser console for errors
- Verify user is authenticated

### "Failed to upload file"

- Check storage bucket exists (`resumes`)
- Verify storage policies are set
- Check file size is under limit
- Check file type is PDF or DOCX

### Stripe webhook not working

- Verify webhook endpoint URL is correct
- Check webhook signing secret is set
- Look at Stripe dashboard > Developers > Webhooks > Attempts
- Check server logs for errors

### TypeScript errors

- Run `npm run lint` to check for errors
- Ensure all dependencies are installed
- Check `tsconfig.json` is correct

## Next Steps

Now that you have ResumeIQ running:

1. Customize the branding and colors
2. Implement actual AI analysis
3. Implement text extraction
4. Add email notifications
5. Add analytics and monitoring
6. Customize the pricing plans
7. Add more features (templates, exports, etc.)

## Getting Help

- **Issues**: https://github.com/frank-mendez/ResumeIQ/issues
- **Discussions**: https://github.com/frank-mendez/ResumeIQ/discussions
- **Email**: support@resumeiq.com (if applicable)

## Security Notes

- Never commit `.env` files
- Use test mode in development
- Rotate keys regularly
- Enable 2FA on all accounts
- Monitor for unusual activity
- Keep dependencies updated

## Additional Resources

- TanStack Start: https://tanstack.com/start
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- OpenAI Docs: https://platform.openai.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
