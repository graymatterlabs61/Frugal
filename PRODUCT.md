# PRODUCT.md — Frugal

register: product (dashboard, settings, app UI) / brand (landing, pricing, legal pages)

## Product Purpose

Frugal is a multi-provider AI cost dashboard with automated guardrails. Developers connect AI provider accounts (OpenAI, Anthropic, Replicate, fal.ai); Frugal polls usage every 5 minutes, shows unified spend per project, and fires email/Slack alerts before budget limits are hit.

It is an early-warning and visibility product, not a real-time interceptor: no proxy, no code changes, no URL swap. Honesty about that tradeoff is a core brand value (see doc/PRICING.md "Honest Version").

## Users

- **Primary:** Solo developers and 1–5 person teams building AI-powered SaaS, spending $200–$5,000/month on AI APIs. Technical, busy, skeptical of yet another dashboard.
- **Beachhead:** Developers who already got burned by a surprise AI bill. No education needed — they want the alarm system they wish they'd had.
- **Secondary:** AI agencies needing per-client cost attribution.

Usage context: a developer glances at the dashboard a few times a week, often late at night after a deploy, usually in dark mode, on a laptop. Alerts reach them in Slack/email — the dashboard must answer "am I OK?" in under five seconds.

## Tone & Voice

- Honest to a fault: never overpromise enforcement, always disclose the 5-minute polling gap
- Technical-peer voice: talks to developers like a competent colleague, not a marketer
- Calm urgency: money is at stake, but panic UI is banned — clarity over alarm
- No AI copywriting clichés ("seamless", "unleash", "supercharge")

## Brand

- Name: Frugal (Gray Matter Labs, Inc.) — domain getfrugal.dev
- Brand orange #FF500B on deep indigo-navy dark surfaces; glassmorphism panels (see DESIGN.md)
- Wordmark font Ethnocentric; UI font Inter
- Dark-first: the app default is dark mode; marketing pages are dark

## Strategic Principles

1. **Trust before features.** Users hand over API keys. Every key-touching surface must explain encryption, scoping (read-only/admin usage keys, never production model keys), and blast radius — in place, not in a FAQ.
2. **Honest enforcement language.** "Block"/"throttle" act at the next 5-minute poll; copy must never imply mid-flight request interception on personal plans.
3. **Five-second answer.** Dashboard's first screenful must answer: current spend, burn rate, anything on fire.
4. **No dead UI.** Every visible button works or is clearly labeled as upcoming — silent "coming soon" toasts are banned.

## Anti-references

- Generic AI-tool landing pages (purple gradients, floating 3D blobs, fake metrics)
- Enterprise dashboards that bury the number that matters under filters
- Crypto-style hype copy; fear-mongering "your costs are exploding!!" tone
