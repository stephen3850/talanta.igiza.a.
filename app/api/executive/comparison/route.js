import { NextResponse } from 'next/server';
import { authorizeExecutiveRequest, ExecutiveError, getHistoricalEventComparison } from '../../../../lib/executiveIntelligence.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const eventIdsParam = searchParams.get('eventIds');
  const eventIds = eventIdsParam ? eventIdsParam.split(',') : [];

  const auth = await authorizeExecutiveRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized executive leadership access is required.' }, { status: auth.status });
  }

  try {
    const comparisons = await getHistoricalEventComparison({
      facilityId: auth.facilityId,
      eventIds,
    });

    return NextResponse.json({ success: true, comparisons });
  } catch (error) {
    const status = error instanceof ExecutiveError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Historical event comparison failed.' }, { status });
  }
}
