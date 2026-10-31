# Talanta Stadium Smart Digital Infrastructure

**Project**: Talanta Stadium Smart Digital Infrastructure (development workspace)  
**Stack**: Next.js App Router, React, Tailwind CSS, PostgreSQL, Prisma ORM  
**Operational status**: This repository is application code, not evidence of a deployed or accepted stadium system. No live venue, controller, payment provider, SIEM, backup scheduler, or high-availability deployment has been verified. See `final_operational_readiness.artifact.md` for current evidence and `security_report.artifact.md` for reviewed protections and residual risks.

---

## Platform overview

The application combines public web pages and administrative workflows for events, bookings, tickets, command dashboards, IoT, network/Wi-Fi, access control, emergency communications, SOC, disaster recovery, and hardware commissioning. Each integration must be treated according to its declared status: database-backed, simulated, disconnected, or awaiting vendor credentials/approval. Dashboards must not interpret fixture records as live venue telemetry.

### Important operating limits

- M-PESA production connectivity is not verified. The legacy direct initiation endpoint returns `410`; do not advertise it as an active provider integration. Any payment initiation is subject to the configured booking flow, runtime mode, and provider credentials.
- QR signing and gate validation are software workflows only. No turnstile or physical access controller is connected or commissioned by this repository.
- In-memory/demo data is not production evidence. Integration tests may use fallback data when PostgreSQL is unavailable.
- SOC, SIEM, notifications, network, IoT, CCTV/VMS, PA/signage, and access-control hardware adapters are incomplete or simulated unless an approved adapter and live status check are explicitly configured.
- Application audit records are not inherently immutable. No legal, procurement, safety, privacy, or security certification is asserted here.
- Do not use sample credentials outside local development; production requires unique secrets, managed identity, TLS, a reviewed database migration, and deployment-specific controls.

## Multi-facility management

The facility registry supports stadiums, training facilities, parking facilities, sports facilities, and other configured venue types. Only a system administrator can register a facility or manage memberships. Facility operators must have an active facility membership; system administrators have enterprise-wide access. Facility dashboards and private event, workforce, IoT, network, and hardware inventory requests are scoped to the authorized facility. Staff booking and ticket queries and gate validation check membership against the event's facility; tickets and payment records inherit facility ownership through the event relationship. This scoping is not yet a claim of complete tenant isolation: audit and scope every legacy operational endpoint before onboarding additional facilities.

The migration `prisma/migrations/20261031000000_multi_facility/migration.sql` creates the facility registry and membership table, backfills existing stadium records to the existing `TALANTA-STADIUM` facility, and assigns existing non-customer accounts to their current role at that facility. It does not create additional venues. Back up the database first and apply this incremental migration only to a database that already contains the current application tables; validate it on a restored staging copy before production. Then run `npm run prisma:generate`. Do not use `prisma db push` as a production migration strategy.

Open **Admin → Facilities** to see authorized facilities, then select a facility to open its scoped dashboard. Facility counts represent stored records and do not establish live hardware connectivity, installation, or operational acceptance. The central registry requires a persistent database; no extra facility fixtures are provided.

## Identity and access management

Apply `prisma/migrations/20261031100000_enterprise_iam/migration.sql` after the multi-facility migration, validate it on a restored staging database, then run `npm run prisma:generate`. No migration is automatically applied. New account passwords use PBKDF2-HMAC-SHA-512 with 310,000 iterations; legacy PBKDF2 hashes remain verifiable and are upgraded after successful login. Seeded administrator hashes use the same current format.

Set `MFA_ENCRYPTION_KEY_B64` to a base64-encoded random 32-byte key stored in a secrets manager. Set `IAM_ENFORCE_MFA_FOR_PRIVILEGED=true` to require TOTP enrollment for system administrators, venue managers, and finance officers at their next password login. Use `/account/security` to enroll an authenticator app and manage sessions. Recovery codes are shown once and stored only as hashes. TOTP credentials are encrypted with AES-256-GCM. Demo accounts do not support MFA.

Password recovery requires `RESEND_API_KEY`, `IAM_PASSWORD_RESET_FROM_EMAIL`, and the HTTPS production `NEXT_PUBLIC_APP_URL`. Recovery links are random, single-use, expire after 30 minutes, and are stored only as hashes. Without Resend configuration, production recovery fails closed. Development may display a one-time reset token only in development mode.

