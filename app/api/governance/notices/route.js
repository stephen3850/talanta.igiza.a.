import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, GovernanceError, recordGovernanceAudit, validateNoticeInput } from '../../../../lib/dataGovernance';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const notices = await prisma.privacyNotice.findMany({ orderBy: { updatedAt: 'desc' } });
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'PRIVACY_NOTICES_VIEWED', entityType: 'PRIVACY_NOTICE' });
    return NextResponse.json({ success: true, notices });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Privacy notice query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Privacy notices are unavailable.' }, { status });
  }
}

export async function POST(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const data = validateNoticeInput(await req.json(), auth.user.id);
    const notice = await prisma.$transaction(async (tx) => {
      const created = await tx.privacyNotice.create({ data });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'PRIVACY_NOTICE_SAVED', entityType: 'PRIVACY_NOTICE', entityId: created.id } });
      return created;
    });
    return NextResponse.json({ success: true, notice, message: 'Notice saved. Legal basis and wording require qualified review before publication.' }, { status: 201 });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : error.code === 'P2002' ? 409 : 503;
    if (!(error instanceof GovernanceError) && error.code !== 'P2002') console.error('[Privacy notice save failed]', error);
    return NextResponse.json({ success: false, message: error instanceof GovernanceError ? error.message : error.code === 'P2002' ? 'That notice version already exists.' : 'Privacy notice could not be saved.' }, { status });
  }
}

export async function PATCH(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    if (typeof body.id !== 'string' || !body.id) throw new GovernanceError('Privacy notice ID is required.');
    const status = typeof body.status === 'string' ? body.status.toUpperCase() : '';
    if (!['DRAFT', 'PUBLISHED', 'RETIRED'].includes(status)) throw new GovernanceError('Notice status must be DRAFT, PUBLISHED, or RETIRED.');
    const notice = await prisma.$transaction(async (tx) => {
      const updated = await tx.privacyNotice.update({
        where: { id: body.id },
        data: { status, ...(status === 'PUBLISHED' ? { publishedAt: new Date() } : {}) },
      });
      await tx.governanceAccessAudit.create({ data: { actorId: auth.user.id, action: 'PRIVACY_NOTICE_STATUS_UPDATED', entityType: 'PRIVACY_NOTICE', entityId: updated.id } });
      return updated;
    });
    return NextResponse.json({ success: true, notice, message: 'Notice status updated; publication does not constitute legal approval.' });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : error.code === 'P2025' ? 404 : 503;
    if (!(error instanceof GovernanceError) && error.code !== 'P2025') console.error('[Privacy notice status update failed]', error);
    return NextResponse.json({ success: false, message: error instanceof GovernanceError ? error.message : error.code === 'P2025' ? 'Privacy notice was not found.' : 'Privacy notice status could not be updated.' }, { status });
  }
}
