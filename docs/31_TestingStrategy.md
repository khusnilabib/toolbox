# 31 — Testing Strategy

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** EC-09 (Testing Philosophy), PC-03 (Tool Completion Standard — tests required)

---

## 1. Purpose

This Testing Strategy defines the **testing pyramid, frameworks, coverage targets, and testing standards** for [PROJECT_NAME]. It implements EC-09 (testing pyramid: Unit → Integration → E2E; engines designed for testability) and PC-03 (tests are mandatory for tool completion).

## 2. Scope

### 2.1 In Scope
- Testing pyramid (unit, integration, E2E).
- Testing frameworks (Vitest, Playwright, Testing Library).
- Coverage targets per layer.
- Test file placement and naming.
- Accessibility testing.
- Performance testing.
- Visual testing (Phase 2+).
- Load testing (Phase 3+).

### 2.2 Out of Scope
- CI/CD pipeline → `30_DevelopmentGuideline`.
- Code review checklist → `08_CodingStandards`.
- Quality gates → `30_DevelopmentGuideline` §Quality Gates.

## 3. Architectural Decisions

### AD-01 — Testing Pyramid

**Context.** EC-09 mandates Unit → Integration → E2E pyramid. Without the pyramid, teams default to all-E2E (slow, flaky) or no tests (fast initial delivery, unmaintainable later).

**Decision.** Testing pyramid:
- **Unit Tests (70%):** Fast, isolated, test pure functions and components.
- **Integration Tests (20%):** Test interactions between modules (e.g., Tool Engine stages, server actions with DB).
- **E2E Tests (10%):** Test full user flows via browser (Playwright).

### AD-02 — Frameworks

**Context.** Multiple frameworks exist; choosing the right ones affects productivity and maintainability.

**Decision.**
- **Unit/Integration:** Vitest (ESM-native, fast, Jest-compatible API).
- **Component Testing:** Testing Library (`@testing-library/react`).
- **E2E:** Playwright (cross-browser, fast, reliable).
- **Accessibility:** axe-core (via `@axe-core/playwright`).
- **Performance:** Lighthouse CI.
- **Visual:** Storybook + Chromatic (Phase 2+).

### AD-03 — Test File Placement (Colocated)

**Context.** Separate test directories create distance between code and tests, making it easy to forget tests.

**Decision.** Tests colocated with code in `tests/` subdirectory (per `07_FolderStructure` AD-04):
- `src/tools/image/image-resize/tests/stages.test.ts` — Unit tests for stages.
- `src/tools/image/image-resize/tests/e2e.test.ts` — E2E test for workflow.
- `tests/e2e/` — Project-wide E2E tests.
- `tests/integration/` — Cross-context integration tests.

### AD-04 — Coverage Targets

**Context.** Without targets, coverage is inconsistent. With unrealistic targets, teams write tests for coverage metrics, not quality.

**Decision.** Coverage targets (guidelines, not hard gates):
- Domain layer: ≥90% line coverage.
- Application layer: ≥80% line coverage.
- Tool stages: ≥85% line coverage.
- Presentation layer: ≥60% line coverage (focus on interaction logic).
- Infrastructure layer: ≥70% line coverage.

Coverage tracked but not enforced as hard gate; gate is "tests exist for critical paths."

### AD-05 — Testability Requirements (EC-09)

**Context.** Untestable code (tight coupling, global state, side effects) makes testing expensive.

**Decision.** Testability requirements (per `08_CodingStandards` AD-08):
- Pure functions preferred; side effects isolated.
- Dependency injection for external deps.
- No global mutable state.
- Tool Engine, Registry, Validators designed for independent testing.
- Mocks for Supabase, Stripe, external APIs.

## 4. Testing Pyramid (Detailed)

### 4.1 Unit Tests

**What:** Test individual functions, components, hooks in isolation.

**Framework:** Vitest + Testing Library.

**Examples:**
```typescript
// Unit test for image resize processing stage
describe('image-resize processing stage', () => {
  it('resizes image to specified dimensions', async () => {
    const input = { file: mockImageFile, width: 800, height: 600 };
    const output = await processingStage(input, mockContext);
    expect(output.width).toBe(800);
    expect(output.height).toBe(600);
  });

  it('maintains aspect ratio when enabled', async () => {
    const input = { file: mockImageFile, width: 800, height: 800, maintainAspectRatio: true };
    const output = await processingStage(input, mockContext);
    expect(output.width / output.height).toBeCloseTo(originalAspectRatio);
  });
});
```

**Speed:** <10ms per test. Total suite <30 seconds.

### 4.2 Integration Tests

**What:** Test interactions between modules (e.g., Tool Engine stages, server actions with mocked DB).

**Framework:** Vitest with mocked dependencies.

**Examples:**
```typescript
// Integration test for Tool Engine lifecycle
describe('Tool Engine lifecycle', () => {
  it('completes full lifecycle: input → validation → processing → preview → download', async () => {
    const engine = createToolEngine(imageResizeManifest);
    const result = await engine.execute({ file: mockImageFile, width: 800, height: 600 });
    expect(result.phase).toBe('downloaded');
  });

  it('handles validation failure gracefully', async () => {
    const engine = createToolEngine(imageResizeManifest);
    const result = await engine.execute({ file: invalidFile, width: 0, height: 0 });
    expect(result.phase).toBe('validation_failed');
  });
});
```

### 4.3 E2E Tests

**What:** Test full user flows via browser simulation.

**Framework:** Playwright.

