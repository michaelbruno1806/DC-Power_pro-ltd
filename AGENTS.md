# Architecture decisions
- Keep landing-only editorial palette scoped to the public landing page and its navigation so payroll workspace theme tokens remain unchanged.
- Use locally bundled Outfit and Figtree font files for predictable rendering without a network font request.
- Load accountant company names with separate permission-scoped queries instead of embedded joins, because the deployed schema has no relationship for that join.
- Keep protected navigation waiting for account metadata so company setup decisions use hydrated account state.
