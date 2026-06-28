# 14 — Architecture Component Document (ACD)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.1.0
> **Implements:** LOCK-03 (Tool Engine), LOCK-04 (Modular); EC-03 (Component Reuse First), EC-10 (Design System Governance); PC-03 (Completion Standard), PC-05 (UX Consistency), PC-08 (Error Experience); DGA-02 (Analytics components), DGA-04 (Search components)

---

## 1. Purpose

This Architecture Component Document defines the **reusable components and modules** that implement the Tool Engine, Tool Registry, and tool page layout for [PROJECT_NAME]. It is the catalog of "what building blocks exist" so that tool authors can compose them rather than reinvent them (per EC-03 Component Reuse First).

The ACD exists because without a documented component catalog, engineers create duplicate implementations. One engineer builds a `FileUploader`, another builds a `FileDropzone`, a third builds an `UploadInput` — three components doing the same thing with different APIs. This fragmentation makes the codebase harder to maintain and the UX inconsistent. The ACD prevents this by being the authoritative list of available components, their contracts, and when to use them.

This document covers three categories of components: (1) **Tool Engine components** that implement LOCK-03 (the lifecycle pipeline), (2) **shared UI components** that implement PC-05 (UX consistency), and (3) **composite components** that combine primitives into higher-level patterns. Primitive design system components (Button, Input, Card) are documented in `10_DesignSystem`; this document covers the application-specific components built on top of them.

## 2. Scope

### 2.1 In Scope

- Tool Engine component architecture (`ToolEngine`, stage components).
- Tool page layout components (`ToolLayout`, `ToolHero`, `ToolResult`, etc.).
- File upload components (`FileDropzone`, `FilePreview`).
- Form components (`ToolInputForm`, `FormField`).
- Error and feedback components (`ErrorDisplay`, `SuccessToast`, `LoadingState`).
- Discoverability components (`RelatedTools`, `FAQ`, `Breadcrumb`).
- Component catalog: when to use each component.
- Component contracts: props, behavior, accessibility.

### 2.2 Out of Scope

- Primitive design system components (Button, Input, Card) → `10_DesignSystem`.
- User flows and interaction patterns → `15_UDS`.
- Specific tool implementations → per-tool specs.
- Component testing strategy → `26_TestingStrategy`.
- Naming conventions → `09_NamingConvention`.

## 3. Architectural Decisions

### AD-01 — Tool Engine as Composable Component

**Context.** The Tool Engine (LOCK-03) orchestrates the lifecycle: Input → Validation → Processing → Preview → Download → History → Share. It could be a single monolithic component, but that would be hard to test and extend.

**Decision.** The Tool Engine is a composable component that orchestrates stage components. Each stage is a separate, testable unit. The engine itself is a thin orchestrator that calls stages in sequence and manages state transitions.

**Implements:** LOCK-03, EC-09 (Testing — stages are independently testable), EC-03 (Component Reuse).

### AD-02 — ToolLayout Enforces PC-05

**Context.** PC-05 mandates every tool page follows the canonical layout: Hero → Tool → Result → FAQ → Related Tools → Documentation → Feedback → Footer. Without a component that enforces this, tool authors may rearrange sections.

**Decision.** `ToolLayout` is the required wrapper component for every tool page. It renders the canonical layout in order. Tool authors pass content as props; the layout handles ordering, spacing, and section visibility.

**Implements:** PC-05 (UX Consistency), EC-10 (Design System Governance).

### AD-03 — Error Components Implement PC-08

**Context.** PC-08 mandates every error explains what happened, why, how to fix. Without standardized error components, each tool implements errors differently.

**Decision.** `ErrorDisplay` component takes a `FailureState` (from manifest) and renders the three-component message (what/why/how). All tools use this component; no custom error UIs.

**Implements:** PC-08 (Error Experience), EC-10.

### AD-04 — Component Catalog is Authoritative

**Context.** Without a documented catalog, engineers don't know what components exist, leading to duplication.

**Decision.** This document is the authoritative component catalog. Every shared component is listed here with its contract. New components must be added here before being used. EC-03 (Component Reuse First) is enforced by checking this catalog.