The supported role aliases map to existing permission roles: platform administrator → system administrator; stadium administrator/operations manager → venue manager; security supervisor → gate operator; ticketing officer → finance officer; maintenance technician/staff member/contractor → steward. These are compatibility mappings, not separate least-privilege permission matrices; review and refine route-level permissions before production use. Configure OIDC/OAuth provider metadata at **Admin → Identity & Access Management**; this stores issuer/client metadata and an environment-secret reference only. Federated login is not implemented or activated, and SAML is unavailable because no approved SAML library is present.

**Session limitation:** new login sessions are stored as token hashes and can be listed/revoked by IAM endpoints. Legacy application APIs still validate signed JWTs synchronously and do not consult the session table, so revocation, account suspension, password reset, and role changes may not take effect on those routes until the existing token expires (up to eight hours). Managed IAM endpoints reject revoked sessions. This is a material residual risk; do not treat session revocation or account suspension as immediate platform-wide enforcement until all protected APIs use database-backed session validation. Existing pre-migration sessions are not listed and should be invalidated by rotating `JWT_SECRET` during deployment.

## Data governance and privacy management

Apply `prisma/migrations/20261031110000_data_governance/migration.sql` after the IAM migration, validate it on a restored staging database, and run `npm run prisma:generate`. **Admin → Data Governance & Privacy** provides a configurable data inventory and classification, privacy-notice records, consent evidence, processor register, data-subject request handling, retention policies/reviews, and governance access audit summaries. Published notices appear at `/privacy`; no notice is published by default. The initial inventory catalog describes platform data categories; it does not add real subject records or assert that named integrations are connected.

Set `GOVERNANCE_ENCRYPTION_KEY_B64` to a separately generated base64-encoded random 32-byte key in the deployment secret manager. It encrypts data-subject request contact details using AES-256-GCM; production requests fail closed without a valid key. Preserve and rotate this key using a documented re-encryption procedure; changing it without re-encrypting existing contacts makes those values unreadable. Set `GOVERNANCE_SUBJECT_HASH_KEY` to a separate high-entropy secret of at least 32 characters to HMAC subject references before consent records are stored. Preserve it for stable lookups; key rotation changes those hashes. Do not reuse the JWT, MFA, or backup keys. Contact details are masked in ordinary request listings; the dedicated contact-access route is system-administrator-only and writes an access audit event.

Retention policy dates are review targets only: this module never automatically deletes platform records and does not perform deletion when an action is marked `DELETE_APPROVED`. An active category or record preservation hold blocks deletion approval until reviewed and released. Configure policy periods only after records mapping and qualified review of applicable obligations and preservation needs. Privacy request status, notices, consent entries, provider statuses, and legal-basis text are administrative records, not evidence that a request was legally resolved or that a notice/consent is valid.

The workflow supports assessment against Kenya's Data Protection Act, 2019, and related regulations; it is not legal advice or a compliance certification. Have a qualified privacy professional assess lawful basis, notice wording, processor contracts, cross-border transfers, retention schedules, data-subject rights and any required impact assessment. No biometric identification or facial recognition is enabled by this module. Before production, define least-privilege roles beyond the current system-administrator-only governance access and confirm audit-log retention, backup protection, incident escalation and request verification procedures.

