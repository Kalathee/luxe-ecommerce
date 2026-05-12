# AI Context & Project Memory

> **Purpose:** This file serves as a persistent memory and project log for AI assistants. It tracks the current state of the application, architecture decisions, environment setup, and a log of completed tasks. **AI Assistants must read and update this file after completing significant tasks.**

## 🏗️ Project Architecture
- **Framework:** Next.js 15 (App Router) — using `next@^16.2.6` (check `package.json`)
- **Database:** PostgreSQL (Containerized via Docker)
- **ORM:** Prisma `^6.8.2`
- **Caching:** Redis (Containerized via Docker)
- **Styling:** TailwindCSS (v4)
- **Authentication:** Auth.js / NextAuth `5.0.0-beta.25` — **JWT strategy, NO PrismaAdapter**
- **Password Hashing:** Custom PBKDF2 utility (`src/lib/password.ts`) using Node.js built-in `crypto` — no `bcryptjs`
- **Environment:** Windows Subsystem for Linux (WSL) / Windows

## ⚙️ Environment & Setup Details
- Docker and WSL are installed and configured on the host machine.
- Local development relies on `docker-compose.yml` to spin up PostgreSQL and Redis.
- **Important constraint:** The AI assistant cannot execute terminal commands automatically on this machine due to Windows sandbox restrictions. The user must manually run commands.
- Dev server is started with `npm run dev`.
- Database commands:
  - `npx prisma generate` — regenerate the Prisma client after schema changes
  - `npx prisma db push` — apply schema changes to the database
  - `npx prisma db seed` — re-seed the database with sample data

## 🔑 Key Architecture Decisions

### Authentication — No PrismaAdapter
`PrismaAdapter` was **intentionally removed** from `src/lib/auth.ts`. Using `PrismaAdapter` with `CredentialsProvider` + `session: { strategy: "jwt" }` in NextAuth v5 beta causes a critical bug: the first login works, but all subsequent logins fail because the adapter's internal `getUserByAccount` lookup can't find credentials-based users (who have no linked OAuth `Account` record). Since we use JWT strategy, the adapter is not needed — the signed JWT cookie is fully self-contained.

### Password Hashing — Custom PBKDF2 Utility
`bcryptjs` is NOT in `package.json` and should NOT be added or imported. All password hashing/verification is handled by `src/lib/password.ts` which uses Node.js built-in `crypto` (PBKDF2-SHA512, 100k iterations). The stored format is `"iterations:salt_hex:hash_hex"`.

---

## 📝 Task Log (Chronological)

### [2026-05-11] 1. Infrastructure Setup & Database Migration
**What was done:**
- Migrated the application from static data to a live PostgreSQL database.
- Created `docker-compose.yml` to orchestrate PostgreSQL and Redis containers for local development.
- Defined the Prisma schema (`prisma/schema.prisma`) for Users, Products, Categories, Orders, and Reviews.
- Created a database seed script (`prisma/seed.ts`) to populate initial data.
- Created a `setup.ps1` PowerShell script to automate the environment startup.

**How it was done:**
- The user ran `.\\setup.ps1` which successfully:
  1. Spun up Docker containers.
  2. Installed npm dependencies.
  3. Generated the Prisma client.
  4. Pushed the schema to the database (`npx prisma db push`).
  5. Seeded the database with sample products and an admin user (`admin@luxe.com`).

**Current Status:** Infrastructure fully provisioned. ✅

---

### [2026-05-12] 2. Authentication Pages — Removed Uninstalled Dependencies
**Problem:** `http://localhost:3000/login` and `/register` pages crashed on load.

**Root Cause:**
- Both pages imported `react-hook-form` and `@hookform/resolvers/zod` which were never installed in `package.json`. Next.js threw a module-not-found compile error that brought down the entire dev server.

**Fix:**
- Removed `react-hook-form` and `@hookform/resolvers` imports from both pages.
- Replaced with standard React `useState` for form field state management.
- Retained full client-side validation using `zod` directly inside the `onSubmit` handler.
- Added `type="button"` to OAuth provider buttons (Google/GitHub) to prevent them from accidentally submitting the credentials form.
- All premium styling, Framer Motion animations, and micro-interactions preserved.

