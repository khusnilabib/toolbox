# 20 — API Convention

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** DGA-08 (API Evolution), EC-08 (Security by Default), EC-12 (Enterprise Readiness), LOCK-05 (Plugin-Ready — stable contracts)

---

## 1. Purpose

This API Convention document defines **how APIs are designed, versioned, and evolved** in [PROJECT_NAME]. It implements DGA-08 (API Evolution — versioned, deprecation policy, backward compatibility), EC-08 (Security by Default — input validation, auth), and supports LOCK-05 (Plugin-Ready — stable contracts for future plugins).

The document covers both internal APIs (server actions, Next.js API routes) and public APIs (Phase 3+ external API for integrations). Internal APIs follow the same conventions as public APIs, ensuring that "internal" APIs can be promoted to "public" with minimal changes. This forward-compatibility is essential for DGA-10 (marketplace readiness) and EC-12 (enterprise readiness).

API conventions are critical because once an API is published, changing it breaks consumers. Without versioning and deprecation policy, changes are silent breakages. Without consistent error format, consumers can't handle errors uniformly. Without authentication standards, security is inconsistent. This document prevents all of these by establishing conventions from day 1, even for internal-only APIs.

## 2. Scope

### 2.1 In Scope

- API URL structure and routing.
- HTTP method semantics.
- Request/response formats (JSON).
- Authentication and authorization.
- Error format and status codes.
- Versioning strategy (DGA-08).
- Deprecation policy (DGA-08).
- Rate limiting.
- Pagination.
- Server action conventions (Next.js).
- Public API preparation (Phase 3+).

### 2.2 Out of Scope

- Specific API endpoint definitions → per-feature in `13_FBRD`.
- Database access patterns → `19_DatabaseDesign`.
- RBAC role definitions → `23_RBAC`.
- Analytics event schema → `16_EventSchemaSpecification`.
- Deployment of API routes → `27_DeploymentGuide`.

## 3. Architectural Decisions

### AD-01 — RESTful Conventions with Versioning

**Context.** Multiple API styles exist: REST, GraphQL, RPC. REST is the most universally understood and compatible. Without versioning, changes break consumers.

**Decision.** RESTful conventions for all APIs. URLs are `/api/v1/[resource]/[id]/[action]`. Versioned from day 1 (v1). Internal and public APIs follow same conventions.

**Implements:** DGA-08, EC-12 (Enterprise Readiness).

### AD-02 — JSON-Only, Typed with Zod

**Context.** Supporting multiple formats (JSON, XML, form-encoded) adds complexity. Untyped JSON leads to runtime errors.

**Decision.** All APIs accept and return JSON only. Every request and response validated with Zod schemas. TypeScript types inferred from Zod. Content-Type must be `application/json`.

**Implements:** EC-08 (input validation), EC-02 (One Source of Truth — Zod is single source).

### AD-03 — Consistent Error Format

**Context.** Inconsistent error formats (some use `{error: "message"}`, some use `{errors: [...]}`, some use HTTP status only) make error handling impossible for consumers.

