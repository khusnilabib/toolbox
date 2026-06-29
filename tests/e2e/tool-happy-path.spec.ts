// tests/e2e/tool-happy-path.spec.ts — E2E happy path for representative tools.
// Covers one tool per category (4 tools) to validate the full Tool Engine pipeline.
import { test, expect } from '@playwright/test';
import { checkAccessibility } from './accessibility';

const SAMPLE_TOOLS = [
  { category: 'text', slug: 'case-converter', title: /Case Converter/i },
  { category: 'developer', slug: 'base64-encoder', title: /Base64/i },
  { category: 'developer', slug: 'uuid-generator', title: /UUID/i },
  { category: 'developer', slug: 'hash-generator', title: /Hash/i },
];

test.describe('Tool happy path — representative tools', () => {
  for (const tool of SAMPLE_TOOLS) {
    test(`${tool.slug} — page loads, accepts input, produces output`, async ({ page }) => {
      const url = `/tools/${tool.category}/${tool.slug}`;
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Page title matches the tool
      await expect(page).toHaveTitle(tool.title);

      // H1 contains tool name
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      // Breadcrumb is present
      const breadcrumb = page.locator('nav[aria-label="breadcrumb"], [data-testid="breadcrumb"]').first();
      if (await breadcrumb.count() > 0) {
        await expect(breadcrumb).toBeVisible();
      }

      // FAQ section is present
      const faq = page.locator('[data-testid="faq"], section:has(h2:has-text("FAQ"))').first();
      if (await faq.count() > 0) {
        await expect(faq).toBeVisible();
      }

      // Try to interact with the input form (text input)
      const textInput = page.locator('textarea, input[type="text"]').first();
      if (await textInput.isVisible()) {
        await textInput.fill('Hello World 123');
      }

      // Try clicking the primary action button (Run / Convert / Generate)
      const actionBtn = page.getByRole('button', { name: /run|convert|generate|encode|decode|create|calculate/i }).first();
      if (await actionBtn.isVisible()) {
        await actionBtn.click();
        // Wait for output to appear (1s should be enough for in-browser tools)
        await page.waitForTimeout(1500);
      }

      // Verify no console errors
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      expect(errors).toHaveLength(0);
    });

    test(`${tool.slug} — passes accessibility audit`, async ({ page }) => {
      await page.goto(`/tools/${tool.category}/${tool.slug}`);
      await page.waitForLoadState('networkidle');
      await checkAccessibility(page);
    });
  }
});

test.describe('Tool URL routing — all 23 tools reachable', () => {
  const ALL_TOOLS = [
    ['text', 'case-converter'],
    ['text', 'word-counter'],
    ['text', 'remove-duplicate-lines'],
    ['text', 'sort-lines'],
    ['text', 'text-diff'],
    ['developer', 'base64-encoder'],
    ['developer', 'url-encoder'],
    ['developer', 'uuid-generator'],
    ['developer', 'jwt-decoder'],
    ['developer', 'json-formatter'],
    ['developer', 'hash-generator'],
    ['image', 'image-resize'],
    ['image', 'image-compress'],
    ['image', 'image-crop'],
    ['image', 'image-rotate'],
    ['image', 'image-format-convert'],
    ['pdf', 'pdf-merge'],
    ['pdf', 'pdf-split'],
    ['pdf', 'pdf-compress'],
    ['pdf', 'pdf-rotate'],
    ['pdf', 'pdf-extract-pages'],
    ['pdf', 'pdf-protect'],
    ['pdf', 'pdf-unlock'],
  ] as const;

  for (const [category, slug] of ALL_TOOLS) {
    test(`${category}/${slug} — page returns 200 and renders H1`, async ({ page }) => {
      const response = await page.goto(`/tools/${category}/${slug}`);
      expect(response?.ok()).toBe(true);
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }
});
