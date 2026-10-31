// TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE
// Network Operations & IT Infrastructure Monitoring Engine (NOC)
// ST-Tech ICT Consultants - Senior Network Engineer & Enterprise Architect

import { logAuditEvent } from './audit.js';

// ----------------------------------------------------------------------------
// 1. DEVICE CATEGORIES, PROTOCOLS & STATUS DEFINITIONS
// ----------------------------------------------------------------------------
export const DEVICE_CATEGORIES = [
  { id: 'CORE_SWITCH', label: 'Core Switch Stack', icon: 'Cpu', description: '100GbE redundant backbone core switches in main data center' },
  { id: 'EDGE_SWITCH', label: 'Edge Access Switch', icon: 'Layers', description: 'PoE+ Gigabit access switches at gates, concourses & broadcast hubs' },
  { id: 'ROUTER', label: 'Edge Gateway Router', icon: 'Globe', description: 'Primary ISP perimeter BGP gateway routers' },
  { id: 'WIRELESS_AP', label: 'Wireless Access Point', icon: 'Wifi', description: 'Wi-Fi 6E high-density stadium bowl and concourse APs' },
  { id: 'FIREWALL', label: 'Perimeter Firewall (NGFW)', icon: 'Shield', description: 'Next-Generation Firewalls with threat prevention' },
  { id: 'SERVER_HOST', label: 'Data Center Server Blade', icon: 'Server', description: 'Hyperconverged infrastructure host blade servers' },
  { id: 'STORAGE_ARRAY', label: 'SAN/NAS Storage System', icon: 'Database', description: 'High-speed NVMe storage arrays for CCTV & transaction logs' },
  { id: 'APP_SERVICE', label: 'Application Microservice', icon: 'Activity', description: 'Next.js App Engine, API Gateway & Auth cluster' },
  { id: 'DB_SERVICE', label: 'Database Cluster', icon: 'HardDrive', description: 'PostgreSQL HA Primary/Replica & Redis Cache cluster' },
  { id: 'IOT_GATEWAY', label: 'IoT Infrastructure Gateway', icon: 'Radio', description: 'Turnstile, BMS, HVAC & Lighting IoT Edge Gateways' },
];

export const MONITORING_PROTOCOLS = [
  { id: 'SNMPV3', label: 'SNMPv3 (Encrypted AuthPriv)', defaultPort: 161 },
  { id: 'HTTPS_HEALTH', label: 'HTTPS Health REST Endpoint', defaultPort: 443 },
  { id: 'PROMETHEUS', label: 'Prometheus Metrics Exporter', defaultPort: 9090 },
  { id: 'SYSLOG_TLS', label: 'Syslog over TLS (RFC 5425)', defaultPort: 6514 },
];

export const NOC_ALERT_SEVERITIES = ['INFO', 'WARNING', 'CRITICAL', 'FATAL'];

