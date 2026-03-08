# MemoryBanner

MemoryBanner is a Next.js 16 app for wedding galleries:
- Couples get a slug-based gallery page
- Guests upload photos/videos and leave guestbook messages
- Admin can create orders and download QR codes

Production domain: `https://memorybanner.com`

## Stack

- Next.js (App Router) + React 19 + TypeScript
- Supabase (Auth + Postgres)
- Cloudflare R2 (media storage)
- Google OAuth (via Supabase Auth)
- Stripe (library is present; payment flow is not fully wired yet)

## Prerequisites

- Node.js 20+
- A Supabase project
- A Cloudflare R2 bucket
- A Google Cloud OAuth client (Web application)
- Vercel project for deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.local.example .env.local
```

3. Fill `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=memorybanner-media
R2_PUBLIC_URL=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SECRET=

# Canva OAuth (Connect API)
CANVA_CLIENT_ID=
CANVA_CLIENT_SECRET=
CANVA_REDIRECT_URI=http://localhost:3000/api/integrations/canva/callback
CANVA_SCOPES=profile:read design:meta:read design:content:read design:content:write asset:read asset:write
```

4. Create database schema in Supabase SQL editor with:
- `supabase/schema.sql`

5. Start dev server:

```bash
npm run dev
```

## Required Production Auth Settings

### Supabase -> Authentication -> URL Configuration

- Site URL:
  - `https://www.memorybanner.com`
- Redirect URLs:
  - `https://memorybanner.com/auth/callback`
  - `https://www.memorybanner.com/auth/callback`

### Google Cloud -> OAuth Client (Web)

- Authorized JavaScript origins:
  - `https://memorybanner.com`
  - `https://www.memorybanner.com`
- Authorized redirect URI:
  - `https://thcnyvrvtukzicaqvquk.supabase.co/auth/v1/callback`

### Supabase -> Auth -> Providers -> Google

- Enable Google provider
- Set Client ID and Client Secret from the same Google OAuth client above

### Canva Developers -> Integration -> Authentication

- Redirect URL:
  - `https://www.memorybanner.com/api/integrations/canva/callback`
  - `http://localhost:3000/api/integrations/canva/callback` (optional for local)
- Keep integration in draft/private while testing
- Run OAuth once before submit for review

## Deploy (Vercel)

1. Push project to GitHub.
2. Import repo in Vercel.
3. Add all environment variables from `.env.local.example`.
4. Set:
   - `NEXT_PUBLIC_APP_URL=https://www.memorybanner.com`
   - `CANVA_REDIRECT_URI=https://www.memorybanner.com/api/integrations/canva/callback`
5. Deploy.

If OAuth redirects to `localhost`, check Supabase URL Configuration first.

## Admin

- Admin interface route: `/mb-hq`
- Protected by `ADMIN_SECRET` (stored in sessionStorage in browser)
- Admin APIs expect `x-admin-secret` header

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Database Note (Template Constraint)

Current app templates:
- `romantic`, `noir`, `golden`, `garden`, `burgundy`, `sage`

If your old DB still has `modern/rustic/minimal` constraint, run:

```sql
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_template_check;

ALTER TABLE orders
ADD CONSTRAINT orders_template_check
CHECK (template IN ('romantic', 'noir', 'golden', 'garden', 'burgundy', 'sage'));
```