**Decision.** Standardized error response format:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request was invalid.",
    "details": [
      { "field": "email", "message": "Email is required." }
    ],
    "requestId": "req_abc123"
  }
}
```

**Implements:** PC-08 (Error Experience — APIs explain errors clearly), DGA-08.

### AD-04 — Authentication via JWT

**Context.** Supabase Auth uses JWT. API routes need to verify JWT to identify users.

**Decision.** All non-public APIs require JWT in `Authorization: Bearer [token]` header. JWT verified at API route entry via Supabase client. User ID extracted from JWT; no DB call for auth check (per LOCK-06 — database optional).

**Implements:** EC-08, LOCK-06 (no DB call per request for auth).

### AD-05 — Rate Limiting

**Context.** Without rate limiting, APIs are vulnerable to abuse (DoS, scraping).

**Decision.** Rate limiting per IP and per user:
- Anonymous: 100 requests/minute per IP.
- Authenticated: 1000 requests/minute per user.
- Premium: 5000 requests/minute per user.
- Public API (Phase 3+): tiered per plan.

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

**Implements:** EC-08, PC-06 (Monetization — premium has higher limits).

### AD-06 — Deprecation Policy (DGA-08)

**Context.** DGA-08 mandates documented deprecation policy. Without it, consumers don't know when an API will be removed.

**Decision.** Deprecation policy:
1. **Deprecation announcement:** API marked deprecated in docs and OpenAPI spec.
2. **`Deprecation` header:** Added to deprecated API responses (RFC draft).
3. **`Sunset` header:** Added with removal date (RFC 8594).
4. **6-month overlap:** Deprecated API works for 6 months after deprecation.
5. **Migration guide:** Published with deprecation announcement.
6. **Removal:** In next major version (v2, v3, etc.).

**Implements:** DGA-08, EC-12.

## 4. Design Principles

### P1 — Versioned from Day 1
Even v1 internal APIs are versioned. Promotion to public requires no restructure.

### P2 — Consistent Everywhere
Internal and public APIs follow the same conventions. No "internal-only" shortcuts.

### P3 — Typed End-to-End
Zod schemas for every request and response. TypeScript types inferred.

### P4 — Errors Are Informative
Every error has code, message, details, requestId. Consumers can handle programmatically.

### P5 — Backward Compatibility Preferred
Additive changes only in minor versions. Breaking changes require major version + migration.

### P6 — Documented
Every API endpoint documented in OpenAPI spec (Phase 2+). For Phase 1, documented in this file and per-feature specs.

## 5. URL Structure

### 5.1 Base URL

- Internal: `/api/v1/...`
- Public (Phase 3+): `https://api.example.com/v1/...`

### 5.2 Resource Naming

- **Plural nouns for collections:** `/api/v1/users`, `/api/v1/tools`, `/api/v1/history-entries`.
- **Singular via ID:** `/api/v1/users/123`, `/api/v1/tools/image-resize`.
- **Nested resources:** `/api/v1/users/123/history-entries`.
- **Actions on resources:** `/api/v1/tools/image-resize/execute`.

### 5.3 HTTP Method Semantics

| Method | Use | Idempotent | Safe |
|--------|-----|------------|------|
| GET | Read resource | Yes | Yes |
| POST | Create resource | No | No |
| PATCH | Partial update | No | No |
| PUT | Full replace | Yes | No |
| DELETE | Remove resource | Yes | No |

### 5.4 Query Parameters

- `?page=1&pageSize=20` — pagination.
- `?sort=-createdAt` — sort (descending by createdAt).
- `?filter[status]=active` — filtering.
- `?fields=id,name,email` — sparse fieldsets (Phase 2+).
- `?include=author,tags` — compound documents (Phase 2+).

## 6. Request/Response Formats

### 6.1 Request Format

All request bodies are JSON:

```http
POST /api/v1/tools/image-resize/execute HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJ...

{
  "input": {
    "file": "base64-encoded-or-multipart-reference",
    "width": 800,
    "height": 600,
    "maintainAspectRatio": true
  }
}
```

### 6.2 Response Format

#### Success Response

```json
{
  "data": {
    "id": "exec_abc123",
    "toolSlug": "image-resize",
    "status": "completed",
    "output": {
      "url": "https://storage.example.com/results/abc.png",
      "width": 800,
      "height": 600,
      "format": "png",
      "sizeBytes": 245678
    },
    "createdAt": "2026-06-28T10:00:00Z"
  },
  "meta": {
    "requestId": "req_abc123",
    "duration": 823
  }
}
```

