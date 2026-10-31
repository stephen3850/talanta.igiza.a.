# Talanta Stadium Smart Digital Infrastructure
## Technical Architecture and Operations Reference

**Status:** Development repository. This document describes implemented application structures, not a deployed or operational venue system.

## Architecture

- **Web/API:** Next.js App Router with JavaScript and React; API handlers are under `app/api/**/route.js`.
- **Persistence:** PostgreSQL through Prisma (`prisma/schema.prisma`). Some modules retain in-memory development fixtures or use explicit simulated adapters when persistence/provider services are unavailable.
- **Authentication:** Signed HS256 session cookie (`talanta_session`) with an 8-hour expiry and role checks in `lib/auth.js`. Production requires a secret `JWT_SECRET` of adequate length. Demo identities are development-only.
- **Integrations:** Each hardware/provider integration requires a vendor-approved adapter, credentials from an approved secret manager, connectivity testing, and operational approval. Metadata or inventory records alone do not prove a connection.
- **Deployment:** No production host, domain, high-availability topology, physical system, or successful recovery is verified by this repository.

## Data model

`prisma/schema.prisma` is the canonical source for tables, enums, keys, and relationships. It contains core users/events/bookings/tickets/payments and module-specific CCTV, network, access-control, emergency-communications, SOC, disaster-recovery, and hardware-deployment records. Review the current schema directly before building migrations or applying changes; this file does not claim the schema has been deployed to a database.

Do not treat in-memory fixtures, seeded examples, dashboard cards, simulated telemetry, or manually entered recovery tests as verified venue records. Dashboard integrations must be labeled `SIMULATED`, `UNVERIFIED`, `DISCONNECTED`, or unavailable as appropriate.

## API and security model

The active API surface is defined by the route handlers in `app/api`; route behavior and role requirements must be checked in source before integration. `/api/v1/docs` intentionally returns an empty development OpenAPI contract until a real partner API is approved and implemented. It must not be used as evidence of a live payment or ticketing partner interface.

Sensitive routes use session authorization and role allowlists. Customer registration assigns `CUSTOMER`; clients cannot grant themselves staff roles. Cookies are HTTP-only and use `SameSite=Lax`. Review CSRF, rate limiting, account recovery, brute-force protection, and deployment-specific cookie/TLS controls before production.

The legacy `/api/payments/mpesa` initiation endpoint is disabled with HTTP 410. M-PESA provider connectivity and live credentials are not verified. Callback code must be exercised against a provider sandbox and production credentials before payments can be represented as operational. Gate validation is a software workflow and does not control or verify a physical turnstile.

Audit records and hash-linked module ledgers are not intrinsically immutable. Database outages have caused in-memory fallback in development tests; production must fail safely or use a durable, protected log pipeline. Do not put credentials, payment secrets, raw passwords, or unnecessary personal data in application logs.

## Local development and schema handling

1. Install the Node.js version required by the installed Next.js package and run `npm ci`.
2. Copy `.env.example` to a private `.env`; configure unique development-only secrets and a local PostgreSQL database.
3. Run `npm run prisma:generate` and validate with `npx prisma validate`.
4. Apply schema changes only to an explicitly selected development database. Do not run `prisma db push` against production; agree on a reviewed migration and backup plan first.
5. Seed only isolated development data. Never use demo credentials in production.
6. Run targeted test scripts from `package.json`, then `npm run build`.

## Operational requirements before deployment

- Provision managed PostgreSQL, private encrypted storage, secret management, TLS, backups, logs, alerting, and approved retention controls.
- Review role assignments, registration/rate limits, session lifecycle, upload scanning, audit durability, database constraints, and privacy impact with the responsible owners.
- Obtain vendor documentation and authorization for each required M-PESA, network, Wi-Fi, CCTV/VMS, access-control, signage/PA, IoT, SIEM, email/SMS, and payment integration.
- Validate physical device status using equipment-specific read-only adapters before calling any feed live. Keep certified life-safety systems independent.
- Confirm recovery objectives with stakeholders and complete an isolated restore/failover exercise before claiming RPO/RTO or availability.
- Obtain applicable Kenyan privacy, legal, procurement, safety, and engineering reviews. This software does not certify compliance.

See `final_operational_readiness.artifact.md`, `security_report.artifact.md`, and the detailed operations sections in `README.md` for current validation evidence and known gaps.