**Implements:** EC-03, EC-02 (One Source of Truth).

## 4. Design Principles

### P1 — Compose, Don't Reinvent
Before creating a new component, check this catalog. Extend existing components if possible.

### P2 — Components Are Accessible by Default
Every component meets WCAG AA (EC-06). Accessibility is not optional.

### P3 — Components Support Dark Mode
Every component works in light and dark mode via design tokens (LOCK-10).

### P4 — Components Are Testable
Components are designed for unit and visual testing. Props are typed; behavior is predictable.

### P5 — Components Are Documented
Every component has a contract (props, behavior, accessibility notes) in this document.

## 5. Tool Engine Components

### 5.1 `ToolEngine<TInput, TOutput>`

**Purpose:** Orchestrates the Tool Engine lifecycle (LOCK-03). Calls stages in sequence, manages state, emits analytics events.

**Location:** `packages/tool-engine/src/engine.ts`

**Contract:**

```typescript
interface ToolEngineProps<TInput, TOutput> {
  manifest: ToolManifest;
  children: (state: ToolEngineState<TInput, TOutput>) => React.ReactNode;
}

type ToolEngineState<TInput, TOutput> =
  | { phase: 'empty'; emptyState: EmptyState }
  | { phase: 'input'; input: Partial<TInput> }
  | { phase: 'validating'; input: TInput }
  | { phase: 'validation_failed'; errors: ValidationError[] }
  | { phase: 'processing'; input: TInput; loadingState: LoadingState }
  | { phase: 'preview'; input: TInput; output: TOutput }
  | { phase: 'error'; failure: FailureState }
  | { phase: 'downloaded'; output: TOutput };

function ToolEngine<TInput, TOutput>(props: ToolEngineProps<TInput, TOutput>): JSX.Element;
```

**Behavior:**
- Manages state transitions: empty → input → validating → processing → preview → downloaded (or error at any stage).
- Calls stage functions: `input` → `validation` → `processing` → `preview` → `download`.
- Emits analytics events automatically (PC-07 standard 10 events).
- Handles cancellation via `AbortSignal`.
- Catches stage errors and maps to `FailureState`.

**Accessibility:**
- Announces state changes via `aria-live="polite"`.
- Manages focus appropriately (e.g., focus result on preview).

**When to use:** Every tool page uses `ToolEngine` via `ToolLayout`. Tool authors don't use it directly.

---

### 5.2 Stage Components

Stage components are the building blocks of the Tool Engine. Each tool implements these per its manifest.

#### 5.2.1 `InputStage<T>`

**Purpose:** Accepts raw user input (file, text, params).

**Contract:**

```typescript
interface InputStage<TInput> {
  (context: StageContext): Promise<TInput>;
}
```

**Implementation pattern:** Tool's `stages/input.ts` exports an `inputStage` function that returns a Promise resolving to the validated input. Typically renders a form via `ToolInputForm`.

#### 5.2.2 `ValidationStage<T>`

**Purpose:** Runs Zod schema validation on input.

**Contract:**

```typescript
interface ValidationStage<TInput> {
  (input: unknown, context: StageContext): { success: true; data: TInput } | { success: false; errors: ValidationError[] };
}
```

**Implementation pattern:** Tool's `stages/validation.ts` exports a function that runs the manifest's `inputSchema` (Zod) and returns the result.

#### 5.2.3 `ProcessingStage<TInput, TOutput>`

**Purpose:** Executes the tool's core logic. Browser-side or server-side per manifest's `execution` field.

**Contract:**

```typescript
interface ProcessingStage<TInput, TOutput> {
  (input: TInput, context: StageContext): Promise<TOutput>;
}
```

**Implementation pattern:** Tool's `stages/processing.ts` exports the core logic. For browser tools, uses Canvas/Web Crypto/etc. For server tools, calls API route.

#### 5.2.4 `PreviewStage<TOutput>`

**Purpose:** React component that renders the output for user inspection before download.

**Contract:**

