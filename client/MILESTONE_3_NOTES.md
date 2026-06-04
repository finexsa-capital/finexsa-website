# FINEXSA Client Portal — Milestone 3 Notes

## What was added

- `client/import.html`
- `client/js/client-import.js`
- `client/templates/FINEXSA_Financial_Import_Template.xlsx`
- Updated `client/company.html` to link each fiscal year to the import page.
- Updated `client/js/client-api.js` with `getFiscalYear`.

## What this milestone does

- Opens Excel import from:
  - `client/import.html?companyId=...&yearId=...`
- Verifies company ownership.
- Reads fiscal year data.
- Lets the client upload `.xlsx`, `.xls`, or `.csv`.
- Parses the first sheet in the browser using SheetJS.
- Checks required headers.
- Shows preview rows.
- Shows warnings for missing classification and invalid numbers.
- Does not save final financial data yet.
- Does not run MIZAN yet.

## Next milestone

Milestone 4:
- Save imported preview into Firestore or staging collection.
- Build Account Mapping screen.
- Connect classifications to MIZAN Code_Map.
