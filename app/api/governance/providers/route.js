import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, GovernanceError, recordGovernanceAudit, validateProcessorInput } from '../../../../lib/dataGovernance';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const providers = await prisma.governanceProcessor.findMany({ orderBy: { displayName: 'asc' } });
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'PROCESSOR_REGISTER_VIEWED', entityType: 'GOVERNANCE_PROCESSOR' });
    return NextResponse.json({ success: true, providers });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Governance processor query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Processor register is unavailable.' }, { status });
  }
}

export async function POST(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const data = validateProcessorInput(await req.json(), auth.user.id);
    const provider = await prisma.$transaction(async (tx) => {
      const created = await tx.governanceProcessor.create({ data });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'PROCESSOR_REGISTER_CREATED', entityType: 'GOVERNANCE_PROCESSOR', entityId: created.id } });
      return created;
    });
    return NextResponse.json({ success: true, provider }, { status: 201 });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : error.code === 'P2002' ? 409 : 503;
    if (!(error instanceof GovernanceError) && error.code !== 'P2002') console.error('[Governance processor create failed]', error);
    return NextResponse.json({ success: false, message: error instanceof GovernanceError ? error.message : error.code === 'P2002' ? 'That provider key already exists.' : 'Processor record could not be created.' }, { status });
  }
}

export async function PATCH(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    if (typeof body.id !== 'string' || !body.id) throw new GovernanceError('Processor record ID is required.');
    const data = {};
    if (body.integrationStatus !== undefined) {
      const status = String(body.integrationStatus).toUpperCase();
      if (!['PENDING_REVIEW', 'CONFIGURED', 'DISCONNECTED', 'SIMULATED'].includes(status)) throw new GovernanceError('Choose a supported, non-verified integration status.');
      data.integrationStatus = status;
    }
    if (body.agreementStatus !== undefined) {
      const status = String(body.agreementStatus).toUpperCase();
      if (!['REVIEW_REQUIRED', 'UNDER_REVIEW', 'APPROVED', 'NOT_APPLICABLE'].includes(status)) throw new GovernanceError('Choose a supported processor-agreement review status.');
      data.agreementStatus = status;
      data.reviewedAt = status === 'UNDER_REVIEW' || status === 'APPROVED' ? new Date() : null;
    }
    if (!Object.keys(data).length) throw new GovernanceError('Provide an integration or agreement review status.');
    const provider = await prisma.$transaction(async (tx) => {
      const updated = await tx.governanceProcessor.update({ where: { id: body.id }, data });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'PROCESSOR_REGISTER_UPDATED', entityType: 'GOVERNANCE_PROCESSOR', entityId: updated.id } });
      return updated;
    });
    return NextResponse.json({ success: true, provider });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : error.code === 'P2025' ? 404 : 503;
    if (!(error instanceof GovernanceError) && error.code !== 'P2025') console.error('[Governance processor update failed]', error);
    return NextResponse.json({ success: false, message: error instanceof GovernanceError ? error.message : error.code === 'P2025' ? 'Processor record was not found.' : 'Processor record could not be updated.' }, { status });
  }
}
