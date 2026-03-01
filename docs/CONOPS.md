# Keene IT & Repair Website
## CONOPS DRAFT V1

**Date:** 02-05-2026  
**System Name:** Keene IT & Repair Website (static marketing site + quote request funnel)

---

## 1) Purpose
Provide a fast, low-attack-surface, mobile-first public website that 
  (1) markets Keene IT & Repair services and 
  (2) captures quote requests via a simple form/funnel, delivering those requests to me via email. The system must remain low-cost, low-maintenance, and resilient.

---

## 2) Operational Context
### 2.1 Users
- **Prospective customers (public web users):** browse services, contact info, submit quote request.
- **Myself:** receives and responds to quote requests; updates site content.

### 2.2 Environments
- **Client-side:** modern browsers on mobile/tablet/desktop.
- **Edge:** Cloudflare CDN/WAF/proxy.
- **Backend:** AWS Lambda (function URL or API Gateway) behind Cloudflare.
- **Email delivery:** AWS SES.

---

## 3) System Overview
### 3.1 High-level Concept of Employment (CONOPS narrative)
1. User navigates to **keenitrepair.com**.  
2. Cloudflare serves the static site from GitHub Pages with caching and TLS.
3. User moves through a 3-step quote funnel (device type → make/model → issue summary) and enters contact info.
4. On submit, the browser sends a POST request to the API endpoint on a dedicated subdomain (**api.keeneitrepair.com**).
5. Cloudflare applies edge protections (WAF/rate limiting/bot controls), injects x-origin-secret header, and forwards the request to AWS Lambda.
6. Lambda validates the request (origin verification, schema validation, anti-abuse controls), normalizes the message, and calls AWS SES to send an email to me (and optionally a confirmation email to the customer).
7. I receive the email and follow up with the customer.

### 3.2 Goals
- Very fast page loads, good Lighthouse/Core Web Vitals.
- Strong basic abuse resistance for the form.
- Minimal moving parts and minimal cost.

### 3.3 Non-goals
- User accounts/login.
- Storing requests in a database.
- E-commerce.
- Complex CMS.

---

## 4) System Modes and States
### 4.1 Normal operation
- Static content served from edge cache.
- Form POSTs routed to Lambda; SES delivers messages.

### 4.2 Degraded operation
- **GitHub Pages down:** Cloudflare may still serve cached content, but fresh deploys may be delayed.
- **Lambda down:** static site still works, but quote submissions fail (UI should show a fallback message and alternative contact method).
- **SES throttling/bounce:** submissions may be accepted but notifications fail; Lambda should surface “message could not be delivered” and log the failure.

### 4.3 Maintenance operation
- Site updates via Git push → GitHub Pages deploy.
- Cloudflare cache purge when needed (selective).

---

## 5) Functional Requirements (FR)
FR-1. Serve a mobile-first static marketing site over HTTPS.

FR-2. Provide a quote-request funnel that collects:
- Device type
- Make/model (either free text or controlled list)
- Issue summary
- Contact name
- Contact email
- Contact phone

FR-3. Submit quote request via POST to backend.

FR-4. Backend validates input, rate-limits/anti-abuse, and sends a notification email to me.

FR-5. Provide clear user feedback on success/failure and a manual fallback contact method.

FR-6. Basic observability: request logging + error reporting.

---

## 6) Non-Functional Requirements (NFR)
NFR-1. **Performance:** cached static assets; minimal JS; optimize for fast LCP/CLS.

NFR-2. **Availability:** edge caching; backend isolated; graceful fallback on backend outage.

NFR-3. **Security:** TLS everywhere; origin protection for backend; strict validation; rate limiting; spam controls.

NFR-4. **Cost:** keep within a small annual budget; avoid persistent databases unless needed.

NFR-5. **Maintainability:** simple deployments; minimal secrets footprint; clear runbook.

---

