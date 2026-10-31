# Talanta Stadium Smart Digital Infrastructure
## Development User and Administrator Guide

**Important:** This repository is not a deployed stadium control system. Demo records, operator profiles, telemetry, screen status, incidents, and assignments are not real-world credentials or operational facts. Do not use this guide to direct patrons, staff, emergency responders, or physical infrastructure.

## Access and roles

Sign in only with an account provisioned for the current environment. In local development, the application may provide clearly identified demo accounts; never reuse them outside a local isolated environment. The server assigns roles and the API enforces them. Do not share session cookies, passwords, API keys, or device secrets. Log out on shared devices.

Administrators should confirm access with the least-privilege role required. System administrators manage configuration; managers and operators have module-specific permissions. A screen or navigation item is not proof that the underlying provider or device is connected.

## Public pages, account and tickets

Public event and ticket pages may display sample or seeded content. The booking/payment flow must be treated as simulated unless the environment explicitly shows a verified database and approved provider status. The direct `/api/payments/mpesa` endpoint is disabled. Never represent a simulated booking, callback, QR, or scan as a paid ticket or real admission decision.

## Operations dashboards

Check each dashboard's data-mode label before acting. `SIMULATED` and `UNVERIFIED` mean the records are examples or metadata, not current telemetry. `DISCONNECTED`, `UNAVAILABLE`, or `NOT CONFIGURED` means there is no verified provider feed. Do not use fixture alerts, occupancy, staff rosters, or asset locations to make operational decisions.

## Emergency communications and incident records

The legacy broadcast and signage override actions are disabled. The emergency communications module supports message preparation and approval workflow tests only; no PA, radio, SMS, or signage transmission is verified. Venue-approved emergency procedures and contacts are not configured in this repository. Follow the responsible venue authority's official emergency plan and use verified official channels. Never use this application to command fire alarms, doors, gates, evacuation systems, or other life-safety equipment.

## Hardware and integration modules

Inventory, network policies, CCTV/VMS metadata, access points, IoT records, and hardware commissioning tasks do not prove installation, connection, acceptance, or operation. Do not upload sensitive credentials. Use only vendor-approved read-only integrations until engineering and security approval is complete. A physical control is not available unless an explicitly approved and tested adapter is deployed.

## Backup and recovery

The backup and restore utilities require configured PostgreSQL tools, encryption keys, private storage, and a separate protected target. Verify-only restore checks do not restore a database. Any actual restore is destructive to its target and requires an approved change record, an isolated target, and a tested recovery plan. Do not test against production.

## Local quality checks

Use `npm run test:core-security` and the module-specific test scripts listed in `package.json`. Run Prisma validation/generation and a production build before proposing deployment. If PostgreSQL is unreachable, tests may pass through in-memory fallback; report this as simulated and do not claim database-backed verification.

See `README.md` for setup and module prerequisites and `final_operational_readiness.artifact.md` for tested versus unverified capabilities.
