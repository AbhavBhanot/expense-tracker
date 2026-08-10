# BudgetTrack — Personal Expense & Budget Tracker

Live app: **https://budget-track-1.vercel.app**

A personal finance tracker built with React + Vite, deployed on Vercel, with Supabase for authentication and cloud data sync.

## Features

- Google OAuth login (via Supabase)
- Email / password signup and login
- Per-user cloud data sync (Supabase Postgres)
- Budget setup, expense logging, spending analysis
- Dark / light theme
- iOS app via Capacitor

## Tech Stack

- React 19 + Vite
- Supabase (auth + Postgres database)
- Chart.js / react-chartjs-2
- Deployed on Vercel

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```
Fill in your Supabase URL and anon key (Supabase Dashboard → Settings → API).

### 3. Set up Supabase database
Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.

### 4. Enable Google OAuth in Supabase
Supabase Dashboard → Authentication → Providers → Google.

Add these to Google Cloud Console OAuth credentials:
- **Authorized JavaScript origins:** `https://budget-track-1.vercel.app`, `http://localhost:5173`
- **Authorized redirect URI:** `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy
Push to GitHub — Vercel auto-deploys. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel environment variables.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
