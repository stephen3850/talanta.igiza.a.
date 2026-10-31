import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, GovernanceError, recordGovernanceAudit, validateConsentInput } from '../../../../lib/dataGovernance';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const records = await prisma.privacyConsent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, categoryKey: true, purpose: true, noticeVersion: true, legalBasis: true, status: true, grantedAt: true, withdrawnAt: true, createdAt: true },
    });
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'PRIVACY_CONSENTS_VIEWED', entityType: 'PRIVACY_CONSENT' });
    return NextResponse.json({ success: true, records });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Privacy consent query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Consent records are unavailable.' }, { status });
  }
}

export async function POST(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const data = validateConsentInput(await req.json(), auth.user.id);
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.privacyConsent.create({ data });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: `PRIVACY_CONSENT_${data.status}`, entityType: 'PRIVACY_CONSENT', entityId: created.id } });
      return created;
    });
    return NextResponse.json({ success: true, record: { id: record.id, categoryKey: record.categoryKey, purpose: record.purpose, noticeVersion: record.noticeVersion, legalBasis: record.legalBasis, status: record.status, grantedAt: record.grantedAt, withdrawnAt: record.withdrawnAt } }, { status: 201 });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Privacy consent record failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Consent record could not be saved.' }, { status });
  }
}
