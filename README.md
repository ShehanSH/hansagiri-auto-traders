# Hansagiri Auto Traders

Premium dealership website with a public showroom and a secure admin dashboard.

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Firebase** (Authentication, Firestore) and **Vercel Blob** for file storage. Deploy on Vercel.

The site runs in **demo mode** until Firebase environment variables are set, so you can preview the UI locally without a live project.

## Requirements

- Node.js 20 or later (Node 24 is fine)
- npm 9+
- A Firebase project for production (Authentication, Firestore)
- A Vercel Blob store for image uploads (production)

## Quick start

```bash
npm install
cp .example.env .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local demo login exists only when `NEXT_PUBLIC_USE_DEMO_DATA=true` on your machine. Do not enable demo mode in Vercel.

## Environment variables

Copy `.example.env` to `.env.local`. Never commit `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_USE_DEMO_DATA` | `true` for local demo data |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Google Analytics measurement ID |
| `NEXT_PUBLIC_FIREBASE_APPCHECK_KEY` | Optional reCAPTCHA v3 site key for App Check |
| `BLOB_READ_WRITE_TOKEN` | **Server-only** Vercel Blob token (never expose to the client) |

Firebase `NEXT_PUBLIC_*` values are client configuration. `BLOB_READ_WRITE_TOKEN` is a secret — set it only in `.env.local` locally and in Vercel project settings for production.

## Firebase setup

1. Create a Firebase project.
2. Enable **Authentication → Email/Password**.
3. Create **Firestore** in production mode.
4. Add a web app and copy the config into `.env.local`.
5. Set `NEXT_PUBLIC_USE_DEMO_DATA=false`.
6. Deploy Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Rule files:

- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`

### File storage (Vercel Blob)

Images (vehicles, media library, trade-in uploads) are stored in **Vercel Blob**, not Firebase Storage.

1. In the Vercel dashboard, create a **Blob** store.
2. Copy the **Read-Write** token into `BLOB_READ_WRITE_TOKEN` (local `.env.local` and Vercel env vars).

### Admin user

1. In Firebase Authentication, create a user (email and password).
2. In Firestore, create `admins/{uid}`:

```json
{
  "uid": "THE_AUTH_UID",
  "email": "you@yourdomain.com",
  "displayName": "Owner",
  "role": "super_admin",
  "active": true,
  "createdAt": "2026-09-10T00:00:00.000Z"
}
```

Roles:

- `super_admin` — everything
- `admin` — vehicles, leads, test drives, trade-ins, settings, media
- `sales` — vehicle read, inquiries, test drives, customers

### Site settings

Create `settings/site` or save once from **Admin → Settings**. Public pages read this document for phone, WhatsApp, maps, currency, hero copy, and SEO.

### App Check

Optional. Add a reCAPTCHA v3 key to `NEXT_PUBLIC_FIREBASE_APPCHECK_KEY`. The app skips App Check when the key is empty so local development still works.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## Production (Vercel)

1. Import the repo into Vercel.
2. Add the same environment variables.
3. Set `NEXT_PUBLIC_USE_DEMO_DATA=false`.
4. Deploy.

Replace `hansagiriautotraders.example` in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` with the live domain.

## Brand assets

- Public logo: `public/logo.jpg` (provided Hansagiri Auto Traders logo, used as-is)
- Hero / cover: `public/cover.jpg` (from the Facebook cover image)

Do not redesign the logo.

## Customer flow

Customers can browse, filter, open a vehicle, call, WhatsApp, send an enquiry, request a test drive, and submit a trade-in **without creating an account**.

A test-drive submission is a **request**. Admin must confirm it.

## Admin flow

Draft → publish → customer enquiry → contact → test drive (confirm) → mark sold. Sold vehicles leave the public vehicles list unless “show sold” is enabled in settings.

## Security

See `SECURITY.md`.
