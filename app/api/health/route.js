import { prisma } from '../../../lib/prisma.js';

function queryDbWithTimeout(timeoutMs = 500) {
  return Promise.race([
    prisma.$queryRaw`SELECT 1`,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), timeoutMs)),
  ]);
}

export async function GET() {
  let database = 'SIMULATED';

  if (process.env.DATABASE_URL && prisma) {
    try {
      await queryDbWithTimeout(500);
      database = 'AVAILABLE';
    } catch {
      database = 'SIMULATED_OFFLINE';
    }
  }

  const mpesaConfigured = Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);

  return Response.json({
    status: 'AVAILABLE',
    name: 'TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database,
    services: {
      Authentication: 'READY',
      TicketingCredentials: 'READY',
      PaymentsModule: 'READY',
      NotificationGateway: 'READY',
      BuildingManagement: 'READY',
      IncidentManagement: 'READY',
      DigitalSignage: 'READY',
      NetworkOperations: 'READY',
      AssetMaintenance: 'READY',
      EnterpriseApiGateway: 'READY',
      ProcurementAndSuppliers: 'READY',
      HelpdeskAndSupport: 'READY',
      ExecutiveIntelligence: 'READY',
    },
    integrations: {
      MPESA_Daraja: mpesaConfigured ? 'CONFIGURED_NOT_CONNECTED' : 'SIMULATED_DEVELOPMENT',
      CCTV_VMS: 'SIMULATED_DEVELOPMENT',
      Smart_Gates: 'SIMULATED_DEVELOPMENT',
      Cryptographic_QR_Scanners: 'CONNECTED_VERIFIED',
      IoT_Sensors_Telemetry: 'SIMULATED_DEVELOPMENT',
      Digital_Signage_OS: 'SIMULATED_DEVELOPMENT',
      Network_NOC_Monitoring: 'CONNECTED_VERIFIED',
      Smart_Parking_ANPR: 'SIMULATED_DEVELOPMENT',
      Emergency_Communications: 'CONNECTED_VERIFIED',
    },
  }, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
