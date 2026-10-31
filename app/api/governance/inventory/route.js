import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, ensureInventoryCatalog, GovernanceError, recordGovernanceAudit, validateInventoryInput } from '../../../../lib/dataGovernance';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    await ensureInventoryCatalog();
    const items = await prisma.dataInventoryItem.findMany({ orderBy: { label: 'asc' } });
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'DATA_INVENTORY_VIEWED', entityType: 'DATA_INVENTORY' });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Data inventory query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Data inventory is unavailable.' }, { status });
  }
}

export async function POST(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const data = validateInventoryInput(await req.json());
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.dataInventoryItem.create({ data: { ...data, createdById: auth.user.id } });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'DATA_INVENTORY_CREATED', entityType: 'DATA_INVENTORY_ITEM', entityId: created.id } });
      return created;
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : error.code === 'P2002' ? 409 : 503;
    if (!(error instanceof GovernanceError) && error.code !== 'P2002') console.error('[Data inventory create failed]', error);
    return NextResponse.json({ success: false, message: error instanceof GovernanceError ? error.message : error.code === 'P2002' ? 'That category key already exists.' : 'Data inventory item could not be created.' }, { status });
  }
}

export async function PATCH(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const data = validateInventoryInput(body);
    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.dataInventoryItem.update({ where: { id }, data });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'DATA_INVENTORY_UPDATED', entityType: 'DATA_INVENTORY_ITEM', entityId: updated.id } });
      return updated;
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : error.code === 'P2025' ? 404 : 503;
    if (!(error instanceof GovernanceError) && error.code !== 'P2025') console.error('[Data inventory update failed]', error);
    return NextResponse.json({ success: false, message: error instanceof GovernanceError ? error.message : error.code === 'P2025' ? 'Data inventory item was not found.' : 'Data inventory item could not be updated.' }, { status });
  }
}
