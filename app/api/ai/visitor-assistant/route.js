import { NextResponse } from 'next/server';
import { processVisitorQuery } from '../../../../lib/visitorAiAssistant';
import { authorizeRole } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;

    if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return NextResponse.json({ success: false, message: 'Message text is required.' }, { status: 400 });
    }

    const auth = authorizeRole(req, ['CUSTOMER']);
    const userSession = auth.authorized ? { name: auth.user.fullName } : null;
    const result = await processVisitorQuery({
      userQuery: message,
      userSession,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      botDisclosure: 'I am Talanta Bot, an AI-powered assistant for Talanta Sports City Stadium.',
      response: result.response,
      sourceArticleId: result.sourceArticleId,
      sourceTitle: result.sourceTitle,
      escalateToHuman: result.escalateToHuman,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