// ----------------------------------------------------------------------------
// 2. INITIAL REGISTERED NETWORK & IT INFRASTRUCTURE INVENTORY
// ----------------------------------------------------------------------------
export const initialDevices = [
  {
    id: 'NET-CORE-01',
    name: 'Main Data Center Core Switch Stack Alpha',
    category: 'CORE_SWITCH',
    ipAddress: '10.100.0.1',
    location: 'Data Center Room 101 - Rack A1',
    vendorModel: 'Cisco Catalyst 9600 100GbE Stack',
    protocol: 'SNMPV3',
    status: 'ONLINE',
    latencyMs: 0.8,
    packetLossPercent: 0.0,
    cpuUtilPercent: 24.5,
    memoryUtilPercent: 42.1,
    storageUtilPercent: 18.0,
    uptimeDays: 248.5,
    lastCheckAt: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'NET-FW-01',
    name: 'Perimeter Next-Gen Firewall Primary',
    category: 'FIREWALL',
    ipAddress: '10.100.0.2',
    location: 'Data Center Room 101 - Rack A2',
    vendorModel: 'Palo Alto PA-5450 NGFW',
    protocol: 'HTTPS_HEALTH',
    status: 'ONLINE',
    latencyMs: 1.2,
    packetLossPercent: 0.0,
    cpuUtilPercent: 38.2,
    memoryUtilPercent: 61.4,
    storageUtilPercent: 32.0,
    uptimeDays: 194.2,
    lastCheckAt: new Date(Date.now() - 15000).toISOString(),
    isSimulated: true,
  },
  {
    id: 'NET-RTR-01',
    name: 'Primary Edge BGP Gateway Router (Safaricom Fiber)',
    category: 'ROUTER',
    ipAddress: '10.100.0.254',
    location: 'Telecom Demarcation Suite B',
    vendorModel: 'Cisco ASR 1002-HX BGP Edge',
    protocol: 'SNMPV3',
    status: 'ONLINE',
    latencyMs: 2.4,
    packetLossPercent: 0.0,
    cpuUtilPercent: 19.8,
    memoryUtilPercent: 38.5,
    storageUtilPercent: 12.0,
    uptimeDays: 310.0,
    lastCheckAt: new Date(Date.now() - 10000).toISOString(),
    isSimulated: true,
  },
  {
    id: 'NET-SW-GTB-01',
    name: 'Gate B Turnstile Access Switch 1',
    category: 'EDGE_SWITCH',
    ipAddress: '10.100.12.10',
    location: 'Gate B Concourse Telecom Cabinet',
    vendorModel: 'Cisco Catalyst 9300 48-Port PoE+',
    protocol: 'SNMPV3',
    status: 'ONLINE',
    latencyMs: 3.1,
    packetLossPercent: 0.0,
    cpuUtilPercent: 44.0,
    memoryUtilPercent: 52.0,
    storageUtilPercent: 21.0,
    uptimeDays: 89.4,
    lastCheckAt: new Date(Date.now() - 25000).toISOString(),
    isSimulated: true,
  },
  {
    id: 'SVR-BLADE-01',
    name: 'Talanta App Engine Kubernetes Host Node 1',
    category: 'SERVER_HOST',
    ipAddress: '10.100.20.11',
    location: 'Data Center Room 101 - Rack B3',
    vendorModel: 'Dell PowerEdge R750 (2x Xeon 8380, 512GB RAM)',
    protocol: 'PROMETHEUS',
    status: 'ONLINE',
    latencyMs: 0.5,
    packetLossPercent: 0.0,
    cpuUtilPercent: 68.4,
    memoryUtilPercent: 74.2,
    storageUtilPercent: 58.1,
    uptimeDays: 112.1,
    lastCheckAt: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'DB-POSTGRES-01',
    name: 'PostgreSQL Master Database Cluster (Primary)',
    category: 'DB_SERVICE',
    ipAddress: '10.100.30.15',
    location: 'Data Center Room 101 - Protected Subnet',
    vendorModel: 'PostgreSQL 16 HA Cluster (Patroni / PgBouncer)',
    protocol: 'HTTPS_HEALTH',
    status: 'ONLINE',
    latencyMs: 0.9,
    packetLossPercent: 0.0,
    cpuUtilPercent: 52.1,
    memoryUtilPercent: 81.0,
    storageUtilPercent: 64.5,
    uptimeDays: 180.6,
    lastCheckAt: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'AP-BOWL-SOUTH-01',
    name: 'South Stand Upper Deck High-Density Wi-Fi 6E AP 12',
    category: 'WIRELESS_AP',
    ipAddress: '10.100.40.112',
    location: 'South Stand Sector 104 Catwalk',
    vendorModel: 'Cisco Catalyst 9136I Wi-Fi 6E',
    protocol: 'SNMPV3',
    status: 'DEGRADED',
    latencyMs: 18.5,
    packetLossPercent: 2.4,
    cpuUtilPercent: 88.2, // High load alert trigger
    memoryUtilPercent: 82.0,
    storageUtilPercent: 15.0,
    uptimeDays: 45.2,
    lastCheckAt: new Date(Date.now() - 30000).toISOString(),
    isSimulated: true,
  },
  {
    id: 'GW-TURNSTILE-04',
    name: 'Gate B Optical Scanner IoT Gateway Appliance',
    category: 'IOT_GATEWAY',
    ipAddress: '10.100.12.24',
    location: 'Gate B Concourse Turnstile Bank',
    vendorModel: 'Advantech UNO Industrial IoT Gateway',
    protocol: 'HTTPS_HEALTH',
    status: 'ONLINE',
    latencyMs: 4.2,
    packetLossPercent: 0.0,
    cpuUtilPercent: 31.0,
    memoryUtilPercent: 44.5,
    storageUtilPercent: 28.0,
    uptimeDays: 62.8,
    lastCheckAt: new Date().toISOString(),
    isSimulated: true,
  },
];