```typescript
interface PreviewStageProps<TOutput> {
  output: TOutput;
  onAccept: () => void;  // User confirms and proceeds to download
  onReject: () => void;  // User wants to modify input
}

type PreviewStage<TOutput> = React.ComponentType<PreviewStageProps<TOutput>>;
```

**Implementation pattern:** Tool's `stages/preview.tsx` exports a React component. For image tools, renders the image. For text tools, renders formatted text. For PDF tools, renders PDF preview.

#### 5.2.5 `DownloadStage<TOutput>`

**Purpose:** Packages output for download (file) or copy (text). Triggers registration gate per LOCK-07 only for premium features.

**Contract:**

```typescript
interface DownloadStage<TOutput> {
  (output: TOutput, context: StageContext): Promise<DownloadResult>;
}

interface DownloadResult {
  kind: 'file' | 'text';
  blob?: Blob;          // For file downloads
  text?: string;        // For text copies
  filename: string;     // Suggested filename
  mimeType: string;
}
```

**Implementation pattern:** Tool's `stages/download.ts` exports a function that converts output to downloadable form.

#### 5.2.6 `HistoryStage<TOutput>` (Optional)

**Purpose:** Persists execution to user history (if authenticated). Best-effort per LOCK-06.

**Contract:**

```typescript
interface HistoryStage<TOutput> {
  (input: unknown, output: TOutput, context: StageContext): Promise<void>;
}
```

**Implementation pattern:** Calls Identity Context's `saveHistoryEntry` server action. Fails silently if DB unavailable (LOCK-06).

#### 5.2.7 `ShareStage<TOutput>` (Optional)

**Purpose:** Generates a shareable link or QR code for the result.

**Contract:**

```typescript
interface ShareStage<TOutput> {
  (output: TOutput, context: StageContext): Promise<ShareResult>;
}

interface ShareResult {
  url: string;          // Shareable URL
  qrCodeDataUrl?: string;  // QR code image
}
```

## 6. Tool Page Layout Components

### 6.1 `ToolLayout`

**Purpose:** Enforces PC-05 canonical layout for every tool page.

**Location:** `src/shared/components/ToolLayout.tsx`

**Contract:**

```typescript
interface ToolLayoutProps {
  manifest: ToolManifest;
  children: React.ReactNode;  // The ToolEngine + tool-specific UI
  faq?: FAQItem[];             // Defaults to manifest.seo.faq
  relatedTools?: ToolManifest[];  // Defaults to registry lookup
  documentation?: React.ReactNode;  // Optional; defaults to manifest README
}

function ToolLayout(props: ToolLayoutProps): JSX.Element;
```

**Renders (in order):**
1. `ToolHero` — title, description, breadcrumb
2. Tool content (children) — `ToolEngine` + tool-specific UI
3. `ToolResult` — wraps preview/download (part of children typically)
4. `FAQ` — from manifest or props
5. `RelatedTools` — from registry or props
6. `Documentation` — from manifest README or props
7. `FeedbackWidget` — "Was this helpful?"
8. Footer — site-wide footer

**Accessibility:**
- Semantic landmarks: `<header>`, `<main>`, `<aside>`, `<footer>`.
- Skip-to-content link.
- Proper heading hierarchy (h1 for tool title, h2 for sections).

**When to use:** Every tool page. Required by PC-05.

---

### 6.2 `ToolHero`

**Purpose:** Renders the tool title, description, and breadcrumb at the top of the page.

**Contract:**

```typescript
interface ToolHeroProps {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
}
```

**Renders:**
- Breadcrumb (linked)
- H1 title
- Description paragraph
- Optional privacy badge ("Your files stay on your device" for browser tools)

---

### 6.3 `ToolInputForm`

**Purpose:** Renders the tool's input form using React Hook Form + Zod.

**Contract:**

```typescript
interface ToolInputFormProps<TInput> {
  schema: ZodSchema<TInput>;
  onSubmit: (input: TInput) => void;
  fields: FieldConfig[];  // Describes each field
  submitLabel?: string;   // Defaults to "Process"
}

interface FieldConfig {
  name: string;
  type: 'file' | 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'slider';
  label: string;
  description?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];  // For select/radio
  min?: number;  // For number/slider
  max?: number;
  step?: number;
  defaultValue?: unknown;
}
```