For an assessment, document controller/processor roles and purposes per category; check necessity, minimization, accuracy and classification; review notice transparency and the applicable lawful basis; define identity verification, response ownership and statutory timelines for each rights request; assess processor terms and cross-border transfers; approve retention periods and preservation holds; and determine whether registration, a data-protection impact assessment, or breach reporting is required. Record the qualified reviewer and evidence outside this tool where required. No legal deadlines or applicability determinations are automatically inferred by the application.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js App Router, React, Tailwind CSS (Deep Navy `#0B132B`, Emerald Green `#10B981`, White/Grey UI).
- **Icons & UI**: Lucide React icons, responsive mobile/desktop component layouts.
- **Backend API**: Next.js REST API Route Handlers (`app/api/...`).
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`).
- **Authentication**: Signed session tokens backed by IAM session records, PBKDF2-HMAC-SHA-512 password hashes, TOTP MFA, one-time recovery codes, and password reset workflows.

---

## 📁 Folder Structure

```
├── app/                      # Next.js App Router pages & API routes
│   ├── (auth)/               # Login & Registration pages
│   ├── (public)/             # Public Landing, Fixtures, Details, About, Help
│   ├── admin/                # Administrator Dashboard & Modules
│   │   ├── command/          # Matchday Live Command Centre
│   │   ├── events/           # Event Management & Category Pricing
│   │   ├── tickets/          # Ticket Inventory & Revocation
│   │   ├── workforce/        # Staff Accreditation & Zone Access
│   │   ├── reports/          # Financial & Operational Reports
│   │   └── audit/            # Cybersecurity & Audit Trail Logs
│   ├── portal/               # Customer Ticket Wallet & Order History
│   ├── gate/                 # Standalone Turnstile/Scanner Validation Tool
│   ├── api/                  # REST API Route Handlers
│   │   ├── auth/             # Login & Register REST endpoints
│   │   ├── events/           # Fixture CRUD & Ticket Categories
│   │   ├── orders/           # Ticket Booking & Cart Hold
│   │   ├── payments/         # M-PESA Daraja & Callback Handler
│   │   ├── tickets/          # Ticket Generation & Wallet REST
│   │   ├── gate/             # Validation Scanner REST API
│   │   ├── staff/            # Workforce Accreditation REST
│   │   ├── command/          # Real-time Metrics Stream
│   │   ├── reports/          # Financial Settlement Exports
│   │   └── audit/            # Audit Log Queries
│   ├── globals.css           # Tailwind CSS theme directives
│   └── layout.jsx            # Root HTML Layout
├── components/               # Reusable UI Components
│   ├── Navbar.jsx            # Header Navigation Bar
│   ├── Footer.jsx            # Public Footer & Links
│   ├── AdminSidebar.jsx      # Admin Navigation Drawer
│   ├── AdminHeader.jsx       # Admin Top Status Bar
│   ├── StatCard.jsx          # Metric Display Cards
│   ├── Badge.jsx             # Status Badge Component
│   ├── Button.jsx            # Standard Primary/Secondary Buttons
│   ├── Modal.jsx             # Dialog Overlay Component
│   └── GateScannerMock.jsx   # Interactive Validation Scanner
├── lib/                      # Core System Libraries & Services
│   ├── prisma.js             # Prisma Database Client Singleton
│   ├── auth.js               # JWT & Password Hash Helpers
│   ├── audit.js              # Audit Event Logging Engine
│   ├── tickets.js            # Cryptographic Ticket Token Signing
│   ├── payments.js           # M-PESA Payment Integration Helper
│   ├── mockData.js           # Baseline System Data & Fallback Storage
│   └── utils.js              # Formatting & Class Merging Utilities
├── prisma/                   # Database ORM Configurations
│   ├── schema.prisma         # Complete PostgreSQL Relational Schema
│   └── seed.js               # Database Seeding Script
├── .env.example              # Environment Configuration Template
├── next.config.js            # Next.js Build Configuration
├── tailwind.config.js        # Tailwind Theme & Color Definitions
└── README.md                 # Project Documentation
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Node.js `v18.0.0` or higher (Tested on Node `v24.15.0`)
- npm `v9.0.0` or higher
- PostgreSQL database instance (Optional for initial development; mock fallback included)

### Step 1: Clone & Install Dependencies
```bash
# Navigate to project directory
cd "C:\Users\stephen\Desktop\SSP IO"

# Install Node.js dependencies
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and configure your local parameters:
```bash
cp .env.example .env
```

### Step 3: Database Setup (Prisma & PostgreSQL)
When a PostgreSQL database is running, generate the Prisma client and push the schema:
```bash
# Set unique JWT_SECRET and INITIAL_ADMIN_PASSWORD values in .env before seeding.
# INITIAL_ADMIN_PASSWORD must be at least 12 characters.
# Generate Prisma Client
npm run prisma:generate

# Push schema to local PostgreSQL
npm run prisma:push

