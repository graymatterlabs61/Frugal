# PRICING — Frugal
## Pricing Strategy & Tier Structure
**Version:** 2.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## What Frugal Actually Is (Honest Version)

Frugal is a **multi-provider AI cost dashboard with automated guardrails**.

It is NOT a real-time interceptor on the personal plan. It polls your provider usage APIs every 5 minutes, aggregates spend across every provider you use, fires alerts before you hit your budget, and enforces rules (block, throttle) at the next poll cycle.

**The actual value:**
- Single dashboard for OpenAI + Anthropic + Replicate + fal.ai — providers don't show you this
- Per-user attribution — see which of your end-users is driving cost, not just totals
- Per-project attribution across providers — no manual log parsing
- Guardrails that fire before the end-of-month invoice, not after
- Zero integration friction — no URL changes, no proxy, no code changes

**What it is not (personal plan):**
- Not instant blocking (5-min polling gap exists)
- Not a request logger or LLM observability tool
- Not a replacement for provider native limits — use both

---

## Why Trust Is the First Thing We Address

On the personal plan, you give Frugal your API keys.

Here is exactly what we do with them:
- AES-256 encrypted immediately on receipt
- Stored only in encrypted form — never in plaintext anywhere in our stack
- Used only to call your provider's **usage/reporting API** — never to make model requests
- Never logged, never transmitted to third parties
- The last 4 characters are shown in the UI — the full key is never returned after save

On the personal plan, Frugal never proxies your requests. Your traffic goes directly from your app to the provider. Frugal only reads usage data, not request content.

**Auditability roadmap:** SOC 2 Type II is targeted for Q4 2026, after the product proves traction. Until then, the architecture is fully open for review — email founder@frugal.dev.

---

## Line 1 — Personal Plans

**Target:** Developers building AI-powered products who use 2+ providers or need per-user cost attribution.

**Core differentiator:** No proxy. No URL change. Connect in 2 minutes, see unified spend across all providers immediately.

**Value metric:** Flat tier by capability.

**Go-to-market:** Self-serve, credit card, live in under 5 minutes.

### Tiers

| | Free | Plus | Pro |
|---|---|---|---|
| **Price (monthly)** | $0 | $19/mo | $49/mo |
| **Price (annual)** | — | $15/mo · $180/yr | $39/mo · $468/yr |
| **Annual saving** | — | Save $48/yr | Save $120/yr |
| **API connections** | 1 | 3 | Unlimited |
| **Projects** | 1 | 5 | Unlimited |
| **Usage history** | 7 days | 90 days | 1 year |
| **Poll interval** | 5 min | 5 min | 5 min |
| **Alerts** | Email only | Email + Slack | Email + Slack + Webhook |
| **Budget guardrails** | None | Alert + Block (next poll) | Alert + Block + Throttle (next poll) |
| **Per-user attribution** | No | No | Yes |
| **Per-project cross-provider view** | Yes | Yes | Yes |
| **Burn rate dashboard** | No | Yes | Yes |
| **API access** | No | No | Yes |
| **Support** | Community | Email · 48h | Priority email · 24h |

> **Honest note on guardrails:** "Block" means the connection is flagged and skipped at the next 5-minute poll cycle. It does not intercept requests mid-flight on the personal plan. Use provider native spending limits as your hard floor — Frugal is your early warning and automated response layer above that.

### Upgrade Triggers

```
Free → Plus
  - Need Slack alerts
  - Need budget guardrails (alert + block)
  - Running more than 1 API connection
  - More than 1 project

Plus → Pro
  - Need per-user attribution (track which end users cost you what)
  - Need webhooks for CI/CD or external alerting
  - Need API access for programmatic budget control
  - More than 5 projects
```

### Price Rationale

**Free — $0**
Exists for pipeline, not revenue. One connection is enough to see unified multi-provider spend. Budget guardrails are locked. That gap drives upgrade.

**Plus — $19/mo · Hero tier**
Below Helicone Pro ($20/seat) on price, ahead on enforcement features. Under $20 = no approval needed. Annual at $15/mo feels like a deal — drives annual conversion. Target: 60%+ of personal revenue lands here.

