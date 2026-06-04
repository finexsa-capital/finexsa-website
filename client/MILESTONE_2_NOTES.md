# FINEXSA Client Portal — Milestone 2 Notes

## What was added

- `client/company.html`
- Updated `client/companies.html` so each company opens its details page.
- Updated `client/js/client-api.js` with:
  - `getClientCompany`
  - `listFiscalYears`
  - `createFiscalYear`

## What this milestone does

- Opens a company details page by URL:
  - `client/company.html?id=COMPANY_ID`
- Verifies that the logged-in client owns the company.
- Shows company basics:
  - company name
  - country
  - business type
  - base currency
  - inventory policy
- Allows creating fiscal years under:
  - `client_companies/{companyId}/fiscal_years/{fiscalYearId}`

## Firestore paths used

- `users/{uid}`
- `client_companies/{companyId}`
- `client_companies/{companyId}/fiscal_years/{fiscalYearId}`

## Next milestone

Milestone 3:
- Excel template.
- Excel import page.
- Preview imported rows.
- Basic validation before mapping.
