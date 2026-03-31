# ZagaPrime Sales System

Static internal CRM for local-business lead tracking, outreach scripts, stage logging, analytics, CSV workflows, and Google Sheets sync.

## Repo Layout

This `deploy/` folder is the canonical app repository.

```text
deploy/
|-- index.html
|-- assets/
|   |-- style.css
|   |-- leads.js
|   |-- scripts.js
|   `-- app.js
|-- google-apps-script.gs
|-- vercel.json
|-- .gitignore
`-- README.md
```

## What v1 Includes

- Lead dashboard with seeded leads and manual lead entry
- Quick filters, saved searches, and search history
- Lead detail panel and full-screen sales workflow
- Sales scripts for opener, hook, offer, email, voicemail, and objections
- Stage tracking with analytics
- CSV import and export
- Google Sheets pull and push sync options
- Browser localStorage persistence for fast single-user use

## First-Time Setup

### 1. Run locally

You can open `index.html` directly in a browser, but a local web server gives the most reliable experience.

PowerShell:

```powershell
cd C:\Users\mmdco\Downloads\Zagaprime-sales-system\deploy
python -m http.server 3000
```

Then open:

```text
http://localhost:3000
```

### 2. Configure operator details

Open `Settings` in the app and fill in:

- Your name
- Your email
- Your phone
- Company name

These values are injected into the outreach templates.

### 3. Confirm your storage model

v1 uses:

- `localStorage` for the working app state in your browser
- Google Sheets for backup, portability, and optional sync

There is no login, database, or backend in this version.

## Daily Workflow

### Review and work leads

1. Open `All Leads`.
2. Use the top quick filters or the filter bar to narrow the list.
3. Click a lead card to open the detail panel.
4. Review the pitch angle and research notes.
5. Click `Work This Lead`.
6. Use the script tabs while logging each stage on the right.
7. Click `Save Progress` or `Save & Close`.

### Add new leads

Use `Find New Leads` for:

- Manual lead entry
- Territory targeting
- CSV import

Recommended CSV headers:

```csv
business_name,owner_name,category,phone,address,city,county,state,zip,website_status,pitch_angle,tier,notes
```

The CSV importer now handles quoted fields and updates an existing lead when the business name already exists.

### Review performance

Use `Analytics` to monitor:

- Total worked leads
- In-progress leads
- Closed-won count
- Funnel movement
- Category breakdown
- Stage performance
- Recent activity

## Google Sheets Setup

### Published CSV import flow

Use this when you want the app to pull leads from a Google Sheet.

1. Open your Google Sheet.
2. Go to `File -> Share -> Publish to web`.
3. Publish the sheet tab as `Comma-separated values (.csv)`.
4. Copy the published URL.
5. In the app, open `Settings`.
6. Paste the URL into `Your Published Google Sheet CSV URL`.
7. Use `Open Sheet in Browser` to confirm the URL returns raw CSV.
8. Use the sync button to load rows into the app.

Expected lead headers:

```text
business_name, owner_name, category, phone, address, city, county, state, zip, website_status, pitch_angle, tier, notes
```

### Apps Script outbound sync

Use this when you want the app to push all leads and stage data into Google Sheets.

1. Open your target Google Sheet.
2. Go to `Extensions -> Apps Script`.
3. Delete any starter code.
4. Copy the contents of `google-apps-script.gs` from this repo.
5. Paste it into the Apps Script editor.
6. Save the script.
7. Click `Deploy -> New deployment`.
8. Choose `Web app`.
9. Set `Execute as` to `Me`.
10. Set `Who has access` to `Anyone`.
11. Deploy and complete authorization.
12. Copy the generated web app URL.
13. In the app, open `Settings`.
14. Paste the URL into `Google Apps Script Web App URL`.
15. Click `Test Connection`.
16. Use `Sync to Sheets` to push the live CRM payload.

The outbound payload includes:

- `type`
- `leads`
- `activity`
- `synced_at`

## Backup and Restore

### Back up

Use at least one of these regularly:

- `Export CSV` for lead records
- `Export Analytics CSV` for stage data
- `Sync to Sheets` for a cloud copy

### Restore

To restore on another machine:

1. Open the deployed app or local app in the new browser.
2. Import a lead CSV or reconnect the Google Sheet.
3. Re-enter your operator settings in `Settings`.
4. If needed, reconnect the Apps Script web app URL.

## GitHub Workflow

The repo is intended to live on GitHub under your account.

Typical update flow:

```powershell
cd C:\Users\mmdco\Downloads\Zagaprime-sales-system\deploy
git status
git add .
git commit -m "Describe the update"
git push
```

If you clone it later on another machine:

```powershell
git clone <repo-url>
cd <repo-name>
```

## Vercel Deployment

This repo is set up for static hosting on Vercel with a serverless API route for live lead search.

### Dashboard flow

1. Push this repo to GitHub.
2. Log in to Vercel.
3. Click `Add New -> Project`.
4. Import the GitHub repository.
5. Keep the root as the project root.
6. In `Settings -> Environment Variables`, add `GOOGLE_PLACES_API_KEY`.
7. Deploy with the default settings.

### CLI flow

From the repo root:

```powershell
cd C:\Users\mmdco\Downloads\Zagaprime-sales-system\deploy
vercel
vercel --prod
```

Before using live no-website search, add:

```text
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

You do not need a Claude API key for lead search. The app uses the Vercel `/api/search-leads` route and Google Places.

For v1, the default Vercel domain is enough.

## Troubleshooting

### App opens but looks unstyled

- Make sure `assets/style.css` exists next to `index.html`
- Make sure you are running from the `deploy/` repo, not an older exported HTML file

### Leads or settings disappeared

- Check whether you opened the app in a different browser or browser profile
- `localStorage` is browser-specific
- Restore from CSV or Google Sheets if needed

### Google Sheet import is not working

- Confirm the published link returns raw CSV, not an HTML page
- Make sure the sheet is published to the web
- Confirm the header names are valid
- If direct fetch fails, the app will try proxy fallbacks

### Google Apps Script sync fails

- Verify the web app URL is the deployed `/exec` URL
- Re-deploy the script as a web app if permissions changed
- Confirm the script is deployed with access set to `Anyone`

### Live lead search is not working

- Confirm the site is running on Vercel or through `vercel dev`, not only from a plain static file open
- Confirm `GOOGLE_PLACES_API_KEY` is set in the Vercel project
- Redeploy after adding the environment variable
- Claude is not required for this feature

### CSV import looks wrong

- Keep the header row
- Quote any field that contains commas
- Make sure `business_name` is present
- Re-importing the same business name updates the existing lead rather than duplicating it

## Operating Notes

- This is an internal single-user tool for v1
- There is no auth layer by design
- Google Sheets is the portability layer, not the primary runtime database
- The automation roadmap in the UI is informational only in this release