**Behavior:**
- Renders form using `@packages/ui` primitives (Input, Select, Checkbox, etc.).
- Validates on submit via Zod schema.
- Calls `onSubmit` with validated input.
- Shows validation errors inline per field.

**Accessibility:**
- Every field has associated `<label>`.
- Errors announced via `aria-describedby`.
- Required fields marked.

---

### 6.4 `FileDropzone`

**Purpose:** File upload via drag-and-drop or click-to-browse.

**Contract:**

```typescript
interface FileDropzoneProps {
  accept: string[];          // MIME types, e.g., ['image/png', 'image/jpeg']
  maxSize: number;           // bytes
  multiple?: boolean;        // Default false
  onFileSelected: (file: File) => void;
  onFileRejected?: (reason: string) => void;
  label?: string;            // Default "Drop file here or click to browse"
}
```

**Behavior:**
- Highlights on drag-over.
- Validates file type and size on drop.
- Calls `onFileSelected` or `onFileRejected`.

**Accessibility:**
- Keyboard accessible (Enter/Space to open file picker).
- ARIA label on the dropzone.
- Visual focus indicator.

---

### 6.5 `ToolProcessingProgress`

**Purpose:** Shows progress during processing stage.

**Contract:**

```typescript
interface ToolProcessingProgressProps {
  loadingState: LoadingState;  // From manifest
  progress?: number;           // 0-100, if available
  onCancel?: () => void;
}
```

**Behavior:**
- Shows spinner or progress bar.
- Displays loading state title and description.
- Cancel button if `onCancel` provided.

---

### 6.6 `ToolResult`

**Purpose:** Wraps the preview and download button.

**Contract:**

```typescript
interface ToolResultProps {
  preview: React.ReactNode;  // The preview stage output
  downloadLabel?: string;     // Default "Download"
  onDownload: () => void;
  onShare?: () => void;       // Optional share button
  onProcessAgain?: () => void;  // "Process another" button
}
```

**Behavior:**
- Renders preview in a Card.
- Download button (prominent, primary).
- Optional Share button.
- "Process another" link to reset.

**Accessibility:**
- Download button has `aria-label` if icon-only.
- Result announced via `aria-live`.

---

### 6.7 `ErrorDisplay`

**Purpose:** Renders PC-08-compliant error messages.

**Contract:**

```typescript
interface ErrorDisplayProps {
  failure: FailureState;  // From manifest
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

**Renders:**
- Error icon (lucide-react `AlertCircle`).
- "What happened" message (prominent).
- "Why" message (if provided, muted).
- "How to fix" message (with action).
- Retry button if `onRetry` provided.

**Accessibility:**
- `role="alert"`.
- `aria-live="assertive"` for screen readers.

---

### 6.8 `SuccessToast`

**Purpose:** Shows success feedback after download or copy.

**Contract:**

```typescript
interface SuccessToastProps {
  message: string;
  onDismiss?: () => void;
  duration?: number;  // Default 3000ms
}
```

**Behavior:**
- Appears in bottom-right corner.
- Auto-dismisses after duration.
- Manual dismiss via close button.

**Accessibility:**
- `role="status"`.
- `aria-live="polite"`.

---

### 6.9 `RelatedTools`

**Purpose:** Renders related tools section (PC-09).

**Contract:**

```typescript
interface RelatedToolsProps {
  tools: ToolManifest[];  // From registry lookup
  max?: number;           // Default 6
}
```

**Renders:**
- Section heading "Related Tools".
- Grid of `ToolCard` components.
- Each card links to the tool's page.

---

### 6.10 `FAQ`

**Purpose:** Renders FAQ section (LOCK-08).

**Contract:**

```typescript
interface FAQProps {
  items: FAQItem[];  // From manifest.seo.faq
}
```

**Renders:**
- Section heading "Frequently Asked Questions".
- Accordion of Q&A items.
- JSON-LD structured data injected for SEO.

---

### 6.11 `Breadcrumb`

**Purpose:** Renders breadcrumb navigation (LOCK-08).

**Contract:**

```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];  // From manifest.seo.breadcrumb
}
```

**Renders:**
- Linked breadcrumb path.
- JSON-LD BreadcrumbList structured data injected.

---

### 6.12 `FeedbackWidget`

**Purpose:** "Was this helpful?" widget at the bottom of tool pages.

**Contract:**

```typescript
interface FeedbackWidgetProps {
  toolSlug: string;
  onSubmit: (feedback: { helpful: boolean; comment?: string }) => void;
}
```

**Behavior:**
- "Was this helpful? Yes / No" buttons.
- Optional comment field on "No".
- Submit triggers analytics event.

## 7. Component Catalog (Quick Reference)

### 7.1 Tool Engine Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ToolEngine<T,I,O>` | `@packages/tool-engine` | Orchestrates lifecycle |
| `InputStage` | Per-tool `stages/input.ts` | Accepts input |
| `ValidationStage` | Per-tool `stages/validation.ts` | Validates input |
| `ProcessingStage` | Per-tool `stages/processing.ts` | Core logic |
| `PreviewStage` | Per-tool `stages/preview.tsx` | Renders preview |
| `DownloadStage` | Per-tool `stages/download.ts` | Packages download |
| `HistoryStage` | Per-tool `stages/history.ts` | Persists to history |
| `ShareStage` | Per-tool `stages/share.ts` | Generates share link |

