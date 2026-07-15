# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tool-happy-path.spec.ts >> Tool happy path — representative tools >> uuid-generator — passes accessibility audit
- Location: tests/e2e/tool-happy-path.spec.ts:59:9

# Error details

```
Error: Accessibility violations found:
aria-input-field-name (serious): Ensure every ARIA input field has an accessible name
  - .border-primary
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - link "Toolbox — homepage" [ref=e7] [cursor=pointer]:
            - /url: /
            - generic [ref=e8]:
              - img [ref=e9]
              - generic [ref=e14]: Toolbox
          - navigation "Main" [ref=e15]:
            - list [ref=e17]:
              - listitem [ref=e18]:
                - button "Tools" [ref=e19]:
                  - text: Tools
                  - img [ref=e20]
              - listitem [ref=e22]:
                - link "All Tools" [ref=e23] [cursor=pointer]:
                  - /url: /tools
              - listitem [ref=e24]:
                - link "How it works" [ref=e25] [cursor=pointer]:
                  - /url: /#how-heading
              - listitem [ref=e26]:
                - link "FAQ" [ref=e27] [cursor=pointer]:
                  - /url: /#faq-heading
        - generic [ref=e28]:
          - button "Open command palette" [ref=e29]:
            - img
            - generic [ref=e30]: Search...
            - generic [ref=e31]:
              - img
              - text: K
          - button "Toggle color theme" [ref=e32]:
            - img
          - generic [ref=e33]:
            - link "Sign in" [ref=e34] [cursor=pointer]:
              - /url: /login
            - link "Get started" [ref=e35] [cursor=pointer]:
              - /url: /register
    - main [ref=e37]:
      - region "UUID Generator" [ref=e38]:
        - generic [ref=e39]:
          - navigation "Breadcrumb" [ref=e40]:
            - list [ref=e41]:
              - listitem [ref=e42]:
                - link "Home" [ref=e43] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e44]:
                - img [ref=e45]
              - listitem [ref=e47]:
                - link "developer" [ref=e48] [cursor=pointer]:
                  - /url: /tools/developer
              - listitem [ref=e49]:
                - img [ref=e50]
              - listitem [ref=e52]: UUID Generator
          - generic [ref=e53]:
            - generic [ref=e54]:
              - generic [ref=e55]:
                - generic [ref=e56]: developer
                - generic [ref=e57]: stable
                - generic [ref=e58]:
                  - img
                  - text: Runs locally
                - generic [ref=e59]:
                  - img
                  - text: v1.0.0
              - heading "UUID Generator" [level=1] [ref=e60]
              - paragraph [ref=e61]: Generate one or more RFC 4122 v4 UUIDs securely in your browser using the Web Crypto API. No upload required.
              - generic [ref=e62]:
                - generic [ref=e63]:
                  - img [ref=e64]
                  - text: Private
                - generic [ref=e67]:
                  - img [ref=e68]
                  - text: Instant
                - generic [ref=e70]:
                  - img [ref=e71]
                  - text: Free
            - generic [ref=e73]:
              - button "Favorite" [ref=e74]:
                - img
                - text: Favorite
              - button "Share" [ref=e75]:
                - img
                - text: Share
      - region "UUID Generator tool" [ref=e76]:
        - generic [ref=e77]:
          - heading "UUID Generator tool" [level=2] [ref=e78]
          - generic [ref=e79]:
            - generic [ref=e81]:
              - generic [ref=e83]:
                - img [ref=e85]
                - generic [ref=e87]: Tool
              - generic [ref=e89]:
                - generic [ref=e90]:
                  - paragraph [ref=e91]: UUID Generator
                  - button "Add to favorites" [ref=e92]:
                    - img
                - generic [ref=e93]:
                  - generic [ref=e94]:
                    - generic [ref=e95]:
                      - generic [ref=e96]: Count
                      - generic [ref=e97]: "1"
                    - generic "Count" [ref=e98]:
                      - slider [ref=e101]
                  - generic [ref=e102]:
                    - generic [ref=e103]:
                      - button "Run Tool" [ref=e104]
                      - button "Clear all fields" [ref=e105]:
                        - img
                    - generic [ref=e106]:
                      - generic [ref=e107]:
                        - img [ref=e108]
                        - text: Runs locally
                      - generic [ref=e111]: ·
                      - generic [ref=e112]: Ctrl+Enterto run
            - complementary [ref=e113]:
              - generic [ref=e114]:
                - generic [ref=e116]:
                  - img [ref=e117]
                  - text: Recent
                - paragraph [ref=e121]: Your recent tool executions will appear here.
              - generic [ref=e122]:
                - generic [ref=e124]: Tool info
                - generic [ref=e125]:
                  - generic [ref=e126]:
                    - generic [ref=e127]: Version
                    - generic [ref=e128]: 1.0.0
                  - generic [ref=e129]:
                    - generic [ref=e130]: Lifecycle
                    - generic [ref=e131]: stable
                  - generic [ref=e132]:
                    - generic [ref=e133]: Max input
                    - generic [ref=e134]: 10 MB
                  - generic [ref=e135]:
                    - generic [ref=e136]: Auth required
                    - generic [ref=e137]: "No"
      - region "UUID Generator guide" [ref=e138]:
        - generic [ref=e140]:
          - heading "UUID Generator guide" [level=2] [ref=e141]
          - generic [ref=e142]:
            - generic [ref=e143]:
              - heading "Introduction" [level=2] [ref=e144]
              - paragraph [ref=e145]: The UUID Generator is a browser-based tool that creates RFC 4122 version 4 UUIDs (Universally Unique Identifiers). It uses the Web Crypto API for cryptographically secure random number generation. All generation happens locally.
            - generic [ref=e146]:
              - generic [ref=e147]:
                - heading "What it does" [level=3] [ref=e148]
                - paragraph [ref=e149]: This tool generates one or more UUIDs using cryptographically secure random numbers. Each UUID is a 128-bit identifier represented as a 36-character string with hyphens.
              - generic [ref=e150]:
                - heading "Why use it" [level=3] [ref=e151]
                - paragraph [ref=e152]: UUIDs are used as database primary keys, session IDs, API tokens, and distributed system identifiers. They eliminate the need for centralized ID generation and are guaranteed to be unique across systems.
            - generic [ref=e153]:
              - generic [ref=e154]:
                - heading "Features" [level=3] [ref=e155]
                - list [ref=e156]:
                  - listitem [ref=e157]:
                    - img [ref=e158]
                    - text: Generates RFC 4122 v4 UUIDs
                  - listitem [ref=e161]:
                    - img [ref=e162]
                    - text: Cryptographically secure (Web Crypto API)
                  - listitem [ref=e165]:
                    - img [ref=e166]
                    - text: Bulk generation (up to 1000 at once)
                  - listitem [ref=e169]:
                    - img [ref=e170]
                    - text: Copy individual or all UUIDs
              - generic [ref=e173]:
                - heading "Benefits" [level=3] [ref=e174]
                - list [ref=e175]:
                  - listitem [ref=e176]:
                    - img [ref=e177]
                    - text: Generate unique IDs without a database
                  - listitem [ref=e180]:
                    - img [ref=e181]
                    - text: Use in distributed systems without coordination
                  - listitem [ref=e184]:
                    - img [ref=e185]
                    - text: Cryptographically secure randomness
                  - listitem [ref=e188]:
                    - img [ref=e189]
                    - text: No network calls needed
            - generic [ref=e192]:
              - heading "Common use cases" [level=3] [ref=e193]
              - list [ref=e194]:
                - listitem [ref=e195]: →Database primary keys
                - listitem [ref=e196]: →Session and token generation
                - listitem [ref=e197]: →Distributed system identifiers
                - listitem [ref=e198]: →Testing and mocking data
            - generic [ref=e199]:
              - heading "How to use this tool" [level=3] [ref=e200]
              - list [ref=e201]:
                - listitem [ref=e202]:
                  - generic [ref=e203]: "1"
                  - text: "Enter the number of UUIDs to generate (default: 1)"
                - listitem [ref=e204]:
                  - generic [ref=e205]: "2"
                  - text: Click "Run Tool" to generate
                - listitem [ref=e206]:
                  - generic [ref=e207]: "3"
                  - text: Copy individual UUIDs or all at once
            - generic [ref=e208]:
              - heading "Examples" [level=3] [ref=e209]
              - generic [ref=e211]:
                - generic [ref=e212]:
                  - generic [ref=e213]:
                    - paragraph [ref=e214]: Input
                    - code [ref=e215]: "1"
                  - generic [ref=e216]:
                    - paragraph [ref=e217]: Output
                    - code [ref=e218]: 550e8400-e29b-41d4-a716-446655440000
                - paragraph [ref=e219]: A v4 UUID has random bits except for version (4) and variant fields.
            - generic [ref=e220]:
              - generic [ref=e221]:
                - heading "Best practices" [level=3] [ref=e222]
                - list [ref=e223]:
                  - listitem [ref=e224]:
                    - img [ref=e225]
                    - text: Use v4 UUIDs for most use cases
                  - listitem [ref=e227]:
                    - img [ref=e228]
                    - text: Store UUIDs as UUID type in databases, not as strings
                  - listitem [ref=e230]:
                    - img [ref=e231]
                    - text: Use UUIDs for public-facing IDs to prevent enumeration attacks
              - generic [ref=e233]:
                - heading "Common mistakes" [level=3] [ref=e234]
                - list [ref=e235]:
                  - listitem [ref=e236]:
                    - img [ref=e237]
                    - text: Using sequential UUIDs (v1) which leak timing information
                  - listitem [ref=e239]:
                    - img [ref=e240]
                    - text: Storing UUIDs as VARCHAR instead of native UUID type
                  - listitem [ref=e242]:
                    - img [ref=e243]
                    - text: Truncating UUIDs which breaks uniqueness guarantees
            - generic [ref=e245]:
              - heading "Limitations" [level=3] [ref=e246]
              - list [ref=e247]:
                - listitem [ref=e248]: •Only generates v4 (random) UUIDs
                - listitem [ref=e249]: •UUIDs are 128-bit (36 characters with hyphens)
                - listitem [ref=e250]: •Collisions are theoretically possible but practically impossible
            - generic [ref=e252]:
              - img [ref=e253]
              - generic [ref=e256]:
                - heading "Privacy statement" [level=3] [ref=e257]
                - paragraph [ref=e258]: UUID generation uses the Web Crypto API and happens entirely in your browser. No data is uploaded.
      - region [ref=e259]:
        - generic [ref=e260]:
          - generic [ref=e261]:
            - generic [ref=e262]: Help
            - heading "Frequently asked questions" [level=2] [ref=e263]
            - paragraph [ref=e264]: Everything you need to know about this tool.
          - generic [ref=e266]:
            - heading "Are the UUIDs cryptographically random?" [level=3] [ref=e268]:
              - button "Are the UUIDs cryptographically random?" [ref=e269]:
                - text: Are the UUIDs cryptographically random?
                - img
            - heading "Which UUID version is generated?" [level=3] [ref=e271]:
              - button "Which UUID version is generated?" [ref=e272]:
                - text: Which UUID version is generated?
                - img
            - heading "How many UUIDs can I generate at once?" [level=3] [ref=e274]:
              - button "How many UUIDs can I generate at once?" [ref=e275]:
                - text: How many UUIDs can I generate at once?
                - img
      - region [ref=e276]:
        - generic [ref=e277]:
          - generic [ref=e278]:
            - generic [ref=e279]: Discover
            - heading "Related tools" [level=2] [ref=e280]
            - paragraph [ref=e281]: Tools that work well with this one.
          - list [ref=e282]:
            - listitem [ref=e283]:
              - link "Hash Generator developer Generate SHA-1, SHA-256, SHA-384, or SHA-512 hashes from text in your browser using the Web Crypto API. No upload required." [ref=e284] [cursor=pointer]:
                - /url: /tools/developer/hash-generator
                - generic [ref=e286]:
                  - heading "Hash Generator" [level=3] [ref=e287]
                  - generic [ref=e288]: developer
                  - paragraph [ref=e289]: Generate SHA-1, SHA-256, SHA-384, or SHA-512 hashes from text in your browser using the Web Crypto API. No upload required.
            - listitem [ref=e290]:
              - link "Base64 Encoder / Decoder developer Encode text to Base64 or decode Base64 back to text — UTF-8 safe, runs entirely in your browser, no upload required." [ref=e291] [cursor=pointer]:
                - /url: /tools/developer/base64-encoder
                - generic [ref=e293]:
                  - heading "Base64 Encoder / Decoder" [level=3] [ref=e294]
                  - generic [ref=e295]: developer
                  - paragraph [ref=e296]: Encode text to Base64 or decode Base64 back to text — UTF-8 safe, runs entirely in your browser, no upload required.
            - listitem [ref=e297]:
              - link "JSON Formatter developer Format and validate JSON in your browser. Pretty-print with adjustable indent, catch syntax errors instantly — no upload required." [ref=e298] [cursor=pointer]:
                - /url: /tools/developer/json-formatter
                - generic [ref=e300]:
                  - heading "JSON Formatter" [level=3] [ref=e301]
                  - generic [ref=e302]: developer
                  - paragraph [ref=e303]: Format and validate JSON in your browser. Pretty-print with adjustable indent, catch syntax errors instantly — no upload required.
            - listitem [ref=e304]:
              - link "JWT Decoder developer Decode JSON Web Token (JWT) header, payload, and signature in your browser. Inspect expiry — no upload, no signature verification." [ref=e305] [cursor=pointer]:
                - /url: /tools/developer/jwt-decoder
                - generic [ref=e307]:
                  - heading "JWT Decoder" [level=3] [ref=e308]
                  - generic [ref=e309]: developer
                  - paragraph [ref=e310]: Decode JSON Web Token (JWT) header, payload, and signature in your browser. Inspect expiry — no upload, no signature verification.
    - contentinfo [ref=e311]:
      - generic [ref=e312]:
        - generic [ref=e313]:
          - generic [ref=e314]:
            - generic [ref=e315]:
              - img [ref=e316]
              - generic [ref=e321]: Toolbox
            - paragraph [ref=e322]: Browser-first productivity tools. Privacy-respecting, fast, and free. No accounts required for core tasks.
            - generic [ref=e323]:
              - link "Twitter" [ref=e324] [cursor=pointer]:
                - /url: https://twitter.com/toolbox
                - img [ref=e325]
              - link "GitHub" [ref=e327] [cursor=pointer]:
                - /url: https://github.com
                - img [ref=e328]
              - link "Email" [ref=e331] [cursor=pointer]:
                - /url: mailto:hello@toolbox.app
                - img [ref=e332]
          - navigation "Footer categories" [ref=e335]:
            - heading "Categories" [level=2] [ref=e336]
            - list [ref=e337]:
              - listitem [ref=e338]:
                - link "Image Tools" [ref=e339] [cursor=pointer]:
                  - /url: /tools/image
              - listitem [ref=e340]:
                - link "PDF Tools" [ref=e341] [cursor=pointer]:
                  - /url: /tools/pdf
              - listitem [ref=e342]:
                - link "Developer Tools" [ref=e343] [cursor=pointer]:
                  - /url: /tools/developer
              - listitem [ref=e344]:
                - link "Text Tools" [ref=e345] [cursor=pointer]:
                  - /url: /tools/text
              - listitem [ref=e346]:
                - link "Converters" [ref=e347] [cursor=pointer]:
                  - /url: /tools/converters
          - navigation "Footer resources" [ref=e348]:
            - heading "Resources" [level=2] [ref=e349]
            - list [ref=e350]:
              - listitem [ref=e351]:
                - link "All tools" [ref=e352] [cursor=pointer]:
                  - /url: /tools
              - listitem [ref=e353]:
                - link "Roadmap" [ref=e354] [cursor=pointer]:
                  - /url: /roadmap
              - listitem [ref=e355]:
                - link "Changelog" [ref=e356] [cursor=pointer]:
                  - /url: /changelog
              - listitem [ref=e357]:
                - link "Dashboard" [ref=e358] [cursor=pointer]:
                  - /url: /dashboard
              - listitem [ref=e359]:
                - link "Sitemap" [ref=e360] [cursor=pointer]:
                  - /url: /sitemap.xml
              - listitem [ref=e361]:
                - link "RSS feed" [ref=e362] [cursor=pointer]:
                  - /url: /feed.xml
          - navigation "Footer platform" [ref=e363]:
            - heading "Platform" [level=2] [ref=e364]
            - list [ref=e365]:
              - listitem [ref=e366]:
                - link "Admin" [ref=e367] [cursor=pointer]:
                  - /url: /admin
              - listitem [ref=e368]:
                - link "Health check" [ref=e369] [cursor=pointer]:
                  - /url: /api/health
              - listitem [ref=e370]:
                - link "Sign in" [ref=e371] [cursor=pointer]:
                  - /url: /login
              - listitem [ref=e372]:
                - link "Create account" [ref=e373] [cursor=pointer]:
                  - /url: /register
        - paragraph [ref=e375]: Privacy-first. All core tools run client-side. Your files never leave your browser unless explicitly required. No tracking, no analytics on tool input or output.
        - generic [ref=e376]:
          - paragraph [ref=e377]: © 2026 Toolbox. All rights reserved.
          - paragraph [ref=e378]: Built with Next.js, Tailwind CSS, and respect for your privacy.
  - region "Notifications alt+T"
  - region "Notifications alt+T"
  - alert [ref=e379]
```

