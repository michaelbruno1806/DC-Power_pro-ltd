# Remove “Join Us” and verify deployment readiness

## Changes
- Remove “Join Us” from the desktop and mobile navigation.
- Remove “Join Us” from the website footer.
- Remove the `/join-us` public route and its unused page, so the old address uses the existing branded not-found page.

## Verification
- Confirm no remaining “Join Us” links, imports, or routes exist.
- Check the homepage, navigation, footer, and old `/join-us` address in the browser.
- Confirm the current build has no errors and that site metadata, favicon, and client-side routing remain ready for a custom domain.

## Scope
- Leave all payroll features, other pages, branding, and content unchanged.
- Do not publish or connect a domain yet; those actions require the final domain and an explicit deployment request.
