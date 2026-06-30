# Recruitment Leaderboard & Tracker

A leaderboard and activity tracker for a recruitment agency. Three surfaces:

- **`/display`** — public TV leaderboard (Raspberry Pi kiosk), no login
- **`/dashboard`** — consultant login: log activities + revenue, view stats
- **`/admin`** — manager panel: full control over users and data

Stack: React + Vite + TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Realtime), Vercel.

> **Build status:** Phase 1 complete — database schema, auth, login, routing.
> Consultant dashboard, TV display, admin panel, celebrations, and Pi scripts
> follow in later phases. Bullhorn sync is deferred (schema is ready for it).

---

## Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

---

## First-time setup (~15 minutes)

### 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) -> **New project**.
2. Give it a name, set a database password (save it), pick a region close to you.
3. Wait for it to finish provisioning.

### 2. Run the database migration

1. In the Supabase dashboard, open **SQL Editor** -> **New query**.
2. Copy the entire contents of `supabase/migrations/0001_initial_schema.sql` and paste it in.
3. Click **Run**. You should see "Success".

This creates all tables, the four leaderboard views, row-level security
policies, indexes, triggers, and the public read functions for the TV display.

### 3. Create the admin user

The admin is seeded manually (it is the only account not created by invite).

1. In Supabase -> **Authentication** -> **Users** -> **Add user** -> **Create new user**.
2. Enter the manager's email and a password. Tick **Auto Confirm User**.
3. After it's created, open **SQL Editor** and run (replace the email):

   ```sql
   update profiles set role = 'admin', full_name = 'Manager Name'
   where email = 'manager@agency.com';
   ```

   The profile row was created automatically by a trigger when the auth user
   was added; this just promotes it to admin.

### 4. Get your API keys

In Supabase -> **Project Settings** -> **API**, copy:

- **Project URL** -> `VITE_SUPABASE_URL`
- **anon / public** key -> `VITE_SUPABASE_ANON_KEY`

### 5. Configure and run locally

```bash
cp .env.example .env
# edit .env and paste in the two values from step 4

npm install
npm run dev
```

Open http://localhost:5173. You'll be redirected to `/display` (public view)
when logged out, or to your dashboard/admin home once you sign in at `/login`.

---

## Deploying to Vercel

1. Push this repo to GitHub (private is fine).
2. In Vercel -> **Add New Project** -> import the GitHub repo.
3. Framework preset: **Vite** (auto-detected).
4. Under **Environment Variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` with the same values as your `.env`.
5. **Deploy.** Vercel gives you a URL like `https://your-app.vercel.app`.

> **SPA routing:** a `vercel.json` is included so deep links like `/display`
> and `/admin/users` resolve correctly instead of 404ing.

The Raspberry Pi kiosk (later phase) will point at `https://your-app.vercel.app/display`.

---

## Project structure

```
src/
  components/   ui primitives, ProtectedRoute, (leaderboard/dashboard/admin in later phases)
  pages/        Index, Login, Placeholder (real pages land per phase)
  hooks/        useAuth
  lib/          supabase client, constants
  types/        shared TypeScript types
supabase/
  migrations/   0001_initial_schema.sql
```

---

## Roles & access

| Role | Created how | Can access |
|---|---|---|
| `admin` | Seeded manually (step 3) | Everything, admin panel |
| `consultant` | Invited from the admin panel (later phase) | Own dashboard + leaderboard |
| anonymous | No account | `/display` only |
