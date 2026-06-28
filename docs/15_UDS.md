# 15 — UI/UX Design Specification (UDS)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.1.0
> **Implements:** LOCK-07 (Guest-First), LOCK-10 (Design Philosophy); EC-05 (Progressive Enhancement), EC-06 (Accessibility First); PC-05 (UX Consistency), PC-06 (Monetization), PC-08 (Error Experience); DGA-04 (Search UX patterns)

---

## 1. Purpose

This UI/UX Design Specification defines the **user flows, interaction patterns, accessibility standards, and state designs** for [PROJECT_NAME]. Where `10_DesignSystem` defines visual tokens and `14_ACD` defines component contracts, this document defines how users move through the platform, how components behave in response to user actions, and how every state (empty, loading, error, success) should feel.

The UDS exists because consistent visual design alone doesn't guarantee consistent UX. Two tools can use the same components but have different interaction patterns — one shows results instantly, another requires a "Process" button; one validates on submit, another validates on blur; one shows errors inline, another shows them in a toast. These inconsistencies make the platform feel amateurish. The UDS prevents this by specifying interaction patterns at the platform level, so every tool behaves the same way.

This document implements LOCK-07 (guest-first UX — no registration before value), LOCK-10 (developer-first minimalism), EC-05 (progressive enhancement — graceful degradation), EC-06 (accessibility first — WCAG AA), PC-05 (UX consistency — canonical layout), PC-06 (monetization philosophy — no interrupting task completion), and PC-08 (error experience — what/why/how).

## 2. Scope

### 2.1 In Scope

- User flows: guest → registered → premium journeys.
- Tool page interaction patterns (input, validation, processing, preview, download).
- State designs: empty, loading, error, success.
- Accessibility standards (WCAG AA operationalized).
- Mobile UX patterns (360px viewport, touch targets).
- Monetization touchpoints (where ads and premium prompts appear).
- Navigation patterns (header, footer, search, breadcrumbs).
- Degraded journeys (when JS/APIs/DB fail).

### 2.2 Out of Scope

- Visual design tokens → `10_DesignSystem`.
- Component APIs → `14_ACD`.
- Specific tool implementations → per-tool specs.
- SEO content → `21_SEOSpecification`.
- Admin UX → `24_AdminSpecification`.

## 3. Architectural Decisions

### AD-01 — Tool Page Interaction Pattern

**Context.** Without a standardized interaction pattern, each tool decides when to validate, when to process, how to show progress, how to show results. Inconsistent interactions confuse users.

**Decision.** Every tool follows this interaction pattern:
1. **Empty state:** Tool shows input form with empty state messaging.
2. **Input:** User provides input (file, text, params). Validation on blur (not on every keystroke).
3. **Submit:** User clicks "Process" button. Full validation runs.
4. **Validation failed:** Inline errors per field. Form remains editable.
5. **Processing:** Progress indicator. Cancel button available.
6. **Preview:** Result shown with "Download" and "Process another" buttons.
7. **Download:** File downloads or text copies. Success toast appears.
8. **Registration prompt (conditional):** If user is guest AND has used 5+ tools in 7 days, show non-blocking prompt after download.

**Implements:** PC-05 (UX Consistency), PC-06 (Monetization — prompt only after value).

### AD-02 — Validation Strategy

**Context.** Validating on every keystroke is annoying (errors while typing). Validating only on submit is frustrating (errors after filling entire form). A middle ground is needed.

**Decision.** Validation strategy:
- **On blur:** Validate field when user leaves it. Show inline error if invalid.
- **On submit:** Validate all fields. If any invalid, focus first invalid field.
- **On change (after first error):** Re-validate field as user types, clearing error when valid.

**Implements:** EC-06 (Accessibility — clear error feedback).

### AD-03 — Empty States Are Welcoming

**Context.** Empty states are often afterthoughts — generic "No data" messages. But empty states are the first thing users see; they set the tone.

**Decision.** Every empty state:
- Has a clear title ("Upload an image to resize").
- Has a description explaining what will happen ("Your image stays on your device").
- Has a CTA ("Choose Image" button).
- Uses an icon or illustration (lucide-react icon, not custom SVG).

**Implements:** PC-05 (consistent UX), LOCK-10 (minimal but welcoming).

### AD-04 — Loading States Set Expectations