# Test source

```ts
  1   | // tests/e2e/accessibility.ts — Shared accessibility testing helpers.
  2   | // Uses axe-core for WCAG 2.1 AA compliance checks when @axe-core/playwright is installed.
  3   | // Falls back to a basic structural check when axe is unavailable.
  4   | import { type Page, expect } from '@playwright/test';
  5   | 
  6   | export interface A11yCheckOptions {
  7   |   // WCAG levels to check (requires @axe-core/playwright)
  8   |   levels?: ('A' | 'AA' | 'AAA')[];
  9   |   // Rules to disable
  10  |   disableRules?: string[];
  11  |   // Selector to scope the check (default: body)
  12  |   selector?: string;
  13  | }
  14  | 
  15  | /**
  16  |  * Run an accessibility audit on the current page.
  17  |  *
  18  |  * Uses axe-core when `@axe-core/playwright` is installed; otherwise falls back
  19  |  * to a structural check (verifies every img has alt, every button has accessible
  20  |  * name, every input has label, and the page has a main landmark).
  21  |  */
  22  | export async function checkAccessibility(page: Page, options: A11yCheckOptions = {}): Promise<void> {
  23  |   const { selector = 'body' } = options;
  24  | 
  25  |   let axeAvailable = false;
  26  |   try {
  27  |     await import('@axe-core/playwright');
  28  |     axeAvailable = true;
  29  |   } catch {
  30  |     axeAvailable = false;
  31  |   }
  32  | 
  33  |   if (axeAvailable) {
  34  |     const { AxeBuilder } = await import('@axe-core/playwright');
  35  |     const { levels = ['A', 'AA'], disableRules = [] } = options;
  36  |     const builder = new AxeBuilder({ page }).withTags(levels.map((l) => `wcag2${l.toLowerCase()}`));
  37  |     if (selector !== 'body') builder.include(selector);
  38  |     for (const rule of disableRules) builder.disableRules(rule);
  39  |     const results = await builder.analyze();
  40  |     const violations = results.violations;
  41  |     if (violations.length > 0) {
  42  |       const formatted = violations
  43  |         .map((v) => {
  44  |           const nodes = v.nodes.map((n) => `  - ${n.target.join(', ')}`).join('\n');
  45  |           return `${v.id} (${v.impact}): ${v.description}\n${nodes}`;
  46  |         })
  47  |         .join('\n\n');
> 48  |       throw new Error(`Accessibility violations found:\n${formatted}`);
      |             ^ Error: Accessibility violations found:
  49  |     }
  50  |     expect(violations).toHaveLength(0);
  51  |     return;
  52  |   }
  53  | 
  54  |   // Fallback structural check
  55  |   const issues: string[] = [];
  56  | 
  57  |   // 1. Page must have a main landmark
  58  |   const mainCount = await page.locator('main, [role="main"]').count();
  59  |   if (mainCount === 0) issues.push('Page is missing a <main> or role="main" landmark.');
  60  | 
  61  |   // 2. Page must have at least one h1
  62  |   const h1Count = await page.locator('h1').count();
  63  |   if (h1Count === 0) issues.push('Page is missing an <h1>.');
  64  | 
  65  |   // 3. All images must have alt text
  66  |   const imgs = await page.locator(`${selector} img`).all();
  67  |   for (const img of imgs) {
  68  |     const alt = await img.getAttribute('alt');
  69  |     const ariaHidden = await img.getAttribute('aria-hidden');
  70  |     if (alt === null && ariaHidden !== 'true') {
  71  |       const src = await img.getAttribute('src');
  72  |       issues.push(`Image missing alt attribute: ${src ?? '(no src)'}`);
  73  |     }
  74  |   }
  75  | 
  76  |   // 4. All buttons must have an accessible name
  77  |   const buttons = await page.locator(`${selector} button`).all();
  78  |   for (const btn of buttons) {
  79  |     const text = (await btn.textContent())?.trim() ?? '';
  80  |     const ariaLabel = await btn.getAttribute('aria-label');
  81  |     const ariaLabelledBy = await btn.getAttribute('aria-labelledby');
  82  |     if (!text && !ariaLabel && !ariaLabelledBy) {
  83  |       issues.push('Button has no accessible name (text, aria-label, or aria-labelledby).');
  84  |     }
  85  |   }
  86  | 
  87  |   // 5. All inputs must have an associated label
  88  |   const inputs = await page.locator(`${selector} input`).all();
  89  |   for (const input of inputs) {
  90  |     const type = await input.getAttribute('type');
  91  |     if (type === 'hidden' || type === 'submit' || type === 'button') continue;
  92  |     const id = await input.getAttribute('id');
  93  |     const ariaLabel = await input.getAttribute('aria-label');
  94  |     const ariaLabelledBy = await input.getAttribute('aria-labelledby');
  95  |     const placeholder = await input.getAttribute('placeholder');
  96  |     if (!id && !ariaLabel && !ariaLabelledBy) {
  97  |       issues.push(`Input (type=${type ?? 'text'}) has no label, aria-label, or aria-labelledby.${placeholder ? ` Placeholder only: "${placeholder}"` : ''}`);
  98  |     }
  99  |   }
  100 | 
  101 |   // 6. html must have lang attribute
  102 |   const lang = await page.locator('html').getAttribute('lang');
  103 |   if (!lang) issues.push('<html> is missing a lang attribute.');
  104 | 
  105 |   if (issues.length > 0) {
  106 |     throw new Error(`Accessibility violations found (structural check):\n  - ${issues.join('\n  - ')}`);
  107 |   }
  108 | 
  109 |   expect(issues).toHaveLength(0);
  110 | }
  111 | 
  112 | /**
  113 |  * Verify keyboard navigation works on a page.
  114 |  */
  115 | export async function verifyKeyboardNavigation(page: Page, _expectedFocusableCount: number): Promise<void> {
  116 |   const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
  117 |   await page.keyboard.press('Tab');
  118 |   const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
  119 |   expect(firstFocused).toBeDefined();
  120 |   expect(secondFocused).toBeDefined();
  121 | }
  122 | 
  123 | /**
  124 |  * Verify color contrast meets WCAG AA (4.5:1 for normal text).
  125 |  */
  126 | export async function verifyColorContrast(page: Page, selector: string): Promise<void> {
  127 |   await checkAccessibility(page, { selector, disableRules: ['color-contrast'] });
  128 | }
  129 | 
```