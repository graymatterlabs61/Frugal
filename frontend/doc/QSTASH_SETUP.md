# QStash Cron Setup

Frugal's polling worker runs every 5 minutes in production via Upstash QStash.

## Steps

### 1. Get your production URL

Deploy to Vercel (or any host). Your poll endpoint is:

```
https://your-domain.com/api/poll
```

### 2. Configure QStash credentials

In your production environment, set these variables (copy from Upstash console → QStash → Signing Keys):

```
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
```

### 3. Create the schedule

In [Upstash console](https://console.upstash.com) → QStash → Schedules → Create Schedule:

- **URL**: `https://your-domain.com/api/poll`
- **Method**: `POST`
- **Cron**: `*/5 * * * *` (every 5 minutes)
- **Body**: leave empty

QStash signs each request. The `/api/poll` route validates the signature via `@upstash/qstash` `Receiver`.

### 4. Local development

Trigger the worker manually without QStash:

```bash
curl "http://localhost:3000/api/poll?secret=<your-POLL_SECRET>"
```

Set `POLL_SECRET` in `.env.local` to any random string.

## How it works

`app/api/poll/route.ts` accepts both:

- **Production**: `POST` with QStash `Upstash-Signature` header (verified via signing keys)
- **Dev**: `GET ?secret=<POLL_SECRET>` fallback

The worker (`lib/polling/worker.ts`) decrypts stored API keys, fetches usage from each provider, upserts `usage_records`, then runs `budgetChecker.ts` to fire alerts if thresholds are crossed.