**Context.** Generic spinners without context frustrate users ("how long will this take?").

**Decision.** Every loading state:
- Has a title ("Resizing your image...").
- Has a description ("This usually takes less than a second").
- Shows estimated duration if known (from manifest's `loadingStates[].estimatedDuration`).
- Shows progress bar if progress is trackable; spinner otherwise.
- Has cancel button if cancellation is safe.

**Implements:** PC-05, EC-05 (progressive enhancement — cancel allows recovery).

### AD-05 — Error States Are Recoverable

**Context.** PC-08 mandates errors explain what/why/how. The UX must support this three-component structure.

**Decision.** Error display:
- Prominent error icon (AlertCircle from lucide-react).
- "What happened" in bold, plain language.
- "Why" in muted text (if known).
- "How to fix" with actionable guidance.
- Retry button if retry is possible.
- Link to related tool if applicable (e.g., "Try Image Compressor first" for file too large).
- Never shows stack traces or technical codes.

**Implements:** PC-08 (Error Experience), EC-05 (graceful degradation).

### AD-06 — Success States Confirm Action

**Context.** Without success feedback, users don't know if their action worked.

**Decision.** Success feedback:
- Toast notification in bottom-right ("Image downloaded successfully").
- Auto-dismisses after 3 seconds.
- Manual dismiss via close button.
- Optional "Process another" button to reset.

**Implements:** PC-03 (Completion Standard — success feedback).

### AD-07 — Mobile UX Patterns

**Context.** Mobile users (360px viewport) have different needs than desktop. Touch targets, scroll behavior, and layout must adapt.

**Decision.** Mobile UX patterns:
- Touch targets minimum 44x44px (WCAG recommendation).
- Forms stack vertically (no side-by-side fields).
- Buttons full-width on mobile.
- Sticky "Process" button if form is long.
- File upload via native file picker (no custom UI).
- Result preview fits viewport (no horizontal scroll).
- Modals become bottom sheets on mobile.

**Implements:** PC-03 (Mobile Support), EC-06 (Accessibility).

## 4. Design Principles

### P1 — Consistency Over Creativity
Every tool behaves the same way. Users learn once, apply everywhere.

### P2 — Feedback for Every Action
Every user action gets feedback: hover, click, processing, success, error. No silent actions.

### P3 — Progressive Disclosure
Show essential information first. Advanced options hidden but accessible.

### P4 — Recovery Over Prevention
Allow users to make mistakes, then help them recover. Don't block actions preemptively.

### P5 — Mobile-First
Design for 360px first, then enhance for larger screens.

### P6 — Accessibility Is Not Optional
WCAG AA is the baseline. Every interaction works with keyboard and screen reader.

## 5. User Flows

### 5.1 Guest User Flow (LOCK-07)

```
1. User arrives at tool page (from search, link, or navigation)
   ↓
2. Page loads (Edge SSR, <500ms TTFB)
   ↓
3. Tool renders with empty state
   ↓
4. User provides input (file/text/params)
   ↓
5. User clicks "Process"
   ↓
6. Validation runs
   ├─ Invalid → inline errors, form editable
   └─ Valid → processing begins
   ↓
7. Processing (with progress indicator)
   ↓
8. Preview shown
   ↓
9. User clicks "Download"
   ↓
10. File downloads / text copies
    ↓
11. Success toast appears
    ↓
12. (Conditional) Registration prompt if 5+ tools used in 7 days
    ↓
13. User can: process another, view related tools, or leave
```

**Key points:**
- No registration required for steps 1-11 (LOCK-07).
- Registration prompt (step 12) is non-blocking; dismissible.
- User can complete entire workflow as guest.

### 5.2 Registered User Flow

```
1-11. Same as guest flow
    ↓
12. History entry saved automatically (if DB available)
    ↓
13. User can access history from dashboard
    ↓
14. Premium features (if premium subscriber):
    - Batch processing
    - Cloud sync
    - Higher file size limits
    - AI features
```

### 5.3 Premium Upsell Flow (PC-06)

```
1. User attempts premium feature (e.g., batch download)
   ↓
2. Premium gate appears (NOT mid-workflow; only at premium feature)
   ↓
3. Gate explains: "Batch download is a premium feature"
   ↓
4. Options:
   ├─ "Upgrade to Premium" → pricing page
   ├─ "Download individually" → free alternative
   └─ "Maybe later" → dismiss
   ↓
5. If upgrade: Stripe checkout → return to tool with premium enabled
```

**Key points:**
- Premium gate NEVER blocks core tool completion (PC-06).
- Gate only appears for value-add features.
- Free alternative always offered.

### 5.4 Degraded Journeys (EC-05)

#### 5.4.1 JavaScript Partially Fails

```
- Tool form renders (SSR HTML)
- If JS fails to hydrate:
  - Form still submittable via native HTML form submission
  - Fallback to server-side processing (if available)
  - Or: show message "This tool requires JavaScript. Please enable it."
```

#### 5.4.2 Database Offline (LOCK-06)

```
- Tool works normally (browser-side processing)
- History save fails silently
- User sees: "History temporarily unavailable" (subtle, non-blocking)
- Favorites may not load
- Auth may fall back to guest mode
```

#### 5.4.3 Auth Service Unavailable

```
- User treated as guest
- Login button shows "Login temporarily unavailable"
- Tools function in guest mode
- Premium features unavailable (graceful degradation)
```

#### 5.4.4 External AI API Down (AI Tools)

```
- AI tool shows: "AI service temporarily unavailable. Please try again later."
- Non-AI tools unaffected
- Retry button offered
```

## 6. Tool Page Layout (PC-05)

Canonical layout, top to bottom:

### 6.1 Hero Section

```
┌─────────────────────────────────────────┐
│ Breadcrumb: Home > Image > Image Resizer│
├─────────────────────────────────────────┤
│ # Image Resizer                         │
│                                         │
│ Resize images to any dimensions         │
│ instantly in your browser.              │
│                                         │
│ [🔒 Your files stay on your device]    │
└─────────────────────────────────────────┘
```

**Elements:**
- Breadcrumb (linked, LOCK-08)
- H1 title
- Description (1-2 sentences)
- Privacy badge (for browser tools; per LOCK-02 marketing claim)

### 6.2 Tool Section

```
┌─────────────────────────────────────────┐
│ [Drop zone: "Drop image here or click"] │
│                                         │
│ Width:  [____] px                       │
│ Height: [____] px                       │
│ [✓] Maintain aspect ratio              │
│                                         │
│ [    Resize Image    ]                  │
└─────────────────────────────────────────┘
```

**Elements:**
- Input form (`ToolInputForm`)
- File dropzone if applicable (`FileDropzone`)
- Configuration fields
- Submit button (primary, prominent)

### 6.3 Result Section

```
┌─────────────────────────────────────────┐
│ Result Preview:                         │
│ [Image preview]                         │
│                                         │
│ Dimensions: 800 x 600 px                │
│ Format: PNG                             │
│ Size: 245 KB                            │
│                                         │
│ [  Download  ] [Share] [Process Another]│
└─────────────────────────────────────────┘
```

**Elements:**
- Preview (`PreviewStage` component)
- Output metadata (dimensions, format, size)
- Download button (primary, prominent)
- Share button (optional)
- "Process another" link

### 6.4 FAQ Section

```
┌─────────────────────────────────────────┐
│ ## Frequently Asked Questions           │
│                                         │
│ ▶ Is this image resizer free?           │
│ ▶ Are my images uploaded to a server?   │
│ ▶ What image formats are supported?     │
└─────────────────────────────────────────┘
```

**Elements:**
- Section heading (H2)
- Accordion of Q&A items (from manifest `seo.faq`)
- Min 3 Q&As per LOCK-08

### 6.5 Related Tools Section

```
┌─────────────────────────────────────────┐
│ ## Related Tools                        │
│                                         │
│ [Image Compressor] [Image Cropper]      │
│ [Format Converter]                      │
└─────────────────────────────────────────┘
```

**Elements:**
- Section heading (H2)
- Grid of `ToolCard` components (from registry, PC-09)
- Min 3 related tools

### 6.6 Documentation Section

```
┌─────────────────────────────────────────┐
│ ## Documentation                        │
│                                         │
│ [Tool README content or link]           │
└─────────────────────────────────────────┘
```

**Elements:**
- Section heading (H2)
- Tool-specific documentation (from README or link)

### 6.7 Feedback Section

```
┌─────────────────────────────────────────┐
│ Was this helpful? [👍] [👎]            │
└─────────────────────────────────────────┘
```

**Elements:**
- "Was this helpful?" prompt
- Thumbs up / thumbs down buttons
- Optional comment field on thumbs down

### 6.8 Footer

Site-wide footer (same across all pages).

## 7. State Designs

### 7.1 Empty State

**When:** Tool page first loads, no input provided.

**UI:**
- Icon (lucide-react, e.g., `Upload` for file tools, `Edit` for text tools)
- Title: "Upload an image to resize" (action-oriented)
- Description: "Drag and drop an image, or click to browse. Your image stays on your device."
- CTA: "Choose Image" button

**Accessibility:**
- `aria-live="polite"` so screen readers announce when state changes.
- Icon has `aria-hidden="true"` (decorative).

### 7.2 Loading State

**When:** Processing stage is running.

**UI:**
- Spinner or progress bar (depending on whether progress is trackable)
- Title: "Resizing your image..."
- Description: "This usually takes less than a second."
- Cancel button (if cancellation is safe)

**Accessibility:**
- `aria-busy="true"` on the processing container.
- `aria-live="polite"` announces start and completion.
- Progress bar has `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

### 7.3 Error State

**When:** Any stage fails (validation, processing, download).

**UI (per PC-08):**
- Error icon (`AlertCircle` from lucide-react, red color)
- **What happened:** "Your image is too large to process."
- **Why:** "The maximum file size is 10MB; your file is 25MB."
- **How to fix:** "Try the Image Compressor tool first to reduce its size, or use a smaller image."
- Retry button (if retry is possible)
- Link to related tool (if applicable)

**Accessibility:**
- `role="alert"` for screen readers.
- `aria-live="assertive"` so error is announced immediately.
- Error icon has `aria-hidden="true"`; text conveys the meaning.

### 7.4 Success State

**When:** Download/copy completes.

**UI:**
- Success toast in bottom-right corner
- Message: "Image downloaded successfully"
- Auto-dismiss after 3 seconds
- Close button for manual dismiss

**Accessibility:**
- `role="status"`.
- `aria-live="polite"`.

### 7.5 Validation Error State

**When:** Input validation fails on submit.

**UI:**
- Inline error message below the invalid field
- Red border on the invalid field
- Error summary at top of form (if multiple errors)
- Focus moves to first invalid field

**Accessibility:**
- Error message has `id`; field has `aria-describedby` pointing to it.
- `aria-invalid="true"` on the field.
- Error summary has `role="alert"`.

## 8. Accessibility Standards (EC-06 Operationalized)

### 8.1 Keyboard Navigation

- All interactive elements operable via keyboard.
- Logical tab order (follows visual order, top to bottom, left to right).
- Visible focus indicator (`focus-visible:` Tailwind classes, `outline-2 outline-offset-2 outline-primary`).
- No keyboard traps.
- Skip-to-content link at top of every page (visually hidden until focused).
- Modals trap focus within (focus cycles within modal while open).
- Escape key closes modals.

### 8.2 Screen Reader Support

- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`, `<footer>`).
- ARIA labels only when semantic HTML insufficient.
- `aria-label` on icon-only buttons (e.g., close button).
- `aria-live="polite"` on dynamic content (toasts, results, loading states).
- `aria-live="assertive"` on errors.
- `aria-busy="true"` on elements being updated.
- Hidden content via `aria-hidden="true"` (not `display: none` if it should be screen-reader accessible).
- Form labels associated via `<label for>` or wrapping.

