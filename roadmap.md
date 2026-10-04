# Roadmap

## In progress
- [ ] Verify redesigned landing on desktop and mobile, including pricing and public links
- [ ] Verify signed-in landing-to-payroll journey end to end and fix any failures

## Done
- [x] Refresh landing page with selected editorial design, preserve flows and optimize presentation
- [x] Link/route audit: Terms + Privacy pages, footer legal links, hash-anchor scrolling, branded 404
- [x] Reviewed uploaded multi-tenant schema; added employees.bank_code and payroll_files.mra_filed_at
- [x] Apply the Midnight Cyber-Precision landing design and connect its actions to onboarding and payroll

## Notes
- Live DB is already multi-tenant (companies + profiles + user_roles, isolation via can_access_company/can_manage_company)
- Uploaded SQL used SERIAL ids and a custom users/password table — not applied; auth is handled by the platform
