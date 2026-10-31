import { NextResponse } from 'next/server';
import { modelMetadata } from '../../../../lib/aiEngine';

export async function GET(req) {
  try {
    return NextResponse.json({
      success: true,
      modelMetadata,
      humanInTheLoopPolicy: {
        financialAuthority: 'HUMAN_APPROVAL_REQUIRED',
        securityAuthority: 'HUMAN_APPROVAL_REQUIRED',
        biometricProfiling: 'NOT_IMPLEMENTED_IN_THIS_DEMONSTRATION',
        auditLogging: 'APPLICATION_LOGGING_CONFIGURED; PRODUCTION_INTEGRITY_NOT_VERIFIED',
      },
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
