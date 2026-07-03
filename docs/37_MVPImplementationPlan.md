# 37 — MVP Implementation Plan

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** Phase 1 goals (`00_Project_Charter` §9.1)

---

## 1. Purpose

This document defines the **Phase 1 MVP plan**: 15-20 high-value browser-first tools across 7 categories. Each tool is evaluated on business value, implementation complexity, SEO potential, traffic potential, monetization potential, and priority.

## 2. MVP Scope

**Target:** 15-20 tools (this plan specifies 20 tools across 7 categories).

**Categories:** Image, PDF, Developer, Text, Converters, SEO, Calculators.

**Principle:** Browser-first (LOCK-02); each tool solves one problem (PC-01); each tool meets PC-03 completion standard and passes PC-04 quality gates.

## 3. Tool Evaluation Matrix

### 3.1 Evaluation Criteria

| Criterion | Scale | Description |
|-----------|-------|-------------|
| Business Value | 1-5 | How much user value does this create? |
| Implementation Complexity | 1-5 | How hard to build? (1=easy, 5=hard) |
| SEO Potential | 1-5 | How strong is search demand? |
| Traffic Potential | 1-5 | How much traffic can this drive? |
| Monetization Potential | 1-5 | How much premium/ads revenue? |
| Priority | P0-P3 | P0=critical, P1=high, P2=medium, P3=low |

### 3.2 Image Tools

| Tool | Business Value | Complexity | SEO | Traffic | Monetization | Priority |
|------|---------------|------------|-----|---------|--------------|----------|
| Image Resizer | 5 | 2 | 5 | 5 | 3 | P0 |
| Image Compressor | 5 | 3 | 5 | 5 | 3 | P0 |
| Image Cropper | 4 | 2 | 4 | 4 | 2 | P1 |
| Image Format Converter | 4 | 2 | 4 | 4 | 2 | P1 |
| Passport Photo Maker | 4 | 4 | 3 | 3 | 4 | P2 |

### 3.3 PDF Tools

| Tool | Business Value | Complexity | SEO | Traffic | Monetization | Priority |
|------|---------------|------------|-----|---------|--------------|----------|
| PDF Merge | 5 | 3 | 5 | 5 | 3 | P0 |
| PDF Split | 4 | 3 | 4 | 4 | 2 | P1 |
| PDF Compress | 5 | 4 | 4 | 4 | 3 | P1 |
| PDF to Image | 4 | 3 | 4 | 4 | 2 | P2 |

### 3.4 Developer Tools

| Tool | Business Value | Complexity | SEO | Traffic | Monetization | Priority |
|------|---------------|------------|-----|---------|--------------|----------|
| JSON Formatter | 5 | 1 | 5 | 5 | 2 | P0 |
| UUID Generator | 4 | 1 | 4 | 4 | 1 | P1 |
| Password Generator | 5 | 1 | 5 | 5 | 2 | P0 |
| Base64 Encoder/Decoder | 4 | 1 | 4 | 4 | 1 | P1 |
| Hash Generator | 3 | 2 | 3 | 3 | 1 | P2 |

### 3.5 Text Tools

| Tool | Business Value | Complexity | SEO | Traffic | Monetization | Priority |
|------|---------------|------------|-----|---------|--------------|----------|
| Word Counter | 5 | 1 | 5 | 5 | 2 | P0 |
| Case Converter | 3 | 1 | 3 | 3 | 1 | P2 |
| Lorem Ipsum Generator | 3 | 1 | 3 | 3 | 1 | P2 |

### 3.6 Converters

| Tool | Business Value | Complexity | SEO | Traffic | Monetization | Priority |
|------|---------------|------------|-----|---------|--------------|----------|
| Unit Converter | 4 | 2 | 4 | 4 | 2 | P1 |
| Color Converter (HEX/RGB/HSL) | 4 | 1 | 4 | 4 | 1 | P1 |

### 3.7 SEO Tools

| Tool | Business Value | Complexity | SEO | Traffic | Monetization | Priority |
|------|---------------|------------|-----|---------|--------------|----------|
| Meta Tag Generator | 4 | 2 | 4 | 4 | 2 | P1 |
| Open Graph Preview | 3 | 2 | 3 | 3 | 1 | P2 |

### 3.8 Calculators

| Tool | Business Value | Complexity | SEO | Traffic | Monetization | Priority |
|------|---------------|------------|-----|---------|--------------|----------|
| Loan Calculator | 4 | 2 | 4 | 4 | 3 | P1 |
| BMI Calculator | 3 | 1 | 4 | 4 | 2 | P1 |

## 4. MVP Tool List (20 Tools, P0 + P1)

### P0 Tools (6 — Critical, ship first)

1. **Image Resizer** — High search demand, simple browser implementation.
2. **Image Compressor** — High search demand, medium complexity.
3. **PDF Merge** — Top search query in PDF category.
4. **JSON Formatter** — Developer staple, very high search demand.
5. **Password Generator** — High search demand, simple.
6. **Word Counter** — Very high search demand, simple.

### P1 Tools (11 — High value, ship after P0)

7. Image Cropper
8. Image Format Converter
9. PDF Split
10. PDF Compress
11. UUID Generator
12. Base64 Encoder/Decoder
13. Unit Converter
14. Color Converter (HEX/RGB/HSL)
15. Meta Tag Generator
16. Loan Calculator
17. BMI Calculator

### P2 Tools (3 — Medium value, ship if time permits)

18. Passport Photo Maker
19. Hash Generator
20. Lorem Ipsum Generator

## 5. Implementation Order

**Sprint 1-2:** P0 tools (6 tools) — establish pattern, validate architecture.
**Sprint 3-4:** P1 tools (11 tools) — scale the pattern.
**Sprint 5:** P2 tools (3 tools) — polish and expand.

## 6. Success Criteria

- All 20 tools in `Stable` lifecycle.
- All 20 tools pass PC-04 quality gates.
- Lighthouse scores: Performance ≥90, Accessibility ≥95, SEO ≥95.
- Total bundle size: main page <300KB, tool pages <500KB.
- All tools browser-first (LOCK-02).
- 10k MAU achieved.
- SEO footprint established (all tools indexed by Google).

## 7. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial MVP Implementation Plan. 20 tools across 7 categories with evaluation matrix (business value, complexity, SEO, traffic, monetization, priority). |

## 8. Cross References

- `00_Project_Charter` §9.1 — Phase 1 goals (30 tools, 10k MAU).
- `36_ProjectBootstrapRoadmap` — Implementation milestones.
- `38_ProjectBacklog` — Detailed backlog with estimates.
- `39_SprintPlanning` — Sprint-by-sprint delivery.
