# TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE
## SYSTEM STARTUP & OPERATIONAL LAUNCH GUIDE

Developed by **ST-Tech ICT Consultants** for **Ministry of Sports / Talanta Stadium Infrastructure**.

---

## 1. SYSTEM OVERVIEW

The **Talanta Stadium Smart Digital Infrastructure** is an enterprise-grade stadium operations, ticketing, security, BMS, and executive intelligence software platform built on **Next.js 16**, **Node.js**, **React 18**, **Tailwind CSS**, and **Prisma ORM**.

To start the software platform effortlessly on Windows, double-click `start_system.bat` in the project root directory.

---

## 2. DOUBLE-CLICK WINDOWS LAUNCHERS

The following batch scripts are available in the project root directory:

| Launcher File | Description | Usage |
| :--- | :--- | :--- |
| **`start_system.bat`** | Locates directory, verifies Node/npm/dependencies/.env, runs readiness check, spawns process, polls health endpoint, and opens startup experience in browser. | **Double-click to start platform** |
| **`stop_system.bat`** | Reads tracked PID (`logs/talanta_app.pid`) or port 3000 listeners and safely terminates launcher processes without affecting unrelated Node.js applications. | **Double-click to stop platform** |
| **`restart_system.bat`** | Safely stops running processes and executes `start_system.bat`. | **Double-click to restart platform** |

---

## 3. SYSTEM READINESS CHECKS

The startup launcher executes [`scripts/system_readiness.js`](file:///C:/Users/stephen/Desktop/SSP%20IO/scripts/system_readiness.js) to inspect system readiness across 10 critical components before starting the web application:

1. **Node.js Runtime** (verifies installation & version)
2. **npm Version** (verifies package manager)
3. **Project Dependencies** (checks `node_modules` existence)
4. **Environment Configuration** (verifies `.env` credentials)
5. **Prisma Schema & Database** (verifies schema integrity)
6. **Application Port 3000** (checks port availability)
7. **System Directories** (creates `logs/` and storage locations)
8. **M-PESA Daraja Payments** (checks API keys & sandbox settings)
9. **CCTV VMS & Access Control** (checks video stream and gate controller IPs)
10. **Network NOC & Emergency Broadcaster** (checks SNMP and Emergency SIP)

### Status Classifications:
* **`READY`**: Component fully verified and online.
* **`WARNING`**: Non-blocking warning (e.g. missing optional configuration; using default fallback).
* **`SIMULATED`**: Sub-system running in offline development/simulation mode.
* **`FAILED`**: Critical requirement missing (e.g. Node.js not installed).

---

## 4. TWO-STEP INTERACTIVE STARTUP INTERFACE

Once `start_system.bat` completes, it opens the **Startup Operations Experience** in the default browser at:
`http://localhost:3000/startup`

### Two-Step Launch Process:
* **Step 1**: Click **`PREPARE & VERIFY SYSTEM`**. Runs live readiness checks, polls sub-system integration status, and updates progress bar to 100%.
* **Step 2**: Click **`CONFIRM & EXECUTE SYSTEM STARTUP`**. Launches application services, checks `/api/health`, and displays application URL.

---

## 5. SYSTEM HEALTH ENDPOINT

The health endpoint is available at:
[`/api/health`](file:///C:/Users/stephen/Desktop/SSP%20IO/app/api/health/route.js) (`http://localhost:3000/api/health`)

### Verified Response Structure:
```json
{
  "status": "AVAILABLE",
  "name": "TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE",
  "version": "1.0.0",
  "timestamp": "2026-10-31T12:00:00.000Z",
  "database": "AVAILABLE",
  "services": {
    "Authentication": "READY",
    "TicketingCredentials": "READY",
    "PaymentsModule": "READY",
    "BuildingManagement": "READY",
    "IncidentManagement": "READY",
    "ExecutiveIntelligence": "READY"
  },
  "integrations": {
    "MPESA_Daraja": "CONFIGURED_NOT_CONNECTED",
    "Cryptographic_QR_Scanners": "CONNECTED_VERIFIED",
    "Network_NOC_Monitoring": "CONNECTED_VERIFIED",
    "Emergency_Communications": "CONNECTED_VERIFIED"
  }
}
```

---

## 6. DATABASE SAFETY POLICY

* The launcher **NEVER** executes `prisma migrate reset`.
* The launcher **NEVER** deletes, overwrites, or recreates database tables.
* Database passwords and private tokens are **NEVER** exposed in health logs or terminal output.

---

## 7. KEY SYSTEM PORTALS

| Portal | URL | Description |
| :--- | :--- | :--- |
| **Startup Operations Experience** | `http://localhost:3000/startup` | System startup, readiness matrix, and launch control |
| **Executive Intelligence** | `http://localhost:3000/admin/executive` | Leadership briefing, KPI scorecards, AI insights |
| **Operations Command Centre** | `http://localhost:3000/admin/command` | Matchday live monitoring and alerts |
| **Turnstile Gate Portal** | `http://localhost:3000/gate` | Cryptographic ticket QR scanner |
| **Helpdesk & Support** | `http://localhost:3000/admin/helpdesk` | IT and operations ticket queue |
| **Procurement & Suppliers** | `http://localhost:3000/admin/procurement` | Supplier directory and purchase orders |

---

## 8. TROUBLESHOOTING

* **Port 3000 Already in Use**: Run `stop_system.bat` to clear stale processes before running `start_system.bat`.
* **Database Connection Error**: The system will automatically run in simulated database mode so all UI portals remain fully accessible during testing.
* **Terminal Closes Immediately**: The batch script includes `pause` at the end to allow reading any error output.
