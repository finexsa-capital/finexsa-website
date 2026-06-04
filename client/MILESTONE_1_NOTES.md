# FINEXSA Client Portal — Milestone 1 Notes

## What was added

- `client/login.html`
- `client/dashboard.html`
- `client/companies.html`
- `client/css/client.css`
- `client/js/client-config.js`
- `client/js/client-auth.js`
- `client/js/client-api.js`
- `client/js/client-ui.js`

## What this milestone does

- Client login through Firebase Auth.
- Reads client profile from `users/{uid}`.
- Rejects disabled clients when `active === false`.
- Opens a new client dashboard without changing the old `/login.html`.
- Lists companies from Firestore collection `client_companies`.
- Allows creating a company document in `client_companies`.
- Keeps the old reports viewer available through `/login.html`.

## Firestore collections used

- `users/{uid}`
- `client_companies/{companyId}`

## Required Firestore rule idea

The authenticated client should be able to read their own `users/{uid}` profile and read/write only companies where `ownerUid == request.auth.uid`.

## Next milestone

Milestone 2:
- Fiscal years under each company.
- Company details page.
- Start preparing Excel import.
