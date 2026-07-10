# Frugal — Pre-Launch Marketing Playbook

**Product:** AI API cost management SaaS  
**Stage:** Pre-launch, solo founder, zero follower base  
**Goal:** Organic reach → waitlist signups → early access users  
**Budget:** $0 (organic only)

---

## 1. Market Context (Why This Works)

### The Opportunity
- OpenAI alone has **2M+ developers** using its API
- Add Anthropic, Replicate, fal.ai, Cohere → **3–5M active AI API builders**
- Every one of them has either been burned by a surprise bill or lives in fear of one
- No native hard-stop budget controls exist on any major provider

### TAM / SAM / SOM (Bottom-Up)
| Tier | Calculation | Size |
|------|-------------|------|
| **TAM** | 5M AI API devs × $120/yr avg spend on dev tools | **$600M** |
| **SAM** | 1M devs with >$50/mo AI spend (have the pain acutely) | **$120M** |
| **SOM (Y3)** | 2% of SAM | **$2.4M ARR** |

**Investor framing:** "$600M TAM, 1M devs feeling the pain right now, zero dominant player in AI budget management."

---

## 2. Channel Strategy (MFS-Scored, Pre-Launch Bias)

> Pre-launch bias: **Speed > Impact, Fit > Scale**. Zero paid. All organic.

| Channel | MFS | Why it wins |
|---------|-----|-------------|
| **Hacker News (Show HN)** | `+11` | Developers, high signal, story-driven, no followers needed |
| **Reddit (r/SideProject, r/webdev, r/artificial)** | `+10` | Community-first, organic reach ≠ follower count |
| **IndieHackers** | `+10` | Exact ICP: solo builders, high engagement with build-in-public |
| **X/Twitter threads** | `+8` | Compounding via RT, pain point posts go viral without audience |
| **LinkedIn** | `+7` | Slower but professional devs + decision-makers (CTOs, lead devs) |
| **Dev.to / Hashnode post** | `+9` | SEO compound value + dev community built-in |
| **ProductHunt** | `+6` | Launch amplifier (use after 50+ waitlist signups, not before) |

**Do not use right now:** Paid ads (MFS +2), TikTok (MFS -1), Instagram (MFS 0)

---

## 3. Psychology Framework Applied

> **PLFS** = Psychological Leverage & Feasibility Score  
> Applied per post type to maximize organic engagement.

### Top 4 Models for Organic Reach (Zero Followers)

| Model | PLFS | Where Applied |
|-------|------|---------------|
| **Loss Aversion** | `+13` | Lead every post with $-loss, not feature gain |
| **Social Proof (Distributed)** | `+12` | "Every dev using AI APIs has this problem" — normalize pain |
| **Specificity Bias** | `+12` | Use exact numbers ($2,300 > "huge bill") — triggers credibility |
| **IKEA Effect** | `+10` | Ask community for input → they become invested in product |

### Psychological Copywriting Rules (Apply to Every Post)
1. **Loss before gain** — "You've already lost money on AI bills you didn't catch" beats "Save money with Frugal"
2. **Specific > vague** — "$847 at 2am on a Sunday" > "unexpected charges"
3. **Problem first, product last** — 80% problem, 20% solution
4. **End with a question** — triggers comments, boosts algorithm on every platform
5. **No feature lists in awareness posts** — features kill organic reach

---

## 4. Post Battery — Platform by Platform

---

### PLATFORM 1: Hacker News

**Format:** Show HN post  
**When:** After you have a live demo (even rough)  
**Organic reach mechanic:** HN front page = 500K+ devs. No followers needed. Story + value = votes.

---

#### Post A — Show HN Launch

```
Title: Show HN: Frugal – Budget alerts and per-project spend tracking for AI APIs

I got hit with a $2,300 OpenAI bill after a weekend of prototyping. 
No alerts fired. I found out Monday morning.

The core problem: AI providers give you billing history, not budget control. 
There's no way to say "stop me at $100 on this project" or "alert me at 80% 
of my monthly limit."

So I built Frugal.

What it does:
- Polls OpenAI / Anthropic / Replicate / fal.ai usage APIs every 5 minutes
- Tracks spend per project (not just per account)
- Fires email + Slack alerts before you hit your budget
- API keys encrypted at rest with AES-256, never logged

Tech: Next.js 14, Supabase, Upstash QStash for the polling worker, Resend for emails.

Early access is open now: [link]

Happy to answer questions about the build, the polling approach, 
or why I chose this stack.
```

