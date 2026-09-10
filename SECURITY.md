# Security

This checklist is for Hansagiri Auto Traders before production.

## Secrets

- [ ] `.env.local` is not committed
- [ ] No Firebase service account JSON in the repo
- [ ] No passwords, tokens, or private keys in source
- [ ] Demo admin credentials are disabled (`NEXT_PUBLIC_USE_DEMO_DATA=false`)

## Firebase

- [ ] Firestore rules deployed from `firebase/firestore.rules`
- [ ] Storage rules deployed from `firebase/storage.rules`
- [ ] Rules never include `allow read, write: if true;`
- [ ] Public users can create enquiries / test drives / trade-ins / contact messages only
- [ ] Public users cannot read inquiries, customers, admins, or internal notes
- [ ] Draft and archived vehicles are not publicly readable
- [ ] Admin access requires both Auth and an `admins/{uid}` document
- [ ] App Check configured for production if public writes are enabled

## Application

- [ ] `/admin` routes require a session cookie and client auth check
- [ ] Role checks use the `admins` document, not a client-supplied role
- [ ] All public forms validated with Zod
- [ ] File uploads limited to images and 8MB
- [ ] Honeypot + short cooldown on public forms
- [ ] Errors shown to users do not include stack traces or Firebase internals
- [ ] Internal admin notes are never rendered on public pages
- [ ] WhatsApp and phone numbers come from settings, not hardcoded values
- [ ] Maps / social URLs are validated as http(s)

## Remaining production hardening

- Session cookies are presence-checked in middleware. For stronger verification, add Firebase Admin session cookies using a server-only service account stored in Vercel env vars (never in git).
- Public Firestore creates can still be abused. Enable App Check and monitor usage.
- Trade-in image paths use unguessable IDs; do not make those folders listable.
