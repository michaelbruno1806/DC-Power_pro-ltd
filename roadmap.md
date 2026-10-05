# Roadmap

## Done this update
- [x] Match public pages and account screens to Home's editorial design; add six module icons to Gallery; desktop/mobile layout, pricing toggle, signup link and mobile navigation checks passed.

## Blocked
- [ ] Complete signed-in payroll save/finalise/export verification: requesting account has no company assignment or role; requires user to identify the company/account to test, without fabricating company details or granting privileges.

## Done
- [x] Verify redesigned landing on desktop and mobile, pricing toggle/selection, navigation, public pages, trial signup links, sales links and employee sign-in gate
- [x] Fix accountant-company query and invitation access errors; wait for auth metadata; prevent false setup saves without a company; payroll calculation tests: 19 passed
- [x] Refresh landing page with selected editorial design, preserve flows and optimize presentation
- [x] Link/route audit: Terms + Privacy pages, footer legal links, hash-anchor scrolling, branded 404
- [x] Reviewed uploaded multi-tenant schema; added employees.bank_code and payroll_files.mra_filed_at
- [x] Apply the Midnight Cyber-Precision landing design and connect its actions to onboarding and payroll

## Notes
- Live DB is already multi-tenant (companies + profiles + user_roles, isolation via can_access_company/can_manage_company)
- Uploaded SQL used SERIAL ids and a custom users/password table — not applied; auth is handled by the platform
