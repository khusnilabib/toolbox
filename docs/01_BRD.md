# 01 — Business Requirements Document (BRD)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect (acting PM)
> **Last Updated:** 2026-06-28
> **Revision:** 1.3.0

---

## 1. Purpose

This Business Requirements Document translates the mission, vision, Architectural Locks (§3 of `00_Project_Charter`), Engineering Constitution articles (§4 of `00_Project_Charter`), and Product Constitution articles (§5 of `00_Project_Charter`) into concrete business requirements for **[PROJECT_NAME]** — a **browser-first productivity ecosystem that enables users to solve everyday digital tasks without installing software and without requiring an account.** This document defines who the product serves, what value it delivers, how success is measured, and how it sustains itself financially while remaining free-tier-first.

Every feature in the backlog (`28_Backlog`) must trace back to a business requirement in this document. Features that cannot trace back are out of scope until the BRD is amended. This traceability rule prevents scope creep — the single most common failure mode for productivity-tool platforms, where the temptation to "just add one more tool" is constant.

The BRD is intentionally separate from the SAD (`02_SAD`). Business requirements drive architecture; architecture never drives business requirements. When the two conflict, business wins, and architecture is refactored to support it. The single exception is the Architectural Locks, Engineering Constitution, and Product Constitution in `00_Project_Charter` §3, §4, and §5 — those governance layers have priority over both business and architecture, because they encode the platform's permanent identity (LOCK-01), the engineering discipline that makes the identity sustainable (LOCK-02 through LOCK-12, EC-01 through EC-12), and the product rules that ensure every tool feels like part of one ecosystem (PC-01 through PC-10).

## 2. Scope

### 2.1 Business In Scope

- A free, guest-accessible, **browser-first** productivity tools ecosystem — the platform's permanent identity per LOCK-01.
- Browser-side processing as the default execution model (LOCK-02). This is both a technical commitment and a marketing claim: "Your files never leave your device."
- Freemium monetization: free tier with usage limits and ads; premium tier with higher limits, no ads, and AI features.
- SEO-driven organic acquisition as the primary growth channel through Phase 2.
- Integrated admin panel (LOCK-11) for content, users, analytics, and configuration.
- A content layer (articles, guides, comparison pages) that supports SEO and funnels users to tools.

### 2.2 Business Out of Scope (Phase 1)

- Paid enterprise contracts and SSO.
- B2B API licensing.
- White-label or embedded product.
- Native mobile apps.
- Marketplace for third-party tool developers.

These become in-scope in later phases per `24_Roadmap`. The BRD for those phases will be amended with the corresponding requirements.

### 2.3 User Segments

| Segment | Description | Primary Need | Monetization Path |
|---------|-------------|--------------|-------------------|
| **Casual Guest** | One-time visitor from search engine | Solve one specific problem in <60 seconds | Ad impressions; conversion to free account |
| **Power Guest** | Returns weekly, uses multiple tools | Speed, no friction, no login | Conversion to free account; later to premium |
| **Free Registered** | Has account, uses cloud features | Save history, favorites, sync | Conversion to premium; ad impressions |
| **Premium Individual** | Pays $5–10/mo | No ads, AI features, batch processing | Subscription revenue |
| **Admin / Editor** | Internal team member | Manage content, users, tools | Salary (internal role, not a customer) |

Phase 1 focus: serve Casual Guest and Power Guest excellently. Free Registered and Premium Individual enter in Phase 2.

## 3. Goals

### 3.1 Business Goals by Phase

| Phase | MAU Goal | Revenue Goal | Tools Live | Primary Metric |
|-------|----------|--------------|------------|----------------|
| Phase 1 | 10,000 | $0 | 30 | MAU + tool completion rate |
| Phase 2 | 100,000 | $500/mo (ads + early premium) | 100 | MAU + free→premium conversion |
| Phase 3 | 500,000 | $5,000/mo | 300 | MRR + retention |
| Phase 4 | 2,000,000+ | $50,000+/mo | 1,000+ | MRR + API revenue |

### 3.2 KPI Definitions

- **Monthly Active User (MAU)** — distinct users (registered or identified by cookie) who use at least one tool in a 30-day window.
- **Tool Completion Rate** — percentage of tool sessions that reach the "result delivered" state. Target: ≥85% for browser-capable tools.
- **Free → Premium Conversion** — percentage of free registered users who upgrade within 30 days of registration. Target: 2–5% by Phase 2.
- **Time-to-First-Result (TTFR)** — time from page load to user receiving first tool output. Target: <3 seconds on 4G.
- **Organic Search Share** — percentage of traffic from search engines. Target: ≥70% through Phase 2.
- **Bounce Rate (single-tool sessions)** — Target: <40% (we want users to either complete the tool or explore related tools).

