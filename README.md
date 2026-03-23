# Focusguard Web

> The official landing page and session dashboard for Focusguard — the AI-powered focus timer desktop app. Built with Next.js 16, deployed on Vercel, and connected to the same Supabase backend as the desktop app.


[![Vercel](https://img.shields.io/badge/deployed-Vercel-black?style=flat-square&logo=vercel)](https://Focusguard-web.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-shared%20project-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

---
## Download

[![Download for Windows](https://img.shields.io/badge/Download-Windows%20Installer-0078D4?style=for-the-badge&logo=windows)](https://github.com/NischayRT/Focusguard/releases/download/v1.0.0/Focusguard-Setup-1.0.0.exe)

[View all releases](https://github.com/NischayRT/Focusguard/releases/tag/v1.0.0)
## What is this repository?

This is the **web companion** to [Focusguard](https://github.com/NischayRT/Focusguard) — a desktop application that uses AI gaze detection to measure real focused work time.

This web app serves two purposes:

1. **Landing page** — explains what Focusguard is, how the AI works, what data is collected, safety guarantees, and the full technology stack. Designed to give users enough information to trust the app before downloading it.

2. **Session dashboard** — a web-based view of your focus session history. Sign in with the same Google account you use in the desktop app to see all your sessions, delete individual records, and view per-session breakdowns.

> The actual AI gaze detection runs in the desktop app, not here. This web app only reads session metadata (duration, focus %, timeline) that you explicitly chose to save.

---

## Table of Contents

- [Live Site](#live-site)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How the Dashboard Works](#how-the-dashboard-works)
- [Data Model](#data-model)
- [Local Development](#local-development)
- [Deploying to Vercel](#deploying-to-vercel)
- [Supabase Configuration](#supabase-configuration)
- [Environment Variables](#environment-variables)
- [Relationship to the Desktop App](#relationship-to-the-desktop-app)
- [License](#license)

---

## Live Site

- **Landing page:** [Focusguard-web.vercel.app](https://Focusguard-web.vercel.app)
- **Dashboard:** [Focusguard-web.vercel.app/dashboard](https://Focusguard-web.vercel.app/dashboard)

---

## Features

### Landing page

- Full explanation of what Focusguard does and how the AI works
- Detailed breakdown of the AI agent — model name, landmark indices, threshold math
- Six documented safety and privacy guarantees
- Complete technology stack with per-component explanations
- Architecture flow diagram (text-based, no external assets)
- Download link for the Windows installer
- Responsive, dark-themed, editorial design

### Dashboard

- Sign in with Google (same account as desktop app — sessions appear automatically)
- View all saved sessions grouped by date
- Filter by all time / this week / this month
- Aggregate stats: total sessions, total focus time, average focus %, best session
- Per-session detail panel: focused time, away time, breaks taken, minute-by-minute chart
- Delete individual sessions
- Fully responsive layout

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.1 | React framework, App Router, server components |
| React | 19.2.4 | UI component library |
| Tailwind CSS | v4 | Utility-first styling (CSS-based config) |
| Supabase JS | 2.49+ | Auth client + database queries |
| Vercel | — | Hosting and deployment |
| Outfit | Google Fonts | Display and body font |
| JetBrains Mono | Google Fonts | Monospaced numbers and labels |

### Why Next.js 16 + Tailwind v4?

Next.js 16 ships with React 19 and the React Compiler via Babel, which reduces unnecessary re-renders automatically. Tailwind v4 uses a CSS-based configuration (`@import "tailwindcss"`) instead of a JavaScript config file, which produces smaller CSS bundles and faster build times.

---

## How the Dashboard Works

### Authentication

The dashboard uses Supabase Auth with Google OAuth. The sign-in flow redirects to Google, then back to `/dashboard` with an auth code that Supabase exchanges for a session token. Sessions persist in the browser via `localStorage`.

### Data fetching

Once authenticated, the dashboard queries the `sessions` table filtered by the logged-in user's `user_id`. Row-level security (configured in the shared Supabase project) ensures that no user can ever see another user's data — even if they somehow obtained the anon key.

```js
const { data } = await supabase
  .from('sessions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(200)
```

### What data is displayed

The dashboard reads and displays:

| Field | Description |
|---|---|
| `created_at` | When the session was saved |
| `duration` | Total timer duration in seconds |
| `focus_time` | Seconds where gaze was classified as focused |
| `focus_pct` | `focus_time / duration × 100` |
| `breaks_taken` | Number of break timers used during session |
| `timeline` | Per-minute focus percentage array |

**No webcam data, no facial landmarks, no biometric information is stored or displayed — because none of it was ever saved.**

### Deleting sessions

Users can delete any individual session row. Deletion is permanent and immediate. The RLS policy ensures only the session's owner can delete it.

---

## Data Model

This web app shares the following Supabase table with the desktop app:

```sql
create table sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  created_at   timestamptz default now(),
  duration     int,          -- total timer seconds
  focus_time   int,          -- seconds focused (elapsed - away)
  focus_pct    int,          -- 0–100
  distractions int,          -- reserved
  breaks_taken int default 0,
  mode         text,         -- 'focus'
  timeline     jsonb         -- [{minute, focus_pct}]
);

alter table sessions enable row level security;

create policy "users own sessions"
  on sessions for all
  using (auth.uid() = user_id);
```

This schema is created by the desktop app's `supabase-setup.sql`. If you are setting up the web app independently, run that SQL in your Supabase SQL editor first.

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (shared with the desktop app, or new)

### Steps

```bash
# Clone
git clone https://github.com/NischayRT/Focusguard-web.git
cd Focusguard-web

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Run development server
npm run dev
# → http://localhost:3000
```

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts, add env variables when asked
```

### Option B — GitHub integration (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Next.js** (auto-detected)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

Every push to `main` auto-deploys.

---

## Supabase Configuration

After deploying, update these settings in your Supabase dashboard:

### Authentication → URL Configuration

| Setting | Value |
|---|---|
| Site URL | `https://your-app.vercel.app` |
| Redirect URLs | `https://your-app.vercel.app/dashboard` |

### Authentication → Providers → Google

Make sure your Google OAuth app's **Authorized redirect URIs** includes:

```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

This is the same Google OAuth app used by the desktop app — no separate setup needed.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key (safe to expose in browser) |

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Use the same values as the desktop app's `renderer/.env.local` — they point to the same Supabase project.

---

## Relationship to the Desktop App

```
Focusguard (desktop)                 Focusguard-web (this repo)
─────────────────────                ─────────────────────────────
Electron + Next.js                   Next.js on Vercel
Runs on your machine                 Runs in your browser
                    ↘             ↙
                   Supabase (shared)
                   ─────────────────
                   sessions table
                   Google Auth
                   Row-level security
```

Both apps authenticate with the same Google account and read/write the same `sessions` table. A session saved in the desktop app appears instantly in the web dashboard, and vice versa (though the web app currently has no way to create sessions — only view and delete them).

---

## Contributing

Issues and PRs welcome. The landing page content (AI explanations, safety guarantees) is intentionally detailed — please keep that level of transparency if contributing changes to those sections.

---

## Related

- [Focusguard Desktop](https://github.com/NischayRT/Focusguard) — the Electron app with AI gaze detection
- [MediaPipe Face Landmarker](https://developers.google.com/mediapipe/solutions/vision/face_landmarker) — the model used for gaze detection
- [Supabase](https://supabase.com) — auth and database

---

Built by **Nischay Reddy Thigulla** — [GitHub](https://github.com/NischayRT) · [Portfolio](https://nischay-reddy.vercel.app)