**Examples:**
```typescript
// E2E test for image resize workflow
test('user can resize an image', async ({ page }) => {
  await page.goto('/tools/image/image-resize');

  // Upload file
  const fileInput = page.locator('input[type=file]');
  await fileInput.setInputFiles('tests/fixtures/images/sample.png');

  // Set dimensions
  await page.fill('[name=width]', '800');
  await page.fill('[name=height]', '600');

  // Process
  await page.click('button:text("Resize Image")');

  // Verify preview
  await expect(page.locator('[data-testid=result-preview]')).toBeVisible();

  // Download
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:text("Download")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('resized');
});
```

**Speed:** <30 seconds per test. Total suite <10 minutes.

## 5. Accessibility Testing

### 5.1 Automated (axe-core)

```typescript
// Accessibility test with axe-core
import { injectAxe, checkA11y } from 'axe-playwright';

test('tool page has no accessibility violations', async ({ page }) => {
  await page.goto('/tools/image/image-resize');
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
  });
});
```

### 5.2 Manual
- Keyboard navigation test (Tab, Enter, Escape).
- Screen reader test (NVDA, VoiceOver).
- Focus visibility test.
- Color contrast test (Lighthouse).

## 6. Performance Testing

### 6.1 Lighthouse CI

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/tools/image/image-resize'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
  },
};
```

### 6.2 Bundle Size

```typescript
// Bundle size check in CI
import { bundleSize } from 'bundle-size-checker';

const limits = {
  'tools/image/image-resize': '200KB',
  'shared/vendor': '300KB',
};

for (const [chunk, limit] of Object.entries(limits)) {
  await bundleSize.check(chunk, limit);
}
```

## 7. Test Data and Fixtures

### 7.1 Test Fixtures

```
tests/
├── fixtures/
│   ├── images/
│   │   ├── sample.png
│   │   ├── sample.jpg
│   │   └── sample.webp
│   ├── pdfs/
│   │   ├── sample.pdf
│   │   └── large.pdf
│   └── text/
│       ├── sample.txt
│       └── large.txt
```

### 7.2 Mock Factories

```typescript
// tests/factories/user-factory.ts
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'uuid-' + Math.random(),
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  };
}
```

## 8. Standards

### 8.1 Test Naming Standards
- Test files: `[subject].test.ts` or `[subject].test.tsx`.
- E2E tests: `[scenario].spec.ts`.
- Test descriptions: `describe('module/function name')`, `it('does X when Y')`.

### 8.2 Test Coverage Standards
- Per AD-04 coverage targets.
- Coverage tracked in CI.
- Critical paths must have tests (hard gate).
- Coverage numbers are guidelines, not hard gates.

### 8.3 Test Quality Standards
- Tests are deterministic (no flaky tests).
- Tests are isolated (no shared mutable state).
- Tests are fast (unit <10ms, E2E <30s).
- Tests are maintainable (clear descriptions, minimal setup).

### 8.4 Test Data Standards
- Fixtures in `tests/fixtures/`.
- Mock factories for entities.
- No real network calls in unit/integration tests.
- E2E tests can make real network calls (to Preview deployment).

## 9. Best Practices

### 9.1 When Writing Tests
1. Write test before or alongside implementation (TDD or test-with).
2. Test behavior, not implementation.
3. One assertion per test (or few related assertions).
4. Clear test descriptions.
5. Minimal setup; reuse fixtures.

### 9.2 When Debugging Flaky Tests
1. Isolate the test (run alone).
2. Check for timing issues (add `await`).
3. Check for shared state (reset between tests).
4. Check for environmental dependencies (mock external services).

### 9.3 When Reviewing Tests
- Verify test actually tests the behavior.
- Check for flakiness (timing, network, random).
- Verify test is maintainable (clear, minimal).
- Ensure coverage targets met.

## 10. Future Expansion

### 10.1 Visual Regression Testing (Phase 2+)
- Storybook stories for each component.
- Chromatic for visual diff detection.
- CI blocks on unexpected visual changes.

### 10.2 Contract Testing (Phase 3+)
- API contract tests between frontend and backend.
- Schema validation against OpenAPI spec.

### 10.3 Load Testing (Phase 3+)
- k6 or Artillery for load testing API routes.
- Verify performance under expected peak load.

### 10.4 Mutation Testing (Phase 4+)
- Stryker for mutation testing.
- Verify test quality (not just coverage).

## 11. Dependencies

- Depends on `00_Project_Charter` §4 EC-09, §5 PC-03.
- `06_ArchitectureDecisionRecords` — ADR-021, ADR-056.
- `07_FolderStructure` AD-04 — Test file placement.
- `08_CodingStandards` AD-08 — Testability requirements.
- `14_ACD` — Components tested via Testing Library.
- `30_DevelopmentGuideline` — CI/CD pipeline runs tests.

## 12. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Testing Strategy. Defined testing pyramid (Unit 70% / Integration 20% / E2E 10%), frameworks (Vitest, Playwright, Testing Library, axe-core), coverage targets, test file placement, accessibility/performance testing, test data and fixtures. |

## 13. Cross References

- `00_Project_Charter` §4 EC-09, §5 PC-03 — Implemented.
- `06_ArchitectureDecisionRecords` — ADR-021 (Testing Philosophy), ADR-056 (Tool Completion Standard — tests required).
- `07_FolderStructure` AD-04 — Colocated test files.
- `08_CodingStandards` AD-08 — Testability requirements; §11 — Testability detailed.
- `14_ACD` — Components tested via Testing Library.
- `15_UDS` — Accessibility standards tested.
- `26_ObservabilitySpecification` — Performance monitoring overlaps with performance testing.
- `30_DevelopmentGuideline` — CI/CD pipeline runs tests; quality gates require tests.
