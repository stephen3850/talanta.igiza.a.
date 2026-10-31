import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, createRevenueCategory, ensureRevenueCategories, FinanceError } from '../../../../lib/financialManagement';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const auth = await authorizeFinanceRequest(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized access is required.' }, { status: auth.status });
  try {
    await ensureRevenueCategories();
    const categories = await prisma.revenueCategory.findMany({ orderBy: { label: 'asc' } });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Categories unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access is required.' }, { status: auth.status });
    const category = await createRevenueCategory(body, auth.user.id);
    return NextResponse.json({ success: true, category, message: 'Revenue category created.' }, { status: 201 });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : error.code === 'P2002' ? 409 : 503;
    return NextResponse.json({ success: false, message: error.message || 'Category could not be created.' }, { status });
  }
}
