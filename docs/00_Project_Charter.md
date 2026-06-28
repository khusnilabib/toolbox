# 00 — Project Charter

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.1.0

---

## 1. Purpose

This Project Charter formally authorizes the existence of **[PROJECT_NAME]** — a **browser-first productivity ecosystem that enables users to solve everyday digital tasks without installing software and without requiring an account.** The platform consolidates hundreds to thousands of utility tools under a single, scalable, privacy-respecting surface. The charter defines the project's mission, vision, scope, guiding principles, twelve **Architectural Locks** (§3), and governance model. It serves as the foundational reference from which all subsequent architecture, business, and engineering decisions derive.

Every downstream document in the `/docs` repository must remain consistent with this charter AND with the twelve Architectural Locks in §3. The locks have priority over every other document; the rest of the charter has priority over every document except the locks. If any document conflicts, the charter wins until formally amended through the revision process defined in §10. This rule exists because architectural drift is the leading cause of platform decay; without a single authoritative source, teams gradually make inconsistent micro-decisions that compound into structural incoherence.

The charter is intentionally short on implementation detail. It defines *what* and *why*, never *how*. The *how* lives in `02_SAD`, `05_ProjectStructure`, `13_DatabaseDesign`, and related technical documents.

## 2. Platform Identity

[PROJECT_NAME] is **NOT** simply an online tools website. The official positioning is:

> **A browser-first productivity ecosystem that enables users to solve everyday digital tasks without installing software and without requiring an account.**

The phrase **"Browser-first Productivity Ecosystem"** is part of the project's permanent identity. Four brand values anchor every product, design, and engineering decision:

1. **Privacy** — User data stays on the user's device whenever technically possible.
2. **Speed** — Sub-second first interaction; no unnecessary network round-trips for browser-capable tasks.
3. **Simplicity** — Every tool has one obvious primary action; no clutter, no tours, no forced onboarding.
4. **Accessibility** — WCAG 2.1 AA from day 1; usable on a 360px viewport and a screen reader.

These values are not aspirational. They are evaluation criteria for every PR, every design mock, and every tool added to the backlog.

---

## 3. Architectural Locks (Permanent Rules)

The following twelve decisions are **locked** as permanent project rules. They have higher priority than any future document unless explicitly revised through a charter amendment (§10). Every downstream document MUST be consistent with these locks. The lock identifier (e.g., `LOCK-01`) is referenced from every doc that implements or depends on it.

### LOCK-01 — Platform Identity

[PROJECT_NAME] is officially positioned as a **browser-first productivity ecosystem**. The full positioning statement is in §2 above. This lock prevents any future repositioning (e.g., "SaaS suite", "online tools directory") without explicit charter amendment.

### LOCK-02 — Browser-First Philosophy

Whenever technically possible, processing MUST happen entirely inside the user's browser. This is a platform-level architectural commitment, not a cost-saving measure.

**Browser-first by default:**
- Image conversion, resize, compression, passport photo, background removal
- PDF merge/split (client-side where feasible via pdf-lib / WASM)
- Text formatting, JSON formatting, code formatters
- UUID generation, password generation, QR generation
- All calculators, unit converters, color converters

**Server-side only when technically unavoidable:**
- AI inference (summarization, translation, captioning)
- OCR on large documents
- File processing beyond browser memory capacity
- Premium cloud features (batch, scheduled, sync)

Benefits: better privacy, faster UX, lower infrastructure cost, better scalability, reduced server dependency. See `02_SAD` §Browser-First Decision Matrix for the authoritative classification.

### LOCK-03 — Tool Engine Philosophy

Every tool MUST follow one standardized lifecycle:

```
Input → Validation → Processing → Preview → Download → History (optional) → Share (optional)
```

Tools MUST reuse this lifecycle instead of implementing custom workflows whenever possible. This becomes the standard **Tool Engine** architecture. The lifecycle is implemented as a typed pipeline (`ToolEngine<TInput, TOutput>`) detailed in `02_SAD` §Tool Engine and `11_ACD` §Tool Engine Component.

### LOCK-04 — Modular Architecture

Every tool is an independent module. Modules MUST be:

- **Independent** — operates without other modules being present or healthy
- **Reusable** — composable into new tools or workflows
- **Replaceable** — swappable without affecting siblings
- **Maintainable** — fixable in isolation; tests run in isolation
- **Discoverable** — registered for navigation, search, and SEO