#### Error Response

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request was invalid.",
    "details": [
      {
        "field": "input.width",
        "message": "Width must be between 1 and 10000."
      }
    ],
    "requestId": "req_abc123"
  }
}
```

#### List Response (Paginated)

```json
{
  "data": [
    { "id": "1", ... },
    { "id": "2", ... }
  ],
  "meta": {
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

## 7. Authentication and Authorization

### 7.1 Authentication

- **Method:** JWT Bearer token.
- **Header:** `Authorization: Bearer [token]`.
- **Verification:** Supabase client verifies JWT signature and expiration.
- **No DB call for auth:** User ID extracted from JWT claims (LOCK-06).

### 7.2 Authorization (RBAC)

Per `23_RBAC`:
- Every API route declares required permission.
- Permission checked after authentication.
- Denials return 403 with error code `PERMISSION_DENIED`.

### 7.3 Public Endpoints

Some endpoints are public (no auth required):
- `GET /api/v1/tools` — list tools (for search, navigation).
- `GET /api/v1/tools/[slug]` — tool metadata.
- `POST /api/v1/tools/[slug]/execute` — execute browser tool (guest allowed per LOCK-07).

## 8. Error Codes and Status Codes

### 8.1 HTTP Status Codes

| Code | Use |
|------|-----|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (auth valid but no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity (semantic error) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### 8.2 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_FAILED` | 400 | Request body failed Zod validation |
| `UNAUTHORIZED` | 401 | No token or invalid token |
| `PERMISSION_DENIED` | 403 | Auth valid but role insufficient |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate resource |
| `QUOTA_EXCEEDED` | 422 | User hit usage limit |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency down (DB, AI API) |

## 9. Versioning Strategy (DGA-08)

### 9.1 Version Format

- URL-based: `/api/v1/...`, `/api/v2/...`.
- Semver for API versions:
  - **Major (v1 → v2):** Breaking changes.
  - **Minor:** Additive changes within v1 (new endpoints, new optional fields).
  - **Patch:** Bug fixes, no API change.

### 9.2 Backward Compatibility Rules

Within a major version:
- ✅ Add new endpoints.
- ✅ Add optional fields to requests.
- ✅ Add new fields to responses.
- ❌ Remove fields from responses.
- ❌ Change field semantics.
- ❌ Change HTTP status codes.
- ❌ Change URL structure.

### 9.3 Breaking Changes

Breaking changes require:
1. New major version (v2).
2. Migration guide published.
3. v1 maintained for 6 months after v2 release.
4. ADR documenting the breaking change (DGA-08).
5. `Deprecation` and `Sunset` headers on v1.

## 10. Server Action Conventions

Next.js Server Actions are the primary internal API mechanism (per `05_ProjectStructure` §8.3).

### 10.1 Server Action Structure

```typescript
// src/identity/application/actions/save-history-entry.ts

'use server';

import { z } from 'zod';
import { requireAuth } from '@/shared/lib/auth';
import { audit } from '@/platform-ops/application/services/audit';

const inputSchema = z.object({
  toolSlug: z.string(),
  inputSummary: z.record(z.unknown()),
  outputSummary: z.record(z.unknown()),
});

export async function saveHistoryEntry(input: unknown) {
  // 1. Validate input
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_FAILED', details: parsed.error.issues } };
  }

  // 2. Authenticate
  const user = await requireAuth();
  if (!user) {
    return { error: { code: 'UNAUTHORIZED' } };
  }

  // 3. Authorize
  if (!hasPermission(user, 'history:write')) {
    return { error: { code: 'PERMISSION_DENIED' } };
  }

  // 4. Execute
  const entry = await historyRepository.create({
    userId: user.id,
    ...parsed.data,
  });

  // 5. Audit
  await audit({
    action: 'history_entry_saved',
    resourceType: 'history_entry',
    resourceId: entry.id,
  });

  return { data: entry };
}
```

### 10.2 Server Action Standards

- Marked with `'use server'`.
- Input validated with Zod.
- Auth check via `requireAuth()`.
- Permission check via `hasPermission()`.
- Return `{ data }` or `{ error }` format (consistent with REST API).
- Audit admin actions (DGA-07).

## 11. Rate Limiting

### 11.1 Limits

| Scope | Limit | Window |
|-------|-------|--------|
| Anonymous IP | 100 requests | 1 minute |
| Authenticated user | 1000 requests | 1 minute |
| Premium user | 5000 requests | 1 minute |
| Public API (Phase 3+) | Per plan | 1 minute |

### 11.2 Implementation

- Upstash Redis for rate limiting (free tier).
- Sliding window algorithm.
- Rate limit headers in response.

### 11.3 Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1719561600
```

### 11.4 429 Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "requestId": "req_abc123"
  }
}
```

## 12. Pagination

### 12.1 Offset Pagination (Default)

- `?page=1&pageSize=20`
- Max pageSize: 100.
- Response includes `meta.pagination` with total count.

### 12.2 Cursor Pagination (Phase 2+)

For large datasets:
- `?cursor=abc123&limit=20`
- Response includes `meta.nextCursor`.
- More efficient for deep pagination.

## 13. Standards

### 13.1 API Authoring Standards
- Every API route/server action validates input with Zod.
- Every API route/server action checks auth and permissions.
- Every API route/server action returns consistent format (`{ data }` or `{ error }`).
- Every API route/server action is documented.

### 13.2 API Versioning Standards
- All APIs under `/api/v1/`.
- Breaking changes require new major version + ADR.
- Deprecated APIs have `Deprecation` and `Sunset` headers.
- 6-month overlap for deprecated APIs.

### 13.3 API Security Standards
- HTTPS only.
- CORS configured per environment.
- No secrets in URL parameters.
- Input validation (Zod) on every endpoint.
- Rate limiting on every endpoint.

### 13.4 API Documentation Standards
- Every endpoint documented (OpenAPI spec in Phase 2+).
- Request and response examples.
- Error codes documented.
- Authentication requirements documented.

## 14. Best Practices

### 14.1 When Adding an API Endpoint
1. Determine if internal (server action) or public (API route).
2. Define URL and HTTP method.
3. Define Zod schemas for request and response.
4. Implement auth and permission checks.
5. Implement rate limiting.
6. Document endpoint.
7. Write tests.

### 14.2 When Modifying an API
- Additive changes: safe within current version.
- Breaking changes: new major version + ADR + migration guide.

### 14.3 When Deprecating an API
1. Mark as deprecated in docs.
2. Add `Deprecation` and `Sunset` headers.
3. Publish migration guide.
4. Maintain for 6 months.
5. Remove in next major version.

## 15. Future Expansion

### 15.1 Public API (Phase 3+)
- API keys for external consumers.
- Tiered pricing (free, pro, enterprise).
- OpenAPI spec published.
- Developer portal.

### 15.2 GraphQL (Phase 4+)
- If REST proves insufficient for complex queries.
- Alongside REST, not replacing.

### 15.3 Webhooks (Phase 3+)
- For async operations (e.g., batch processing complete).
- Signed payloads for verification.

### 15.4 API SDK (Phase 3+)
- Official SDKs for JavaScript, Python, Go.
- Generated from OpenAPI spec.

## 16. Dependencies

### 16.1 Document Dependencies
- Depends on `00_Project_Charter` §6 DGA-08.
- Depends on `04_TechStack` — Next.js API routes, Zod, Supabase Auth.
- Depends on `05_ProjectStructure` §8.3 — Server action conventions.
- `06_ArchitectureDecisionRecords` — ADR-071.
- `13_FBRD` — Per-feature API specs.
- `19_DatabaseDesign` — DB access via repositories.
- `23_RBAC` — Permission definitions.
- `24_AdminSpecification` — Admin API endpoints.
- `27_DeploymentGuide` — API deployment and CORS.

### 16.2 External Dependencies
- Next.js API routes (Node runtime).
- Zod (validation).
- Supabase Auth (JWT verification).
- Upstash Redis (rate limiting, Phase 2+).

### 16.3 Assumptions
- REST sufficient through Phase 3.
- Server actions sufficient for internal APIs.
- URL-based versioning acceptable.

## 17. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial API Convention. Defined RESTful conventions with v1 versioning, JSON-only with Zod validation, consistent error format, JWT auth, rate limiting, deprecation policy (DGA-08), server action conventions. |

## 18. Cross References

- `00_Project_Charter` §6 DGA-08, §4 EC-08, EC-12, §3 LOCK-05 — Implemented.
- `02_SAD` §9 — Cross-cutting concerns (auth, RBAC) implemented via these conventions.
- `06_ArchitectureDecisionRecords` — ADR-071 (API Evolution).
- `05_ProjectStructure` §8.3 — Server action patterns.
- `08_CodingStandards` — Zod validation standards.
- `13_FBRD` — Per-feature API specs follow these conventions.
- `19_DatabaseDesign` — Repository pattern for DB access.
- `23_RBAC` — Permission checks in API routes.
- `24_AdminSpecification` — Admin API endpoints.
- `27_DeploymentGuide` — API deployment and CORS configuration.
- `28_AI_Guideline` — AI must follow API conventions (LOCK-09, EC-11).
