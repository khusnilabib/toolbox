// .lighthouserc.cjs — Lighthouse CI configuration
// Phase 1 — Performance benchmarking + SEO + Accessibility + Best Practices
// Targets per Sprint 6 Phase 4: Performance ≥95, A11y ≥100, SEO ≥100, BP ≥100

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'bun run start',
      startServerReadyPattern: 'Ready in',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/tools/text/case-converter',
        'http://localhost:3000/tools/developer/base64-encoder',
        'http://localhost:3000/tools/image/image-resize',
        'http://localhost:3000/tools/pdf/pdf-merge',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-gpu',
      },
    },
    assert: {
      assertions: {
        // Performance target (Sprint 6 Phase 4)
        'categories:performance': ['error', { minScore: 0.95 }],
        // Accessibility target
        'categories:accessibility': ['error', { minScore: 1.0 }],
        // SEO target
        'categories:seo': ['error', { minScore: 1.0 }],
        // Best Practices target
        'categories:best-practices': ['error', { minScore: 1.0 }],
        // PWA (optional, soft target)
        'categories:pwa': ['warn', { minScore: 0.7 }],
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'lighthouse-reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
  },
};