A module MUST NOT depend directly on another module's internal implementation. Shared functionality lives only in shared libraries/components under `/packages` and `/src/shared`. See `05_ProjectStructure` §Module Boundaries.

### LOCK-05 — Plugin-Ready Architecture

The platform MUST support future plugin/module registration. Each tool MUST eventually expose metadata through a manifest/registry system.

**Long-term objective:** Adding a new tool should require minimal modification outside the tool's own module. Architecture MUST anticipate auto-discovery and registry-driven navigation. The registry pattern is defined in `05_ProjectStructure` §Tool Registry and the manifest schema in `10_FBRD` §Tool Manifest.

### LOCK-06 — Database Optional Philosophy

The database is NOT required for the platform to operate. Core tools MUST continue functioning even if database services are temporarily unavailable.

**Database responsibilities (with graceful degradation):**
- Authentication, user profile, history, favorites, cloud sync, analytics, admin, content, settings

**Core tool processing MUST NOT depend on database availability.** Architecture enforces this through strict separation between the **Tool Engine** (stateless, browser-side) and **Platform Services** (stateful, server-side). See `02_SAD` §Layered Architecture and §Graceful Degradation.

### LOCK-07 — Guest-First User Experience

Guest users MAY: browse tools, upload files, configure settings, process files, preview results.

Registration is requested ONLY when users attempt to: download results, save history, favorite tools, synchronize devices, access premium capabilities.

The onboarding flow MUST maximize trust and minimize friction. **No mandatory registration before demonstrating value.** See `16_UserFlow` and `01_BRD` §4.2.

### LOCK-08 — SEO Constitution

SEO is a first-class architectural concern, not a post-launch optimization. Every tool page MUST support:

- Unique URL
- Unique metadata (title, description, keywords)
- Canonical URL
- Open Graph tags
- Twitter Card tags
- Structured Data (JSON-LD: SoftwareApplication + FAQPage + BreadcrumbList)
- Breadcrumb navigation
- FAQ section
- Related Tools section
- Internal Linking (bidirectional where sensible)
- Search Intent Mapping (informational / transactional / navigational)

**No duplicate metadata or duplicate content.** SEO requirements influence architecture from the beginning — the URL structure, the routing layer, and the tool manifest schema all encode SEO requirements. See `15_SEOSpecification`.

### LOCK-09 — AI Development Constitution

This project is AI-assisted. The AI assistant (and any human using AI tooling) MUST NOT:

- Duplicate components or business logic
- Change architecture
- Change folder conventions
- Install new dependencies
- Introduce breaking patterns

...without explicit human approval recorded in the PR description.

The AI MUST always prefer **extending existing systems** over creating parallel implementations. **Consistency has higher priority than speed.** See `22_AI_Guideline` and `19_DevelopmentGuideline` §AI-Assisted Development.

### LOCK-10 — Design Philosophy

Visual language follows **developer-first minimalism** inspired by modern engineering products (Vercel-like).

Characteristics:
- Monochrome palette (black / white / grays + single accent)
- High contrast (WCAG AAA where feasible)
- Spacious layout (generous padding, breathing room)
- Premium feel (precise typography, deliberate spacing)
- Fast interfaces (no decorative animations, ≤200ms interaction feedback)
- Minimal animation (only state-change animations that aid comprehension)
- Accessible (WCAG 2.1 AA minimum)
- Mobile-first (360px baseline, scales up)
- Dark mode ready (token-driven, no hardcoded colors)
- Light mode ready (default)

**Avoid decorative UI that does not improve usability.** Every visual element must justify its existence with a usability purpose. See `09_DesignSystem` and `12_UDS`.

### LOCK-11 — Admin Philosophy

The Admin Panel is NOT merely a CMS. It is the **operational control center** of the platform.

Long-term modules include:
- Dashboard, Users, Roles, Permissions
- Categories, Tools, Media
- SEO, Articles, Analytics
- Advertisements
- Feature Flags, Experiments
- System Health, Logs, Audit Trail
- Settings

Admin architecture MUST anticipate enterprise-scale growth. RBAC enforced from Phase 1 (`17_RBAC`); audit trail mandatory from Phase 1. See `18_AdminSpecification`.

### LOCK-12 — Feature Lifecycle

