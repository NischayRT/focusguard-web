# FocusGuard Web

Landing page + session dashboard for FocusGuard desktop app.
Deployed on Vercel. Shares the same Supabase project as the desktop app.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import into Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Add web URL to Supabase

After deploying, add your Vercel URL to Supabase:
- Authentication → URL Configuration → Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/dashboard`

## Structure

```
src/
  app/
    page.js           # Landing page
    dashboard/page.js # Session history dashboard
    layout.js         # Root layout with fonts
    globals.css
  lib/
    supabase.js       # Shared with desktop app
```