### 3.3 Non-Quantitative Goals

1. **Brand trust.** Users must perceive [PROJECT_NAME] as fast, private, and reliable. No dark patterns. No surprise paywalls mid-workflow.
2. **Tool quality > tool quantity.** A great tool is worth more than five mediocre ones. Each tool must meet the quality bar in `15_UDS` and `18_SEOSpecification` before launch, AND must satisfy PC-03 (Tool Completion Standard — 13 mandatory items) and PC-04 (7 quality gates).
3. **Privacy by default.** Browser-side processing is a feature, not a cost-saving measure. We market it.

## 4. Standards

### 4.1 Monetization Standards

- **Never block core tool completion behind paywall.** A user must always be able to complete the primary workflow for free. This is a direct implementation of LOCK-07 (guest-first UX), PC-06 (Monetization Philosophy — revenue never interrupts task completion), and supports EC-05 (progressive enhancement).
- **Paywall only value-adds**: download in batch, save to cloud, AI features, remove ads, higher file size limits.
- **Ads are non-intrusive**: max 1 ad per tool page, never inside the workflow area, never auto-playing audio/video. Ads appear only after value demonstrated (PC-06).
- **Premium pricing is transparent**: pricing page public, no hidden tiers, cancel-anytime.
- **Browser-first processing is a marketing claim, not a cost-saving measure.** Every browser-first tool must visibly communicate to the user that their files stay on their device. This builds trust and differentiates from competitors (LOCK-02).
- **Security by default (EC-08).** Payment flows use Stripe-hosted checkout; we never see or store raw card numbers. All payment webhooks validated against Stripe signatures.

### 4.2 Onboarding Standards (LOCK-07)

- Guest can: browse, use tools, upload, convert, preview — without registration.
- Registration is prompted ONLY when user wants: download, save history, favorite, cloud sync, premium features.
- Registration must take ≤30 seconds (email or OAuth).
- No forced tour, no forced profile completion, no email verification gate before first tool use.
- **No mandatory registration before demonstrating value.** This is locked in `00_Project_Charter` §3 LOCK-07 and cannot be relaxed without charter amendment.

### 4.3 Content Standards

- Every tool page has supporting content: FAQ, related tools, "how to use" guide, at least 300 words of unique explanatory text (for SEO).
- Articles are original. No AI-generated bulk content. AI may assist drafting, but every published article is human-edited.
- All claims (e.g., "compresses up to 80%") must be substantiated.

### 4.4 Privacy & Data Standards

- Uploaded files for browser-side tools never leave the user's device. This is a marketing claim, a technical commitment, and an architectural lock (LOCK-02). Any tool that violates this rule must be clearly labeled as server-side and require explicit user consent (EC-08 security by default).
- Server-side tools (AI utilities, OCR) clearly disclose that files are processed server-side and deleted within 1 hour.
- GDPR/CCPA compliant from Phase 1: cookie consent, data export, account deletion.
- **Database optional (LOCK-06, EC-05 progressive enhancement):** Core tool processing must not depend on database availability. If the database is down, tools still work — only account features (history, favorites) degrade gracefully.

## 5. Examples

### 5.1 Competitor Analysis

| Competitor | Strengths | Weaknesses | Our Wedge |
|-----------|-----------|------------|------------|
| **TinyWow** | Tool breadth, free, no-login | Dated UI, ad-heavy, slow | Faster UX, modern design, better SEO structure |
| **ILovePDF** | Brand recognition, PDF depth | Paywalls on common features, limited non-PDF | Free core PDF tools + cross-category breadth |
| **FreeConvert** | Premium UX, broad formats | Aggressive paywall, slow uploads | Browser-first processing = instant + private |
| **SmallPDF** | Simple UX, strong brand | 2-task free limit per day | No daily task limit; only premium for advanced features |
| **OCR2Edit** | OCR + edit integration | Niche, slow | Integrated into a broader productivity ecosystem |

### 5.2 Example User Story — Casual Guest

> *As a* casual guest searching "compress pdf to 1mb",
> *I want* to compress my PDF without uploading it to a server,
> *so that* my sensitive document stays on my device.

