# Plan — Round 1 of 4

You confirmed everything in sequence. This round delivers the foundations that everything else depends on. The next 3 rounds will layer on top without breaking what we ship now.

## Round breakdown (high-level)

1. **THIS ROUND** — Auth revamp + Wizard + Trial + Roles DB + Stripe enable
2. Company details v2 (logo, directors, accountant, leave-cumulate toggle) + Employee model v2 + bulk CSV import
3. Leave automation engine (6-month / 1-year auto-eligibility, sick reset, December payout)
4. MRA exports in official format (PAYE/CSG/NSF + PRGF + exit statements) — needs your uploaded templates

---

## What ships in this round

### A. Database migrations
- `companies`: add `trial_ends_at`, `subscription_status` (trial/active/expired/cancelled), `stripe_customer_id`, `setup_completed`, `payroll_frequency` (monthly/weekly/fortnightly), `payroll_start_month`, `currency` (default MUR), `tan`, `vat_number`, `logo_url`
- `app_role` enum extended: `super_admin`, `company_owner`, `payroll_officer`, `hr_user`, `accountant`
- `user_roles` already exists — add `company_id` (nullable, for multi-company accountant assignment)
- New `accountant_company_links` table: maps an accountant `user_id` to many `company_id`s (foundation for accountant-mode switcher in round 2+)
- New `company_logos` storage bucket (public)
- `profiles`: add `phone`, `full_name`
- `has_role` updated to optionally scope by company

### B. Sign-up flow rebuild (`src/pages/Auth.tsx`)
- New `SignUp` form with: Full Name, Email, Mobile (Mauritius regex `^(?:\+230|230)?[0-9]{8}$`), Password, Confirm Password, T&C checkbox, Privacy checkbox
- Zod schema with: email format, password strength (8 chars + 1 upper + 1 lower + 1 number), mobile MU format, password match
- `supabase.auth.signUp` with `emailRedirectTo` and `data: { full_name, phone }`
- Email verification gate — block dashboard until `email_confirmed_at` is set; show "Verify your email" screen with resend button
- "Welcome back, {full_name}" on sign-in (fixes earlier bug)
- Forgot Password link → `/forgot-password` page → `/reset-password` page (both new)
- Google sign-in button (Lovable Cloud OAuth)

### C. Company Setup Wizard (`src/pages/Onboarding.tsx`, replaces direct CompanySetup)
- 3 steps with progress indicator:
  - **Step 1 — Company Details**: name, BRN, TAN, VAT (optional), address, email, phone, logo upload (storage bucket)
  - **Step 2 — Payroll Settings**: frequency (Monthly/Weekly/Fortnightly), start month picker, currency (locked MUR)
  - **Step 3 — Employee Setup**: choice between "Add manually" or "Import from Excel" with a downloadable `.xlsx` template (basic columns now, full schema in round 2)
- On finish: marks `setup_completed=true`, creates first `payroll_files` row for the start month, redirects to **/employees** (per your spec)

### D. 14-day trial logic
- On signup: trigger sets `trial_ends_at = now() + 14 days`, `subscription_status='trial'`
- New `<TrialBanner />` component on dashboard: "X days remaining in your trial" with Upgrade CTA
- Read-only guard hook `useTrialStatus()`: when expired AND status≠active, payroll-run actions blocked with toast + upgrade modal (full enforcement wired in round 4 after Stripe products are created)

### E. Stripe billing enable
- Run `recommend_payment_provider` then `enable_stripe_payments` (you confirmed Stripe)
- After enable completes, scaffold a `subscription_plans` table + Pricing page at `/pricing` with placeholder tiers — actual product creation happens once Stripe is live

### F. Auth email customization
- Scaffold branded auth-email templates (verification, password reset, magic link) using emerald/navy theme — requires email domain. If you don't have one, the dialog will appear; otherwise we use defaults and you can add the domain later.

### G. Routing changes (`src/App.tsx`)
- `/` → Landing (unchanged)
- `/auth` → new sign-in/sign-up
- `/forgot-password`, `/reset-password` → new
- `/onboarding` → wizard (gate: signed-in + email verified + setup_completed=false)
- `/employees`, `/dashboard`, etc → require email verified + setup_completed=true
- `<ProtectedRoute>` rewritten with these gates

---

## Technical notes (skim if non-technical)

- Mobile validation: MU mobile numbers are 8 digits starting `5`. Regex `^(?:\+230\s?|230\s?)?5\d{7}$`.
- Logo upload uses Supabase storage with `company_id` as folder — RLS restricts each company to its own folder.
- Trial enforcement uses a `is_company_active(company_id)` SQL function returning bool, used by future RLS on payroll mutations (round 4).
- Roles migration is additive — existing `super_admin` / `client_admin` users keep working. We'll map `client_admin` → `company_owner` in the migration.
- The wizard writes to `companies` row already created at signup (a trigger creates an empty company on first sign-up of a non-accountant user).

---

## Out of scope for THIS round (coming next)

- Director list editor, accountant assignment, leave-cumulate toggle on company → **Round 2**
- Employee code/job/dept/transport/EDF/ID upload + bulk CSV → **Round 2**
- 6-month / 1-year leave auto-promotion + sick reset + December payout calc → **Round 3**
- MRA-format exports + PRGF + exit statement reminders → **Round 4** (need your templates)
- Accountant company-switcher UI → **Round 3** (DB foundation ships now)
- WhatsApp notifications → not started; structure-ready

Approve and I'll execute the full migration, then code, then deploy.