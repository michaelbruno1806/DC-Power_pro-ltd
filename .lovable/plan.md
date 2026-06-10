
## Round 3 — Make the app fully functional

Three areas, in this order.

---

### 1) Accountant mode + company switcher

**Data**
- `accountant_company_links` table already exists. Add `role` ('view' | 'manage') and `accepted_at` columns; add a `name` column on `companies` if a friendlier display name is missing (already present).
- New SECURITY DEFINER function `get_accessible_company_ids(_user)` returning company_ids the user can access (own profile.company_id + linked accountant rows). Update RLS helpers/policies on companies, employees, payroll_files, payroll_entries, leave_requests, leave_types, public_holidays, working_day_configs, payroll_components, company_directors so accountants linked to a company can read (and, if role='manage', write) data — using a new helper `can_access_company(_user, _company)`.
- Add admin UI in Company Setup → "Accountants" tab: invite by email, assign role, list/revoke. Invitations resolve when the invited user signs up with that email (trigger maps pending invites to user_id).

**Frontend**
- New `CompanyContext` that exposes `activeCompanyId` (defaults to user's own company; accountants can switch). Stored in localStorage per user.
- New `<CompanySwitcher />` in the sidebar header (shown only when user has access to >1 company). Lists own company + linked companies; click to switch.
- Replace `companyId` reads across pages with `useActiveCompany()` (alias keeps `useAuth().companyId` for back-compat, but pages we touch use the new hook).
- Update `AppSidebar` to show role badge ("Accountant" when active company ≠ own).

---

### 2) Leave automation engine

**Data**
- New `leave_balances` table: (employee_id, leave_type_id, year, opening_balance, accrued, taken, adjustments, closing_balance). Unique on (employee_id, leave_type_id, year).
- SECURITY DEFINER RPC `recalculate_leave_balance(_employee, _type, _year)` — recomputes accrual from hire_date + annual_entitlement_days (pro-rated), subtracts approved leave_requests for that year, applies company policy:
  - `local_leave_cumulate` = false → opening_balance resets each Jan 1.
  - `local_leave_payout_december` = true → unused local-leave days payout flag (surfaces as a "Payout" line item in December payroll).
  - `sick_leave_reset_january` = true → sick balances reset Jan 1.
- RPC `recalculate_company_balances(_company, _year)` loops over employees × leave_types. Triggered on:
  - Leave request approval/rejection (trigger).
  - Manual "Recalculate balances" button on Leaves page.
  - Year-end rollover when the user clicks "Run year-end rollover" (creates next-year row using policy).

**Frontend**
- Leaves page: add a "Balances" tab with a table per employee × type (opening, accrued, taken, balance), and a "Recalculate" button.
- Employee profile: show current-year balances inline.
- Payroll Run: when generating December payroll, surface a "Local leave payout" suggested addition for employees with positive local-leave balance and `local_leave_payout_december=true` (pre-filled, dismissible). When unpaid leave is approved within the period, auto-create a deduction line.
- Payslip: show YTD leave taken + remaining for each leave type.

---

### 3) Polish all existing pages

For every page in the protected app:
- Add proper **loading skeletons** (Skeleton components from shadcn) and **empty states** with a clear CTA.
- Add **error toasts** for every supabase call that currently swallows errors.
- Add **zod validation** on every form that currently uses inline checks.
- Trial/active **gating**: when `!isActive`, disable mutation buttons across Payroll Run, Employees (add/edit), Leaves (approve), Components (save) with a tooltip "Subscribe to continue". `TrialBanner` already shown on Dashboard — add it to PayrollFiles + PayrollRun headers too.
- Add a top-bar "Active company" pill on every page so accountants always know which company they're operating on.
- Fix mocked content:
  - Dashboard "checklist" hard-coded array → reuse logic from `Checklist.tsx` so the dashboard ring reflects real status.
  - Dashboard "Payroll Assistant" status pill → reflect actual file.status (draft/processing/completed).
- Pricing page: wire the "Subscribe" button to Lovable Stripe payments (already enabled previously? — if not, skip in this round; otherwise just link to checkout).

---

### Technical notes

- All schema changes go through one migration. Every new public table gets `GRANT`s + RLS + policies in the same migration.
- New RPCs are SECURITY DEFINER with `SET search_path = public`.
- Tests: add a vitest spec for the leave accrual math (pro-ration, reset rules, December payout flag).
- No edits to `src/integrations/supabase/{client,types}.ts` — types regenerate after migration.

---

### Order of execution

1. Migration (accountant access helper + leave_balances + invite columns).
2. CompanyContext + CompanySwitcher + sidebar wiring.
3. Accountants tab in Company Setup.
4. Leave engine RPCs + Balances tab + Payroll Run integration.
5. Polish pass (skeletons, empty states, validation, gating).

I'll batch each step's file writes in parallel and verify after each major checkpoint.
