# FINANCIAL MODEL — Frugal
## 12-Month Revenue Projections + Unit Economics
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. Assumptions (all stated explicitly)

| Assumption | Value | Type | Confidence |
|-----------|-------|------|-----------|
| Month 1 landing page visitors | 500 | ASSUMED | MEDIUM |
| Email-to-trial conversion | 20% | ASSUMED | MEDIUM (Reddit SaaS benchmark: 10–30%) |
| Trial-to-paid conversion | 40% | ASSUMED | MEDIUM (pain-aware audience, not cold traffic) |
| Average revenue per user (ARPU) | $35/month | ASSUMED | MEDIUM (mix of $19 Founder Beta + $49 Growth) |
| Monthly churn | 8% | ASSUMED | MEDIUM (Indie Hackers SaaS benchmark: 5–12%) |
| MoM visitor growth (months 1–4) | 40% | ASSUMED | LOW (dependent on community traction) |
| MoM visitor growth (months 5–8) | 25% | ASSUMED | LOW |
| MoM visitor growth (months 9–12) | 15% | ASSUMED | LOW |
| CAC | $0 | SOURCED | HIGH (organic-only distribution, June 2026) |

---

## 2. Three Scenarios — MRR by Month

| Month | Pessimistic | Realistic | Optimistic |
|-------|------------|-----------|-----------|
| 1 | $70 | $175 | $350 |
| 2 | $130 | $380 | $800 |
| 3 | $200 | $650 | $1,600 |
| 4 | $280 | $1,050 | $2,900 |
| 5 | $360 | $1,600 | $4,500 |
| 6 | $440 | $2,200 | $6,800 |
| 7 | $510 | $2,900 | $9,000 |
| 8 | $570 | $3,700 | $11,500 |
| 9 | $620 | $4,400 | $14,000 |
| 10 | $660 | $5,100 | $17,000 |
| 11 | $700 | $5,800 | $20,000 |
| 12 | $750 | $6,500 | $24,000 |

**Key milestones (realistic scenario):**
- $300 MRR (covers costs): Month 2
- $1k MRR: Month 4
- $5k MRR: Month 10
- $10k MRR: Month 13–14

---

## 3. Cost Structure

### Fixed costs per month
| Item | Month 1–2 | Month 3–6 | Month 7–12 |
|------|----------|----------|-----------|
| Vercel | $0 (free) | $20 (Pro) | $20 |
| Supabase | $0 (free) | $25 (Pro) | $25 |
| Upstash (Redis + QStash) | $0 (free tier) | $10 | $25 |
| Resend (email) | $0 (free tier) | $0 | $20 |
| Sentry (error tracking) | $0 (free) | $0 | $26 |
| Domain + SSL | $15/year = $1.25/mo | $1.25 | $1.25 |
| **Total infrastructure** | **~$1.25** | **~$56** | **~$117** |

### Variable costs
- Stripe payment processing: 2.9% + $0.30 per transaction
- At $2,200 MRR (50 users, avg $44/transaction): ~$65/month in fees

### Total costs at $2,200 MRR (month 6): ~$121/month
### Net at $2,200 MRR: ~$2,079/month

---

## 4. Unit Economics

| Metric | Value | Basis |
|--------|-------|-------|
| ARPU | $35/month | Mix of $19 Starter + $49 Growth |
| Churn rate | 8%/month | ASSUMED MEDIUM |
| Average customer lifetime | 12.5 months (1 / 0.08) | Derived |
| LTV | $437 ($35 × 12.5) | Derived |
| CAC | $0 | Organic distribution |
| LTV:CAC | Infinite at $0 CAC | Derived |
| Gross margin | ~95% | Infrastructure <5% of revenue |
| Payback period | Immediate | $0 CAC |

---

## 5. Funding Threshold

Seed-fundable metrics (typical YC/angel bar for B2B SaaS):
- MRR: $5k–$15k
- MoM growth: 10–20%+
- Retention: <10% monthly churn
- Users: 100–300 paying

Frugal reaches this threshold in the realistic scenario between months 10–12. With the optimistic scenario (strong HN/Product Hunt launch), potentially month 6–8.

**What to show investors:**
1. MRR chart (exponential curve matters more than absolute number)
2. Connected APIs per user (activation metric)
3. Churn rate (retention story)
4. The DeepVid story + $500M news hook (why this, why now, why Nilesh)

---

## 6. Break-Even Analysis

Break-even on infrastructure costs: Month 1 (3 users at $19 Starter = $57 > $1.25 infra cost)
Break-even on full costs at $2,200 MRR: MRR > $121/month = Month 2 in realistic scenario
