# Frugal
### Control your AI costs before they control you.

AI API cost management for developers. Connect OpenAI, Anthropic, Replicate, or fal.ai — get real-time spend visibility, automatic budget enforcement, and alerts before you hit your limits.

---

## The Problem

A company spent $500 million on Claude AI in a single month because nobody set usage limits. I shut down my own product (DeepVid AI — 50k users, $3,500 MRR) because API costs spiraled during a traffic surge and I had nothing to stop it.

Every AI developer faces this. Provider dashboards show you what happened. Frugal stops it from happening.

---

## Features

- **Real-time spend dashboard** — See costs by provider, project, user, and feature
- **Budget rules** — Set daily or monthly limits per project
- **Automatic enforcement** — Throttle or block API calls when limits are hit
- **Alerts before limits** — Email and Slack notifications at 80% of your budget (not after 100%)
- **Per-user attribution** — Know exactly which users are costing you money

---

## Supported Providers

- OpenAI (GPT-4o, GPT-4, GPT-3.5, DALL-E)
- Anthropic (Claude 3.5, Claude 3)
- Replicate
- fal.ai
- ElevenLabs (v1.1)

---

## Pricing

| Plan | Price | Includes |
|------|-------|---------|
| Free | $0 | 1 API connected, 14-day history, email alerts |
| Starter | $19/mo | 3 APIs, 90-day history, Slack alerts |
| Growth | $49/mo | Unlimited APIs, auto-throttling, per-user attribution |
| Pro | $99/mo | Team access, API access, white-label reports |

---

## Tech Stack

Next.js 14 + TypeScript + Supabase + Upstash + Stripe + Vercel

---

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

See AGENTS.md for full setup documentation and environment variables.

---

## Contact

Built by Nilesh Kumar — [@aiwithnilesh](https://x.com/aiwithnilesh)
Gray Matter Labs, Gurugram, India