# Seed initial baseline data (Events, Staff, Users)
npm run prisma:seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔐 Key Access Routes

| Role / Portal | URL Route | Description |
| :--- | :--- | :--- |
| **Public Portal** | `http://localhost:3000/` | Matchday Landing, Fixture Schedule, Venue Info |
| **Event Details & Booking**| `http://localhost:3000/fixtures/EVT-001` | Ticket Category Selector & Checkout Flow |
| **Customer Login** | `http://localhost:3000/login` | Patron & Staff Authentication |
| **Customer Ticket Wallet** | `http://localhost:3000/portal` | Active Dynamic QR Tickets & Order Receipts |
| **Admin Dashboard** | `http://localhost:3000/admin` | Executive Overview & Key Operations |
| **Matchday Command Centre**| `http://localhost:3000/admin/command` | Operational aggregates; provider data is unavailable unless verified |
| **Gate Scanner Kiosk** | `http://localhost:3000/gate` | Turnstile Operator Scanner Tool |

---

## Governance, privacy and safety

This repository does not establish legal compliance, procurement approval, safety certification, or operational acceptance. Before deployment, the venue owner and qualified Kenyan privacy, security, engineering, and safety professionals must review data processing, retention, access controls, physical integrations, and applicable law. See the security and operational-readiness reports for known limitations.

## CCTV & Video Management

The administrator CCTV inventory is available at `/admin/cctv`. Camera inventory, event metadata, VMS configuration, and sensitive access audit records use the Prisma models in `prisma/schema.prisma`. Apply the schema with `npm run prisma:generate` and `npm run prisma:push` after configuring PostgreSQL.

The dashboard includes clearly labelled simulated development fixtures. A registered camera is **not** considered connected: operational state defaults to `UNKNOWN`/`UNVERIFIED` until a vendor-approved, equipment-specific adapter supplies verified status. This module currently stores inventory and authorized event metadata only; it does not connect to cameras, display live video, or copy raw footage. ONVIF and vendor-approved API details are configuration metadata only until the actual equipment, vendor documentation, credentials held in an approved secret manager, and a tested adapter are supplied. Do not enter passwords or API tokens; store only a secret-manager reference.

Before deployment, provide the camera/VMS hardware inventory, vendor and model compatibility documentation, approved API/ONVIF documentation and licensing, HTTPS endpoint details, secret-manager references, and retention/access-control requirements. Complete legal review, necessity and proportionality assessment, and a DPIA where applicable before enabling additional intrusive monitoring. Facial recognition, biometric identification, and identity matching are not implemented.

## Stadium network and smart Wi-Fi

The network operations module is at `/admin/network-operations`; guest Wi-Fi policy and aggregate usage are at `/admin/network-operations/wifi`. Network inventory, controller references, segmentation proposals, guest policies, and aggregate usage persist through the network models in `prisma/schema.prisma`. Run `npm run prisma:generate` and `npm run prisma:push` after configuring PostgreSQL.

Development accounts and baseline telemetry use a clearly labelled simulated adapter. Without a physical wireless controller and equipment-specific, vendor-approved adapter, device connectivity stays `UNKNOWN`/`UNVERIFIED`, guest usage is explicitly simulated, and no controller connection is claimed. Controller settings accept HTTPS endpoint metadata and a secret-manager reference only; they do not accept or persist controller credentials. Guest Wi-Fi policies remain `PENDING_APPROVAL` drafts. The module does not push SSIDs, VLANs, ACLs, bandwidth, session, or captive-portal changes to live equipment. Proposed segmentation domains are administrative, ticketing/payments, CCTV/security, IoT, staff operations, guest Wi-Fi, and critical infrastructure.

Network operations APIs require a signed-in system administrator; the smart Wi-Fi dashboard also permits venue-manager read access. Access is audited. Guest analytics retain aggregate session, connected-device, and data-volume counts only, without browsing history or user-level identities. Hardware readiness requires managed routers/switches/APs and wireless controller/gateway, a stadium RF/capacity survey, vendor-supported controller API or SNMPv3 AuthPriv documentation and licensing, approved read-only monitoring credentials held in a secret manager, captive-portal provider compatibility, and network/security change-control approval. Before deployment, the network team must design and approve actual isolation, VLANs, ACLs, routing and failover.