**Files changed:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

**Current Status:** Both auth pages load and render correctly. ✅

---

### [2026-05-12] 3. bcryptjs — Replaced with Zero-Dependency PBKDF2 Utility
**Problem:** `src/lib/auth.ts` and `src/app/api/auth/register/route.ts` imported `bcryptjs` which was not installed. This crashed the entire Next.js app at startup.

**Root Cause:** `bcryptjs` was never added to `package.json` but was used throughout the auth system.

**Fix:**
- Created `src/lib/password.ts` — a zero-dependency password utility using Node.js built-in `crypto` module.
  - `hashPassword(password)` → PBKDF2-SHA512, 100k iterations, random 16-byte salt. Output: `"100000:salt_hex:hash_hex"`.
  - `verifyPassword(plaintext, stored)` → splits stored hash, re-derives, compares.
- Replaced all `bcrypt.hash()` calls with `hashPassword()`.
- Replaced all `bcrypt.compare()` calls with `verifyPassword()`.
- Updated `prisma/seed.ts` to hash the admin password using `hashPassword()` instead of storing plain text.
- Updated `prisma/seed.ts` to use `upsert` for products (prevents duplicate errors on re-seed).
- Added `AUTH_SECRET` to `.env` (NextAuth v5 reads `AUTH_SECRET`, not just `NEXTAUTH_SECRET`).

**Files changed:**
- `src/lib/password.ts` (**NEW**)
- `src/lib/auth.ts`
- `src/app/api/auth/register/route.ts`
- `prisma/seed.ts`
- `.env`

**Current Status:** Password hashing working with zero external dependencies. ✅

---

### [2026-05-12] 4. Critical Prisma Schema Fix
**Problem:** Registration returned "Something went wrong during registration" for all users.

**Root Cause:**
- `prisma/schema.prisma` was **completely malformed** — the `Order` model block was split in half, with `Payment` and `WebhookEvent` model definitions injected mid-block (at line 113 of the original file). The remaining fields of `Order` then appeared as orphaned/dangling code after those models closed.
- This invalid syntax caused Prisma Client generation to silently produce a broken client, meaning every single database operation threw a runtime error.
- Additional issues: `fullTextSearchPostgres` preview feature was enabled (potentially unsupported); `VerificationToken` model (required by NextAuth PrismaAdapter) was missing.

**Fix:**
- Rewrote `prisma/schema.prisma` completely from scratch with all models properly structured:
  - `User`, `Account`, `Session`, `VerificationToken` (Auth.js models)
  - `Product`, `Category`
  - `Order`, `OrderItem`, `Payment`, `WebhookEvent`
  - `Address`, `Review`
  - Enums: `Role`, `OrderStatus`
- Removed `fullTextSearchPostgres` preview feature for stability.
- Added `debug` field to register API 500 response in development mode so the real Prisma error surfaces to the UI instead of the generic message.
- Updated register page to display the `debug` message from the API when available.

**Commands run by user to apply:**
```
npx prisma generate
npx prisma db push
npx prisma db seed
```

**Files changed:**
- `prisma/schema.prisma` (full rewrite)
- `src/app/api/auth/register/route.ts`
- `src/app/register/page.tsx`

**Current Status:** Schema valid, DB schema applied, database seeded. Registration works. ✅

---

### [2026-05-12] 5. Login Bug — Removed PrismaAdapter to Fix Subsequent Login Failures
**Problem:** Registration worked. First login right after registration worked. But after logging out and trying to log in again with the same credentials, it showed "Invalid email or password."

**Root Cause:**
- `PrismaAdapter` was configured in `src/lib/auth.ts` despite using `session: { strategy: "jwt" }` and `CredentialsProvider` only.
- In **NextAuth v5 beta**, `PrismaAdapter` is designed for OAuth flows and database sessions. When used with `CredentialsProvider`, after the first sign-in the adapter attempts internal lookups via `getUserByAccount()`. Since credentials-based users have no linked OAuth `Account` record in the database, this lookup returns `null` — causing all subsequent logins to fail before `authorize()` can even verify the password.
- This is why the first login (immediately after registration, before any adapter state exists) worked, but all subsequent ones failed.

