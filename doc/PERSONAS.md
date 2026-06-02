# PERSONAS — Frugal
## Ideal Customer Profiles
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## ICP 1 — Arjun, the Solo AI Builder

**Name + archetype:** Arjun — 26-year-old solo developer building an AI-powered SaaS product in India, currently at the "post-launch, early traction" stage.

**Situation:** Arjun launched his AI writing tool 3 months ago. He has 200 users, 15 paying. He's integrating OpenAI GPT-4o for generation and Anthropic Claude Haiku for classification. His OpenAI bill was $45 last month. This month a Reddit post drove a traffic spike and he has no idea what his bill will look like. He checks his OpenAI dashboard twice a day but it only shows totals, not which feature or which user is driving spend.

**Pain intensity:** 7/10 — Evidence: He has already started building a manual cap in his app logic (a custom token counter) to protect himself. That's 4 hours of engineering he didn't need to spend.

**Trigger:** His OpenAI invoice lands and it's double what he budgeted. He Googles "how to set OpenAI spending limit per project."

**Willingness to pay:** $19–29/month — Evidence: He pays $12/month for Vercel Pro, $25/month for Supabase Pro, $20/month for Resend. He has established SaaS tooling spend already.

**Where he is online:** r/webdev, r/SideProject, Indie Hackers, HN, @levelsio Twitter community.

**How he buys:** Self-serve trial. Reads the pricing page, starts the free tier, upgrades when he hits the first limit or receives his first alert.

**Primary objection to switching:** "I already built a basic token counter in my app. Is this meaningfully better?" — Counter: Frugal works across all providers, tracks at user-level not token-level, and fires alerts before limits are hit, not after.

**Buyer journey:**
1. Discovers via Reddit post or HN thread
2. Lands on frugal.dev, reads the DeepVid story, recognizes himself
3. Signs up for free tier (1 API, no credit card)
4. Connects OpenAI account, sees dashboard
5. First meaningful alert fires within a week
6. Upgrades to $19 Starter within 30 days

**Reach channel:** r/SideProject, r/webdev, cold DM on Twitter/X, GitHub outreach (projects using OpenAI API with recent commits)

---

## ICP 2 — Sofia, the Small AI Startup CTO

**Name + archetype:** Sofia — 29-year-old CTO of a 4-person AI startup, building a B2B document processing product using OpenAI, Anthropic, and Replicate simultaneously.

**Situation:** Sofia's product is in beta with 30 clients. Different clients use different AI features. She has no way to know which client is the most expensive to serve. Her team's AI API bill hit $2,300 last month. She suspects 2-3 clients are causing 60% of the cost, but cannot prove it without manually parsing logs. She needs to price her contracts correctly but doesn't have the data.

**Pain intensity:** 9/10 — Evidence: She is actively misquoting enterprise contracts because she can't estimate per-client AI costs. This is a direct revenue leakage problem.

**Trigger:** She loses a pricing negotiation with a client because she can't show the client what their usage actually costs.

**Willingness to pay:** $49–99/month — Evidence: Her team pays $200+/month for linear, Notion, Slack, Vercel combined. A tool that helps price contracts correctly pays for itself with one corrected deal.

**Where she is online:** Twitter/X developer circles, LinkedIn (for B2B content), HN, specific AI developer Discords.

**How she buys:** Tries the free tier, immediately sees per-user/per-client attribution value, upgrades to Growth ($49) or Pro ($99) within the first week.

**Primary objection:** "We're already using Helicone for logging — why do we need another tool?" — Counter: Helicone shows logs. Frugal shows costs with automatic enforcement. Different job.

**Buyer journey:**
1. Discovers via Twitter thread or HN
2. Lands on frugal.dev, sees "per-user cost attribution" in feature list
3. Signs up, connects all 3 providers
4. Immediately sees which clients are expensive
5. Upgrades to Growth or Pro on day 1 or 2
6. Refers to 2 other CTO contacts within 30 days

**Reach channel:** Twitter/X AI builder community, cold outreach via LinkedIn, YC startup Slack communities

---

## ICP 3 — Rahul, the AI Agency Developer

**Name + archetype:** Rahul — 31-year-old developer at a 6-person AI agency in Bengaluru. His agency builds AI features for clients and bills them monthly. Clients are billed flat-rate but costs are variable.

**Situation:** Rahul's agency built 4 client projects that all use AI APIs. The agency pays the API bills and recharges clients. But they have no way to accurately attribute costs per client. Some months one client subsidizes another. His boss wants per-client cost reports but they don't exist.

**Pain intensity:** 8/10 — Evidence: His agency lost margin on 2 client projects last quarter because AI usage spiked and they ate the cost.

**Trigger:** A client asks for a detailed breakdown of their AI usage costs. Rahul has no report to give them.

**Willingness to pay:** $49–99/month — Evidence: The agency pays for multiple SaaS tools. A tool that helps them bill clients accurately and protect margins on projects is directly profitable.

**Where he is online:** LinkedIn, agency Slack groups, r/webdev, local developer communities.

**How he buys:** Decision requires 2-day team check-in. Signs up for free tier, shows the dashboard to his boss, gets approval to upgrade to Pro.

**Buyer journey:**
1. Finds Frugal via LinkedIn post or r/webdev
2. Signs up, connects client project APIs
3. Shows per-project cost breakdown to boss
4. Boss approves $99/month Pro plan immediately
5. Agency adds Frugal cost report to client invoicing workflow

**Reach channel:** LinkedIn AI/developer content, r/webdev, direct outreach to AI agencies on Upwork/Clutch

---

## Objection Handling Scripts

**"I just check the OpenAI dashboard manually."**
"The OpenAI dashboard shows you what happened. Frugal stops it from happening. When was the last time your OpenAI bill surprised you? That's the gap."

**"I built my own token counter."**
"Token counters track tokens. Frugal tracks dollars across every provider you use, per user, per project — and fires an alert before you hit your limit, not after. How long did building your counter take?"

**"Helicone already does this."**
"Helicone is an observability tool. It logs your requests and shows you what happened. Frugal enforces budget rules and automatically throttles before you hit them. Different job."

**"It's too early for us — we're not spending much on AI APIs yet."**
"That's the best time to set it up. The founders who lose products to API costs are always the ones who set up controls after the first bad month, not before."
