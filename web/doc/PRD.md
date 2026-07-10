# PRD — Frugal
## Product Requirements Document
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. Problem Statement

Developers building AI-powered products on APIs (OpenAI, Anthropic, Replicate, fal.ai, ElevenLabs) have no reliable way to:

- Know how much they are spending in real time, broken down by project, user, or feature
- Set and enforce budget limits that automatically trigger before damage occurs
- Automatically throttle or block expensive calls when spend exceeds a threshold
- Attribute costs to individual end users consuming the product

The result: unexpected billing events that range from painful ($800 surprise bills) to catastrophic ($500M in a single month, as reported in May 2026). The founder of Frugal lost a product with 50k users and $3,500 MRR to this exact failure mode in 2025.

---

## 2. Goals

| Goal | Metric | Timeframe |
|------|--------|-----------|
| Reach first paying customer | 1 paid user | Week 2 post-launch |
| Validate PMF | 35 beta signups + 12 pain-story DM replies | Week 1 |
| Reach $1k MRR | 25–50 paying users | Month 4 |
| Reach $5k MRR | 100–150 paying users | Month 9 |

---

## 3. Users

**Primary ICP:** Solo developers and small teams (1–5 people) building AI-powered SaaS products, spending $200–$5,000/month on AI APIs.

**Beachhead segment:** Developers who have already experienced at least one unexpected AI API cost spike. They need no education on the problem — only a solution.

**Secondary ICP:** AI agencies building AI features for clients who need per-client cost attribution and reporting.

---

## 4. User Stories & Acceptance Criteria

### 4.1 API Connection

**US-001** — As a developer, I must be able to connect my OpenAI account so that Frugal can track my usage in real time.
- Acceptance: User enters API key, Frugal validates it, and begins polling usage data within 60 seconds. Gherkin:
  ```
  Given a valid OpenAI API key is entered
  When the user clicks Connect
  Then Frugal displays spend data within 60 seconds
  And shows a green Connected status indicator
  ```

**US-002** — Frugal must support: OpenAI, Anthropic, Replicate, fal.ai. It should support ElevenLabs and Cohere in v1.1.

**US-003** — A user must be able to connect multiple providers under a single Frugal account.

---

### 4.2 Real-Time Dashboard

**US-004** — As a developer, I must see my current spend broken down by provider, project, and date range so I can understand where costs are coming from.
- Acceptance: Dashboard updates within 5 minutes of new API usage. Gherkin:
  ```
  Given a user has connected at least one API
  When they open the dashboard
  Then spend is displayed by provider and project
  And the data is no more than 5 minutes stale
  ```

**US-005** — I must be able to see spend per individual end user of my product so I can identify high-cost users.

**US-006** — The dashboard should show a burn rate indicator: estimated monthly spend at current usage pace.

---

### 4.3 Budget Rules

**US-007** — As a developer, I must be able to set a monthly spending limit per project so that I am protected from runaway costs.
- Acceptance: When spend reaches the configured limit, the configured action triggers within 5 minutes. Gherkin:
  ```
  Given a project has a $200 monthly limit set
  When cumulative spend in the current calendar month reaches $200
  Then the configured action (alert / throttle / block) triggers within 5 minutes
  ```

**US-008** — Budget actions must include: Alert only, Throttle (downgrade to a cheaper model), Block (return error to the calling app).

**US-009** — A user must be able to set both daily and monthly limits independently per project.

**US-010** — Budget rules may support per-user limits (cap individual end users of my product) in v1.1.

---

### 4.4 Alerts

**US-011** — As a developer, I must receive an email alert when my project spend reaches 80% of the configured limit, so I have time to act before the limit hits.
- Acceptance: Email sent within 5 minutes of crossing 80% threshold.

**US-012** — I must be able to configure Slack alerts as an alternative or addition to email.

**US-013** — Alerts must include: current spend, configured limit, % used, estimated hours until limit is hit at current burn rate.

---

### 4.5 Alert Log

**US-014** — As a developer, I must be able to see a log of all past threshold breaches with context (which project, which model, timestamp, spend at time of breach) so I can audit and improve my budget rules.

---

## 5. Out of Scope — v1.0

- LLM evaluation and quality scoring (Helicone/LangSmith territory — not our market)
- Prompt logging and replay
- Model routing / fallback chains (Portkey territory)
- Mobile app
- Team collaboration features (v1.1)
- API access for programmatic budget management (v1.1)

---

## 6. Success Metrics

| Metric | Formula | Target at Month 6 |
|--------|---------|-------------------|
| Connected APIs per active user | Total connected APIs / Active users | ≥ 2.5 |
| Weekly active users | Users who open dashboard ≥ 1x/week | ≥ 60% of paid users |
| Alert-to-upgrade rate | Users who upgrade within 7 days of first alert | ≥ 25% |
| MRR | Sum of active subscriptions | $2,200 (realistic) |
| Churn | Cancelled users / Total users per month | ≤ 8% |

**OMTM:** Connected AI API accounts per active user. A user with 3+ connected APIs has real switching costs and is fully activated.

---

## 7. Constraints

- Must ship MVP in under 6 weeks from decision date
- Must reach first paying customer within 14 days of launch
- Infrastructure cost must stay under $200/month until 100 paying users
- Solo developer build — no features requiring a backend team or third-party specialist
