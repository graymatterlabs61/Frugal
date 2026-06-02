# LAUNCH PLAN — Frugal
## 6-Week Pre-Launch + Launch Day + 30-Day Post-Launch
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## Phase 1: 6-Week Pre-Launch Checklist

### Week 1 — Validate Before Building
- [ ] Build landing page (one page: story, features, pricing, email capture)
- [ ] Set up Supabase project and database schema
- [ ] Post on r/SideProject ("looking for beta testers" format)
- [ ] Post on r/webdev (problem-focused discussion)
- [ ] DM every landing page signup within 24 hours
- [ ] Compile 12+ specific cost horror stories from replies — or reframe and repeat

### Week 2 — Core Infrastructure
- [ ] Auth: Supabase Auth with email + Google OAuth
- [ ] API connection flow: encrypt and store API keys
- [ ] OpenAI usage polling worker (QStash cron, every 5 min)
- [ ] Basic dashboard: show spend by day for connected OpenAI account
- [ ] Post "Ask HN: How do you manage AI API costs before they spiral?"
- [ ] Post on Indie Hackers (validation story post)

### Week 3 — Core Features
- [ ] Budget rules CRUD (daily/monthly limits per project)
- [ ] Alert system: email (Resend) when 80% threshold hit
- [ ] Alert log page
- [ ] Anthropic usage API integration
- [ ] First beta user onboarded (live data, real feedback session)

### Week 4 — Polish + Monetization
- [ ] Replicate and fal.ai integrations
- [ ] Slack webhook alerts
- [ ] Stripe integration: Free / Starter $19 / Growth $49 / Pro $99
- [ ] Plan gating: free tier locked to 1 API, upgrade prompts
- [ ] Founder beta offer: Growth features at $19/mo for first 50 users (limited time)
- [ ] Privacy Policy, Terms of Service, Refund Policy pages live

### Week 5 — Beta Testing
- [ ] Invite 10 beta testers from signup list
- [ ] Record Loom walkthrough of all 3 core screens
- [ ] Fix top 3 bugs from beta feedback
- [ ] Per-user cost attribution feature live
- [ ] Daily cost summary email working

### Week 6 — Launch Prep
- [ ] Final QA: all alert flows tested end-to-end
- [ ] SEO: meta tags, og:image, sitemap.xml
- [ ] Product Hunt assets: 5 screenshots, 60-second demo video, tagline
- [ ] Outreach to 3 developer newsletter authors (TLDR, bytes.dev, daily.dev)
- [ ] Identify Product Hunt hunter with 500+ followers
- [ ] Schedule 30 build-in-public posts (see MARKETING_PLAN.md)

---

## Phase 2: Launch Day Playbook (24 Hours)

**6:00 AM IST**
- Go live on Product Hunt (12:01 AM PST = target time)
- Post launch announcement on @aiwithnilesh (X/Twitter)
- Email all beta users asking for upvotes and honest comments

**8:00 AM IST**
- Post on r/SideProject: "Frugal is live on Product Hunt today"
- Share on Indie Hackers: launch post
- Check for any critical bugs; have dev environment ready

**12:00 PM IST**
- Mid-day check: monitor upvote count, respond to every Product Hunt comment within 30 minutes
- Share a progress screenshot on @aiwithnilesh

**6:00 PM IST**
- Second push: re-share on relevant communities
- DM 20 developers directly who have interacted with your build-in-public posts

**End of Day**
- Record the final Product Hunt rank
- DM every new signup from launch day within 2 hours
- Post "Day 1 recap" on @aiwithnilesh

---

## Phase 3: 30-Day Post-Launch Growth Sprint

### Week 1 (Days 1–7)
- Interview every single user who signed up — 15-minute call or 5-question async survey
- Fix the top 3 complaints from launch day feedback immediately
- Post daily on @aiwithnilesh (use content calendar from MARKETING_PLAN.md)
- Target: 20 paying users

### Week 2 (Days 8–14)
- Cold outreach: DM 50 developers on GitHub with AI repos (filter: active in last 30 days, uses OpenAI/Anthropic)
- Post "Show HN: Frugal – AI API budget controls that actually enforce limits"
- Write and publish first SEO blog post: "How to set AI API cost limits before they destroy your margins"
- Target: 35 paying users

### Week 3 (Days 15–21)
- Reach out to 3 developer newsletters for feature inclusion (TLDR Tech, Bytes.dev)
- Ship first user-requested feature (based on feedback from weeks 1–2)
- Post monthly revenue update on Indie Hackers and @aiwithnilesh
- Target: 50 paying users

### Week 4 (Days 22–30)
- Run first cohort analysis: which users stayed, which churned, why
- Interview every churned user within 24 hours of cancellation
- Identify top 1 feature that would prevent churn — ship it
- Plan month 2 strategy based on data
- Target: $700+ MRR

---

## First 100 Users Path

| Source | Expected Users | Action |
|--------|---------------|--------|
| Product Hunt launch | 20–40 | Launch on week 6 |
| Reddit posts | 15–30 | r/SideProject, r/webdev, r/ClaudeAI |
| HN Show HN | 15–50 | Week 2 post |
| Indie Hackers | 10–20 | Milestone posts + comments |
| GitHub cold outreach | 5–15 | DM devs with AI repos |
| Word of mouth | 10–30 | Grows from month 2 onward |

**Target: 100 users within 60 days of launch.**