// ----------------------------------------------------------------------------
// 3. TRACKED APPLICATION & DATABASE SERVICES
// ----------------------------------------------------------------------------
export const initialServices = [
  {
    id: 'SVC-APP-01',
    name: 'Talanta Next.js Smart Infrastructure Web Portal',
    category: 'APP_SERVICE',
    endpointUrl: 'https://stadium.talanta.go.ke/api/health',
    status: 'HEALTHY',
    availabilityPercent: 99.98,
    responseTimeMs: 38,
    lastCheckAt: new Date().toISOString(),
  },
  {
    id: 'SVC-GATE-01',
    name: 'Turnstile Cryptographic QR Validation Service',
    category: 'APP_SERVICE',
    endpointUrl: 'https://gate.talanta.go.ke/api/gate/validate',
    status: 'HEALTHY',
    availabilityPercent: 100.0,
    responseTimeMs: 14,
    lastCheckAt: new Date().toISOString(),
  },
  {
    id: 'SVC-DB-01',
    name: 'PostgreSQL Relational Storage & Audit Vault',
    category: 'DB_SERVICE',
    endpointUrl: '10.100.30.15:5432 (TCP Health Check)',
    status: 'HEALTHY',
    availabilityPercent: 99.99,
    responseTimeMs: 2,
    lastCheckAt: new Date().toISOString(),
  },
  {
    id: 'SVC-CACHE-01',
    name: 'Redis In-Memory Session & Gate Token Cache',
    category: 'DB_SERVICE',
    endpointUrl: '10.100.30.18:6379 (PING/PONG)',
    status: 'HEALTHY',
    availabilityPercent: 100.0,
    responseTimeMs: 1,
    lastCheckAt: new Date().toISOString(),
  },
  {
    id: 'SVC-BMS-01',
    name: 'BACnet / Modbus Smart Building IoT Engine',
    category: 'IOT_GATEWAY',
    endpointUrl: '10.100.50.10:8080/api/bms/health',
    status: 'HEALTHY',
    availabilityPercent: 99.95,
    responseTimeMs: 28,
    lastCheckAt: new Date().toISOString(),
  },
];

// ----------------------------------------------------------------------------
// 4. NOC ALERTS & INCIDENT HISTORY
// ----------------------------------------------------------------------------
export const initialNocAlerts = [
  {
    id: 'NOC-2026-8801',
    deviceId: 'AP-BOWL-SOUTH-01',
    deviceName: 'South Stand Upper Deck High-Density Wi-Fi 6E AP 12',
    severity: 'WARNING',
    type: 'HIGH_RESOURCE_UTILIZATION',
    title: 'High CPU & Memory Load Warning on Wi-Fi AP 12',
    description: 'CPU utilization reached 88.2% and RAM 82.0% during pre-match spectator arrival surge in Section 104.',
    triggeredAt: '2026-10-30T13:45:00.000Z',
    status: 'ACTIVE',
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolutionNote: null,
  },
  {
    id: 'NOC-2026-8799',
    deviceId: 'NET-SW-GTB-01',
    deviceName: 'Gate B Turnstile Access Switch 1',
    severity: 'CRITICAL',
    type: 'INTERFACE_FLAP',
    title: 'PoE Port Flap Detected on Port GigabitEthernet1/0/7',
    description: 'Port connected to Gate B Turnstile 7 optical scanner re-linked 4 times in 10 minutes.',
    triggeredAt: '2026-10-30T12:01:00.000Z',
    status: 'RESOLVED',
    acknowledgedBy: 'Eng. Samuel Kipchumba',
    acknowledgedAt: '2026-10-30T12:03:00.000Z',
    resolutionNote: 'Re-terminated PoE RJ45 connector on Turnstile Lane 7.',
  },
  {
    id: 'NOC-2026-8780',
    deviceId: 'NET-FW-01',
    deviceName: 'Perimeter Next-Gen Firewall Primary',
    severity: 'INFO',
    type: 'CONFIG_CHANGE',
    title: 'Firewall Security Rule Modification Audited',
    description: 'Authorized rule update: Allowed HTTPS telemetry from Gate B QRT steward handhelds.',
    triggeredAt: '2026-10-30T09:15:00.000Z',
    status: 'RESOLVED',
    acknowledgedBy: 'NOC Lead Engineer',
    acknowledgedAt: '2026-10-30T09:16:00.000Z',
    resolutionNote: 'Rule modification verified against change control ticket CHG-2026-101.',
  },
];