**Acceptance:**
1. Land on `/pdf/compress` from Google.
2. Drop file → progress bar → result preview within 3 seconds.
3. Download button visible. No registration gate.
4. "Save to cloud" CTA visible but dismissible.

### 5.3 Example User Story — Premium Upsell

> *As a* power guest who has used 5 tools in 7 days,
> *I want* to save my history across devices,
> *so that* I don't lose my work when I switch computers.

**Acceptance:**
1. After 5th tool use, show non-blocking toast: "Create a free account to save your history."
2. User clicks → OAuth/email signup → previous history migrated to account.
3. No premium upsell yet. Premium upsell triggers only when user hits a premium-gated feature (e.g., batch download).

## 6. Best Practices

### 6.1 Acquisition
- **SEO is the primary channel through Phase 2.** Every tool is a landing page; every category is a hub page; every article interlinks with tools. See `18_SEOSpecification`.
- **Programmatic SEO where sensible.** Common patterns (e.g., "convert X to Y") generate landing pages from a template. Beware: thin content penalty risk — every generated page must have unique value-add content.
- **Accessibility as SEO (EC-06).** WCAG AA compliance is also a search ranking factor; accessible pages rank higher.
- **Performance as SEO (EC-07).** Core Web Vitals are ranking signals; the performance budget is also an SEO budget.
- **Feature discoverability as retention (PC-09).** Every tool links to related tools; internal linking strengthens the SEO graph and keeps users in the ecosystem.
- **No paid acquisition until CAC < LTV is provable.** Phase 3 at the earliest.

### 6.2 Retention
- **No forced accounts, but reward registration.** Save history, favorites, recent tools. Make registered users feel faster than guests.
- **Email is opt-in, valuable, and rare.** Max 1 email per week. Every email must have a non-promotional reason to exist.
- **Tool quality is the best retention.** A user who completes a task in 30 seconds tells a friend.

### 6.3 Monetization Discipline
- **Never compromise the free core.** If a feature is core to a tool's primary workflow, it stays free.
- **Ads never degrade the workflow.** Ad placement is reviewed in code review. Workflow-blocking ads are blocking bugs.
- **Premium features solve scale, not access.** Batch processing, automation, higher limits — not "you must pay to use this tool at all."

### 6.4 Content Operations
- **Editorial calendar.** Publish at least 2 articles per week through Phase 1 to build SEO footprint.
- **Tool-data-driven content.** Mine search console and tool usage logs for content ideas ("users searching X also try Y").
- **Refresh content.** Revisit published articles every 6 months; refresh dates, examples, screenshots.

## 7. Future Expansion

### 7.1 Revenue Streams (Phased)

| Stream | Phase Introduced | Notes |
|--------|------------------|-------|
| Display ads | Phase 1 | Carbon Ads or EthicalAds — developer-friendly, privacy-respecting |
| Premium subscription | Phase 2 | $5–10/mo, individual |
| Enterprise subscription | Phase 3 | SSO, audit logs, SLA, $50+/user/mo |
| Public API (usage-based) | Phase 3 | $0.001–0.01 per call, tiered |
| White-label / embed | Phase 4 | Custom pricing |
| Marketplace revenue share | Phase 4 | 30% from community tools |

### 7.2 Geographic Expansion
- Phase 1: English-only.
- Phase 2: Add Spanish, Portuguese, French, German based on traffic data.
- Phase 3: Add Asian languages (Hindi, Bahasa, Japanese).

### 7.3 Platform Expansion
- **Browser extension** (Phase 2) — quick access to tools from any page.
- **PWA install** (Phase 1, lightweight) — installable but not marketed heavily until Phase 2.
- **Mobile app** (Phase 3+) — only if PWA usage data justifies native investment.

### 7.4 B2B Expansion
- **Team workspaces** (Phase 3) — shared history, shared favorites, admin billing.
- **Audit logs** (Phase 3) — required for enterprise sales.
- **Custom tool development** (Phase 4) — paid engagements to build bespoke tools for enterprise clients.

## 8. Dependencies

### 8.1 Business Dependencies

- **Search engine indexing.** Organic traffic depends on Google/Bing indexing. A single manual action penalty could set the project back 6 months. Mitigation: clean SEO per `16_SEOSpecification`, no black-hat tactics.
- **Free tier stability.** Vercel and Supabase free tier changes could force early monetization. Mitigation: monitor usage monthly; upgrade to paid tier before hitting limits.
- **Ad network approval.** Carbon/EthicalAds require minimum traffic (typically 10k MAU). Mitigation: Phase 1 runs ad-free; ads activate in Phase 2.

