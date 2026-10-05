# Architecture decisions
- Share Home's editorial tokens and MarketingPage shell across public pages and authentication screens; keep payroll workspace theme tokens unchanged to avoid workspace regressions.
- Use locally bundled Outfit and Figtree font files for predictable rendering without a network font request.
- Load accountant company names with separate permission-scoped queries instead of embedded joins, because the deployed schema has no relationship for that join.
- Keep protected navigation waiting for account metadata so company setup decisions use hydrated account state.