Run the Wi-Fi and network management test suite with `npm run test:network-wifi`.

## Physical access control

The administrator access-control console is available at `/admin/access-control`. It stores stadium access-point inventory, date-bounded permissions tied to existing user IDs, system roles, staff accreditation numbers or accreditation groups, operator-recorded authorization outcomes, repeated-denial alerts, and hash-linked audit records. System administrators manage inventory, permissions, and integration metadata; authorized gate and venue staff can view the dashboard. Credential references in events and alerts are keyed hashes, not raw card data.

Until compatible physical panels and approved credentials are installed, the dashboard uses an explicitly labelled simulated development adapter. Device connectivity remains `UNKNOWN`/`UNVERIFIED`; metadata registration does not prove a panel is connected. Authorization decisions are audit records only. There is deliberately no door-unlock, gate-actuation, fire-exit override, or life-safety command endpoint. Hash-linked logs are tamper-evident, not intrinsically tamper-proof; production deployment must enforce append-only database permissions, restricted DBA access, protected backups, key rotation, and external audit-log retention. Configure a dedicated `ACCESS_CONTROL_AUDIT_KEY` in the production secret manager.

Apply the models with `npm run prisma:generate` and, after review against the deployment database, `npm run prisma:push`. Run the access-control suite using `npm run test:access-control`.

Before live integration, provide the panel/controller make, model, firmware and supported access-point inventory; vendor-approved API or OSDP Secure Channel documentation and licensing; HTTPS endpoint and a tested read-only status adapter; credentials provisioned through an approved secret manager (never entered into this application); network segmentation and certificate requirements; identity/card-reader mapping and revocation processes; retention and alert escalation policies; and signed engineering, security, and life-safety review. Any future physical operation requires explicit approval, vendor safety procedures, independent emergency-release validation, and change-control authorization. This module does not override emergency egress.

## Emergency communications and public address

The operator dashboard is at `/admin/emergency-communications`. It provides configurable operational, event, safety and emergency templates; incident-linked message drafts; operator/supervisor role policy; distinct human approval; schedules and cancellations; publication records; and a hash-linked audit trail. Emergency communications require approval by a different authorized supervisor from the preparing operator. `SYSTEM_ADMIN` remains a required supervisor role. Configure `EMERGENCY_COMMS_AUDIT_KEY` in the production secret manager; hash links are tamper-evident, not intrinsically tamper-proof, and require append-only database permissions, protected backups, access controls and external retention.

The development PA and digital-signage adapters are explicitly simulated. Provider metadata stays `UNVERIFIED`; there is no connection claim or physical transmission. “Preview publish” writes a simulated publication record only. Scheduling creates a queue record and does not automatically dispatch. Certified fire alarms, emergency notification systems, independent controls and official emergency procedures are not replaced or overridden.

Apply the new Prisma models after reviewing the deployment database using `npm run prisma:generate` and `npm run prisma:push`. Test with `npm run test:emergency-communications`. Live integration requires the actual PA controller/amplifier, zone and speaker inventory; digital-signage player/platform inventory; vendor-approved and licensed HTTPS APIs or documented gateways; TLS/certificate and network-segmentation requirements; test tenant and read-only/status credentials provisioned in a secret manager; verified device/status reporting; human approval and scheduling requirements; and formal stadium safety, emergency-services, engineering and change-control approval. Any future dispatch adapter must preserve independent certified life-safety operation and require explicit, auditable human action.

## Cybersecurity operations centre

The defensive SOC dashboard is at `/admin/security-operations`. It aggregates sanitized authentication events, administrative audit metadata, ticket/payment activity summaries, integration HTTP statuses, network and IoT alerts, access-control decisions, and emergency-communications audit actions. The login endpoint now records success/failure activity without storing passwords, raw account identifiers or IP addresses; account references are keyed hashes. Repeated failed sign-ins, API server-error bursts and sensitive administrator activity raise configurable alerts. Authorized supervisors can acknowledge alerts, open/assign investigations, record notes, update severity/status and resolution. A request to `/api/audit` now requires an authorized system administrator or venue manager and returns a sanitized event projection rather than raw audit data.