### 7.2 Tool Page Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ToolLayout` | `@/shared/components` | Enforces PC-05 layout |
| `ToolHero` | `@/shared/components` | Title + breadcrumb |
| `ToolInputForm` | `@/shared/components` | Form rendering |
| `FileDropzone` | `@/shared/components` | File upload |
| `ToolProcessingProgress` | `@/shared/components` | Processing UI |
| `ToolResult` | `@/shared/components` | Preview + download |
| `ErrorDisplay` | `@/shared/components` | PC-08 errors |
| `SuccessToast` | `@/shared/components` | Success feedback |
| `RelatedTools` | `@/shared/components` | PC-09 discoverability |
| `FAQ` | `@/shared/components` | LOCK-08 SEO |
| `Breadcrumb` | `@/shared/components` | LOCK-08 navigation |
| `FeedbackWidget` | `@/shared/components` | User feedback |

### 7.3 Composite Components (from `10_DesignSystem`)

| Component | Location | Purpose |
|-----------|----------|---------|
| `PageContainer` | `@/shared/components` | Page wrapper |
| `SectionHeading` | `@/shared/components` | Section heading |
| `EmptyState` | `@/shared/components` | Empty state UI |
| `ErrorState` | `@/shared/components` | Generic error (use `ErrorDisplay` for tools) |
| `LoadingState` | `@/shared/components` | Generic loading |
| `ToolCard` | `@/shared/components` | Tool card for grids |
| `ToolGrid` | `@/shared/components` | Grid of ToolCards |

## 8. Standards

### 8.1 Component Authoring Standards
- Every component is in PascalCase file (e.g., `ToolLayout.tsx`).
- Every component has typed props (interface defined above component).
- Every component is accessible (WCAG AA).
- Every component supports dark mode.
- Every component has at least one test.

### 8.2 Component Reuse Standards (EC-03)
- Before creating a new component, search this catalog.
- Extend existing components via props rather than creating variants.
- New components must be added to this catalog via PR.

### 8.3 Component Documentation Standards
- Every component has a contract (props, behavior) in this document.
- Complex components have usage examples.
- Accessibility notes documented.

### 8.4 Component Testing Standards
- Unit tests for logic.
- Component tests for rendering and interaction.
- Accessibility tests (axe-core).
- Visual tests (Storybook, Phase 2+).

## 9. Best Practices