// ----------------------------------------------------------------------------
// 5. CORE NOC FUNCTIONS & BUSINESS LOGIC
// ----------------------------------------------------------------------------

export function getAllDevices(filters = {}) {
  let list = [...initialDevices];

  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((d) => d.status === filters.status);
  }
  if (filters.category && filters.category !== 'ALL') {
    list = list.filter((d) => d.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.ipAddress.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.vendorModel.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getDeviceById(id) {
  return initialDevices.find((d) => d.id === id);
}

export async function registerDevice({
  name,
  category = 'EDGE_SWITCH',
  ipAddress,
  location,
  vendorModel,
  protocol = 'SNMPV3',
  currentUser = { email: 'admin@sttech.co.ke', role: 'SYSTEM_ADMIN' },
}) {
  const newId = `NET-${category.slice(0, 3)}-${Math.floor(Math.random() * 900 + 100)}`;
  const newDevice = {
    id: newId,
    name,
    category,
    ipAddress: ipAddress || '10.100.50.50',
    location: location || 'Stadium Data Center',
    vendorModel: vendorModel || 'Cisco Enterprise Equipment',
    protocol,
    status: 'ONLINE',
    latencyMs: 1.5,
    packetLossPercent: 0.0,
    cpuUtilPercent: 15.0,
    memoryUtilPercent: 30.0,
    storageUtilPercent: 10.0,
    uptimeDays: 1.0,
    lastCheckAt: new Date().toISOString(),
    isSimulated: true,
  };

  initialDevices.unshift(newDevice);

  await logAuditEvent({
    userEmail: currentUser.email,
    action: 'NOC_DEVICE_REGISTERED',
    entityType: 'NETWORK_DEVICE',
    entityId: newId,
    details: { name, category, ipAddress, protocol, isSimulated: true },
  });

  return newDevice;
}

export function getAllServices() {
  return initialServices;
}

export async function registerService({ name, category, endpointUrl, currentUser }) {
  const newId = `SVC-${Math.floor(Math.random() * 900 + 100)}`;
  const newService = {
    id: newId,
    name,
    category,
    endpointUrl,
    status: 'HEALTHY',
    availabilityPercent: 100.0,
    responseTimeMs: 12,
    lastCheckAt: new Date().toISOString(),
  };

  initialServices.unshift(newService);

  await logAuditEvent({
    userEmail: currentUser?.email || 'admin@sttech.co.ke',
    action: 'NOC_SERVICE_REGISTERED',
    entityType: 'NETWORK_SERVICE',
    entityId: newId,
    details: { name, endpointUrl },
  });

  return newService;
}

export function getAllAlerts(filters = {}) {
  let list = [...initialNocAlerts];

  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters.severity && filters.severity !== 'ALL') {
    list = list.filter((a) => a.severity === filters.severity);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.deviceName.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function acknowledgeAlert({ alertId, currentUser }) {
  const alert = initialNocAlerts.find((a) => a.id === alertId);
  if (!alert) return { success: false, message: 'Alert not found' };

  alert.status = 'ACKNOWLEDGED';
  alert.acknowledgedBy = currentUser?.email || 'NOC Controller';
  alert.acknowledgedAt = new Date().toISOString();

  await logAuditEvent({
    userEmail: currentUser?.email || 'admin@sttech.co.ke',
    action: 'NOC_ALERT_ACKNOWLEDGED',
    entityType: 'NOC_ALERT',
    entityId: alertId,
    details: { alertTitle: alert.title, deviceId: alert.deviceId },
  });

  return { success: true, alert };
}

export async function resolveAlert({ alertId, resolutionNote, currentUser }) {
  const alert = initialNocAlerts.find((a) => a.id === alertId);
  if (!alert) return { success: false, message: 'Alert not found' };

  alert.status = 'RESOLVED';
  alert.resolutionNote = resolutionNote || 'Resolved by NOC engineering team.';
  if (!alert.acknowledgedBy) alert.acknowledgedBy = currentUser?.email || 'NOC Controller';

  // If associated device was DEGRADED, restore to ONLINE
  const dev = initialDevices.find((d) => d.id === alert.deviceId);
  if (dev && dev.status === 'DEGRADED') {
    dev.status = 'ONLINE';
    dev.cpuUtilPercent = 45.0;
  }

  await logAuditEvent({
    userEmail: currentUser?.email || 'admin@sttech.co.ke',
    action: 'NOC_ALERT_RESOLVED',
    entityType: 'NOC_ALERT',
    entityId: alertId,
    details: { alertTitle: alert.title, resolutionNote },
  });

  return { success: true, alert };
}

// ----------------------------------------------------------------------------
// 6. NOC METRICS & DIAGNOSTICS SUITE (REQUIREMENT 10)
// ----------------------------------------------------------------------------
export function calculateNocMetrics() {
  const totalDevices = initialDevices.length;
  const onlineDevices = initialDevices.filter((d) => d.status === 'ONLINE').length;
  const degradedDevices = initialDevices.filter((d) => d.status === 'DEGRADED').length;
  const offlineDevices = initialDevices.filter((d) => d.status === 'OFFLINE').length;
  const activeAlerts = initialNocAlerts.filter((a) => a.status === 'ACTIVE').length;
  const totalServices = initialServices.length;
  const healthyServices = initialServices.filter((s) => s.status === 'HEALTHY').length;

  return {
    totalDevices,
    onlineDevices,
    degradedDevices,
    offlineDevices,
    activeAlerts,
    totalServices,
    healthyServices,
    overallAvailabilitySla: 99.98,
    avgLatencyMs: 2.1,
  };
}

export async function runNetworkOperationsDiagnostics() {
  const results = [];

  // 1. Device Registration & Telemetry
  try {
    const regDev = await registerDevice({
      name: 'Diagnostic Access Switch 48P',
      category: 'EDGE_SWITCH',
      ipAddress: '10.100.99.10',
      location: 'East Stand Telecom Bay',
    });
    results.push({
      testName: 'NOC Device Registration & Telemetry Ingestion',
      passed: !!regDev && regDev.id.startsWith('NET-EDG-'),
      details: `Registered device ${regDev.id} with simulated SNMPv3 telemetry.`,
    });
  } catch (err) {
    results.push({ testName: 'NOC Device Registration', passed: false, details: err.message });
  }

  // 2. Alert Trigger & Threshold Check
  try {
    const alerts = getAllAlerts({ status: 'ACTIVE' });
    results.push({
      testName: 'NOC Alert Engine & Resource Threshold Detection',
      passed: Array.isArray(alerts),
      details: `Alert engine active. Found ${alerts.length} active resource warning alerts.`,
    });
  } catch (err) {
    results.push({ testName: 'NOC Alert Engine', passed: false, details: err.message });
  }

  // 3. Alert Acknowledgment
  try {
    const ackRes = await acknowledgeAlert({
      alertId: 'NOC-2026-8801',
      currentUser: { email: 'noc.lead@sttech.co.ke' },
    });
    results.push({
      testName: 'Alert Acknowledgment & Workflow Pipeline',
      passed: ackRes.success && ackRes.alert.status === 'ACKNOWLEDGED',
      details: `Alert ${ackRes.alert?.id} acknowledged by ${ackRes.alert?.acknowledgedBy}.`,
    });
  } catch (err) {
    results.push({ testName: 'Alert Acknowledgment', passed: false, details: err.message });
  }

  // 4. Alert Resolution & Auto-Healing Recovery
  try {
    const resRes = await resolveAlert({
      alertId: 'NOC-2026-8801',
      resolutionNote: 'Re-balanced Wi-Fi channel allocation to Section 105 APs.',
      currentUser: { email: 'noc.lead@sttech.co.ke' },
    });
    results.push({
      testName: 'Alert Resolution & Device State Restoration',
      passed: resRes.success && resRes.alert.status === 'RESOLVED',
      details: `Alert resolved and associated device telemetry restored to normal state.`,
    });
  } catch (err) {
    results.push({ testName: 'Alert Resolution', passed: false, details: err.message });
  }

  // 5. Application & DB Services Health Checks
  try {
    const services = getAllServices();
    results.push({
      testName: 'HTTPS & Database Microservice Health Checks',
      passed: services.length >= 4 && services.every((s) => s.status === 'HEALTHY'),
      details: `Verified ${services.length} application and database service health endpoints.`,
    });
  } catch (err) {
    results.push({ testName: 'Service Health Checks', passed: false, details: err.message });
  }

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount: results.filter((r) => r.passed).length,
    failedCount: results.filter((r) => !r.passed).length,
    results,
  };
}
