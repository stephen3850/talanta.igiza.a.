import { NextResponse } from 'next/server';
import { runNetworkOperationsDiagnostics } from '../../../../lib/networkOperations';
import { authorizeNetworkRequest, networkErrorResponse, recordNetworkAccess } from '../../../../lib/networkManagement';

export async function GET(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    await recordNetworkAccess({ user: auth.user, action: 'NOC_DIAGNOSTICS_STARTED', req });
    const diagnostics = await runNetworkOperationsDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return networkErrorResponse(err);
  }
}

export async function POST(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    await recordNetworkAccess({ user: auth.user, action: 'NOC_DIAGNOSTICS_STARTED', req });
    const diagnostics = await runNetworkOperationsDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return networkErrorResponse(err);
  }
}