Configure a dedicated `SOC_EVENT_HASH_KEY` in the production secret manager. SOC investigation text rejects obvious credential/payment-card patterns; operators must not enter secrets, payment data or unnecessary personal information in incident summaries or notes. SOC administrative actions use a hash-linked audit ledger, which is tamper-evident but not intrinsically tamper-proof; enforce append-only database permissions, restricted DBA access, protected backups, key rotation and independent retention. Authentication now rejects malformed, expired or claim-incomplete sessions, and the legacy role helper no longer grants an implicit administrator session when authentication is missing. Remaining application-wide authentication, authorization and audit controls still require a formal deployment review; generic legacy audit fallback remains in-memory when database writes fail.

Development events are explicitly simulated. Existing API-gateway and some network/IoT telemetry sources are fixture/audit feeds, not proof of complete live monitoring. The SIEM screen stores HTTPS/TLS endpoint metadata and secret-manager references only; it does not forward events and remains `UNVERIFIED`. Host/OS logs, identity-provider telemetry, production network-flow/IDS events, complete payment-provider security events, endpoint detection, alert delivery, retention, on-call escalation and SIEM transport require separately approved adapters and credentials. This SOC is observation and human-managed investigation only: it does not scan targets, disable accounts, change firewalls, isolate networks or automatically contain incidents.

Follow incident response procedures: validate event source/time integrity; triage severity and potential impact; assign an authorized investigator; preserve relevant approved evidence; record decisions and chain of custody; escalate through the venue’s approved incident and emergency procedures; document resolution and lessons learned; and review detection thresholds. Any active response requires explicit authorization and must use the existing approved operational workflow. Prepare and validate the schema with `npm run prisma:generate`, review/apply it to the target database with `npm run prisma:push`, and run `npm run test:security-operations`.

## High availability, backup and disaster recovery

The recovery console is `/admin/disaster-recovery`; its APIs are system-administrator-only. `/api/health` is a no-store application/database readiness probe and returns `503` when a configured production database is unavailable. Neither route proves redundancy or a successful recovery.

### Current architecture and availability limits

The application is a Next.js web/API process backed by PostgreSQL/Prisma. The current repository contains no deployed load balancer, redundant application instances, database replica/failover configuration, independent backup account, object-lock policy, scheduler, or alert-delivery integration. A single application host, PostgreSQL service, network path, DNS/TLS configuration, secret manager, and third-party payment provider are potential single points of failure. Current high availability, automatic failover, backup execution, and disaster recovery are **not verified operational**.

Keep deployment costs proportional: begin with one production application instance behind the hosting provider's managed health checks, managed PostgreSQL with provider-supported automated backups/PITR, and a separate encrypted backup copy in an access-isolated storage account/region. Add a second application instance and database standby only after capacity, provider SLA, tested failover procedures, and budget approval justify them. Do not treat replicas as backups. Use provider-native multi-zone or standby options where available; document their actual RPO/RTO and test failover before claiming availability.

### PostgreSQL backup job

`npm run db:backup` runs PostgreSQL `pg_dump --format=custom` and streams its output through AES-256-GCM encryption into a `.tsdb` envelope. It requires `pg_dump`, `DATABASE_URL`, `BACKUP_DIR` outside the repository, `BACKUP_ENCRYPTION_KEY_B64` (a base64-encoded random 32-byte key), and a provisioned PostgreSQL schema. The backup password is passed to the child process through `PGPASSWORD`; it is not included in command arguments, output, or backup metadata. Artifact files are created with owner-only permissions where supported. The job hashes the encrypted artifact, records status in PostgreSQL when available, and writes minimal backup history to `.dr-history.json` in the protected backup directory so job status can survive a database outage. A lock file prevents overlapping executions.

The backup script does not install or run a scheduler. Configure an approved external scheduler (for example, Windows Task Scheduler, systemd timer, or a cloud scheduler) to invoke `npm run db:backup` using a protected environment/secret manager. Set the desired five-field UTC cron expression in the administrator console; this is a proposed schedule record and does not configure the external scheduler. Confirm the scheduler's actual job, service identity, network access, logs, missed-run alerting, and backup storage replication during deployment. Failed executions are recorded where local history is available and appear in the dashboard; no email/SMS/on-call alert is sent until a separate alerting integration is deployed.

