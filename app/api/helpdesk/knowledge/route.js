import { NextResponse } from 'next/server';
import { authorizeHelpdeskRequest, createKnowledgeArticle, HelpdeskError, searchKnowledgeArticles } from '../../../../lib/helpdesk.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const query = searchParams.get('query');

  const auth = await authorizeHelpdeskRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const articles = await searchKnowledgeArticles({ category, query });
    return NextResponse.json({ success: true, articles });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Knowledge base search failed.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeHelpdeskRequest(req, { write: true });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Helpdesk or technical author access required.' }, { status: auth.status });
    }

    const article = await createKnowledgeArticle(body, auth.user.id);
    return NextResponse.json({
      success: true,
      article,
      message: `Technical solution article ${article.articleRef} (${article.title}) published in Knowledge Base.`,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Knowledge article creation failed.' }, { status });
  }
}