Every feature MUST have a maturity status. The canonical lifecycle:

```
Concept → Planned → Design → Development → Testing → Beta → Stable → Deprecated → Archived
```

This lifecycle MUST eventually be represented inside the Admin Panel as a first-class status field on every tool, feature, and module. Each tool's manifest (`10_FBRD` §Tool Manifest) MUST declare its current lifecycle status. Status transitions are audited.

---

## 4. Scope

### 4.1 In Scope

[PROJECT_NAME] covers the following tool categories, with explicit intent to expand to additional categories over time:

- **Image Tools** — resize, compress, crop, format convert, passport photo, background removal, watermark.
- **Document Tools** — merge, split, convert, preview, redact.
- **PDF Tools** — merge, split, compress, rotate, watermark, PDF↔image conversion, OCR.
- **Developer Tools** — JSON formatter, Base64, UUID, password generator, hash, regex tester, JWT decoder.
- **Text Tools** — word counter, case converter, Lorem Ipsum, diff, markdown preview.
- **SEO Tools** — meta tag generator, sitemap builder, robots.txt, Open Graph preview, schema markup.
- **Converters** — unit, currency, color (HEX/RGB/HSL), timezone, number base.
- **Calculators** — loan, BMI, age, percentage, scientific, GPA.
- **Utility Tools** — QR generator, color picker, stopwatch, password strength meter.
- **AI Utilities** — text summarizer, translator, image captioner (Phase 2+, opt-in only).

The platform also includes a fully integrated admin panel at `/admin`, a content management layer for articles and SEO landing pages, and a user account system with freemium capabilities.

### 4.2 Out of Scope (Phase 1)

- Native mobile applications (web is responsive and PWA-capable; native apps deferred to Phase 3+).
- Real-time collaborative editing of documents.
- Paid enterprise SSO (SAML, SCIM) — deferred until paying enterprise demand exists.
- Desktop installers / Electron builds.
- Marketplaces for third-party tool developers.

### 4.3 Long-Term Scope

The architecture must support growth from 30 tools (Phase 1) to 1,000+ tools (Phase 4) without major restructuring. This is the single most important architectural constraint and shapes every downstream decision in `02_SAD`, `05_ProjectStructure`, and `06_FolderStructure`.

## 5. Goals

### 5.1 Phase Goals

| Phase | Tool Count | Primary Goal |
|-------|------------|--------------|
| Phase 1 | 30 tools | Validate architecture, ship initial SEO footprint, achieve first 10k MAU. |
| Phase 2 | 100 tools | Establish category leadership in 3 categories, reach 100k MAU. |
| Phase 3 | 300 tools | Introduce premium tier, reach 500k MAU. |
| Phase 4 | 1,000+ tools | Platform plays role of "developer infrastructure" — APIs, embeds, white-label. |

### 5.2 Non-Numeric Goals

1. **Architectural longevity.** No rewrite required between Phase 1 and Phase 4.
2. **Sub-second tool load.** First interaction with any tool within 1 second on a mid-tier device over 4G.
3. **Zero backend for browser-capable tools.** Image, text, and most developer tools run entirely client-side.
4. **Guest-first UX.** Users complete core workflows without registration; registration prompted only at value-adding moments (download, save history, favorite).
5. **SEO dominance.** Every tool is an indexable, schema-marked landing page.

## 6. Standards

The project adheres to the following non-negotiable standards. Each is expanded in its dedicated document; this section establishes them as charter-level commitments. Where a standard implements an Architectural Lock (§3), the lock ID is cited.

### 6.1 Architectural Standards
- **Feature-Based Architecture.** Every tool is a self-contained feature module. *Implements LOCK-04, LOCK-05.* See `10_FBRD` and `05_ProjectStructure`.
- **Browser-first processing.** Tools that can run client-side MUST run client-side. Backend is reserved for auth, persistence, AI, and content. *Implements LOCK-02, LOCK-06.* See `02_SAD`.
- **Tool Engine lifecycle.** Every tool follows Input → Validation → Processing → Preview → Download → History → Share. *Implements LOCK-03.* See `02_SAD` §Tool Engine.
- **Type safety end-to-end.** TypeScript strict mode; Zod schemas at every IO boundary. See `07_CodingStandards`.
- **No giant files.** Soft limit 300 lines per file; hard limit 500. See `07_CodingStandards`.