Set `BACKUP_RETENTION_DAYS` to a stakeholder-approved value (1–3650 days). The job removes old `.tsdb` files only from its configured backup directory; configure independent retention, deletion, lifecycle and legal-hold policies for off-host copies. The protected local history is operational metadata, not an immutable ledger. Replicate encrypted artifacts and history to a separate account/region with least privilege, access logging, versioning/immutability where approved, and restore monitoring. Keep the encryption key separate from the backup files, restrict use to backup/restore identities, rotate under an approved re-encryption plan, and retain prior key versions until all dependent backups expire. Never put keys, database URLs with credentials, or plaintext dumps in source control or shared logs.

### Verification and authorized restore

`npm run db:restore -- "<absolute-path-to-backup.tsdb>"` defaults to verify-only when `DR_RESTORE_VERIFY_ONLY=1`: it authenticates/decrypts the envelope into a temporary directory and runs `pg_restore --list`; it makes no database changes. Use an encrypted, access-restricted ephemeral restore volume through `DR_RESTORE_TMPDIR`; decrypted temporary dumps contain the entire database and must be deleted securely according to the host's storage guarantees.

An actual restore is destructive to the specified target. Require a reviewed change record (`DR_RESTORE_APPROVED=YES` and `DR_RESTORE_CHANGE_ID`), `DR_RESTORE_TARGET_URL`, the configured source `DATABASE_URL`, and a target database distinct from the source. The tool refuses the configured source database. For scheduled recovery exercises, set `DR_RESTORE_TEST=1` and use a separately provisioned target database whose name begins `dr_restore_test_`; validate application behavior against that isolated target before recording results. This utility does not create target databases, switch production traffic, or automatically roll back. Follow provider-specific recovery procedures for point-in-time recovery and cloud infrastructure.

The dashboard records backup metadata and administrator-entered recovery exercise evidence. Record only exercises actually run, with the selected backup reference, isolated target/environment, integrity checks, application/payment-sandbox/ticket-validation checks, duration, outcome, and change reference in the details. A recorded result is not independently attested. Run `npm run test:disaster-recovery` for local crypto, authorization and policy tests. Do not run a production restore as a test.

### Recovery objectives and checklist

Initial configurable targets are proposals of **RPO 60 minutes** and **RTO 240 minutes**; the proposed backup schedule is **02:00 UTC daily**. These values remain `PENDING_STAKEHOLDER_APPROVAL` until the business/service owners formally approve them and a timed recovery exercise demonstrates performance. An administrator can edit the proposed UTC cron and RPO/RTO values; saving does not approve targets or deploy scheduler changes.

Recovery dependencies include PostgreSQL/provider account access, `pg_dump`/`pg_restore` client versions compatible with the database, encryption key and prior key versions, protected backup storage and integrity metadata, approved compute/networking, application source/build artifact, `DATABASE_URL` and other application configuration from the secret manager, DNS/TLS certificates, identity/role configuration, payment-provider credentials, email/notification providers, and operational owners/change approval.

Recovery checklist:

1. Declare the incident, identify the service owner and recovery lead, preserve evidence, and obtain change/security approval.
2. Confirm incident scope and trusted recovery environment; verify provider, network, identity and secret-manager access using least privilege.
3. Select a known-good backup or provider PITR point; verify encrypted artifact hash and AES-GCM authentication before using it.
4. Restore to an isolated database/host first. Validate schema version, record counts, referential integrity, critical audit/ticket/payment records, and data timestamps.
5. Deploy the approved application artifact and restore configuration from the secret manager. Never restore secrets from source code or untrusted logs.
6. Run `/api/health`, application smoke tests, payment sandbox/reconciliation checks, and offline ticket scanner synchronization checks. Do not send live transactions or operate physical systems during recovery tests.
7. Obtain application/data owner sign-off; cut over DNS/traffic only under approved change control. Monitor errors, reconcile transactions, and retain a recovery log.
8. Record actual data-loss window and elapsed time, compare with approved RPO/RTO, document gaps/actions, and securely dispose of temporary plaintext and test data.

### Business continuity playbooks

