# PRICING — Frugal
## Pricing Strategy & Tier Structure
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## Overview

Frugal has two pricing lines serving fundamentally different buyers:

| Line | Buyer | Architecture | Problem Solved |
|------|-------|-------------|----------------|
| **Personal** | Individual developer | Polling-based | Own AI API costs spiraling |
| **Corporate** | CEO / CTO / Finance | Proxy-based gateway | Employee AI spend invisible to org |

---

## Line 1 — Personal Plans

**Target:** Solo developers and indie hackers building AI-powered products.
**Value metric:** Flat tier by capability (connections, projects, features).
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
| **Alerts** | Email only | Email + Slack | Email + Slack + Webhook |
| **Budget rules** | None | Alert + Block | Alert + Throttle + Block |
| **Per-user attribution** | No | No | Yes |
| **Burn rate dashboard** | No | Yes | Yes |
| **API access** | No | No | Yes |
| **Support** | Community | Email · 48h | Priority email · 24h |

### Upgrade Triggers

```
Free → Plus
  - Need Slack alerts
  - Need budget rules (block / alert)
  - Running more than 1 API connection
  - More than 1 project

Plus → Pro
  - Need per-user attribution (tracking end users' costs)
  - Need webhooks for CI/CD integration
  - Need API access for programmatic budget control
  - More than 5 projects
```

### Price Rationale

**Free — $0**
Exists for pipeline, not revenue. One connection is enough to feel the value — not enough to run a real product. Budget rules are locked. Key pain point drives upgrade.

**Plus — $19/mo · Hero tier**
Below Helicone Pro ($20/seat) on price, ahead on enforcement features. Under $20 = no approval needed, solo dev swipes card immediately. Annual at $15/mo feels like a deal — drives annual conversion. Target: 60%+ of personal revenue lands here.

**Pro — $49/mo**
Matches LangSmith price but different product category. Per-user attribution is the unlock — any developer monetizing their own product needs cost visibility per end user. Unlimited everything removes anxiety about scale.

---

## Line 2 — Corporate Plans

**Target:** Organizations where CEO/CTO/Finance manages employee AI tool spend.
**Value metric:** Per-seat banded. Scales with team size — larger team = more value = higher price.
**Go-to-market:** Self-serve for Team/Scale. Sales-assisted for Growth.
**Architecture:** Proxy gateway — employee requests route through Frugal, costs attributed to employee ID, forwarded to provider. No prompts logged.

### Tiers

| | Team | Scale | Growth |
|---|---|---|---|
| **Price (monthly)** | $79 flat | $149 flat | Contact sales |
| **Price (annual)** | $63/mo · $756/yr | $119/mo · $1,428/yr | Custom |
| **Annual saving** | Save $192/yr | Save $360/yr | — |
| **Seats covered** | 2–10 | 11–20 | 20+ |
| **Overflow seats** | +$9/seat/mo | +$9/seat/mo | Negotiated |
| **Proxy access** | Yes | Yes | Yes |
| **Admin dashboard** | Yes | Yes | Yes |
| **Real-time blocking** | Yes | Yes | Yes |
| **Per-employee attribution** | Yes | Yes | Yes |
| **Budget policies** | Per-team | Per-person | Custom |
| **Admin alerts (Slack + email)** | Yes | Yes | Yes |
| **SSO** | No | Yes | Yes |
| **Compliance export (CSV/PDF)** | No | Yes | Yes |
| **Prompt metadata logs** | No | Yes | Yes |
| **SLA** | No | No | 99.9% uptime |
| **Onboarding call** | No | No | Yes |
| **Dedicated CSM** | No | No | Yes |
| **Support** | Email · 48h | Email · 24h | Dedicated |

### Upgrade Triggers

```
Team → Scale
  - Team size exceeds 10 users
  - IT requires SSO
  - Finance needs compliance exports
  - Need per-person (not per-team) budget policies

Scale → Growth
  - Team exceeds 20 users
  - Need uptime SLA (Frugal is now critical infrastructure)
  - Need custom policy logic or API integrations
  - Procurement requires MSA / DPA / security review
```

### Tier Boundary Math