### 6.2 Engineering Standards
- **Free-tier-first.** Initial budget is $0. Every dependency must have a viable free tier. See `04_TechStack`.
- **DRY / KISS / SOLID.** Applied as default review criteria. See `07_CodingStandards`.
- **Documentation first.** No production code without prior docs. See `19_DevelopmentGuideline`.
- **AI-assisted discipline.** AI must not duplicate, drift, or introduce unapproved dependencies. *Implements LOCK-09.* See `22_AI_Guideline`.

### 6.3 UX Standards
- **Guest-first onboarding.** No registration before value demonstrated. *Implements LOCK-07.* See `16_UserFlow`.
- **Dark / Light mode ready from day 1.** Token-driven, no hardcoded colors. *Implements LOCK-10.* See `09_DesignSystem`.
- **Accessibility AA.** WCAG 2.1 AA conformance for every tool. See `12_UDS`.
- **Mobile-first responsive.** Every tool usable on a 360px viewport.

### 6.4 SEO Standards
- Every tool page has: unique URL, unique metadata, canonical URL, Open Graph, Twitter Card, JSON-LD structured data, breadcrumb, FAQ, related tools, internal linking, search intent mapping. *Implements LOCK-08.* See `15_SEOSpecification`.

### 6.5 Security Standards
- RBAC enforced from Phase 1. *Implements LOCK-11.* See `17_RBAC`.
- Audit trail mandatory from Phase 1. See `18_AdminSpecification`.
- No secrets in client bundles. Server-only env vars validated at boot.
- All file uploads scanned and size-limited before processing.

### 6.6 Admin Standards
- Admin is the operational control center, not a CMS. *Implements LOCK-11.* See `18_AdminSpecification`.
- Feature lifecycle status visible in admin. *Implements LOCK-12.* See `18_AdminSpecification` §Feature Lifecycle.

## 7. Examples

### 7.1 Reference Platforms

The following platforms represent the target end state. We study their UX, SEO, and architecture; we do not copy their code.

| Platform | What we learn from it |
|----------|----------------------|
| **TinyWow** | Tool breadth, guest-first UX, no-login download friction. |
| **FreeConvert** | Premium UX patterns, conversion workflow design. |
| **ILovePDF** | PDF tool segmentation, category landing pages. |
| **Vercel** | Design language, dark/light execution, dashboard patterns. |
| **Stripe Docs** | Documentation structure, code-as-docs philosophy. |

### 7.2 Reference Workflow — Passport Photo Maker

This canonical workflow (defined in the original brief) becomes a reusable pattern for any multi-step tool:

```
Upload → Face Detection → Auto Crop → Background Selection
       → Standard Size Selection → Preview → Download
```

The pattern is generalized in `11_ACD` as the **Multi-Step Tool Workflow** component and reused by Image Resizer, Background Remover, Format Converter, and any future tool with similar shape.

## 8. Best Practices

### 8.1 Decision-Making
- **Always prefer long-term scalability over short-term convenience.** A 2-hour shortcut that costs 20 hours of refactoring later is a net loss.
- **Never introduce a new dependency without justification.** Every dependency is a future maintenance liability. Justify in the PR description and link to the docs.
- **Never change architecture without explaining the impact.** Architectural changes require a written impact analysis in the PR.

### 8.2 Documentation
- **Docs are the source of truth.** If a behavior is not in the docs, it does not exist.
- **Update docs in the same PR as the code.** Code PRs without doc updates are blocked.
- **Cross-references must be live.** Broken links are P1 bugs.

### 8.3 Tool Development
- **Isolate every tool.** A bug in one tool must never affect another.
- **Reuse the workflow pattern.** New tools should compose existing workflows, not invent new ones.
- **Make tools discoverable.** Every tool links to related tools; internal linking is mandatory.

### 8.4 Performance
- **Lazy-load every tool.** Tool code is code-split; only the tool being used loads.
- **Cache aggressively.** Static assets immutable, HTML revalidated, tool outputs cached in IndexedDB when sensible.
- **Measure before optimizing.** No premature optimization without a profile.

## 9. Future Expansion

The charter explicitly anticipates the following expansion paths. Architecture must not preclude them.

