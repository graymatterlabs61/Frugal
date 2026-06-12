# CONCEPT — Frugal
## Master Project Brief
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## The Idea in One Paragraph

Frugal is an AI API cost management layer for developers building on OpenAI, Anthropic, Replicate, and fal.ai. Connect your provider accounts in 2 minutes, see real-time spend broken down by project, user, and feature, set daily or monthly budget limits per project, and receive automatic alerts before you hit your ceiling. When a budget limit is crossed, Frugal throttles the API call or blocks it entirely — depending on the rule you set. The founder of Frugal shipped DeepVid AI to 50k users and $3,500 MRR, then watched it die because a traffic surge caused API costs to spiral with no controls in place. In May 2026, an unnamed company spent $500 million on Claude AI in a single month for the same reason. Frugal is the tool that would have saved both.

---

## The Numbers

| Metric | Value | Source |
|--------|-------|--------|
| Market | AI developer tools, $28.5B TAM (2025), 22% CAGR | Grand View Research, 2025 |
| Feasibility | 51/60 | GML-FEA analysis |
| Founder fit | 33/40 | GML-WHY analysis |
| Target MRR Month 6 | $2,200 (realistic) / $6,800 (optimistic) | GML-RFA model |
| Infrastructure cost | $0–120/month | GML-FEA |
| CAC | $0 | Organic distribution |

---

## The Sharpest Risk

OpenAI or Anthropic ships native per-project budget controls with automatic throttling inside their own dashboards, removing the core value proposition for single-provider users. Counter: multi-provider support is the moat no single provider can build.

---

## The First 7 Days

**Day 1:** Build and publish the landing page. Hero: "$500M Claude story + DeepVid story." CTA: Free beta signup.

**Day 2–3:** Post on r/SideProject and r/webdev ("looking for beta testers" format). DM every signup within 24 hours.

**Day 4:** Post "Ask HN: How do you manage AI API costs before they spiral?" Start building: Supabase schema + auth.

**Day 5–6:** Evaluate signup and DM response quality. If 35 signups + 12 specific pain stories = build the product. If not, reframe.

**Day 7:** OpenAI usage polling worker live. First real spend data in the dashboard.

---

## Documents in This Package (16 files)

| File | Description |
|------|-------------|
| PRD.md | Product requirements, user stories, acceptance criteria, success metrics |
| TRD.md | Technical requirements, stack, security, performance, scaling |
| ARCHITECTURE.md | C4 model, system design, ADRs, data model, scaling path |
| BRD.md | Business objectives, KPIs, risk register, ROI model |
| MRD.md | Market size, competitive landscape, positioning, segments |
| COMPETITIVE.md | Competitor matrix, attack/defense strategy, positioning map |
| MARKETING_PLAN.md | GTM strategy, 30-day launch plan, 30-post content calendar |
| LAUNCH_PLAN.md | 6-week pre-launch checklist, launch day playbook, 30-day sprint |
| PERSONAS.md | 3 ICPs with buyer journeys, objection handling scripts |
| FINANCIAL_MODEL.md | 12-month projections (3 scenarios), unit economics, cost structure |
| LEGAL_CHECKLIST.md | India + global compliance, DPDP, GDPR, Stripe, entity structure |
| DESIGN.md | Brand palette, typography, component style, 3 screen wireframes |
| AGENTS.md | Full project context for AI coding agents, file structure, conventions |
| CLAUDE.md | Condensed context for Claude Code sessions |
| README.md | Public-facing project overview and setup instructions |
| CONCEPT.md | This file — master brief linking all documents |

---

*Gray Matter Labs — GML-IOS v2.0 | Ideation first. Documents second. Ship something real. | @aiwithnilesh*
