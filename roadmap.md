# Roadmap

## Done
- [x] Link/route audit: Terms + Privacy pages, footer legal links, hash-anchor scrolling, branded 404
- [x] Reviewed uploaded multi-tenant schema; added employees.bank_code and payroll_files.mra_filed_at

## Notes
- Live DB is already multi-tenant (companies + profiles + user_roles, isolation via can_access_company/can_manage_company)
- Uploaded SQL used SERIAL ids and a custom users/password table — not applied; auth is handled by the platform