### 8.2 Document Dependencies

- This BRD depends on `00_Project_Charter` for mission, scope, Architectural Locks (§3), Engineering Constitution (§4), and Product Constitution (§5).
- `27_Roadmap` operationalizes the phase goals defined here.
- `28_Backlog` lists the specific tools that satisfy the Phase 1 tool count.
- `11_ProductConstitution` binds every tool listed in `28_Backlog`.
- `12_ToolManifestSpecification` defines the schema every backlog tool must implement.
- `18_SEOSpecification` operationalizes the SEO acquisition strategy in §6.1.
- `21_AdminSpecification` defines the admin tooling required to operate the content layer in §4.3.

### 8.3 Assumptions

- Organic search remains a viable acquisition channel through Phase 4. If AI-generated search results reduce organic traffic by >40%, the acquisition strategy must pivot (contingency plan to be documented in `27_Roadmap` v2).
- Free tier limits of Vercel + Supabase remain generous enough to support Phase 1 (10k MAU).
- At least one team member can write editorial-quality English content for SEO.

## 9. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial BRD. |
| 1.1.0 | 2026-06-28 | Chief Architect | Integrated the 12 Architectural Locks from `00_Project_Charter` §3. Strengthened browser-first as a marketing commitment (LOCK-02). Elevated guest-first UX and database-optional philosophy to lock-referenced standards. Updated cross-references to reflect doc renumbering. |
| 1.2.0 | 2026-06-28 | Chief Architect | Integrated the 12 Engineering Constitution articles from `00_Project_Charter` §4. Linked monetization to EC-05 (progressive enhancement) and EC-08 (security by default). Added accessibility and performance as SEO factors (EC-06, EC-07). Renumbered all cross-references to reflect insertion of `06_ArchitectureDecisionRecords` (docs 06-25 shifted to 07-26). |
| 1.3.0 | 2026-06-28 | Chief Architect | Integrated the 10 Product Constitution articles from `00_Project_Charter` §5. Linked monetization standards to PC-06 (Monetization Philosophy). Linked tool quality to PC-03 (Completion Standard) and PC-04 (Quality Gates). Linked acquisition to PC-09 (Feature Discoverability). Renumbered all cross-references to reflect insertion of `11_ProductConstitution` and `12_ToolManifestSpecification` (docs 11-26 shifted to 13-28). |

## 10. Cross References

- `00_Project_Charter` — Source of mission, vision, scope, the 12 Architectural Locks (§3), the 12 Engineering Constitution articles (§4), and the 10 Product Constitution articles (§5). Locks, ECs, and PCs have priority over this document.
- `02_SAD` — Architecture that supports the technical business commitments (browser-first, free-tier, database-optional, progressive enhancement).
- `04_TechStack` — Operationalizes LOCK-02 (browser-first technology choices) and EC-12 (enterprise readiness).
- `06_ArchitectureDecisionRecords` — Permanent history of architectural decisions affecting business capabilities.
- `11_ProductConstitution` — Binding rules for how every tool behaves as a product (PC-01 through PC-10).
- `12_ToolManifestSpecification` — Canonical schema every tool must implement; foundation for product scalability (PC-10).
- `13_FBRD` — Tool feature template; every tool must trace to a business requirement here.
- `18_SEOSpecification` — Implements the SEO acquisition strategy in §6.1 and LOCK-08, PC-09.
- `19_UserFlow` — Implements the onboarding standards in §4.2 and LOCK-07, EC-05, PC-06.
- `20_RBAC` — Implements admin/editor role separation in §2.3 and LOCK-11, EC-08.
- `21_AdminSpecification` — Operates the content layer in §4.3 and implements LOCK-11, PC-07, PC-10.
- `23_TestingStrategy` — Implements EC-09, PC-03 (testing philosophy, completion standard).
- `24_DeploymentGuide` — Implements EC-07, EC-08, EC-12 (performance monitoring, security headers, enterprise migration).
- `25_AI_Guideline` — Constrains AI usage to align with §4.3 content standards and LOCK-09, EC-11.
- `27_Roadmap` — Phase plan operationalizing §3.1.
- `28_Backlog` — Phase 1 tool list satisfying §3.1 (30 tools); every tool bound by `11_ProductConstitution`.
