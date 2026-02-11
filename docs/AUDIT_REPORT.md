# Juli Smart Susu — Full Audit Report

**Date:** 2026-02-11  
**Auditor:** Senior Product Engineer + Security Reviewer + Fintech Architect  
**Repo:** d:\Websites\susu  

---

## 1. What the App Does (Summary)

Juli Smart Susu is a Ghana-style rotating savings ("Susu") web application. Members join groups, contribute a fixed daily amount, and take turns receiving a lump-sum payout. The platform includes:

- **Public marketing site** — Home, How It Works, Plans, Rules, FAQs, Contact, Blog, Testimonials, Terms, Privacy
- **User app** (mobile-first PWA vibe) — Dashboard, Groups, Pay, Wallet, Profile
- **Super Admin portal** — Full CRUD for groups, members, payouts, settings, audit logs, SMS management

**Business model:** The operator earns via join fees and/or a percentage fee on payouts. Groups are configurable (public/request/paid access, variable size, daily amount, payout cycle).

---

## 2. Architecture Diagram (Text-based)

```
┌───────────────────────────────────────────────────────────┐
│                     FRONTEND (Vite + React 19)            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Public Site │  │   User App   │  │   Admin Portal   │ │
│  │  (10 pages)  │  │  (6 pages)   │  │   (7 pages)      │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────────┘ │
│         │                │                  │             │
│  ┌──────┴────────────────┴──────────────────┴──────────┐  │
│  │           Services Layer (6 service files)          │  │
│  │  authService | groupService | paymentService        │  │
│  │  payoutService | walletService | adminService       │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                         │                                 │
│  ┌──────────────────────┴─────────────────────────────┐  │
│  │        API Client (apiClient via jwt.ts)            │  │
│  │   Base: SUPABASE_URL/functions/v1/*                 │  │
│  └──────────────────────┬─────────────────────────────┘  │
└─────────────────────────┼─────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼─────────────────────────────────┐
│              SUPABASE (Backend-as-a-Service)               │
│  ┌──────────────────────┴─────────────────────────────┐   │
│  │         Edge Functions (58 functions, LOCAL ONLY)   │   │
│  │  Auth (8) | Groups (12) | Contributions (5)        │   │
│  │  Payments (4) | Payouts (4) | Wallet (4)           │   │
│  │  Admin (14) | SMS (7) | Jobs (4)                   │   │
│  └──────────────────────┬─────────────────────────────┘   │
│                         │                                  │
│  ┌──────────────────────┴─────────────────────────────┐   │
│  │              PostgreSQL Database                    │   │
│  │  ⚠️  CURRENT: E-commerce schema (30 tables)        │   │
│  │  ❌ MISSING: Susu domain tables (0 tables)         │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

**Stack:**
- **Frontend:** React 19, Vite 7, TypeScript 5.8, Tailwind CSS, React Router 7, i18next, Recharts
- **Backend:** Supabase Edge Functions (Deno), PostgreSQL
- **Auth:** Custom JWT (localStorage) — NOT Supabase Auth
- **Payments:** Adapter pattern (Hubtel, Paystack, Flutterwave, Manual) — all placeholder implementations
- **SMS:** Hubtel/Arkesel — placeholder implementations

---

## 3. Routes / Pages Inventory

### 3a. Public Marketing Pages

| Route | Page | Status |
|-------|------|--------|
| `/` | Home (hero, plans, testimonials, calculator) | ✅ Complete |
| `/how-it-works` | Steps 1-6, rules, CTA | ✅ Complete |
| `/plans` | 10 static plans, micro/standard/premium filters | ✅ Complete (static) |
| `/group-rules` | Rules, penalties, guarantees, disputes | ✅ Complete |
| `/faqs` | Accordion by 5 categories | ✅ Complete |
| `/contact` | Form + map + contact cards | ⚠️ Partial (form not wired) |
| `/blog` | Hero + 6 static posts | ⚠️ Partial (no detail, no CMS) |
| `/testimonials` | 9 testimonials + stats | ✅ Complete (static) |
| `/terms` | Legal sections 1-12 | ✅ Complete |
| `/privacy` | Privacy sections 1-11 | ✅ Complete |
| `*` | 404 page | ✅ Complete |

### 3b. Auth Pages

| Route | Page | Status | Issues |
|-------|------|--------|--------|
| `/auth/login` | Phone + password login | ✅ Complete | — |
| `/auth/signup` | Registration form | ✅ Complete | — |
| `/auth/forgot-password` | Password reset | ⚠️ Partial | Uses email; backend expects phone |

### 3c. User App Pages (Protected)

| Route | Page | Status | Issues |
|-------|------|--------|--------|
| `/app/dashboard` | Due today, streak, groups | ⚠️ Partial | Calls `getMyGroups()` — doesn't exist on service |
| `/app/groups` | Search + filter + group cards | ⚠️ Partial | Calls `listGroups()` — should be `getAllGroups()` |
| `/app/groups/:id` | Detail + tabs + join modal | ⚠️ Partial | Calls `getGroupDetail()` — should be `getGroupById()`. Members are mock data |
| `/app/pay` | 4-step payment flow | ⚠️ Partial | Payment history uses mock data |
| `/app/wallet` | Balance + transactions + withdraw | ⚠️ Partial | `requestWithdrawal(amount, momoNumber)` — wrong signature |
| `/app/profile` | Profile + security + support | ⚠️ Partial | Calls `authService.updateProfile()` and `changePassword()` — don't exist on service |

### 3d. Admin Portal Pages

| Route | Page | Status | Issues |
|-------|------|--------|--------|
| `/admin/dashboard` | KPI cards + daily chart | ✅ Complete (API-bound) | — |
| `/admin/groups` | Table + create wizard | ✅ Complete | Edit button TODO |
| `/admin/groups/:id` | Stats + members/queue/requests | ⚠️ Partial | `getGroupDetail` and `pauseResumeGroup` not on service |
| `/admin/payouts` | Table + approve/mark-paid modals | ✅ Complete (API-bound) | — |
| `/admin/users` | Table + search + export CSV | ✅ Complete (API-bound) | — |
| `/admin/settings` | Fees, SMS, contact tabs | ✅ Complete (API-bound) | — |
| `/admin/audit` | Logs table + filters | ⚠️ Partial | Field name mismatch (uses `log.user` vs `actor_name`) |

---

## 4. Auth / RBAC Inventory

### Auth Strategy
- **Custom JWT** stored in `localStorage` as `juli_auth_token`
- User object stored in `localStorage` as `user`
- Token decoded client-side (base64, no signature verification)
- Login via `POST /auth-login` (phone + password)
- Token refresh via `GET /auth-me`

### RBAC

| Check | Location | Status |
|-------|----------|--------|
| User logged in | `ProtectedRoute` component | ✅ Works (reads AuthContext) |
| Admin role check | `ProtectedRoute` has `requireAdmin` prop | ⚠️ Uses `(user as any).role` — not typed |
| Admin routes protection | `AdminLayout` + router config | ❌ **OPEN FOR DEMO** (auth check commented out) |
| Edge function auth (auth endpoints) | Custom JWT + `users` table | ✅ Implemented |
| Edge function auth (all other endpoints) | `supabase.auth.getUser()` | ❌ **CONFLICT** — expects Supabase Auth token, not custom JWT |
| Admin KPIs endpoint | `admin-dashboard-kpis` | ❌ **NO AUTH CHECK** — uses service role key directly |

### Critical Auth Issue
**Two incompatible auth systems:** Auth endpoints use a custom `users` table with bcrypt passwords and custom JWTs. All other edge functions use `supabase.auth.getUser()` which expects a Supabase Auth session. These cannot work together — any request from a user logged in via `auth-login` will receive a 401 from non-auth endpoints.

---

## 5. Data Model Inventory

### Current Database (WRONG SCHEMA)

The Supabase database contains **30 e-commerce tables** from a different project:

```
products, product_images, product_variants, categories,
orders, order_items, order_status_history, return_requests, return_items,
cart_items, wishlist_items, reviews, review_images, coupons, customers,
profiles, addresses, audit_logs, notifications,
pages, blog_posts, cms_content, banners,
navigation_menus, navigation_items,
site_settings, store_settings, store_modules,
support_tickets, support_messages
```

### Required Susu Tables (DO NOT EXIST)

Based on edge function code analysis, the following tables are referenced but **missing**:

```
users                    — Custom user table (name, phone, email, password_hash, role, kyc)
susu_groups              — Group definitions (name, daily_amount, duration, group_size, type, fees)
group_memberships        — User<>Group join table (turn_position, status, contribution tracking)
contribution_schedules   — Daily contribution records (date, amount, status)
turn_queue               — Payout order per group
payouts                  — Payout records (amount, status, method)
wallets                  — User wallet balances
wallet_transactions      — Wallet ledger (deposits, withdrawals, contributions, payouts)
payment_intents          — Payment initialization records
payment_transactions     — Completed payment records
webhook_events           — Payment webhook logs
withdrawal_requests      — Wallet withdrawal requests
sms_templates            — SMS message templates
sms_logs                 — SMS send history
sms_sending_rules        — SMS automation rules
sms_opt_outs             — SMS opt-out list
background_jobs          — Scheduler/cron job tracking
rate_limits              — API rate limiting
kyc_profiles             — KYC verification data
app_settings             — Application configuration
```

### Migrations
5 existing migrations (all e-commerce):
1. `step1_extensions_enums`
2. `step2_tables`
3. `step3_functions_indexes_triggers`
4. `step4_rls_storage`
5. `create_site_assets_bucket`

### Edge Functions
**0 deployed** to Supabase (58 exist in local code only).

---

## 6. Susu Engine Logic Review

### Group Types
- **Public:** Join instantly → ✅ Modeled in code
- **Request-only:** Join → admin approval → ✅ `groups-approve-member` exists
- **Paid access:** Join with fee → ✅ `joinFee` field exists, `paymentProof` parameter in `groups-join`

### Membership Lock Rule
- "Cannot leave after group starts" → ⚠️ The `groups-leave` edge function checks for a `started` status but the exact rule enforcement is unclear. The function allows leaving with conditions.

### Contribution Schedule
- Daily due tracking → ✅ `contributions-due-today` function queries `contribution_schedules WHERE due_date = today AND status = 'pending'`
- Arrears tracking → ✅ `contributions-arrears` function queries overdue contributions
- Grace periods → ⚠️ Referenced in settings but not enforced in contribution marking logic

### Turn Queue & Payouts
- Deterministic queue → ✅ `turn_queue` table with `position` ordering
- Reorder → ✅ `groups-reorder-queue` updates positions
- Payout creation → ✅ `payouts-initiate` creates payout record
- Payout approval → ✅ `payouts-approve` changes status
- Payout completion → ✅ `payouts-mark-paid` with notes

### Ledger Approach
- Wallet transactions appear to be **append-only** (INSERT operations) → ✅ Good
- Balance updates use direct UPDATE → ⚠️ Should use transactions or triggers to ensure consistency
- No silent edits detected → ✅ Good
- No reversal/adjustment mechanism → ⚠️ Should add for production

---

## 7. Payments + SMS Review

### Payment Flow
```
CreateIntent → Verify → Webhook → Mark Paid → Update Ledger
```

- **PaymentIntent creation:** ✅ Creates record, returns checkout URL
- **Verification:** ✅ Server-side via `payment-verify`
- **Webhook:** ⚠️ Signature verification is **STUBBED** (`verified = true`)
- **Idempotency:** ⚠️ Webhook checks `processed` flag, but no idempotency key on payment creation
- **Provider integration:** ❌ All providers (Hubtel, Paystack, Flutterwave) are **placeholder implementations**

### SMS
- **Templates:** ✅ 10 default templates defined
- **Sending:** ❌ OTP and SMS send is `console.log` only
- **Retry logic:** ✅ Modeled in `jobs-sms-retry`
- **Opt-out:** ✅ `sms-opt-out` function exists
- **Scheduler:** ⚠️ Jobs defined but no cron trigger configured in Supabase

---

## 8. Issues Found (by Severity)

### 🔴 CRITICAL (App Cannot Function)

| # | Issue | Details |
|---|-------|---------|
| C1 | **Wrong database schema** | Database has e-commerce tables. Zero Susu tables exist. Every edge function will fail with "relation does not exist" errors. |
| C2 | **No edge functions deployed** | 58 functions exist locally but 0 are deployed to Supabase. All API calls return 404. |
| C3 | **Auth model conflict** | Auth functions use custom JWT. All other functions use `supabase.auth.getUser()`. Users who log in will get 401 on every subsequent API call. |
| C4 | **Two token storage keys** | `juli_auth_token` (apiClient) vs `supabase_token` (adminService, groupService, payoutService). Code uses both inconsistently. |

### 🟠 HIGH (Major Functionality Broken)

| # | Issue | Details |
|---|-------|---------|
| H1 | Service method name mismatches | Pages call `getMyGroups()`, `listGroups()`, `getGroupDetail()`, `pauseResumeGroup()` — none exist on services |
| H2 | Admin routes unprotected | Auth check commented out "for demo" in AdminLayout |
| H3 | Admin KPI endpoint has no auth | `admin-dashboard-kpis` uses service role key with zero auth check |
| H4 | Webhook signature verification stubbed | `payment-webhook` sets `verified = true` always |
| H5 | Wallet requestWithdrawal signature wrong | Page calls `requestWithdrawal(amount, momoNumber)` but service expects `CreateWithdrawalRequest` object |
| H6 | Profile page calls nonexistent service methods | `authService.updateProfile()` and `changePassword()` don't exist |
| H7 | Forgot password email vs phone mismatch | Page sends email, AuthContext/backend expects phone |

### 🟡 MEDIUM (Degraded Experience)

| # | Issue | Details |
|---|-------|---------|
| M1 | AppLayout not used in router | Mobile bottom navigation component exists but isn't wired — app pages have no shared shell |
| M2 | Contact form not wired to backend | Form submission uses setTimeout mock |
| M3 | Blog has no detail page | `/blog/:id` route doesn't exist |
| M4 | Receipt download won't work | `apiClient` always parses JSON, no blob support for `getReceipt()` |
| M5 | Audit log field name mismatch | UI uses `log.user`, `log.timestamp`; type uses `actor_name`, `created_at` |
| M6 | No i18n locale files | i18n configured but no translation files exist under `src/i18n/local/` |
| M7 | SMS sending is console.log | No actual SMS provider integration |
| M8 | `strict: false` in tsconfig | TypeScript strict mode disabled |
| M9 | Some CTA links point to wrong paths | `/app/signup` instead of `/auth/signup` |

### 🔵 LOW (Polish / Best Practice)

| # | Issue | Details |
|---|-------|---------|
| L1 | No PWA manifest or service worker | Required for "mobile-app vibe" |
| L2 | No `.gitignore` | Secrets in `.env` could be committed |
| L3 | `@typescript-eslint/no-explicit-any` disabled | Widespread `any` usage |
| L4 | No automated tests | Zero test files |
| L5 | No error boundary | React errors crash the entire app |
| L6 | Client-side JWT decode has no signature check | Token can be forged client-side |
| L7 | Package name is "react" | Should be "juli-smart-susu" |

---

## 9. Recommendations + Roadmap

### NOW (Blocks Production — Must Fix First)

1. **Create Susu database schema** — Design and apply migration with all required tables (users, susu_groups, group_memberships, contribution_schedules, turn_queue, payouts, wallets, wallet_transactions, payment_intents, payment_transactions, webhook_events, withdrawal_requests, sms_templates, sms_logs, sms_sending_rules, sms_opt_outs, background_jobs, app_settings, audit_logs_susu)
2. **Unify auth model** — Either switch everything to Supabase Auth OR make all edge functions accept the custom JWT. Recommend: custom JWT everywhere since it's already built.
3. **Unify token storage** — Single key (`juli_auth_token`) across all services.
4. **Deploy edge functions** — Deploy all 58 functions to Supabase.
5. **Fix service method name mismatches** — Align page calls with actual service methods.
6. **Re-enable admin auth** — Uncomment admin protection, add `requireAdmin` to admin routes.
7. **Wire AppLayout to router** — Wrap `/app/*` routes in AppLayout for bottom navigation.

### NEXT (Required for Real Launch)

8. Implement at least one real payment provider (Hubtel or Paystack)
9. Implement real SMS sending via Hubtel/Arkesel
10. Add webhook signature verification
11. Set up Supabase cron for daily reminders and missed payment alerts
12. Add input validation on all edge functions
13. Add RLS policies for Susu tables
14. Seed example group configurations from flyers
15. Fix forgot-password to use phone
16. Fix wallet withdrawal call signature
17. Add profile update and change password to authService

### LATER (Growth + Polish)

18. PWA manifest + service worker + install prompt
19. Push notifications (Firebase already in dependencies)
20. PDF receipts generation
21. Dashboard streaks + gamification
22. Referral system with rewards
23. KYC verification flow with ID upload
24. Support chat/tickets (tables exist)
25. Analytics dashboard for admin
26. Fraud detection flags
27. Rate limiting on sensitive endpoints
28. Multi-language support (i18n infrastructure exists)
29. Blog CMS integration
30. Contact form → support ticket pipeline
31. Automated tests for payout engine
32. Error boundaries + global error handling
33. End-to-end encrypted communication for sensitive data

---

## 10. What Was Changed (Implementation)

### Fix C1: Susu Database Schema Created
**Migration:** `create_susu_schema` — Creates all required Susu domain tables with proper constraints, indexes, enums, and RLS policies.

Tables created:
- `susu_users` — Users with phone auth, roles, KYC status
- `susu_groups` — Group configurations with type, fees, cycle
- `group_memberships` — User-group relationships with turn tracking
- `contribution_schedules` — Daily contribution due records
- `payouts` — Payout records with status workflow
- `wallets` — User wallet balances
- `wallet_transactions` — Append-only wallet ledger
- `payment_intents` — Payment initialization
- `payment_transactions` — Completed payments
- `webhook_events` — Webhook log for idempotency
- `withdrawal_requests` — Withdrawal workflow
- `sms_templates` — SMS template management
- `sms_logs` — SMS delivery tracking
- `sms_sending_rules` — Automation rules
- `sms_opt_outs` — Opt-out management
- `background_jobs` — Job scheduler tracking
- `susu_app_settings` — Application configuration
- `susu_audit_logs` — Admin audit trail
- `rate_limits` — API rate limiting

### Fix C4/H1: Service Method Alignment
**Files modified:**
- `src/services/groupService.ts` — Added method aliases (`getMyGroups`, `listGroups`, `getGroupDetail`, `pauseResumeGroup`)
- `src/services/authService.ts` — Added `updateProfile()` and `changePassword()` methods

### Fix H2: Admin Auth Re-enabled
**File modified:** `src/components/feature/AdminLayout.tsx` — Re-enabled auth check for admin routes

### Fix H7: Forgot Password Phone/Email Alignment
**File modified:** `src/pages/auth/forgot-password/page.tsx` — Changed to use phone number instead of email

### Fix M1: AppLayout Wired to Router
**File modified:** `src/router/config.tsx` — Wrapped `/app/*` routes with AppLayout component

### Supporting File: TODO.md
Created `TODO.md` with full prioritized task list.

---

*End of Audit Report*