**Psychology applied:** Specificity Bias (exact number), Loss Aversion (loss already happened), Authority (built it myself = lived experience)

---

#### Post B — Ask HN (alternative, for earlier pre-launch)

```
Title: Ask HN: How do you manage AI API costs across multiple projects?

I'm building a tool for this after getting burned ($2,300 weekend surprise), 
but curious what everyone's current approach is.

Do you:
- Set usage limits on the provider side?
- Track spend manually?
- Use any third-party tools?
- Just accept the chaos?

Building something to solve this — would love to hear what's missing from 
existing approaches before I get too deep.
```

**Why this works:** Asks for community input (IKEA Effect) → builds interest before launch → HN rewards genuine curiosity → comment engagement signals product demand.

---

### PLATFORM 2: Reddit

**Format:** Problem-first post, value-first, product last paragraph  
**No follower dependency. Algorithm rewards engagement, not account age.**

---

#### r/SideProject — Post A (Build story)

```
Title: Built an AI API cost tracker after a $2,300 surprise bill — here's what I learned

Long story short: I had three projects running on GPT-4 Turbo over a weekend 
and forgot to check spend. Monday morning: $2,300 bill. No alerts. No hard stops. 
Just a credit card statement.

I looked for tools that would let me set per-project budgets. Nothing good existed.

So I built Frugal. Six weeks later, here's what the build taught me:

**The technical problem is harder than it looks**

AI provider APIs don't expose real-time spend. They expose usage data with a 
delay. So you have to poll, normalize units (tokens → $), and account for 
the fact that different models have wildly different per-token costs.

I ended up with a QStash-triggered worker that polls every 5 minutes, writes 
normalized usage records to Postgres, and compares against budget rules on 
every run.

**The UX problem is the real problem**

Developers don't want dashboards. They want to NOT think about this until 
they need to. So the product has to be zero-config once you connect an API key, 
and the alerts have to fire before the damage is done.

**What I'm still figuring out**

Hard cutoffs (actually blocking spend) require key rotation — complex but doable.

---

Early access is open if you want to try it: [link]

Anyone else been burned by unexpected AI bills? What's your current approach?
```

---

#### r/webdev — Post B (Pain point, no product mention until end)

```
Title: PSA: AI provider dashboards don't show you real-time spend. 
Found out the hard way.

If you're building on OpenAI or Anthropic APIs, worth knowing:

The usage dashboard is NOT real-time. There's a delay. And there are 
no native per-project budget limits — only account-level limits, and 
those don't fire alerts, they just cut off access.

I got a $2,300 bill last month from a weekend prototype. Three projects, 
GPT-4 Turbo, no monitoring.

Some options I've seen people use:
1. Set a low credit limit on the card you use for AI APIs
2. Create separate API keys per project and monitor individually
3. Write your own spend tracker (I did this)
4. Pray

What do people here do? Genuinely curious if there's a workflow I'm missing.

(For context: I'm building a tool specifically for this — frugal.so — 
but asking because I want to understand what other developers already do.)
```

**Psychology applied:** Social Proof (implies this happens to others), Reciprocity (sharing useful info first), Question hook drives comments.

---

#### r/artificial — Post C (Community intelligence)

```
Title: Does anyone track AI API costs per project? 
Looking for how people handle this.

Running multiple projects on different AI APIs — OpenAI for one thing, 
Anthropic for another, Replicate for image stuff.

The per-account dashboards are fine but I need per-project visibility. 
And I want alerts before hitting budget limits, not after.

Current approach: a spreadsheet and anxiety.

Is there a tool for this or is everyone rolling their own? 
Building something if not — happy to share when it's ready.
```

---

### PLATFORM 3: X / Twitter

**Format:** Threads for reach. Single posts for testing. No followers needed if RT happens.  
**Organic reach mechanic:** Pain point threads get RT'd by devs with audiences. One RT from a 10K account = your post.

---

#### Thread A — The Bill Shock Story (highest organic potential)

