# 22 — User Flow

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-07 (Guest-First UX), EC-05 (Progressive Enhancement), PC-06 (Monetization Philosophy), DGA-06 (Feature Flags — for A/B testing flows)

---

## 1. Purpose

This User Flow document defines **how users move through [PROJECT_NAME]** — from first visit as a guest, through registration, to premium subscription. It implements LOCK-07 (guest-first UX — no registration before value), EC-05 (progressive enhancement — degraded journeys when services fail), and PC-06 (monetization philosophy — revenue never interrupts task completion).

The document exists because user flows shape the entire user experience. Without documented flows, each feature designs its own flow inconsistently — one feature requires login upfront, another allows guest use but gates download, another has no clear path to premium. These inconsistencies frustrate users and reduce conversion. This document ensures every user journey follows the same principles: demonstrate value first, then ask for commitment.

This document covers the canonical user flows (guest → registered → premium), degraded flows (when services fail), and monetization touchpoints (where ads and premium prompts appear). It complements `15_UDS` (which defines interaction patterns) by defining the end-to-end journeys.

## 2. Scope

### 2.1 In Scope

- Guest user flows (browse, use tools, download without registration).
- Registration trigger points and flow.
- Registered user flows (history, favorites, sync).
- Premium upgrade flow.
- Degraded flows (JS fail, DB offline, auth unavailable, AI API down).
- Monetization touchpoints (ads, premium prompts).
- Onboarding sequences (first-time visitor, returning visitor).
- Abandonment and recovery flows.

### 2.2 Out of Scope

- UI interaction patterns → `15_UDS`.
- Component contracts → `14_ACD`.
- Analytics events → `16_EventSchemaSpecification`.
- Auth implementation → `23_RBAC`.
- Admin user management → `24_AdminSpecification`.

## 3. Architectural Decisions

### AD-01 — Guest-First Flow (LOCK-07)

**Context.** Forcing registration before demonstrating value drives users away, especially search-driven traffic with one-task intent.

**Decision.** Guest users can: browse tools, use tools, upload files, process files, preview results, download results — all without registration. Registration is prompted ONLY at value-adding moments: save history, favorite tools, cloud sync, premium features.

