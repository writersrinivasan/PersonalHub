# Setting Up Google Calendar Integration

This guide walks you through connecting PersonalHub to your Google Calendar. It takes about 5 minutes.

---

## What you'll be able to do after setup

- See all your existing Google Calendar events on the PersonalHub calendar (shown in blue)
- When adding a task or client booking, optionally push it directly to Google Calendar
- Navigate months — events sync automatically per month
- Click "↺ Sync" to refresh at any time

---

## Prerequisites

- A Google account
- The app must be served over **HTTP or HTTPS** (not opened as a `file://` path)

> **Important:** Google OAuth does not work when you open `index.html` directly from Finder as a file.
> You need to serve it from a local server. The easiest way:
> ```bash
> cd "/Users/apple/Documents/Personal app"
> python3 -m http.server 8080
> ```
> Then open **http://localhost:8080** in your browser.
>
> For permanent access, deploy to **GitHub Pages** (see bottom of this guide).

---

## Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `PersonalHub` → click **Create**
4. Make sure the new project is selected in the dropdown

---

## Step 2 — Enable the Google Calendar API

1. In the left sidebar go to **APIs & Services → Library**
2. Search for `Google Calendar API`
3. Click it → click **Enable**

---

## Step 3 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. If prompted, configure the **OAuth consent screen** first:
   - User Type: **External**
   - App name: `PersonalHub`
   - Support email: your Gmail address
   - Save and continue through all steps (you can skip optional fields)
   - Under **Test users**, add your own Gmail address
4. Back at Create Credentials → OAuth client ID:
   - Application type: **Web application**
   - Name: `PersonalHub`
   - **Authorised JavaScript origins** — add ALL of these that apply:
     ```
     http://localhost:8080
     http://localhost
     https://writersrinivasan.github.io
     ```
   - Leave **Authorised redirect URIs** empty (not needed for this app)
5. Click **Create**
6. Copy the **Client ID** — it looks like:
   ```
   123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
   ```

---

## Step 4 — Connect in PersonalHub

1. Open PersonalHub at **http://localhost:8080**
2. Go to **Calendar** in the sidebar
3. Click **Connect Google Calendar**
4. Paste your Client ID in the dialog → click **Save & Authorize**
5. A Google sign-in popup will appear — sign in and allow access
6. Your Google Calendar events will now appear in **blue** on the calendar

The Client ID is saved in your browser — you only need to enter it once. On future visits, the app reconnects silently.

---

## Step 5 — Using the Integration

### Viewing events
- Navigate to **Calendar** — Google events appear in blue alongside your tasks and bookings
- Use **← Prev** / **Next →** to move months; events are fetched automatically
- Click **↺ Sync** to manually refresh

### Adding events to Google Calendar
- When creating a **Task** or **Client Booking**, check **"Also add to Google Calendar"**
- The event is created in your primary Google Calendar immediately
- A "📅 Synced to Google Calendar" tag appears on the item

---

## Deploying to GitHub Pages (for permanent use without local server)

Since the app is already on GitHub, enabling Pages takes 30 seconds:

1. Go to [github.com/writersrinivasan/PersonalHub](https://github.com/writersrinivasan/PersonalHub)
2. Settings → Pages → Source: **Deploy from a branch** → Branch: `main` → folder: `/ (root)`
3. Click **Save** — your app will be live at:
   ```
   https://writersrinivasan.github.io/PersonalHub
   ```
4. Add this URL to **Authorised JavaScript origins** in your Google Cloud credentials (Step 3 above)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Google APIs are still loading" | Wait 3–5 seconds and try again |
| Popup blocked | Allow popups for localhost in browser settings |
| "Error 400: redirect_uri_mismatch" | Make sure your current URL is in Authorised JavaScript origins |
| Events not showing | Click ↺ Sync; check that the month matches |
| "Access blocked: app not verified" | In the OAuth consent screen, add yourself as a Test User |
| Token expired after 1 hour | Click Connect Google Calendar again — it silently refreshes |

---

## Privacy & Security

- Your Google account credentials are **never stored** in the app
- The OAuth token (temporary access key) is held in memory only — it expires after 1 hour
- The app requests only `calendar.events` scope (read + write events on your primary calendar)
- No data is sent to any server — everything runs in your browser
