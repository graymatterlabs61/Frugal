# MRD — Frugal
## Market Requirements Document
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. Market Context

AI API usage among developers has grown exponentially since 2023. As of mid-2026, the majority of new SaaS products include at least one AI API integration. The cost management tooling has not kept pace with this adoption curve.

**The timing signal:** In May 2026, a major unnamed company reported spending $500 million on Claude AI in a single month after failing to set usage limits on employee licenses. Simultaneously, Uber burned through its entire 2026 AI budget by April, and Microsoft cut Claude Code licenses due to cost overruns. This cluster of high-profile cost failures signals that AI API cost management has moved from a nice-to-have to an urgent infrastructure need.
[Source: Economic Times, Tom's Hardware, Fast Company — May 2026]

---

## 2. Market Size

- **TAM:** Global developer tools market — $28.5 billion (2025), growing at ~22% CAGR [Grand View Research, 2025]. Frugal addresses the AI tooling sub-segment.
- **SAM:** Developers building AI-powered SaaS products globally who spend >$100/month on AI APIs — estimated 500,000–2M developers as of 2026. At $35 average ARPU: $210M–$840M SAM.
- **SOM (12-month target):** 185 paying users × $35 avg ARPU × 12 months = $77,700 ARR. Achievable through organic channels with zero paid acquisition.

*Note: TAM/SAM figures are estimates based on developer population data. No verified SOM data available for this specific sub-category.*

---

## 3. Target Segments

| Segment | Description | Size | Priority |
|---------|-------------|------|---------|
| Solo AI builders | Individual developers running AI products, spending $200–$2k/month on APIs | Large, growing | Primary |
| Small AI startups | 2–5 person teams with multiple AI API integrations | Medium | Primary |
| AI agencies | Studios building AI features for clients, need per-client cost attribution | Medium | Secondary (v1.1) |
| Enterprise AI teams | Large orgs, the $500M bill story — require compliance and audit trails | Large but long sales cycle | Future |

---

## 4. Competitive Landscape

| Competitor | Focus | Pricing | Cost-Specific Gap |
|-----------|-------|---------|------------------|
| Helicone | LLM observability, logging, evaluation | Free (10k req) / Pro $20/seat | Tracks costs but no automatic budget enforcement or throttling |
| Portkey | AI gateway, routing, fallbacks | Usage-based | Multi-provider routing focus, cost management secondary |
| LangSmith | LangChain evaluation, tracing | $39/user/month | Evaluation-focused, no budget rules |
| Lunary | Open source LLM telemetry | Free (self-host) / Cloud paid | Observability only, no enforcement |
| OpenAI Dashboard | Built-in usage view | Free (with account) | Shows historical usage, no real-time limits or automatic throttling |
| Anthropic Console | Built-in usage view | Free (with account) | Shows usage, no limits, no cross-provider view |

**Industry hate gap:** Every tool shows you what happened. None of them stop it from happening.

**Positioning white space:** Automatic budget enforcement with cross-provider visibility. No current tool combines real-time multi-provider spend tracking with automatic throttling triggered by user-defined rules.

---

## 5. Positioning Statement

For developers building AI-powered products who have lost — or nearly lost — revenue to runaway API costs, Frugal is the cost management layer that monitors, caps, and alerts before a good week turns into a billing disaster — unlike every provider dashboard in existence, which shows you the damage only after it is done.

---

## 6. Positioning Map

```
                    HIGH ENFORCEMENT
                          |
                          |
                       [Frugal]
                          |
LOW VISIBILITY --------[---|---]---------- HIGH VISIBILITY
                          |
              [OpenAI]  [LangSmith]  [Helicone]
              [Anthropic]         [Portkey]
                          |
                    LOW ENFORCEMENT
```

Frugal owns the top-right quadrant: high visibility + high enforcement. No current competitor is positioned there.