```
Tweet 1:
I got a $2,300 OpenAI bill on a Monday morning.

I spent the weekend prototyping. Three projects. GPT-4 Turbo.

No alerts fired. I found out from my credit card statement.

Here's what I learned building the fix 🧵

---

Tweet 2:
First thing I discovered: OpenAI's usage API has a delay.

You can't poll "what did I spend in the last 5 minutes" and get an accurate answer.

You poll, you normalize (tokens → dollars at current model rates), you compare 
to your last record. The delta is your spend window.

It's not hard but it's not obvious either.

---

Tweet 3:
Second thing: account-level limits are useless for multi-project devs.

If you have 5 projects on one API key, a $100 limit stops everything 
when project #3 runs hot.

You need per-project spend tracking, tied to per-project budget rules.

---

Tweet 4:
Third thing: devs don't want dashboards.

They want to forget about this until they need to.

That means: zero-config setup, background polling, alert fires before 
the damage is done. That's it.

---

Tweet 5:
So I built Frugal.

→ Connects to your AI provider APIs
→ Polls spend every 5 minutes per project
→ Alerts you at whatever % of budget you set
→ Works across OpenAI, Anthropic, Replicate, fal.ai

Early access open now: [link]

If you've ever been burned by an AI bill — that's exactly who I built this for.

---

Tweet 6 (engagement hook):
Question for devs:

What's your current approach to tracking AI API costs?

A) Check the dashboard manually
B) Set a card limit
C) Built something custom
D) Don't — just hope

Reply 👇 (genuinely curious what the baseline is)
```

---

#### Single Posts (Test these first — fastest signal)

```
Post 1:
Friendly reminder: OpenAI has no per-project budget limits.

One runaway script will eat your whole monthly budget before you notice.

I found out with a $2,300 bill. Built the alert system I wish existed.

→ [link]
```

```
Post 2:
Hot take: every developer using AI APIs is one forgotten loop 
away from a painful surprise.

The native dashboards are billing history, not budget control.

There's a difference. Most devs find out too late.
```

```
Post 3:
Things that don't exist natively in any AI API provider:

❌ Per-project budget limits
❌ Alerts before you hit a limit
❌ Real-time (< 5 min) spend tracking
❌ Multi-project spend breakdown

This is why I built Frugal. [link]
```

```
Post 4 (engagement bait):
Poll: Have you ever been surprised by an AI API bill?

A) Yes — over $100
B) Yes — over $500  
C) Not yet (still scared though)
D) I track it obsessively

[results normalize pain → social proof → shares]
```

```
Post 5 (build in public):
Week 6 of building Frugal solo.

What I've shipped:
✅ Supabase auth + Google OAuth
✅ API key encryption (AES-256)
✅ OpenAI usage polling worker
✅ Budget rule engine
✅ Email alerts via Resend

What's next:
→ Anthropic + Replicate support
→ Dashboard spend visualization
→ Hard cutoffs via key rotation

Building in public. Follow for the raw journey.
```

---

### PLATFORM 4: LinkedIn

**Format:** Long-form story, professional pain, CTA at end  
**Organic reach mechanic:** LinkedIn rewards dwell time + comments. Emotional posts outperform feature posts 10:1.

---

#### Post A — The $2,300 Story (Awareness)

```
I got a $2,300 OpenAI bill on a Monday morning.

I want to be honest about what that felt like as a solo builder.

It wasn't just the money (though that stung). It was the helplessness.

I had done everything "right" — separate projects, careful testing, 
local runs where possible. But I had three things running over the 
weekend and I forgot to check.

Here's what I discovered when I went looking for solutions:

There's no native way to set per-project budget limits on any major 
AI API provider. OpenAI, Anthropic, Replicate — none of them let you 
say "stop this project at $50" or "alert me when Project A hits 80% of budget."

You get account-level limits. You get billing history. That's it.

So I built Frugal.

It polls your AI provider APIs every 5 minutes, tracks spend per project, 
and fires alerts before you hit your limit — not after.

I'm opening early access now. If you or your team build on AI APIs, 
I'd love to have you try it.

→ [link]

One question I'm genuinely trying to answer: what would make this a 
must-have vs a nice-to-have for your workflow?

Reply in comments — I read every one.

#BuildingInPublic #AITools #DeveloperTools #Startup
```

---

#### Post B — The Systemic Problem (Consideration)