### 9.1 When Creating a Tool Page
1. Use `ToolLayout` as the wrapper.
2. Pass manifest to `ToolLayout` for SEO and discoverability.
3. Use `ToolEngine` inside the layout.
4. Use `ToolInputForm` for input (with `FileDropzone` if file input).
5. Use `ToolProcessingProgress` during processing.
6. Use `ToolResult` to wrap preview and download.
7. Use `ErrorDisplay` for errors (never custom error UI).
8. Use `SuccessToast` for download confirmation.
9. Let `ToolLayout` render FAQ, RelatedTools, Documentation, Feedback, Footer.

### 9.2 When Creating a New Shared Component
1. Check this catalog first (EC-03).
2. If new: add to this document via PR.
3. Place in `@/shared/components` or `@packages/ui` per `07_FolderStructure`.
4. Write tests.
5. Document contract.
6. Verify accessibility and dark mode.

### 9.3 When Modifying an Existing Component
- Maintain backward compatibility or migrate all consumers.
- Bump version if breaking change.
- Update this document.

## 10. Future Expansion

### 10.1 Storybook (Phase 2+)
- Component documentation and visual testing.
- Stories colocated with components.

### 10.2 Component Versioning (Phase 3+)
- Components may gain versions as the platform evolves.
- Migration tooling for breaking changes.

### 10.3 Plugin Component Library (Phase 4)
- Plugins may ship their own components.
- Plugin components follow same standards (accessibility, dark mode).

## 11. Dependencies

### 11.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4, §5 — LOCKs, ECs, PCs implemented.
- Depends on `02_SAD` AD-02 — Tool Engine contract.
- Depends on `10_DesignSystem` — primitive components used.
- Depends on `12_ToolManifestSpecification` — manifest fields referenced.
- `06_ArchitectureDecisionRecords` — ADR-026, ADR-040, ADR-043, ADR-051, ADR-058, ADR-061.
- `11_ProductConstitution` — PC-03, PC-05, PC-08.
- `13_FBRD` — tool specs reference these components.
- `15_UDS` — interaction patterns using these components.
- `26_TestingStrategy` — component testing.

### 11.2 External Dependencies
- React, Next.js.
- shadcn/ui primitives.
- lucide-react icons.
- React Hook Form, Zod.

### 11.3 Assumptions
- Component contracts remain stable; changes require ADR.
- Team uses these components rather than reinventing.

## 12. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial ACD. Defined Tool Engine components (ToolEngine + 7 stage types), tool page layout components (ToolLayout + 11 components), component catalog, contracts, accessibility standards. |
| 1.1.0 | 2026-06-28 | Chief Architect | Linked to Data & Growth Architecture articles. Renumbered cross-references to reflect insertion of `16_EventSchemaSpecification`, `17_AnalyticsArchitecture`, `18_SearchArchitecture` (docs 16-28 shifted to 19-31). |

## 13. Cross References

- `00_Project_Charter` §3 LOCK-03, LOCK-04; §4 EC-03, EC-10; §5 PC-03, PC-05, PC-08; §6 DGA-02, DGA-04 — Implemented.
- `02_SAD` §6 — Tool Engine detailed (components here implement it).
- `06_ArchitectureDecisionRecords` — ADR-026 (Tool Engine), ADR-040 (shadcn/ui), ADR-043 (RHF+Zod), ADR-051 (shared code), ADR-058 (UX Consistency), ADR-061 (Error Experience).
- `16_EventSchemaSpecification` — Event schema (DGA-02).
- `17_AnalyticsArchitecture` — Analytics adapters (DGA-02, DGA-09).
- `18_SearchArchitecture` — Search index (DGA-04).
- `07_FolderStructure` — Component file locations.
- `08_CodingStandards` — Component coding standards.
- `09_NamingConvention` — Component naming.
- `10_DesignSystem` — Primitive components used here.
- `11_ProductConstitution` — PC-03, PC-05, PC-08 expanded.
- `12_ToolManifestSpecification` — Manifest fields components consume.
- `13_FBRD` — Tool specs reference these components.
- `15_UDS` — Interaction patterns using these components.
- `21_SEOSpecification` — FAQ and Breadcrumb SEO.
- `25_DevelopmentGuideline` — Component PR workflow.
- `26_TestingStrategy` — Component testing.
- `28_AI_Guideline` — AI must use these components (LOCK-09, EC-11).
