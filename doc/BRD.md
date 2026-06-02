# BRD — Frugal
## Business Requirements Document
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. Business Objective

Build and launch Frugal — an AI API cost management SaaS — to achieve:

1. $300–500 MRR by month 3 (covers operating costs, validates the market)
2. $2,200 MRR by month 6 (confirms growth trajectory)
3. $5,000+ MRR by month 9 (seed-fundable traction)
4. Sufficient metrics to apply for seed funding (YC, angel round) by month 10–12

The business operates as a sole proprietorship under Gray Matter Labs, Gurugram, India, with global customers billed in USD via Stripe.

---

## 2. Stakeholders

| Stakeholder | Role | Interest |
|-------------|------|---------|
| Nilesh Kumar | Founder, sole builder | Revenue, product, growth |
| Beta users (developers) | Primary customers | Solving API cost overrun problem |
| Stripe | Payment processor | Transaction fees |
| YC / Angel investors | Future stakeholders | Traction metrics, founder story |

---

## 3. Business KPIs

| KPI | Measurement | Target at Month 6 |
|-----|------------|-------------------|
| MRR | Sum of active subscriptions | $2,200 |
| Paying users | Count of active paid subscriptions | 50–80 |
| Churn rate | Cancelled / total users per month | ≤ 8% |
| CAC | Total acquisition spend / new paid users | $0 (organic only) |
| Connected APIs per user | Avg APIs connected per active user | ≥ 2.5 |
| NPS | Monthly 1-question survey | ≥ 40 |
| Free-to-paid conversion | Free users who upgrade within 30 days | ≥ 20% |

---

## 4. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| OpenAI builds native budget controls | MEDIUM | HIGH | Multi-provider strategy is the moat. Ship cross-provider budgeting before any single provider can replicate it. |
| Reddit/HN launch does not generate signups | MEDIUM | HIGH | Pivot to cold outreach (DM developers with AI repos on GitHub). Have 50 targets ready before launch. |
| API rate limits prevent accurate polling | LOW | MEDIUM | Cache usage data, implement exponential backoff, document polling limitations clearly. |
| Stripe rejects India-based account | LOW | HIGH | Use Lemon Squeezy as backup payment processor, which explicitly supports Indian founders. |
| Churn exceeds 15% in month 2 | MEDIUM | HIGH | Instrument everything. Interview every churned user within 24 hours of cancellation. |
| Solo builder burnout | MEDIUM | MEDIUM | 6-week scoped MVP. No scope creep until first $1k MRR. |

---

## 5. ROI Model

**Assumptions:**
- $0 acquisition cost (organic channels)
- $80/month infrastructure cost at 100 users
- $0 salary (founder stage)
- Average revenue per user: $35/month

| Milestone | Users | MRR | Monthly Cost | Net |
|-----------|-------|-----|-------------|-----|
| Month 1 | 5 | $175 | $0 | $175 |
| Month 3 | 20 | $700 | $30 | $670 |
| Month 6 | 60 | $2,200 | $80 | $2,120 |
| Month 9 | 120 | $4,200 | $200 | $4,000 |
| Month 12 | 185 | $6,500 | $350 | $6,150 |

**Breakeven:** Month 1 (infrastructure costs are covered by first 3 paying users on $19 Starter plan).

---

## 6. Go / No-Go Criteria

**Go (build the full product):**
- 35+ email signups from validation landing page in week 1
- 12+ DM replies with specific cost horror stories
- At least 3 people say "I'd pay $49/month for this right now"

**No-Go (reframe the product):**
- Fewer than 15 signups from 300 landing page visits
- Zero people describe a specific prior API cost incident
- Redirects to "I just check the dashboard manually" — indicates low pain intensity