**Implements:** LOCK-07, PC-06 (Monetization — don't interrupt task).

### AD-02 — Progressive Registration Prompt

**Context.** Showing registration prompt too early annoys users; too late misses conversion opportunity.

**Decision.** Registration prompt triggers:
1. **After download (5+ tools in 7 days):** Non-blocking toast: "Create a free account to save your history."
2. **History save attempt (guest):** Modal: "Sign up to save your history across devices."
3. **Favorite attempt (guest):** Modal: "Sign up to save your favorites."
4. **Cloud sync attempt (guest):** Modal: "Sign up to sync across devices."
5. **Premium feature attempt (guest):** Modal: "Sign up for premium to use this feature."

Prompts are dismissible; don't reappear for 7 days after dismissal.

**Implements:** LOCK-07, PC-06, DGA-09 (Registration Rate metric).

### AD-03 — Degraded Flows (EC-05)

**Context.** Services fail. Without degraded flows, users hit error pages and leave.

**Decision.** Every critical user flow has a degraded path:
- **JS partially fails:** Form still submittable via HTML; fallback messaging.
- **DB offline:** Tools work (browser-side); history/favorites unavailable with subtle notice.
- **Auth unavailable:** User treated as guest; login button shows "temporarily unavailable."
- **AI API down:** AI tools show "service unavailable"; non-AI tools unaffected.
- **Rate limited:** Show "Please wait X seconds" with countdown.

**Implements:** EC-05, LOCK-06 (Database Optional).

### AD-04 — Monetization Never Interrupts (PC-06)

**Context.** Ads and premium prompts mid-workflow frustrate users and reduce completion rate.

**Decision.** Monetization touchpoints:
- **Ads:** Only AFTER result is shown (in Result section or below).
- **Premium prompts:** Only at premium-gated features (batch, cloud sync, AI); free alternative always offered.
- **Registration prompts:** Non-blocking; dismissible.
- **No paywalls on core workflow:** Input → Validation → Processing → Preview → Download is always free.

**Implements:** PC-06, LOCK-07.

## 4. Design Principles

### P1 — Value Before Commitment
Users experience value before being asked to register or pay.

### P2 — Progressive Disclosure
Don't overwhelm new users. Reveal features as they engage.

### P3 — Graceful Degradation
Every flow has a degraded path. Users never hit a dead end.

### P4 — Non-Blocking Prompts
Registration and premium prompts are dismissible, never modal-blocking the workflow.

### P5 — Consistent Recovery
Errors and degraded states have clear recovery paths.

### P6 — Mobile-First Flows
All flows work on 360px viewport. Touch-friendly.

## 5. Guest User Flow (Primary)

### 5.1 First-Time Visitor Flow

```
1. User arrives at tool page (from Google search)
   ↓
2. Page loads (Edge SSR, <500ms TTFB)
   - Hero section: title, description, privacy badge
   - Tool section: input form with empty state
   ↓
3. User provides input (file/text/params)
   ↓
4. User clicks "Process"
   ↓
5. Validation runs
   ├─ Invalid → inline errors, form editable
   └─ Valid → processing begins
   ↓
6. Processing (with progress indicator)
   ↓
7. Preview shown
   ↓
8. User clicks "Download"
   ↓
9. File downloads / text copies
   ↓
10. Success toast appears
    ↓
11. (Conditional) If 5+ tools used in 7 days:
    Registration prompt toast (non-blocking, dismissible)
    ↓
12. User can:
    ├─ Process another (reset form)
    ├─ View related tools (PC-09)
    ├─ Browse category
    └─ Leave
```

### 5.2 Browse and Discover Flow

```
1. User lands on homepage or category page
   ↓
2. Sees tool grid (popular tools, categories)
   ↓
3. Uses search (instant search, DGA-04)
   ↓
4. Clicks a tool → tool page flow (§5.1)
   ↓
5. After tool use, sees "Related Tools" section
   ↓
6. Clicks related tool → another tool page flow
   ↓
7. (Cycle continues; user explores ecosystem)
```

### 5.3 Search-Driven Flow

```
1. User searches "resize image"
   ↓
2. Instant search results (DGA-04)
   ↓
3. Clicks "Image Resizer" result
   ↓
4. Tool page flow (§5.1)
   ↓
5. (Analytics: search_performed, search_result_clicked)
```

## 6. Registration Flow

### 6.1 Registration Triggers

| Trigger | When | UI |
|---------|------|-----|
| After download | 5+ tools in 7 days | Non-blocking toast |
| History save attempt | Guest tries to save history | Modal |
| Favorite attempt | Guest tries to favorite | Modal |
| Cloud sync attempt | Guest tries cloud sync | Modal |
| Premium feature | Guest tries premium feature | Modal with premium upsell |

### 6.2 Registration Modal Flow

```
1. Trigger fires (e.g., favorite attempt)
   ↓
2. Modal appears:
   "Sign up to save your favorites"
   [Sign up with Google] [Sign up with GitHub]
   [Sign up with email]
   [Maybe later]
   ↓
3. User chooses:
   ├─ OAuth → OAuth flow → account created
   ├─ Email → email/password form → verification email
   └─ Maybe later → modal dismisses, doesn't reappear for 7 days
   ↓
4. Account created:
   - Previous anonymous history migrated to account
   - User returned to original action (favorite saved)
   - Success toast: "Account created! Your favorites are saved."
```

### 6.3 Email Verification Flow

```
1. User submits email/password
   ↓
2. Account created (unverified)
   ↓
3. Verification email sent
   ↓
4. User can immediately use tools (no verification gate per LOCK-07)
   ↓
5. User clicks verification link in email
   ↓
6. Email verified; full access to features
```

## 7. Registered User Flow

### 7.1 Returning Visitor Flow

```
1. User returns to site (recognized via cookie)
   ↓
2. Auto-login via Supabase session
   ↓
3. Homepage/dashboard shows:
   - Recently used tools
   - Favorites
   - Recommended tools
   ↓
4. User clicks a tool → tool page flow
   ↓
5. After tool use:
   - History entry saved automatically (LOCK-06: best-effort)
   - User can favorite the tool
   ↓
6. User can access dashboard:
   - History (all past tool uses)
   - Favorites
   - Settings
```

### 7.2 History Access Flow

```
1. User clicks "History" in dashboard
   ↓
2. History page loads (paginated)
   ↓
3. Each entry shows:
   - Tool name
   - Input summary (anonymized)
   - Output summary
   - Timestamp
   - "Run again" button
   ↓
4. User clicks "Run again" → tool page with pre-filled input
```

## 8. Premium Upgrade Flow (PC-06)

### 8.1 Premium Trigger

```
1. User attempts premium feature (e.g., batch download)
   ↓
2. Premium gate appears (NOT mid-core-workflow; only at premium feature)
   ↓
3. Gate explains:
   "Batch download is a premium feature"
   [Upgrade to Premium] [Download individually] [Maybe later]
   ↓
4. User chooses:
   ├─ Upgrade → pricing page → Stripe checkout
   ├─ Download individually → free alternative (one at a time)
   └─ Maybe later → dismisses
```

### 8.2 Pricing Page Flow

```
1. User lands on /pricing
   ↓
2. Sees plan comparison:
   - Free: $0, all tools, basic features
   - Premium: $9/mo, no ads, batch, cloud sync, AI, priority support
   - Enterprise: Contact us, SSO, SLA, audit logs
   ↓
3. User clicks "Upgrade to Premium"
   ↓
4. Stripe checkout (Stripe-hosted for security)
   ↓
5. Payment success → premium activated
   ↓
6. User returned to original tool with premium feature available
   ↓
7. Success toast: "Welcome to Premium! Batch download is now available."
```

### 8.3 Premium Management Flow

```
1. Premium user clicks "Settings" → "Subscription"
   ↓
2. Sees:
   - Current plan: Premium
   - Renewal date
   - Payment method (last 4 digits)
   - [Cancel subscription] [Update payment] [Download invoices]
   ↓
3. User can:
   - Cancel (effective at period end)
   - Update payment method
   - Download invoices
```

## 9. Degraded Flows (EC-05)

### 9.1 JavaScript Partially Fails

```
- Tool form renders (SSR HTML)
- If JS fails to hydrate:
  - Form still submittable via native HTML <form>
  - Fallback: POST to API route, server renders result page
  - Or: show message "This tool requires JavaScript. Please enable it."
```

### 9.2 Database Offline (LOCK-06)

```
- Tools work normally (browser-side processing per LOCK-02)
- History save fails silently (best-effort per LOCK-06)
- User sees subtle notice: "History temporarily unavailable"
- Favorites may not load
- Auth may fall back to guest mode
- Premium features unavailable (graceful degradation)
```

### 9.3 Auth Service Unavailable

```
- User treated as guest
- Login button shows "Login temporarily unavailable"
- Tools function in guest mode
- Registration prompts suppressed (can't complete anyway)
- Premium features unavailable
```

### 9.4 External AI API Down (AI Tools)

```
- AI tool shows: "AI service temporarily unavailable. Please try again later."
- Retry button offered
- Non-AI tools unaffected
- Status page linked
```

### 9.5 Rate Limited

```
- API returns 429 with Retry-After header
- UI shows: "Please wait X seconds before trying again."
- Countdown timer
- Auto-retry when timer expires
```

## 10. Onboarding Sequences

### 10.1 First-Time Visitor

- **No forced tour.** Users land on tool page and can immediately use it.
- **Subtle hints:** Empty state guides ("Drag and drop an image...").
- **Privacy badge:** "Your files stay on your device" (builds trust).
- **No registration prompt on first visit.**

### 10.2 Returning Visitor (Guest)

- **Recently used tools** shown on homepage (if cookie present).
- **No aggressive prompts.**
- **Registration prompt after 5+ tools in 7 days** (non-blocking).

### 10.3 New Registered User

- **Welcome toast:** "Account created! Your history is now saved."
- **Dashboard tour (optional):** "See your history and favorites" (dismissible).
- **No email verification gate** (per LOCK-07).

### 10.4 New Premium Subscriber

- **Welcome toast:** "Welcome to Premium! Enjoy ad-free experience."
- **Premium features highlighted** in relevant tools.
- **No aggressive upsell** (already converted).

## 11. Abandonment and Recovery

### 11.1 Cart Abandonment (Premium)

- User starts checkout but doesn't complete.
- **No immediate email.** (Privacy-respecting.)
- **Return visit:** Subtle "Complete your upgrade" banner (dismissible).
- **7 days later:** One email reminder (opt-in only).

### 11.2 Registration Abandonment

- User starts registration but doesn't complete.
- **No immediate follow-up.**
- **Return visit:** Registration still available; no nagging.

### 11.3 Tool Abandonment (Mid-Processing)

- User starts processing but leaves page.
- **No recovery needed** (browser-side processing is lost, but that's expected).
- **If authenticated:** Input may be saved to history (if processing completed).

## 12. Standards

### 12.1 Flow Consistency Standards
- Every tool follows the same user flow (guest-first, registration prompted at value moments).
- Every monetization touchpoint follows PC-06 (never interrupts core workflow).
- Every degraded flow has a clear recovery path.

### 12.2 Prompt Standards
- Registration prompts: non-blocking, dismissible, 7-day cooldown after dismissal.
- Premium prompts: only at premium features, free alternative always offered.
- Ads: only after result shown, max 1 per page.

### 12.3 Onboarding Standards
- No forced tours.
- No registration gates before value.
- Subtle hints, not aggressive CTAs.

### 12.4 Degraded Flow Standards
- Every critical flow has a degraded path.
- Degraded states clearly communicated to user.
- Recovery path always available.

## 13. Best Practices

### 13.1 When Designing a New Flow
1. Start with guest user (LOCK-07).
2. Identify value moments for registration prompts.
3. Ensure monetization never interrupts core workflow (PC-06).
4. Design degraded path for every service dependency (EC-05).
5. Test on mobile (360px viewport).
6. Test with keyboard only.
7. Test with screen reader.

### 13.2 When Adding a Premium Feature
1. Ensure feature is value-add, not core (PC-06).
2. Design premium gate (modal, not blocking).
3. Provide free alternative.
4. Add "Maybe later" option.
5. Track conversion rate (DGA-09).

### 13.3 When Designing a Degraded Flow
1. Identify what service could fail.
2. Determine what user can still do without that service.
3. Communicate degraded state clearly.
4. Provide recovery path or alternative.

## 14. Future Expansion

### 14.1 Personalized Flows (Phase 3+)
- Flows adapt based on user history and preferences.
- Recommended tools prominent.
- Personalized onboarding.

### 14.2 Team Workflows (Phase 3+)
- Shared history and favorites across team.
- Team admin manages billing.
- Collaborative tool collections.

### 14.3 Multi-Platform Flows (Phase 3+)
- Flows span web, mobile app, browser extension.
- Seamless handoff between platforms.

## 15. Dependencies

### 15.1 Document Dependencies
- Depends on `00_Project_Charter` §3 LOCK-07, §4 EC-05, §5 PC-06, §6 DGA-06.
- Depends on `14_ACD` — Components used in flows.
- Depends on `15_UDS` — Interaction patterns.
- `06_ArchitectureDecisionRecords` — ADR-007 (Guest-First), ADR-017 (Progressive Enhancement), ADR-059 (Monetization).
- `16_EventSchemaSpecification` — Flow analytics events.
- `23_RBAC` — Auth and permissions in flows.
- `24_AdminSpecification` — Admin user management.

### 15.2 External Dependencies
- Supabase Auth (registration, login, OAuth).
- Stripe (premium checkout).
- Next.js App Router (routing, SSR).

### 15.3 Assumptions
- Guest-first approach converts better than forced registration.
- Non-blocking prompts don't annoy users.
- Degraded flows are acceptable trade-offs for resilience.

## 16. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial User Flow. Defined guest-first flow, progressive registration prompts, registered/premium flows, degraded flows (JS/DB/auth/AI fail), monetization touchpoints, onboarding sequences, abandonment recovery. |

## 17. Cross References

- `00_Project_Charter` §3 LOCK-07, §4 EC-05, §5 PC-06, §6 DGA-06 — Implemented.
- `01_BRD` §4.1, §4.2 — Monetization and onboarding standards.
- `06_ArchitectureDecisionRecords` — ADR-007 (Guest-First UX), ADR-017 (Progressive Enhancement), ADR-059 (Monetization Philosophy).
- `14_ACD` — Components used in flows (ToolLayout, ErrorDisplay, SuccessToast, etc.).
- `15_UDS` — Interaction patterns and state designs.
- `16_EventSchemaSpecification` — `registration_prompt_viewed`, `registration_completed`, `download_completed` events.
- `17_AnalyticsArchitecture` — Registration rate, conversion rate metrics.
- `23_RBAC` — Auth and permission checks in flows.
- `24_AdminSpecification` — Admin user management.
- `28_AI_Guideline` — AI must follow user flow principles (LOCK-09, EC-11).