- **Database failure:** declare degraded service; stop non-idempotent writes/avoid duplicate payment or ticket issuance; contact the database provider; preserve available logs; restore/provider-PITR to an isolated target; reconcile payment callbacks and ticket state before controlled cutover.
- **Application outage:** check `/api/health`, host/deployment logs and provider status; roll back to the last approved application artifact or provision replacement compute; verify secrets, DNS/TLS and DB connectivity; use change control before traffic cutover.
- **Payment integration outage:** disable or pause new payment initiation through the approved operator/provider process; preserve callback/reconciliation evidence; communicate pending states; do not mark payments paid based only on client reports; reconcile with provider before resuming.
- **Network failure:** use venue-approved redundant circuits and local operations procedures; isolate the fault domain with network staff; do not change security segmentation or physical controls from this application; keep life-safety systems independent.
- **Ticket scanning interruption:** use the approved offline scanner/cache process and trained gate supervisor; prevent duplicate admissions using controlled local reconciliation; do not bypass ticket authorization or safety operations; synchronize and reconcile scans after connectivity returns.
- **Cloud hosting failure:** verify provider-region/service status and backup accessibility from the independent recovery account; provision approved recovery compute/database in the alternate region; restore, validate, and shift traffic only after owner approval.
- **Cybersecurity incident:** follow the SOC/incident-response procedure; preserve logs and chain of custody; involve authorized security and privacy leads; use clean recovery credentials/hosts; do not automatically disable accounts, isolate networks, or overwrite evidence.

Prisma models for backup history, recovery tests, and proposed RPO/RTO/schedule require `npm run prisma:generate` and a reviewed `npm run prisma:push` against the intended database. Apply schema changes before enabling the scheduled backup job. Run `npm run test:disaster-recovery`; perform an isolated provider-specific restore/failover exercise before representing any RPO/RTO or availability target as achieved.

## Hardware deployment and commissioning

The administrator console is `/admin/hardware-deployment`. It supports configurable inventory for CCTV cameras, switches, routers, Wi-Fi access points, IoT sensors, digital signage, access-control controllers, ticket scanners, environmental equipment, and server/storage. Records include assigned asset ID, manufacturer/model/serial, verified installation location, supplier, warranty dates, installation and commissioning status, maintenance status, optional IoT device ID, and change/test history. No stadium quantities, procurement orders, locations or completed work are pre-populated or inferred. Existing IoT device records are shown as linked inventory only and do not imply commissioning acceptance.

System administrators and venue managers can register assets, assign installation tasks, update installation progress, configure category commissioning checklists, create maintenance/repair/fault/replacement records and upload evidence. Staff roles can record technical commissioning checks. Five core checks are mandatory (power, network, configuration, security, functional); category-specific defaults can be configured while retaining those checks. A separate system administrator or venue manager must approve acceptance after a passed checklist; the technician who ran the checklist cannot self-approve. Repair/replacement work records include assigned technician and optional replacement asset link.

Installation documents and photographs are restricted to PDF/JPEG/PNG/WEBP up to 10 MB, signature-checked, SHA-256 recorded and downloaded only via the authenticated API. Configure `HARDWARE_EVIDENCE_DIR` to private storage outside the application repository and web root, limit filesystem access to the application service identity, encrypt the volume, and deploy malware scanning/quarantine if required by the venue. The application does not claim antivirus scanning or cloud-object-storage replication unless separately configured.

The dashboard integrates existing IoT inventory records for visibility but does not push device configuration or claim hardware connectivity. Inventory records, IoT status, installation completion, commissioning pass, and acceptance approval remain separate facts. CSV reports are available for inventory, installation tasks, commissioning checks, and maintenance history.

Run `npm run prisma:generate`, review and apply the added hardware models with `npm run prisma:push` on the intended database, then execute `npm run test:hardware-deployment`. The evidence store and database must be backed up together under the approved retention policy; protect private files, database metadata and their encryption keys. Before use, supply verified asset lists, actual site locations, equipment documents, warranty/procurement evidence, staff account IDs, manufacturer commissioning instructions, approved checklists, inspection/acceptance signatories, evidence-storage controls, and IoT device mappings. Development/test entries are explicitly marked simulated and do not assert stadium deployment.
