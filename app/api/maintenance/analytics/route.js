import { NextResponse } from 'next/server';
import {
  calculateAssetMetrics,
  generateAiPredictiveRecommendations,
} from '../../../../lib/assetMaintenance';
import { authorizeRole } from '../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'MAINTENANCE_TECHNICIAN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized maintenance staff must sign in.' }, { status: auth.status });
  try {
    const metrics = calculateAssetMetrics();
    const recommendations = generateAiPredictiveRecommendations();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      disclaimer: {
        title: 'AI Predictive Model Uncertainty Disclaimer',
        notice: 'Equipment failure predictions are based on statistical degradation trends and demonstration telemetry. They generate recommendations for authorized technical review and MUST NOT automatically control physical equipment.',
      },
      metrics,
      recommendations,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