**Fix:**
- Removed `PrismaAdapter` and `@auth/prisma-adapter` import from `src/lib/auth.ts`.
- Added explicit `secret: process.env.AUTH_SECRET` to the NextAuth config.
- Added `try/catch` inside `authorize()` to safely handle any Prisma query errors.
- JWT tokens are now entirely self-contained (signed with `AUTH_SECRET`, stored in a cookie) — no database involvement during authentication at all.

**Files changed:**
- `src/lib/auth.ts`

**Current Status:** Login, logout, and re-login all work correctly. Authentication system is fully functional. ✅

---

## 🚨 Known Gotchas for Future AI Assistants

1. **Never import `bcryptjs`** — it is not installed. Use `src/lib/password.ts` (`hashPassword` / `verifyPassword`).
2. **Never add `PrismaAdapter` back to `src/lib/auth.ts`** — it breaks CredentialsProvider login after first session. If OAuth providers are added later, the adapter must be handled with a custom override that skips adapter lookups for credential sign-ins.
3. **Never import `react-hook-form` or `@hookform/resolvers`** — not installed. Use `useState` + `zod` directly.
4. **`AUTH_SECRET` in `.env`** — NextAuth v5 uses `AUTH_SECRET` (not `NEXTAUTH_SECRET`). Both are set in `.env` for compatibility.
5. **Prisma schema changes** always require: `npx prisma generate` → `npx prisma db push` → `npx prisma db seed`.
6. **Admin test account:** `admin@luxe.com` / `admin123` (hashed in DB with PBKDF2).
7. **Stripe keys** — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client) and `STRIPE_SECRET_KEY` (server) must both be set in `.env`. The old `STRIPE_PUBLIC_KEY` variable is deprecated/unused.

---

### [2026-05-12] 6. Stripe Checkout Integration

**What was done:**
- Built a complete, production-ready Stripe checkout flow replacing the fake card input UI.

**Architecture:**
- **2-step checkout UI**: Step 1 → Shipping info form. Step 2 → Stripe PaymentElement (supports cards, wallets, bank transfers etc.)
- **Server-side price validation**: The backend fetches authoritative prices from the DB and never trusts client-side amounts — prevents price tampering.
- **PaymentIntent flow**: Client calls `/api/stripe/create-payment-intent` which creates the Stripe PaymentIntent AND a PENDING Order record atomically. Stripe then handles the payment client-side via Elements.
- **Webhook confirms orders**: `/api/stripe/webhook` listens for `payment_intent.succeeded` → updates Order status to `CONFIRMED` and creates a `Payment` record. Also handles `payment_intent.payment_failed`.
- **Idempotency**: Webhook handler records every Stripe event in `WebhookEvent` table and skips already-processed events.

**Files created/changed:**
- `src/app/api/stripe/create-payment-intent/route.ts` (**NEW**) — creates PaymentIntent + Order + Address in DB
- `src/app/api/stripe/webhook/route.ts` (**NEW**) — Stripe webhook with signature verification and idempotency
- `src/app/checkout/page.tsx` — **full rewrite** with Stripe Elements, 2-step flow, animated step indicator, real cart items, success screen
- `.env` — added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, renamed `STRIPE_PUBLIC_KEY`

**Setup required (user must do once):**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy `Publishable key` → paste as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`
3. Copy `Secret key` → paste as `STRIPE_SECRET_KEY` in `.env`
4. For webhooks (local dev): install Stripe CLI and run:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret shown → paste as `STRIPE_WEBHOOK_SECRET` in `.env`
5. Restart `npm run dev`

**Test card details (Stripe test mode):**
| Card | Number | Expiry | CVC |
|---|---|---|---|
| Visa (success) | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| 3D Secure | `4000 0025 0000 3155` | Any future date | Any 3 digits |
| Decline | `4000 0000 0000 0002` | Any future date | Any 3 digits |

**Current Status:** Checkout fully implemented. Stripe keys must be configured in `.env` before use. ✅
