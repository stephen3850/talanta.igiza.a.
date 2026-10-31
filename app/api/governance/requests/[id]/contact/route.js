import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, decryptContactForRequest, GovernanceError, recordGovernanceAudit } from '../../../../../../lib/dataGovernance';
import { prisma } from '../../../../../../lib/prisma';

export async function GET(req, { params }) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const { id } = await params;
    const request = await prisma.dataSubjectRequest.findUnique({
      where: { id },
      select: { id: true, reference: true, subjectContactCiphertext: true },
    });
    if (!request) return NextResponse.json({ success: false, message: 'Privacy request was not found.' }, { status: 404 });
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'PRIVACY_REQUEST_CONTACT_ACCESSED', entityType: 'DATA_SUBJECT_REQUEST', entityId: request.id });
    return NextResponse.json({ success: true, reference: request.reference, contact: decryptContactForRequest(request) });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Privacy request contact access failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Request contact could not be accessed.' }, { status });
  }
}
