import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, createPrivacyRequest, GovernanceError, recordGovernanceAudit, validateRequestUpdate } from '../../../../lib/dataGovernance';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const requests = await prisma.dataSubjectRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, reference: true, requestType: true, contactHint: true, requestedCategories: true, status: true, assignedToId: true, notes: true, preservationHold: true, holdReason: true, dueAt: true, resolvedAt: true, createdAt: true, updatedAt: true },
    });
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'PRIVACY_REQUESTS_VIEWED', entityType: 'DATA_SUBJECT_REQUEST' });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Privacy request query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Privacy requests are unavailable.' }, { status });
  }
}

export async function POST(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const request = await createPrivacyRequest(await req.json(), auth.user.id);
    return NextResponse.json({ success: true, request, message: 'Request registered. Contact details are encrypted at rest; use the audited contact access route only when needed.' }, { status: 201 });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Privacy request create failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Privacy request could not be registered.' }, { status });
  }
}

export async function PATCH(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    if (typeof body.id !== 'string' || !body.id) throw new GovernanceError('Request ID is required.');
    const data = validateRequestUpdate(body);
    if (data.assignedToId) {
      const assignee = await prisma.user.findFirst({ where: { id: data.assignedToId, isActive: true }, select: { id: true } });
      if (!assignee) throw new GovernanceError('Assign the request to an active user account.');
    }
    const request = await prisma.$transaction(async (tx) => {
      const updated = await tx.dataSubjectRequest.update({
        where: { id: body.id },
        data,
        select: { id: true, reference: true, requestType: true, contactHint: true, requestedCategories: true, status: true, assignedToId: true, notes: true, preservationHold: true, holdReason: true, dueAt: true, resolvedAt: true, createdAt: true, updatedAt: true },
      });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'PRIVACY_REQUEST_UPDATED', entityType: 'DATA_SUBJECT_REQUEST', entityId: updated.id } });
      return updated;
    });
    return NextResponse.json({ success: true, request });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : error.code === 'P2025' ? 404 : 503;
    if (!(error instanceof GovernanceError) && error.code !== 'P2025') console.error('[Privacy request update failed]', error);
    return NextResponse.json({ success: false, message: error instanceof GovernanceError ? error.message : error.code === 'P2025' ? 'Privacy request was not found.' : 'Privacy request could not be updated.' }, { status });
  }
}
