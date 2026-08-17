# Tiwari Dairy

Farmer milk purchase, payment, and sales ledger. Next.js (App Router) + Supabase (Postgres, Auth, Row Level Security) + Prisma (schema/migrations only) + Tailwind CSS + Chart.js.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Copy environment variables**: copy `.env.example` to `.env` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API.
   - `DATABASE_URL` — Project Settings → Database → Connection string. Try the **Session pooler** URI first (username becomes `postgres.<project-ref>`) — it works for `prisma migrate deploy` and, unlike the direct connection, works over IPv4. Supabase's **direct** connection (`db.<ref>.supabase.co`) is IPv6-only on most projects; if your network has no IPv6 route (common on many ISPs), that host is simply unreachable and you must use the pooler.
   - `DIRECT_URL` (optional) — the direct, non-pooled connection. Only relevant if you use `prisma migrate dev` locally and need its shadow-database step, and only works if your network actually has IPv6 access to Supabase.
3. **Install dependencies**: `npm install`
4. **Apply the migration**: `npm run db:migrate:deploy` — creates every table, the RLS policies, the `current_organization_id()` / `get_farmer_account_totals()` / `get_farmer_status_counts()` functions, and the trigger that auto-provisions an organization on signup.
5. **Run the dev server**: `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

## First login

There's no separate seed script — signing up through the app's "Create an account" form provisions everything: a new organization, your admin profile, and default master data (Cow/Buffalo/Mixed milk types, Morning/Evening shifts, and a starter set of expense categories), via the DB trigger from the migration. This is also how a second dairy business would onboard later.

## Scripts

- `npm run dev` / `npm run build` / `npm run start` — Next.js dev/build/start
- `npm run typecheck` — TypeScript check with no emit
- `npm test` / `npm run test:watch` — unit tests (business-rule functions in `src/lib/`)
- `npm run db:migrate:dev` — create + apply a new migration from `prisma/schema.prisma` changes (local/dev use)
- `npm run db:migrate:deploy` — apply pending migrations without prompting (use this in production/CI)
- `npm run db:migrate:status` — check which migrations are applied
- `npm run db:migrate:resolve-applied -- <migration-folder-name>` — mark a migration as already-applied without running its SQL (for baselining an existing database)
- `npm run db:studio` — Prisma Studio, a visual browser for the database
- `npm run supabase:link` — one-time `supabase link` to this project (needed for `supabase:types`)
- `npm run supabase:types` — regenerate `src/lib/supabase/database.types.ts` from the live schema via the Supabase CLI (verification/drift-check only — the app's hand-maintained `src/lib/supabase/types.ts` is what's actually imported; see the note at the top of that file for why)

## REST API

Every resource is also reachable over plain HTTP under `/api`, in addition to the app's own UI (which uses Server Actions directly). Auth is the same browser session cookie — call these from a logged-in browser, or forward the Supabase session cookie if calling from an external client. Responses are JSON; errors are `{ "error": "..." }` with an appropriate status code (400 validation, 401 unauthorized, 404 not found, 409 duplicate, 500 server error).

| Resource | Endpoints |
|---|---|
| Farmers | `GET/POST /api/farmers`, `GET/PUT /api/farmers/:id`, `GET /api/farmers/:id/ledger?from&to` |
| Milk Types | `GET/POST /api/milk-types`, `PUT /api/milk-types/:id` (`{status}`) |
| Shifts | `GET/POST /api/shifts`, `PUT /api/shifts/:id` (`{startTime,endTime}`), `GET /api/shifts/current` |
| Expense Categories | `GET/POST /api/expense-categories`, `PUT /api/expense-categories/:id` (`{status}`) |
| Milk Purchases | `GET/POST /api/purchases` (`?farmerId&from&to`), `GET/DELETE /api/purchases/:id` |
| Farmer Payments | `GET/POST /api/payments` (`?farmerId&from&to`), `DELETE /api/payments/:id` |
| Milk Supply | `GET/POST /api/supplies` (`?from&to`), `DELETE /api/supplies/:id` |
| Expenses | `GET/POST /api/expenses` (`?from&to`), `DELETE /api/expenses/:id` |
| Dashboard | `GET /api/dashboard/summary?from&to` |

Every route handler calls the exact same underlying logic as the UI (duplicate-purchase check, amount calculation, friendly error mapping) via shared `*Core()` functions in `src/lib/actions/*.ts` — nothing is reimplemented, so the REST API and the web UI can never drift apart in behavior.

## Architecture notes

See the implementation plan for the full rationale. In short:

- **Prisma is schema/migrations only** — `prisma/schema.prisma` and `prisma/migrations/` are the source of truth for the database structure, and `npm run db:migrate:*` is how you evolve it. The app does **not** use Prisma Client at runtime.
- **Supabase Row Level Security is the runtime data-access layer** — every table's `organization_id` is enforced by `public.current_organization_id()` at the database level, so most reads query Supabase directly from Server Components, and writes go through Next.js Server Actions in `src/lib/actions/`. This is deliberate: a Prisma-connected client is a single fixed DB role and would bypass RLS entirely, which is why Prisma isn't used as the query layer.
- A few Supabase-specific objects (RLS policies, `current_organization_id()`, `get_farmer_account_totals()`, `get_farmer_status_counts()`, the `handle_new_user()` auth trigger) have no `schema.prisma` representation — they're appended as raw SQL at the end of the initial migration. Don't run `prisma db pull` and let it "clean up" what looks like drift; that's expected and intentional.