### 9.1 Tool Expansion
- **1,000+ tools.** Folder structure (`06_FolderStructure`) and feature registry (`10_FBRD`) must scale to thousands of entries without reorganization.
- **New tool categories.** Adding a category must not require touching core modules.

### 9.2 Platform Expansion
- **Public API.** Expose tools as APIs in Phase 3+. Schema designed in `14_APIConvention` to be API-friendly from day 1.
- **Embed widgets.** Allow third-party sites to embed [PROJECT_NAME] tools.
- **White-label.** Allow partners to skin the platform.
- **Marketplace.** Allow community-contributed tools (Phase 4).

### 9.3 Business Expansion
- **Premium tier.** Higher usage limits, batch processing, no ads, priority AI. See `01_BRD`.
- **Enterprise tier.** SSO, audit logs, SLA. Phase 3+.
- **API monetization.** Usage-based pricing on the public API.

### 9.4 Technical Expansion
- **Multi-region deployment.** Vercel Edge + Supabase read replicas.
- **WebAssembly tools.** Heavy compute tools (e.g., video transcoding) compile to WASM.
- **Worker offloading.** Heavy file processing offloaded to Cloudflare Workers or Vercel Edge Functions.

## 10. Dependencies

### 10.1 External Dependencies (Free Tier)

| Dependency | Purpose | Free Tier Adequate Through | Upgrade Path |
|-----------|---------|---------------------------|--------------|
| Next.js 15+ | Application framework | Indefinite | N/A — open source |
| Supabase | DB, Auth, Storage | ~50k MAU | Pro tier $25/mo |
| Vercel | Hosting | ~100GB bandwidth | Pro tier $20/mo |
| Drizzle ORM | Type-safe ORM | Indefinite | N/A — open source |
| shadcn/ui | UI components | Indefinite | N/A — open source |

Full rationale in `04_TechStack`.

### 10.2 Internal Dependencies

- This document (`00_Project_Charter`) is the root. All other docs depend on it.
- `01_BRD` defines business context required by `24_Roadmap` and `25_Backlog`.
- `02_SAD` defines architecture required by `05_ProjectStructure`, `06_FolderStructure`, `13_DatabaseDesign`, `14_APIConvention`.
- `09_DesignSystem` is required by `12_UDS` and every UI implementation.

### 10.3 Assumptions

- Team size: 1–3 engineers through Phase 1, scaling to 5–10 by Phase 3.
- Budget: $0 through Phase 1; ≤$100/mo through Phase 2; revenue-funded thereafter.
- Domain expertise: at least one engineer comfortable with both frontend and Postgres.

## 11. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial charter. |
| 1.1.0 | 2026-06-28 | Chief Architect | Added §2 Platform Identity and §3 Architectural Locks (12 locks: LOCK-01 through LOCK-12). Renumbered subsequent sections. Updated §5 Standards to cite lock IDs. Updated cross-references to reflect doc renumbering (04=TechStack, 05=ProjectStructure, 10=FBRD, 11=ACD, 12=UDS). |

## 12. Cross References

- `01_BRD` — Business context that shapes Phase goals (§5.1).
- `02_SAD` — Implements LOCK-02, LOCK-03, LOCK-04, LOCK-06 (architecture, Tool Engine, modularity, database-optional).
- `03_DDD` — Defines bounded contexts that align with LOCK-04 (modularity).
- `04_TechStack` — Justifies each dependency listed in §10.1; operationalizes LOCK-02 (browser-first tech).
- `05_ProjectStructure` — Implements LOCK-04 (modularity), LOCK-05 (plugin-ready registry).
- `09_DesignSystem` — Implements LOCK-10 (developer-first minimalism).
- `10_FBRD` — Defines the tool-as-feature pattern and tool manifest schema (LOCK-05, LOCK-12).
- `12_UDS` — Implements the UX standards in §6.3.
- `15_SEOSpecification` — Implements LOCK-08 (SEO Constitution).
- `16_UserFlow` — Implements LOCK-07 (guest-first UX).
- `17_RBAC` — Implements the Security standards in §6.5.
- `18_AdminSpecification` — Implements LOCK-11 (admin philosophy) and LOCK-12 (feature lifecycle in admin).
- `22_AI_Guideline` — Implements LOCK-09 (AI Development Constitution).
- `24_Roadmap` — Expands the Phase goals in §5.1.
- `25_Backlog` — Operationalizes the Phase 1 tool priorities.
