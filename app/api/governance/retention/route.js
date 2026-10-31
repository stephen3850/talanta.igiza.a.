import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, createRetentionReview, GovernanceError, recordGovernanceAudit, validateRetentionPolicyInput } from '../../../../lib/dataGovernance';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const [policies, reviews] = await Promise.all([
      prisma.retentionPolicy.findMany({ orderBy: { categoryKey: 'asc' } }),
      prisma.retentionReview.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    ]);
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'RETENTION_REGISTER_VIEWED', entityType: 'RETENTION_POLICY' });
    return NextResponse.json({ success: true, policies, reviews, automaticDeletion: false });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Retention register query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Retention register is unavailable.' }, { status });
  }
}

export async function POST(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const data = validateRetentionPolicyInput(await req.json(), auth.user.id);
    const policy = await prisma.$transaction(async (tx) => {
      const saved = await tx.retentionPolicy.upsert({
        where: { categoryKey: data.categoryKey },
        create: data,
        update: data,
      });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'RETENTION_POLICY_SAVED', entityType: 'RETENTION_POLICY', entityId: saved.id } });
      return saved;
    });
    return NextResponse.json({ success: true, policy, automaticDeletion: false, message: 'Policy saved for human review; no records were deleted.' }, { status: 201 });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Retention policy save failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Retention policy could not be saved.' }, { status });
  }
}

export async function PATCH(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    if (typeof body.policyId !== 'string' || !body.policyId) throw new GovernanceError('Retention policy ID is required.');
    const review = await createRetentionReview({
      policyId: body.policyId,
      recordReference: body.recordReference,
      action: body.action,
      rationale: body.rationale,
      actorId: auth.user.id,
    });
    return NextResponse.json({ success: true, review, dataDeletionPerformed: false });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Retention review failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Retention review could not be saved.' }, { status });
  }
}
