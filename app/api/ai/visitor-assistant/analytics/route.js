import { NextResponse } from 'next/server';
import { getConversationAnalytics } from '../../../../../lib/visitorAiAssistant';
import { authorizeRole } from '../../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'SECURITY_ANALYST']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Assistant analytics are restricted to authorized staff.' }, { status: auth.status });
  try {
    const data = getConversationAnalytics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analytics: data.analytics,
      unansweredQuestions: data.unansweredQuestions,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