### 8.3 Color Contrast

- Body text on background: ≥7:1 (WCAG AAA).
- Large text (≥24px or ≥18.66px bold): ≥4.5:1 (WCAG AA).
- UI components and graphical elements: ≥3:1.
- Verified via Lighthouse CI (≥95 accessibility score).

### 8.4 Reduced Motion

- All animations respect `prefers-reduced-motion: reduce`.
- When reduced motion is preferred, animations are instant or replaced with opacity changes.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 8.5 Touch Targets

- Minimum 44x44px on touch devices.
- Adequate spacing (≥8px) between interactive elements.

### 8.6 Forms

- Every input has associated `<label>`.
- Required fields marked with `aria-required="true"` and visible indicator (`*`).
- Error messages via `aria-describedby` linking to input.
- Validation errors announced via `aria-live`.

## 9. Mobile UX Patterns

### 9.1 Viewport

- Design for 360px viewport first.
- Scale up to 768px (tablet), 1024px (laptop), 1280px (desktop).
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`.

### 9.2 Layout

- Single column on mobile.
- Two columns at `md:` (768px).
- Three or four columns at `lg:` (1024px).
- Forms always single column (even on desktop, for readability).

### 9.3 Navigation

- Hamburger menu on mobile (`< 768px`).
- Full nav bar on desktop.
- Search always visible (icon on mobile, expanded on desktop).

### 9.4 Buttons

- Full-width on mobile.
- Auto-width on desktop.
- Min height 44px (touch target).

### 9.5 Modals

- Bottom sheet on mobile (slides up from bottom).
- Centered modal on desktop.
- Full-screen on very small viewports (< 400px).

### 9.6 File Upload

- Use native file picker (`<input type="file">`).
- Custom dropzone only on desktop (mobile doesn't support drag-drop well).
- "Take photo" option on mobile (via `capture` attribute).

## 10. Monetization Touchpoints (PC-06)

### 10.1 Ad Placement

**Where:** Below the Result section, above FAQ.

**Format:** Single ad, responsive (leaderboard on desktop, rectangle on mobile).

**Network:** Carbon Ads or EthicalAds (privacy-respecting, developer-friendly).

**Constraints:**
- Max 1 ad per tool page.
- Never inside the Tool or Result sections.
- Never auto-playing audio/video.
- Clearly labeled "Advertisement" or "Sponsored".

### 10.2 Premium Upsell

**Where:** Only at premium-gated features (e.g., batch download, AI features, cloud sync).

**Format:** Inline modal or banner, not a full-page interstitial.

**Constraints:**
- Never blocks core tool completion (PC-06).
- Free alternative always offered.
- "Maybe later" dismisses without friction.
- Max 1 upsell per session (don't nag).

### 10.3 Registration Prompt

**Where:** After download, in a non-blocking toast.

**Trigger:** Guest user who has used 5+ tools in 7 days.

**Format:** Toast: "Create a free account to save your history and favorites."

**Constraints:**
- Non-blocking; dismissible.
- Doesn't appear on first tool use.
- Doesn't reappear for 7 days after dismissal.

## 11. Navigation Patterns

### 11.1 Header

```
[Logo] [Search] [Categories ▼] [Theme Toggle] [Login / Account]
```

- Sticky on scroll.
- Mobile: hamburger menu replaces Categories dropdown.

### 11.2 Footer

```
[About] [Blog] [Pricing] [Privacy] [Terms] [Contact]
[© 2026 [PROJECT_NAME]]
```

- Same across all pages.
- Contains legal links (privacy policy, terms).

### 11.3 Search

- Available in header (icon on mobile, expanded on desktop).
- Searches tool manifests (title, description, keywords, FAQ).
- Results in dropdown (instant) or dedicated search page.
- Powered by client-side search (Pagefind or similar) for speed.

### 11.4 Breadcrumbs

- Rendered in Hero section (per `14_ACD` `Breadcrumb` component).
- Format: Home > Category > Tool.
- JSON-LD BreadcrumbList structured data injected for SEO (LOCK-08).

## 12. Standards

### 12.1 UX Consistency Standards
- Every tool uses `ToolLayout` (PC-05).
- Every tool follows the interaction pattern in AD-01.
- Every tool uses the same state designs (§7).
- No custom interaction patterns without ADR approval.

### 12.2 Accessibility Standards
- WCAG 2.1 AA conformance (EC-06).
- Lighthouse accessibility score ≥95.
- Keyboard navigation tested per tool.
- Screen reader tested per tool.
- Reduced motion respected.

### 12.3 Mobile Standards
- 360px viewport supported.
- Touch targets ≥44x44px.
- Forms single column.
- Native file picker on mobile.

### 12.4 Monetization Standards (PC-06)
- Ads only after result.
- Premium gates only at premium features.
- Free alternative always offered.
- Registration prompts non-blocking.

## 13. Best Practices

### 13.1 When Designing a Tool's UX
1. Use `ToolLayout` for canonical structure (PC-05).
2. Design empty state first (first impression).
3. Design loading state with estimate (set expectations).
4. Design error states with what/why/how (PC-08).
5. Design success state with feedback.
6. Test on mobile (360px viewport).
7. Test with keyboard only.
8. Test with screen reader.

### 13.2 When Adding a New Interaction
1. Check if existing components support it (EC-03).
2. If new: document in this file via PR.
3. Ensure accessible (keyboard, screen reader).
4. Ensure mobile-friendly.
5. Ensure consistent with other tools.

### 13.3 When Reviewing UX
- Verify PC-05 layout.
- Verify PC-08 errors.
- Verify EC-06 accessibility.
- Verify mobile support.
- Verify monetization placement (PC-06).

## 14. Future Expansion

### 14.1 Personalization (Phase 3+)
- Personalized tool recommendations.
- Recent tools prominent.
- Custom layouts per user (within PC-05 constraints).

### 14.2 Internationalization (Phase 2+)
- RTL languages (Arabic, Hebrew).
- CJK fonts (Chinese, Japanese, Korean).
- Cultural adaptations (color meanings, icon familiarity).

### 14.3 Voice Interface (Phase 4+)
- Voice-activated tool selection.
- Voice input for text tools.

## 15. Dependencies

### 15.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4, §5 — LOCKs, ECs, PCs implemented.
- Depends on `10_DesignSystem` — visual tokens used.
- Depends on `12_ToolManifestSpecification` — manifest fields consumed.
- Depends on `14_ACD` — components used.
- `06_ArchitectureDecisionRecords` — ADR-058 (UX Consistency), ADR-059 (Monetization), ADR-061 (Error Experience).
- `11_ProductConstitution` — PC-05, PC-06, PC-08 expanded.
- `21_SEOSpecification` — SEO elements in layout.
- `22_UserFlow` — detailed user flow diagrams.
- `25_DevelopmentGuideline` — UX review in quality gates.
- `26_TestingStrategy` — accessibility and UX testing.

### 15.2 External Dependencies
- React, Next.js.
- shadcn/ui components.
- lucide-react icons.
- axe-core (accessibility testing).

### 15.3 Assumptions
- UX patterns remain stable; changes require ADR.
- Team tests for accessibility and mobile per tool.

## 16. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial UDS. Defined tool page interaction pattern, validation strategy, state designs (empty/loading/error/success/validation), accessibility standards (WCAG AA operationalized), mobile UX patterns, monetization touchpoints, navigation patterns, degraded journeys. |
| 1.1.0 | 2026-06-28 | Chief Architect | Linked to Data & Growth Architecture articles. Renumbered cross-references to reflect insertion of `16_EventSchemaSpecification`, `17_AnalyticsArchitecture`, `18_SearchArchitecture` (docs 16-28 shifted to 19-31). |

## 17. Cross References

- `00_Project_Charter` §3 LOCK-07, LOCK-10; §4 EC-05, EC-06; §5 PC-05, PC-06, PC-08; §6 DGA-04 — Implemented.
- `01_BRD` §4.2 — Onboarding standards (guest-first).
- `06_ArchitectureDecisionRecords` — ADR-058 (UX Consistency), ADR-059 (Monetization), ADR-061 (Error Experience).
- `16_EventSchemaSpecification` — Event schema (DGA-02).
- `17_AnalyticsArchitecture` — Analytics adapters (DGA-02, DGA-09).
- `18_SearchArchitecture` — Search index (DGA-04).
- `07_FolderStructure` — Component file locations.
- `08_CodingStandards` — Accessibility coding rules.
- `10_DesignSystem` — Visual tokens and primitive components.
- `11_ProductConstitution` — PC-05, PC-06, PC-08 expanded.
- `12_ToolManifestSpecification` — Manifest fields consumed by UX.
- `13_FBRD` — Tool specs plan UX per this document.
- `14_ACD` — Components implementing these patterns.
- `21_SEOSpecification` — SEO elements in layout.
- `22_UserFlow` — Detailed user flow diagrams.
- `24_AdminSpecification` — Admin UX (separate but consistent).
- `25_DevelopmentGuideline` — UX review in quality gates.
- `26_TestingStrategy` — Accessibility and UX testing.
- `28_AI_Guideline` — AI must follow UX patterns (LOCK-09, EC-11).
