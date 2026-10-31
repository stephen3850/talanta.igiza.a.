import {
  authorizeHardwareRequest,
  getHardwareDashboard,
  hardwareErrorResponse,
} from '../../../../lib/hardwareDeployment';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function GET(req) {
  const auth = authorizeHardwareRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const dashboard = await getHardwareDashboard({ simulatedOnly: Boolean(auth.user.isDemo), facilityId });
    const type = new URL(req.url).searchParams.get('type') || 'inventory';
    const reportDefinitions = {
      inventory: {
        filename: 'hardware-inventory-report.csv',
        rows: [
          ['Asset ID', 'Name', 'Category', 'Manufacturer', 'Model', 'Serial Number', 'Location', 'Supplier', 'Warranty Start', 'Warranty Expiry', 'Installation Date', 'Maintenance Status', 'Commissioning Status', 'Simulated'],
          ...dashboard.assets.map((asset) => [asset.assetId, asset.name, asset.category, asset.manufacturer, asset.model, asset.serialNumber, asset.installationLocation, asset.supplier, asset.warrantyStart, asset.warrantyExpiry, asset.installationDate, asset.maintenanceStatus, asset.commissioningStatus, Boolean(asset.isSimulated)]),
        ],
      },
      installations: {
        filename: 'hardware-installation-report.csv',
        rows: [
          ['Task Reference', 'Asset ID', 'Technician ID', 'Title', 'Status', 'Details', 'Notes', 'Created At', 'Updated At'],
          ...dashboard.installationTasks.map((task) => [task.taskRef, task.assetId, task.technicianId, task.title, task.status, task.details, Array.isArray(task.notes) ? task.notes.map((note) => note.note).join(' | ') : task.notes, task.createdAt, task.updatedAt]),
        ],
      },
      commissioning: {
        filename: 'hardware-commissioning-report.csv',
        rows: [
          ['Check Reference', 'Batch Reference', 'Asset ID', 'Check Key', 'Passed', 'Status', 'Notes', 'Performed By', 'Tested At'],
          ...dashboard.commissioningChecks.map((check) => [check.checkRef, check.batchRef, check.assetId, check.checkKey, check.passed, check.status, check.notes, check.performedById, check.testedAt]),
        ],
      },
      maintenance: {
        filename: 'hardware-maintenance-report.csv',
        rows: [
          ['Maintenance Reference', 'Asset ID', 'Type', 'Status', 'Scheduled At', 'Details', 'Technician ID', 'Replacement Asset ID', 'Created At'],
          ...dashboard.maintenanceRecords.map((record) => [record.maintenanceRef, record.assetId, record.recordType, record.status, record.scheduledAt, record.details, record.technicianId, record.replacementAssetId, record.createdAt]),
        ],
      },
    };
    const definition = reportDefinitions[type];
    if (!definition) return Response.json({ success: false, message: 'Select inventory, installations, commissioning or maintenance.' }, { status: 400 });
    const rows = definition.rows;
    const csv = rows.map((row) => row.map((value) => {
      const safe = String(value ?? '').replace(/[\r\n]/g, ' ');
      const escaped = /^[=+\-@]/.test(safe) ? `'${safe}` : safe;
      return `"${escaped.replace(/"/g, '""')}"`;
    }).join(',')).join('\r\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${definition.filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) { return hardwareErrorResponse(error); }
}
