import { NextResponse } from 'next/server';
import { authorizeManagedUser, IamError, validateIdentityProvider } from '../../../../lib/iam';
import { prisma } from '../../../../lib/prisma';
import { logAuditEvent } from '../../../../lib/audit';

export async function GET(req) {
  const auth = await authorizeManagedUser(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const providers = await prisma.identityProvider.findMany({
      orderBy: { displayName: 'asc' },
      select: { id: true, providerKey: true, displayName: true, protocol: true, issuerUrl: true, clientId: true, scopes: true, status: true, updatedAt: true },
    });
    return NextResponse.json({ success: true, providers, saml: 'UNAVAILABLE_NO_APPROVED_LIBRARY' });
  } catch (error) {
    console.error('[IAM identity provider query failed]', error);
    return NextResponse.json({ success: false, message: 'Identity provider settings are unavailable.' }, { status: 503 });
  }
}

export async function POST(req) {
  const auth = await authorizeManagedUser(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const input = validateIdentityProvider(await req.json());
    const provider = await prisma.identityProvider.upsert({
      where: { providerKey: input.providerKey },
      create: { ...input, configuredById: auth.user.id },
      update: { ...input, configuredById: auth.user.id, status: 'PENDING_CONFIGURATION' },
      select: { id: true, providerKey: true, displayName: true, protocol: true, issuerUrl: true, clientId: true, scopes: true, status: true, updatedAt: true },
    });
    await logAuditEvent({ userId: auth.user.id, action: 'IAM_IDENTITY_PROVIDER_CONFIGURED', entityType: 'IDENTITY_PROVIDER', entityId: provider.id, details: `Identity provider metadata saved for ${provider.providerKey}; SSO remains pending implementation and verification.` });
    return NextResponse.json({ success: true, provider, message: 'Provider metadata saved. No login flow is active; OIDC client secrets must remain in the deployment secret manager.' }, { status: 201 });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[IAM identity provider save failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'Identity provider metadata could not be saved.' }, { status });
  }
}