## 7) Interfaces
### 7.1 Public website
- **URL:** https://keeneitrepair.com/
- **Method:** GET
- **Payload:** static HTML/CSS/JS assets

### 7.2 Quote API endpoint
- **URL:** https://api.keeneitrepair.com
- **Method:** POST
- **Content-Type:** application/json
- **Auth:** not user-authenticated; protected by:
  - Cloudflare WAF + rate limits
  - Origin verification header (edge-injected) and/or shared secret
  - Optional Turnstile challenge on suspicious traffic

#### Suggested request schema (v1)
```json
{
  "device": {
    "type": "Laptop",
    "make": "Dell",
    "model": "XPS 13"
  },
  "issue": {
    "summary": "Battery not charging",
    "details": "Happened after Windows update"
  },
  "contact": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "513-555-0101",
    "preferred": "text"
  },
  "meta": {
    "consent": true,
    "client_ts": "2026-02-05T16:05:00-05:00"
  }
}
```

#### Suggested response
```json
{ "ok": true, "request_id": "<uuid>", "message": "Request received" }
```

---

## 8) Security and Abuse Controls (baseline)
- **Origin protection:**
  - Cloudflare → Lambda with an injected header (e.g., `X-Origin-Secret`) plus server-side verification.
  - Restrict Lambda to only accept requests with that header and expected value.
- **Rate limiting:** per-IP and per-path at Cloudflare; secondary in Lambda.
- **Input validation:** strict JSON schema; length limits; reject unexpected fields.
- **Spam controls:**
  - Honeypot field or hidden input.
  - Optional Cloudflare Turnstile on form submit.
  - Optional SES configuration set for bounce/complaint tracking.
- **CORS:** only allow the site origin.
- **Secrets:** stored in AWS (env vars) and not embedded in static JS.

---

## 9) Data and Privacy
- **Data collected:** minimal contact and issue description.
- **Data stored:** ideally none long-term (email only). Logs may contain metadata; avoid logging PII in plaintext if possible.
- **Retention:** logs retention limited (e.g., 14–30 days) unless needed for abuse investigations.

---

## 10) Traceability
### 10.1 Top-level Needs (N)
N-1. Public users can quickly understand services and contact Keene IT & Repair.

N-2. Public users can request a quote without calling.

N-3. Requests reliably reach me.

N-4. System resists spam/abuse and protects backend.

N-5. System is low-cost and low-maintenance.


### 10.2 Requirements-to-Design Traceability Matrix (draft)
| Need | Requirement | Design Element(s) | Verification |
|---|---|---|---|
| N-1 | FR-1 | GitHub Pages + Cloudflare caching | Browser test; Lighthouse report; TLS check |
| N-2 | FR-2, FR-3 | Static funnel UI + POST to `api.<domain>` | Form submission E2E test; negative tests |
| N-3 | FR-4 | Lambda → SES | Send test request; confirm inbox delivery |
| N-4 | NFR-3 | Cloudflare WAF/rate limit + origin header + schema validation | WAF rule tests; replay w/o header; fuzz invalid JSON |
| N-5 | NFR-4, NFR-5 | Serverless + no DB; simple deploy pipeline | Cost dashboard review; deploy runbook check |

### 10.3 Component Traceability (quick map)
- **Static Site:** FR-1, FR-2, FR-5, NFR-1
- **Cloudflare:** FR-1, FR-3, NFR-2, NFR-3
- **Lambda:** FR-3, FR-4, FR-6, NFR-3
- **SES:** FR-4

---


## 11) Verification Plan
- **V-1 Static site served via Cloudflare:** verify response headers, TLS, caching, and deploy works.
- **V-2 API accepts valid requests:** unit tests for schema, integration test via curl/browser.
- **V-3 API rejects invalid/abusive requests:** missing origin header, bad CORS origin, rate limit.
- **V-4 Email delivery:** SES sandbox vs production, SPF/DKIM alignment, inbox delivery checks.
- **V-5 Observability:** confirm logs for success/failure without leaking PII.

---