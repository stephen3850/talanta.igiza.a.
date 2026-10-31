import { NextResponse } from 'next/server';
import {
  getAllKnowledgeArticles,
  createOrUpdateArticle,
} from '../../../../../lib/visitorAiAssistant';
import { authorizeRole } from '../../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Knowledge management is restricted to authorized administrators.' }, { status: auth.status });
  try {
    const articles = getAllKnowledgeArticles();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: articles.length,
      articles,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Knowledge management is restricted to authorized administrators.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { id, category, title, content, keywords, published } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Article title and content are mandatory.' },
        { status: 400 }
      );
    }

    const article = await createOrUpdateArticle({
      id,
      category,
      title,
      content,
      keywords,
      published,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Knowledge article ${article.id} saved successfully.`,
        article,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
