import { NextResponse } from 'next/server';
import {
  getAllWorkOrders,
  createWorkOrder,
  updateWorkOrderStatus,
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
} from '../../../../lib/assetMaintenance';
import { authorizeRole } from '../../../../lib/auth';

const maintenanceRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'MAINTENANCE_TECHNICIAN'];

export async function GET(req) {
  const auth = authorizeRole(req, maintenanceRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized maintenance staff must sign in.' }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const priority = searchParams.get('priority') || 'ALL';
    const search = searchParams.get('search') || '';

    const workOrders = getAllWorkOrders({ status, priority, search });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      priorities: WORK_ORDER_PRIORITIES,
      statuses: WORK_ORDER_STATUSES,
      count: workOrders.length,
      workOrders: workOrders.map((workOrder) => ({ ...workOrder, isSimulated: true })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized maintenance managers must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { assetId, title, priority, assignedTechnician, dueDate, costExpenditureKes, description } = body;

    if (!assetId || !title) {
      return NextResponse.json(
        { success: false, message: 'assetId and work order title are required.' },
        { status: 400 }
      );
    }

    const wo = await createWorkOrder({
      assetId,
      title,
      priority,
      assignedTechnician,
      dueDate,
      costExpenditureKes,
      description,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Simulated work order ${wo.id} created; no maintenance work was performed.`,
        workOrder: { ...wo, isSimulated: true },
        dataMode: 'SIMULATED',
        isSimulated: true,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function PATCH(req) {
  const auth = authorizeRole(req, maintenanceRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized maintenance staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { woId, status, inspectionNotes, completionDetails } = body;

    if (!woId || !status) {
      return NextResponse.json({ success: false, message: 'woId and status are required.' }, { status: 400 });
    }

    const result = await updateWorkOrderStatus({
      woId,
      status,
      inspectionNotes,
      completionDetails,
      currentUser: auth.user,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Simulated work order ${woId} updated to ${status}; no physical maintenance was performed.`,
      workOrder: { ...result.workOrder, isSimulated: true },
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
