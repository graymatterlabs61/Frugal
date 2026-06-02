# MARKETING PLAN — Frugal
## Go-To-Market Strategy
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. GTM Summary

**Product:** Frugal — AI API cost management for developers
**Launch window:** June–July 2026 (news hook: $500M Claude bill story is fresh)
**Distribution:** 100% organic — Reddit, Hacker News, Indie Hackers, Product Hunt, build-in-public content
**CAC target:** $0 for first 6 months
**Revenue target:** $300–500 MRR by month 3

---

## 2. Channels & CAC Estimates

| Channel | Estimated CAC | Expected Volume | Priority |
|---------|--------------|----------------|---------|
| Reddit (r/SideProject, r/webdev, r/ClaudeAI) | $0 | 20–80 signups per post | Week 1 |
| Hacker News (Show HN) | $0 | 50–300 signups per front page | Week 1 |
| Indie Hackers | $0 | 10–40 signups | Week 2 |
| Product Hunt | $0 | 100–500 signups on launch day | Month 2 |
| Build in public (@aiwithnilesh) | $0 | 5–20 signups/post initially; grows with audience | Ongoing |
| Cold GitHub outreach | $0 | 2–5% response rate on 100 targets | Month 2 |

*Attribution tracking: UTM parameters on all links. Use Supabase to track signup source.*

---

## 3. Launch Message

**Headline:** "A company just spent $500M on Claude AI because nobody set a limit. I lost my own product to the same problem. Built a fix."

**Supporting story:** DeepVid AI hit 50k users and $3,500 MRR, then died because API costs spiraled with no controls in place. Frugal is the tool that would have saved it.

**CTA:** "Free tier — 1 API connected, real-time alerts, no credit card."

---

## 4. Week-by-Week 30-Day Launch Plan

**Week 1 — Validation & Soft Launch**

Day 1–2: Build and publish the landing page (getfrugal.dev or frugal.dev)
- Hero: $500M Claude story + DeepVid story as 4-sentence personal hook
- Features: 3 bullet points only
- CTA: Free beta signup (email capture)
- Pricing: Show all tiers clearly — $0 / $19 / $49 / $99

Day 3: Post on r/SideProject ("looking for testers" format — see LAUNCH_PLAN.md)
Day 4: Post on r/webdev (problem-focused, not product-focused)
Day 5: Post on r/ClaudeAI (link to $500M article + your solution)
Day 6: DM every signup within 24 hours: "What's the worst API bill you've ever gotten?"
Day 7: Compile replies. If 12+ describe specific cost incidents → build the product.

**Week 2 — Hacker News & Indie Hackers**

Day 8: Post "Ask HN: How do you manage AI API costs before they spiral?"
Day 9: Write and post Indie Hackers milestone post: "How I validated my idea in 7 days after my last product died from API costs"
Day 10–12: Start building v1.0 (auth + API connection + OpenAI polling + dashboard)
Day 13–14: DM 20 developers on GitHub who have AI projects (search: stars, recent commits, uses OpenAI API)

**Week 3–4 — Build + Build-in-Public**

Tweet / post daily on @aiwithnilesh (even at 20–30 followers, this builds the archive for when audience grows):
- Screenshot of real dashboard data
- Screenshot of first alert firing
- "Day 12 of building Frugal — added Anthropic support"
- Share beta user feedback anonymously

Goal: First paying customer by Day 14–21.

---

## 5. 30-Post Content Calendar for @aiwithnilesh

| # | Post Type | Topic |
|---|-----------|-------|
| 1 | Story | "I shut down DeepVid AI because of a bill I didn't see coming. Here's what happened." |
| 2 | Hook | Share the $500M Claude story with commentary |
| 3 | Announcement | "Building Frugal — the tool that would have saved DeepVid" |
| 4 | Build log | "Day 3: Auth is live on Frugal. Here's the stack I'm using." |
| 5 | Insight | "Why your OpenAI dashboard is lying to you about your real costs" |
| 6 | Build log | "Day 7: First real spend data flowing in from OpenAI API" |
| 7 | Tip | "3 ways AI API costs can kill a healthy product (and how to spot them)" |
| 8 | Social proof | "First beta tester connected. Here's what their dashboard looks like." |
| 9 | Build log | "Day 12: Anthropic integration done. Frugal now covers both providers." |
| 10 | Insight | "The difference between an observability tool and a cost management tool" |
| 11 | Behind the scenes | "How I'm polling 4 AI provider APIs without blowing my own budget" |
| 12 | Build log | "Day 17: Alert system live. Set a $50/day limit and watched it fire." |
| 13 | Milestone | "First paying customer on Frugal" |
| 14 | Question | "What's the most you've ever spent on AI APIs in a single day?" |
| 15 | Build log | "Day 21: Slack alerts working. Here's the webhook setup." |
| 16 | Insight | "Why per-user cost attribution matters for AI products (with numbers)" |
| 17 | Tip | "How to set AI API budget limits that actually protect your margins" |
| 18 | Build log | "Day 25: Stripe integration done. Frugal is officially open to paying customers." |
| 19 | Social proof | "5 paying users. Here's what they said about the first alert they received." |
| 20 | Behind the scenes | "How Frugal's polling architecture works (no proxy, no latency)" |
| 21 | Milestone | "Week 4 revenue update: $X MRR" |
| 22 | Insight | "The 3 types of AI apps most at risk from cost overruns" |
| 23 | Product | "New: Daily cost reports via email. Here's an example." |
| 24 | Build log | "Replicate and fal.ai support live on Frugal" |
| 25 | Question | "Would you rather pay per API call or flat rate for cost management? Why?" |
| 26 | Tip | "5 budget rules every AI product should have before going public" |
| 27 | Social proof | "10 paying users. Here's the feedback that shaped the product." |
| 28 | Milestone | "Product Hunt prep: launching next week" |
| 29 | Announcement | "Frugal is live on Product Hunt today" |
| 30 | Story | "30 days of building Frugal: what worked, what failed, what's next" |

---

## 6. Product Hunt Launch Plan (Month 2)

- Submit to Product Hunt on a Tuesday or Wednesday (highest traffic days)
- Hunter: Reach out to a developer with 500+ followers to hunt the product
- Gallery: 5 screenshots — dashboard, budget rules, alert log, per-user view, Slack alert
- Tagline: "Control your AI costs before they control you"
- First comment: The DeepVid story in 5 sentences
- Ask beta users to upvote and comment on launch day
- Goal: Top 5 Product of the Day