**Pro — $49/mo**
Per-user attribution is the unlock. Any developer monetizing their own product needs cost visibility per end user to price contracts correctly, protect margins, and identify expensive users. Unlimited everything removes scale anxiety.

---

## Line 2 — Corporate Plans (Waitlist — Q3 2026)

**Status:** Not launched. Waitlist open. Target launch Q3 2026.

**Why delayed:** Corporate proxy architecture requires trust infrastructure (SOC 2, uptime SLA, security audit) that takes time to build credibly. We are not launching corporate until personal plan is proven and trust is established.

**Why it's coming:** The personal polling approach cannot attribute costs to individual employees — for that you need a proxy gateway. That is a distinct product with distinct trust requirements.

**What corporate will be:**
- Proxy gateway replacing `OPENAI_BASE_URL` (and other providers) in employee tooling
- Every request routed through Frugal → attributed to employee ID → forwarded to provider
- Real-time block (sub-second) when budget is exceeded — no 5-min gap
- Admin dashboard for CEO/CTO/Finance
- Per-team or per-person budget policies
- Logged: model, token count, cost, timestamp, employee ID
- Never logged: prompt content, completion content, any message data

**Planned tiers (not final):**

| | Team | Scale | Growth |
|---|---|---|---|
| **Price (monthly)** | $79 flat | $149 flat | Contact sales |
| **Seats covered** | 2–10 | 11–20 | 20+ |
| **SSO** | No | Yes | Yes |
| **Compliance export** | No | Yes | Yes |
| **SLA** | No | No | 99.9% uptime |

**Join waitlist:** frugal.dev/corporate

---

## Annual Discount — Personal Plans

**Frame as "2 months free" not "20% off."**

| Plan | Monthly | Annual/mo | Annual total | You save |
|------|---------|-----------|-------------|----------|
| Plus | $19 | $15 | $180 | $48 |
| Pro | $49 | $39 | $468 | $120 |

---

## Competitive Position

| | Frugal Personal | Helicone | LangSmith | Provider Native |
|---|---|---|---|---|
| Multi-provider | Yes | Yes | No | No |
| No URL change / no proxy | **Yes** | No (proxy) | No | N/A |
| Automatic guardrails | Yes | No | No | Partial |
| Per-user attribution | Yes (Pro) | Partial | No | No |
| Solo-dev pricing | **$19/mo** | $20/seat | $39/user | Free |
| Enforcement type | Polling (5-min) | Proxy (real-time) | None | Native limit |

**Frugal's wedge:** Only tool with multi-provider + enforcement + no integration friction at any price.

**Honest tradeoff vs Helicone:** Helicone proxy gives real-time enforcement. Frugal personal plan gives 5-min polling enforcement with zero integration friction. Users who want sub-second blocking use provider native hard limits as floor + Frugal as the layer above.

---

## Personal Plan Revenue Model

### Realistic Month 6 Projection

| Tier | Users | MRR |
|------|-------|-----|
| Free | 30 | $0 |
| Plus | 20 | $380 |
| Pro | 10 | $490 |
| **Total** | **60** | **$870** |

**Assumptions behind this:** 
- 60 paid users in 6 months requires ~600–1,200 free signups (5–10% conversion)
- 600 free signups requires significant distribution work: HN, Reddit, Twitter, cold outreach
- This is achievable but not certain — primary risk is distribution, not product

---

## What Frugal Does Not Claim

- Does not claim to prevent all overspend — pair with provider hard limits
- Does not claim real-time blocking on personal plan — 5-min polling gap exists
- Does not claim SOC 2 yet — targeted Q4 2026
- Does not claim corporate plan features before corporate launches

---

## Open Questions Before Personal Launch

1. Does Free tier allow any provider simultaneously, or one provider type only?
2. "Throttle" on Pro — how does polling-based throttle work without proxy? Define the mechanic.
3. What happens to budget guardrails when poll fails? Fail open or fail closed?
4. Does API access (Pro) expose raw usage data or only aggregated budget state?
