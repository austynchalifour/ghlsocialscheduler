# GHL Social Scheduler

A multi-tenant SaaS for scheduling social media posts via the [GoHighLevel Social Planner API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/post/index.html). Each user signs up, connects their own GHL Sub-Account (location ID + Private Integration Token), and manages their posts independently.

## Features

- **Multi-tenant accounts** — Email/password signup with isolated per-user GHL connections
- **Per-user location ID** — Each customer connects their own GHL Sub-Account
- **Encrypted token storage** — API tokens encrypted at rest with AES-256-GCM
- **Post composer** — Schedule posts across connected social accounts
- **Dashboard & calendar** — Filter and visualize scheduled content
- **Secure sessions** — HTTP-only JWT cookies, middleware-protected routes

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. **(Recommended)** Connect Supabase MCP in Cursor — see [Supabase MCP setup](#supabase-mcp-optional) below
3. Open **Project Settings → Database**
4. Under **Connection string**, choose **URI** and copy **exactly** what Supabase shows:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Session pooler** (port `5432`) → `DIRECT_URL`
5. Replace `[YOUR-PASSWORD]` with your database password (URL-encode special characters like `!` and `?`)

> **Important:** Do not guess the pooler hostname (`aws-0`, `aws-1`, etc.). Copy it from your dashboard — new projects are not always on `aws-0`.

### 2. Configure environment

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
AUTH_SECRET=your-long-random-secret-at-least-32-chars
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Apply database schema

```bash
npm run db:push
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### User onboarding flow

1. User signs up at `/signup`
2. User connects their GHL location in **Settings** (Location ID + PIT)
3. User schedules posts from **Compose**

Each user only sees posts and accounts for their own connected location.

## GHL credentials (per user)

Each user provides:

| Field | Description |
|-------|-------------|
| **Location ID** | Their GHL Sub-Account ID |
| **Private Integration Token** | `pit_...` with `socialplanner/account.readonly`, `socialplanner/post.readonly`, `socialplanner/post.write` |

Credentials are validated against GHL before saving and stored encrypted in the database.

## Tech stack

- Next.js 15 (App Router)
- Prisma + Supabase (PostgreSQL)
- bcrypt + jose (auth)
- Tailwind CSS 4
- GoHighLevel Social Planner API v2

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to Supabase |
| `npm run db:migrate` | Create and apply a migration (optional) |
| `npm run db:discover` | Try to auto-find pooler host (fallback) |

## Supabase MCP (optional)

This project includes `.cursor/mcp.json` for the Supabase MCP server:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=itzpoeibycrcrqovuehe"
    }
  }
}
```

**To activate:**

1. Reload Cursor (`Cmd+Shift+P` → "Developer: Reload Window")
2. When prompted, authenticate the Supabase MCP server in your browser (OAuth)
3. Confirm the `supabase` server appears in Cursor MCP settings

Once connected, you can ask the agent to run SQL, inspect tables, and apply schema changes directly via MCP.

**Agent skills** (installed via `npx skills add supabase/agent-skills`):

- `supabase` — general Supabase guidance
- `supabase-postgres-best-practices` — Postgres patterns

## License

MIT