| Team size | Team cost | Scale cost | Best choice |
|-----------|-----------|------------|-------------|
| 2 users | $79 | — | Team |
| 5 users | $79 | — | Team |
| 10 users | $79 | — | Team |
| 11 users | $79 + $9 = $88 | $149 | Scale (SSO + compliance unlock) |
| 15 users | $79 + $45 = $124 | $149 | Scale ($25 more, far more features) |
| 20 users | — | $149 | Scale |
| 21+ users | — | $149 + $9/extra | Growth conversation |

At tier boundary, frame Scale as savings not upgrade:
> *"You're adding your 11th person. Scale plan covers up to 20 users at $149 — that's actually cheaper than Team + overages at 13+ users, and you get SSO and compliance exports."*

### Price Rationale

**Team — $79/mo flat for 2–10 seats**
A CTO giving 10 devs $200/month AI budgets = $2,000/month with zero visibility. $79 = 4% of that spend for full attribution and blocking. Easy yes. Flat band removes per-seat mental math at this team size.

**Scale — $149/mo flat for 11–20 seats**
At 15 seats = $9.93/seat — beats most per-seat SaaS tools. SSO and per-person budget policies are hard requirements for any company with an IT department. These features create a clear wall. $149 not $159 — stays below the $150 psychological threshold.

**Growth — Contact sales**
20+ employees = procurement, security review, custom contract. No public price. Open conversation at $299–499/mo, negotiate by seat count and contract length.

---

## Annual Discount — Both Lines

**Frame as "2 months free" not "20% off."**
Tangible beats arithmetic. "2 months free" is visual and concrete.

| Plan | Monthly | Annual/mo | Annual total | You save |
|------|---------|-----------|-------------|----------|
| Plus | $19 | $15 | $180 | $48 |
| Pro | $49 | $39 | $468 | $120 |
| Team | $79 | $63 | $756 | $192 |
| Scale | $149 | $119 | $1,428 | $360 |

Corporate buyers strongly prefer annual — one PO, one invoice, Finance is satisfied. Push annual on every Team and Scale close.

---

## Competitive Anchoring

| Competitor | Price | Enforcement | Multi-provider |
|-----------|-------|-------------|----------------|
| Helicone Pro | $20/seat | No | Yes |
| Helicone Team | $799/mo | No | Yes |
| LangSmith | $39/user/mo | No | No |
| Portkey | Usage-based | Partial | Yes |
| OpenAI Dashboard | Free | No | No |
| **Frugal Plus** | **$19/mo** | **Yes** | **Yes** |
| **Frugal Team** | **$79/mo** | **Yes** | **Yes** |

Frugal is the only tool with automatic enforcement + multi-provider + no proxy requirement (personal line) at any price point.

---

## Revenue Model

### Personal — Realistic Month 6 Projection

| Tier | Users | MRR |
|------|-------|-----|
| Free | 30 | $0 |
| Plus | 20 | $380 |
| Pro | 10 | $490 |
| **Total** | **60** | **$870** |

### Corporate — Realistic Month 6 Projection

| Tier | Accounts | MRR |
|------|----------|-----|
| Team | 5 | $395 |
| Scale | 2 | $298 |
| Growth | 0 | $0 |
| **Total** | **7** | **$693** |

### Combined Month 6: ~$1,563 MRR

---

## Privacy Commitment (Corporate — Must Be Explicit)

> Frugal logs: model name, token count, cost, timestamp, employee ID.
> Frugal never logs: prompt content, completion content, or any message data.

This is table stakes for corporate. Legal and IT will ask. Answer before they ask.

---

## Validation Checklist

- [x] Clear value metric per line
- [x] Distinct persona per tier (no overlap)
- [x] Conversion-safe entry tier (Free for personal)
- [x] Feature walls drive natural upgrades
- [x] Expansion path: Free → Plus → Pro → Team → Scale → Growth
- [x] Annual discount structured (2 months free framing)
- [x] Enterprise handled (Growth = contact, no public anchor)
- [x] Not too cheap — Free has real limits, Team floor is $79
- [x] Not too expensive — Plus at $19 is impulse buy, Team at $79 is <5% of typical AI budget managed

---

## Open Questions Before Launch

1. Does Free tier allow Anthropic + OpenAI simultaneously, or just 1 total?
2. Does Plus "throttle" action require proxy mode — or is throttle personal-line only in Pro?
3. Corporate Growth — what is the floor price in sales conversations?
4. Do Team/Scale users also get personal Pro features, or are lines fully separate?
