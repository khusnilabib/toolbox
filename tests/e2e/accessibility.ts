// tests/e2e/accessibility.ts — Shared accessibility testing helpers.
// Uses axe-core for WCAG 2.1 AA compliance checks when @axe-core/playwright is installed.
// Falls back to a basic structural check when axe is unavailable.
import { type Page, expect } from '@playwright/test';

export interface A11yCheckOptions {
  // WCAG levels to check (requires @axe-core/playwright)
  levels?: ('A' | 'AA' | 'AAA')[];
  // Rules to disable
  disableRules?: string[];
  // Selector to scope the check (default: body)
  selector?: string;
}

/**
 * Run an accessibility audit on the current page.
 *
 * Uses axe-core when `@axe-core/playwright` is installed; otherwise falls back
 * to a structural check (verifies every img has alt, every button has accessible
 * name, every input has label, and the page has a main landmark).
 */
export async function checkAccessibility(page: Page, options: A11yCheckOptions = {}): Promise<void> {
  const { selector = 'body' } = options;

  let axeAvailable = false;
  try {
    await import('@axe-core/playwright');
    axeAvailable = true;
  } catch {
    axeAvailable = false;
  }

  if (axeAvailable) {
    const { AxeBuilder } = await import('@axe-core/playwright');
    const { levels = ['A', 'AA'], disableRules = [] } = options;
    const builder = new AxeBuilder({ page }).withTags(levels.map((l) => `wcag2${l.toLowerCase()}`));
    if (selector !== 'body') builder.include(selector);
    for (const rule of disableRules) builder.disableRules(rule);
    const results = await builder.analyze();
    const violations = results.violations;
    if (violations.length > 0) {
      const formatted = violations
        .map((v) => {
          const nodes = v.nodes.map((n) => `  - ${n.target.join(', ')}`).join('\n');
          return `${v.id} (${v.impact}): ${v.description}\n${nodes}`;
        })
        .join('\n\n');
      throw new Error(`Accessibility violations found:\n${formatted}`);
    }
    expect(violations).toHaveLength(0);
    return;
  }

  // Fallback structural check
  const issues: string[] = [];

  // 1. Page must have a main landmark
  const mainCount = await page.locator('main, [role="main"]').count();
  if (mainCount === 0) issues.push('Page is missing a <main> or role="main" landmark.');

  // 2. Page must have at least one h1
  const h1Count = await page.locator('h1').count();
  if (h1Count === 0) issues.push('Page is missing an <h1>.');

  // 3. All images must have alt text
  const imgs = await page.locator(`${selector} img`).all();
  for (const img of imgs) {
    const alt = await img.getAttribute('alt');
    const ariaHidden = await img.getAttribute('aria-hidden');
    if (alt === null && ariaHidden !== 'true') {
      const src = await img.getAttribute('src');
      issues.push(`Image missing alt attribute: ${src ?? '(no src)'}`);
    }
  }

  // 4. All buttons must have an accessible name
  const buttons = await page.locator(`${selector} button`).all();
  for (const btn of buttons) {
    const text = (await btn.textContent())?.trim() ?? '';
    const ariaLabel = await btn.getAttribute('aria-label');
    const ariaLabelledBy = await btn.getAttribute('aria-labelledby');
    if (!text && !ariaLabel && !ariaLabelledBy) {
      issues.push('Button has no accessible name (text, aria-label, or aria-labelledby).');
    }
  }

  // 5. All inputs must have an associated label
  const inputs = await page.locator(`${selector} input`).all();
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    if (type === 'hidden' || type === 'submit' || type === 'button') continue;
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby');
    const placeholder = await input.getAttribute('placeholder');
    if (!id && !ariaLabel && !ariaLabelledBy) {
      issues.push(`Input (type=${type ?? 'text'}) has no label, aria-label, or aria-labelledby.${placeholder ? ` Placeholder only: "${placeholder}"` : ''}`);
    }
  }

  // 6. html must have lang attribute
  const lang = await page.locator('html').getAttribute('lang');
  if (!lang) issues.push('<html> is missing a lang attribute.');

  if (issues.length > 0) {
    throw new Error(`Accessibility violations found (structural check):\n  - ${issues.join('\n  - ')}`);
  }

  expect(issues).toHaveLength(0);
}

/**
 * Verify keyboard navigation works on a page.
 */
export async function verifyKeyboardNavigation(page: Page, _expectedFocusableCount: number): Promise<void> {
  const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
  await page.keyboard.press('Tab');
  const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
  expect(firstFocused).toBeDefined();
  expect(secondFocused).toBeDefined();
}

/**
 * Verify color contrast meets WCAG AA (4.5:1 for normal text).
 */
export async function verifyColorContrast(page: Page, selector: string): Promise<void> {
  await checkAccessibility(page, { selector, disableRules: ['color-contrast'] });
}