```
Most developers I talk to have one of two approaches to AI API costs:

1. Check the dashboard periodically and hope for the best
2. Set a hard credit limit on their card and accept the interruption risk

Neither is good enough.

The first fails because provider dashboards aren't real-time — 
there's a delay. You can blow through budget before the dashboard reflects it.

The second fails because a card limit stops all your projects, not just 
the one that ran hot.

What's missing is per-project, proactive monitoring. Know what Project A, 
Project B, and Project C are spending independently. Get an alert when 
any one of them approaches your threshold.

This is what I'm building with Frugal.

If you manage multiple AI projects — or you're on a team where different 
developers are hitting the same API keys — I'd love to talk to you before 
I finalize the feature set.

Drop a comment or DM me.

#AIEngineering #DevTools #BuildingInPublic #Startup
```

---

#### Post C — Founder Journey (Retention / Audience Building)

```
6 weeks ago I started building Frugal as a solo founder.

Here's what no one tells you about solo building:

The hardest part isn't the code.

It's choosing what to build when you have unlimited options and 
limited time. Every feature is a tradeoff. Every hour spent on one 
thing is an hour not spent on something else.

My forcing function: will this change whether someone signs up?

If no → skip it for now.

The stack I chose:
→ Next.js 14 (App Router)
→ Supabase (auth + database + RLS)
→ Upstash QStash (polling worker)
→ Resend (transactional email)
→ Stripe (billing, not wired yet)
→ Vercel (deployment)

No co-founder. No investors. Just a problem I couldn't stop thinking about 
and six weeks of evenings.

Early access is open: [link]

I'm building this in public. Follow if you want the unfiltered version 
of what it looks like to go from idea to launch solo.

What's the thing you'd most want from an AI API cost management tool?

#BuildingInPublic #SoloFounder #Startup #AITools
```

---

### PLATFORM 5: Dev.to / Hashnode (SEO Compound Value)

**Format:** Technical article — drives search traffic long-term + dev credibility now  
**Organic reach mechanic:** Evergreen search traffic. Dev community amplification. Backlink value.

---

#### Article A — "Why AI API Bills Are Unpredictable (And What To Do About It)"

```
Title: Why Your AI API Bills Are Unpredictable (And How to Fix It)

Slug: why-ai-api-bills-are-unpredictable

Hook: 
Last month I got a $2,300 OpenAI bill from a weekend of prototyping.
Here's exactly why it happened — and the architecture I built to prevent it.

Sections:
1. The problem: delayed usage data + no per-project limits
2. How provider APIs actually expose usage data (polling patterns)
3. Why account-level limits aren't enough for multi-project devs  
4. Architecture of a polling-based spend tracker (QStash + Supabase)
5. What "per-project tracking" actually means technically
6. The alerting logic (budget rules, thresholds, idempotency)
7. What I'm building: Frugal [link]

[~1500 words, code snippets, architecture diagram]

Target keywords:
- openai api cost management
- ai api budget tracking
- openai spending alert
- how to monitor ai api costs
```

---

#### Article B — "Building a Polling Worker on Upstash QStash"

```
Title: How I Built a 5-Minute AI API Polling Worker with Upstash QStash

[Pure technical content — establishes credibility, not sales]
[Mentions Frugal as context, not pitch]

Target keywords:
- upstash qstash tutorial
- nextjs background jobs
- polling worker nextjs
- qstash scheduled tasks
```

---

### PLATFORM 6: IndieHackers

**Format:** Milestone post + community question  
**Organic reach mechanic:** IH rewards build-in-public transparency. Exact ICP. High engagement.

---

#### Post A — Milestone (First 50 Waitlist)

```
Title: 0 → 50 waitlist signups for my AI cost tracking tool — 
here's what worked and what didn't

Background: I'm building Frugal, an AI API spend tracker that alerts 
you before you hit budget limits. Started because of a $2,300 OpenAI bill.

What drove signups:
- HN Ask post (35 signups, 0 upfront product pitch)
- One Reddit thread in r/SideProject (12 signups)
- LinkedIn post (3 signups, but better lead quality)

What didn't work:
- Tweeting features at 0 followers (0 signups, obviously)
- ProductHunt teaser (0 signups, too early)

What I'm testing next:
- Dev.to technical article
- X thread on the bill shock story
- Direct outreach to AI developers on IH

Revenue: $0 (pre-launch, waitlist only)
Stack: Next.js 14, Supabase, Upstash, Resend

Any IH founders who've done pre-launch waitlist → 
what was your highest-converting channel?
```

---

## 5. Organic Reach Rules (Non-Negotiable)

These apply to every post, every platform:

| Rule | Why |
|------|-----|
| **Lead with loss, not feature** | Loss Aversion (PLFS +13) drives 3× more engagement than gain framing |
| **Use exact numbers** | $2,300 > "huge bill". Specificity = credibility = shares |
| **End every post with a question** | Comments = algorithm signal on every platform |
| **80% problem, 20% product** | Community posts get downvoted if too promotional |
| **Post in communities first** | Communities > followers for zero-audience founders |
| **One clear CTA max** | Paradox of Choice — one action converts better than three |
| **Reply to every comment** | Replies extend post life on all algorithms |

---

## 6. Content Calendar (6-Week Pre-Launch Sequence)

| Week | Day | Platform | Post | Goal |
|------|-----|----------|------|------|
| 1 | Mon | X | Pain point poll (Post 4) | Test messaging |
| 1 | Wed | Reddit r/webdev | PSA post (Post B) | Community validation |
| 1 | Fri | LinkedIn | $2,300 story (Post A) | Professional reach |
| 2 | Mon | X | Bill shock thread (Thread A) | Viral potential |
| 2 | Wed | IndieHackers | Build-in-public milestone | ICP engagement |
| 2 | Fri | HN | Ask HN post (Post B) | Dev community signal |
| 3 | Mon | Reddit r/SideProject | Build story (Post A) | Warm community |
| 3 | Wed | Dev.to | Technical article A | SEO + credibility |
| 3 | Fri | X | "Things that don't exist" (Post 3) | Shareable statement |
| 4 | Mon | LinkedIn | Systemic problem (Post B) | Professional trust |
| 4 | Wed | HN | Show HN (when demo ready) | Launch moment |
| 4 | Fri | X | Build in public (Post 5) | Audience building |
| 5 | Mon | Reddit r/artificial | Community intelligence (Post C) | Demand validation |
| 5 | Wed | LinkedIn | Founder journey (Post C) | Followers → waitlist |
| 5 | Fri | Dev.to | Technical article B | SEO compound |
| 6 | Mon | All | ProductHunt teaser | Pre-launch heat |
| 6 | Wed | IH | Waitlist milestone post | Community proof |
| 6 | Fri | All | Launch day posts | Convert waitlist |

---

## 7. Waitlist Landing Page Copy (One-Liner Battery)

Test these as headline variants:

```
A: "Set it once. Never get surprised by an AI bill again."
B: "Per-project budget alerts for OpenAI, Anthropic, and more."
C: "The thing OpenAI's dashboard doesn't do: warn you before it's too late."
D: "Stop finding out about AI overspend in your credit card statement."
E: "Your AI API costs, tracked every 5 minutes, alerted before limits hit."
```

**Recommended headline:** D (Loss Aversion + Specificity, PLFS +13)  
**Sub-headline:** "Frugal polls your AI provider APIs every 5 minutes and fires alerts before you hit budget — not after. Per-project, not just per-account."

---

## 8. DM/Outreach Templates (Low-Volume, High-Quality)

Find developers on X or IH who've publicly complained about AI bills:

```
Template A (Twitter DM):
"Saw your tweet about [X AI bill]. Exact same thing happened to me — 
built something to prevent it. Would love a beta user who already 
understands the problem. No pitch — just want someone who'll actually 
tell me what's wrong with it. Want a link?"
```

```
Template B (IH DM):
"Hey — noticed you're building on AI APIs. I got hit with a $2,300 
OpenAI bill and built a monitoring tool. Would you be interested in 
being an early user? Totally free, I just want real feedback from 
someone building something similar."
```

**Target:** 10 high-quality DMs per week > 1,000 cold cold follows

---

## 9. Metrics to Track

| Metric | Target (Week 6) | How to Track |
|--------|-----------------|--------------|
| Waitlist signups | 200 | Supabase / form analytics |
| HN points on Show HN | 50+ | HN post |
| Reddit post engagement | >20 upvotes per top post | Reddit analytics |
| X profile visits | 500/week | X analytics |
| Dev.to article views | 500+ total | Dev.to dashboard |
| Email open rate (waitlist nurture) | >45% | Resend |

---

## 10. What NOT to Post

- Feature lists in awareness posts
- Pricing before product is validated
- "We're better than X" competitor attacks (no credibility yet)
- Growth metrics before you have real ones
- Vague pain points ("AI is expensive") — always use specific numbers