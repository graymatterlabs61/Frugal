# LEGAL CHECKLIST — Frugal
## India + Global SaaS Compliance
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. Required Website Pages (must be live before first paid user)

- [ ] **Privacy Policy** — What data you collect, how you use it, who you share it with, user rights
- [ ] **Terms of Service** — Usage rules, liability limits, payment terms, account termination
- [ ] **Refund Policy** — 7-day refund window recommended for SaaS (builds trust, reduces disputes)
- [ ] **Cookie Policy** — Required for EU users if you use analytics cookies (Vercel Analytics uses cookies)

*Recommended tool: Termly.io or Iubenda for auto-generated policies — review and customize before publishing.*

---

## 2. Entity Structure (India)

**Current stage (pre-revenue):** Operate as sole proprietor under your name or a trade name (Gray Matter Labs). No registration required below ₹20 lakh annual revenue.

**When to register:**
- GST registration: Required once annual turnover exceeds ₹20 lakh (or immediately if you have any interstate supply or export of services)
- Private Limited Company: Recommended when seeking seed funding — investors require a corporate entity. File with MCA (Ministry of Corporate Affairs).

**Action items:**
- [ ] Open a separate bank account for Frugal revenue (even as sole proprietor, keep books clean)
- [ ] Register for GST once revenue exceeds ₹20 lakh/year (~$2,400 USD) or if serving overseas customers regularly

---

## 3. DPDP (Digital Personal Data Protection Act 2023 — India)

India's DPDP Act came into force and applies to any entity processing personal data of Indian citizens.

**Data you collect from users:**
- Email address (personal data)
- API keys (sensitive — treat as personal data)
- Usage patterns and billing information

**Checklist:**
- [ ] Obtain explicit consent before collecting personal data (signup checkbox + Privacy Policy link)
- [ ] Allow users to download their data (export feature or manual response to requests)
- [ ] Allow users to delete their account and all associated data
- [ ] Do not share user data with third parties beyond Stripe (payments) and Resend (email)
- [ ] Encrypt API keys at rest (AES-256 — covered in TRD.md)
- [ ] Document your data processing activities (simple internal spreadsheet is sufficient at this stage)

---

## 4. GDPR Basics (for EU users)

If Frugal is accessible globally (it will be), EU users are protected under GDPR.

**Minimum requirements:**
- [ ] Privacy Policy must include lawful basis for processing (legitimate interest or consent)
- [ ] Cookie consent banner if using tracking cookies
- [ ] Right to erasure (delete account and data) — must be functional, not just a form
- [ ] Data Processing Agreement (DPA) with Supabase and Stripe (both have standard DPAs available — sign them)
- [ ] Do not transfer EU personal data to countries without adequate protection (Supabase EU region resolves this)

**Supabase action:** When creating your Supabase project, select EU (Frankfurt) region if you anticipate EU users.

---

## 5. Payment & Tax Compliance

**Stripe setup for India:**
- [ ] Create Stripe account as an Indian business (Stripe supports India with INR)
- [ ] Complete KYC with Stripe (PAN, bank account, business address)
- [ ] Enable Stripe Tax for automatic GST/VAT calculation on invoices (required for B2B EU customers)
- [ ] Stripe handles PCI DSS compliance — do not store card details yourself

**GST on exports:**
- Services exported to overseas customers are zero-rated under GST (0% GST, but you may still need to register and file returns)
- Keep records of all overseas invoices

**Fallback payment processor:** If Stripe India setup is delayed, use Lemon Squeezy (explicitly supports Indian founders, acts as merchant of record — handles all tax compliance globally).

---

## 6. Intellectual Property

- [ ] Ensure the name "Frugal" does not conflict with existing trademarks in your target markets (India, US, EU). Search: [trademarkia.com](https://www.trademarkia.com)
- [ ] Do not use "Frugal" branding if a conflict exists — use the GML-NME alternatives (BurnGuard, CostPilot)
- [ ] All code written by Nilesh is owned by Nilesh / Gray Matter Labs by default (sole proprietor)
- [ ] If you use open-source libraries, ensure license compliance (MIT, Apache 2.0 are fine for commercial use; GPL is not)

---

## 7. Priority Order

Do these before launch:
1. Privacy Policy + Terms of Service live on website
2. Stripe account verified and KYC complete
3. Supabase DPA signed
4. Delete account functionality working

Do these at $20 lakh INR revenue:
5. GST registration
6. Separate business bank account
7. Consider Private Limited incorporation if seeking investment
