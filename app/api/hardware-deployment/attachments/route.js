import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import {
  assertHardwareFacilityOwnership,
  authorizeHardwareRequest,
  HardwareDeploymentError,
  hardwareErrorResponse,
} from '../../../../lib/hardwareDeployment';
import { prisma } from '../../../../lib/prisma';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_BYTES = 10 * 1024 * 1024;

function storageDirectory() {
  const configured = process.env.HARDWARE_EVIDENCE_DIR;
  if (!configured) throw new HardwareDeploymentError('HARDWARE_EVIDENCE_DIR must point to private storage outside the application repository.', 503);
  const dir = path.resolve(configured);
  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd());
  const relative = path.relative(root, dir);
  if (!path.isAbsolute(dir) || relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    throw new HardwareDeploymentError('Hardware evidence storage must be outside the application repository.', 503);
  }
  return dir;
}

async function ensurePrivateDirectory() {
  const configuredDir = storageDirectory();
  await fs.mkdir(configuredDir, { recursive: true, mode: 0o700 });
  const realDir = await fs.realpath(configuredDir);
  const realRoot = await fs.realpath(process.cwd());
  const relative = path.relative(realRoot, realDir);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    throw new HardwareDeploymentError('Hardware evidence directory resolves inside the application repository.', 503);
  }
  await fs.chmod(realDir, 0o700);
  return realDir;
}

function validSignature(type, bytes) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (type === 'application/pdf') return bytes.toString('ascii', 0, 5) === '%PDF-';
  return false;
}

export async function POST(req) {
  const auth = authorizeHardwareRequest(req, true);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  let storedPath;
  try {
    if (!process.env.DATABASE_URL || !prisma?.hardwareAttachment || !prisma?.hardwareAsset) {
      throw new HardwareDeploymentError('Private attachment storage requires the deployed hardware database schema.', 503);
    }
    const declaredLength = Number(req.headers.get('content-length') || 0);
    if (declaredLength > MAX_BYTES + 1024 * 1024) throw new HardwareDeploymentError('Upload request exceeds the 10 MB file limit.');
    const form = await req.formData();
    const file = form.get('file');
    const assetId = String(form.get('assetId') || '');
    const taskRef = String(form.get('taskRef') || '').trim() || null;
    if (!file || typeof file.arrayBuffer !== 'function') throw new HardwareDeploymentError('Select a document or photograph to upload.');
    if (!assetId || assetId.length > 64) throw new HardwareDeploymentError('A valid asset ID is required.');
    await assertHardwareFacilityOwnership({ assetId, facilityId, simulatedOnly: Boolean(auth.user.isDemo) });
    if (!TYPES.has(file.type) || file.size < 1 || file.size > MAX_BYTES) throw new HardwareDeploymentError('Upload a JPEG, PNG, WEBP or PDF file up to 10 MB.');
    const asset = await prisma.hardwareAsset.findFirst({ where: { assetId, facilityId }, select: { assetId: true } });
    if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
    if (taskRef) {
      const task = await prisma.hardwareInstallationTask.findUnique({ where: { taskRef }, select: { assetId: true } });
      if (!task || task.assetId !== assetId) throw new HardwareDeploymentError('Installation task does not belong to this asset.', 404);
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!validSignature(file.type, bytes)) throw new HardwareDeploymentError('File content does not match the declared image or PDF type.');
    const storageKey = `${crypto.randomBytes(24).toString('hex')}.evidence`;
    const dir = await ensurePrivateDirectory();
    storedPath = path.join(dir, storageKey);
    await fs.writeFile(storedPath, bytes, { flag: 'wx', mode: 0o600 });
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    const attachment = await prisma.hardwareAttachment.create({
      data: {
        attachmentRef: `HWE-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
        assetId,
        taskRef,
        storageKey,
        originalName: path.basename(String(file.name || 'evidence')).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 160),
        mimeType: file.type,
        sizeBytes: bytes.length,
        sha256,
        uploadedById: auth.user.id,
      },
      select: { attachmentRef: true, assetId: true, taskRef: true, originalName: true, mimeType: true, sizeBytes: true, sha256: true, createdAt: true },
    });
    return Response.json({ success: true, attachment }, { status: 201 });
  } catch (error) {
    if (storedPath) await fs.unlink(storedPath).catch(() => {});
    return hardwareErrorResponse(error);
  }
}

export async function GET(req) {
  const auth = authorizeHardwareRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    if (!process.env.DATABASE_URL || !prisma?.hardwareAttachment) {
      throw new HardwareDeploymentError('Private attachment records are unavailable until the database schema is deployed.', 503);
    }
    const attachmentRef = new URL(req.url).searchParams.get('ref');
    if (!attachmentRef || attachmentRef.length > 40) throw new HardwareDeploymentError('A valid attachment reference is required.');
    const attachment = await prisma.hardwareAttachment.findFirst({ where: { attachmentRef, asset: { facilityId } } });
    if (!attachment) throw new HardwareDeploymentError('Attachment not found.', 404);
    if (!/^[a-f0-9]{48}\.evidence$/.test(attachment.storageKey)) throw new HardwareDeploymentError('Attachment storage reference is invalid.', 409);
    const filePath = path.join(await ensurePrivateDirectory(), attachment.storageKey);
    const stat = await fs.lstat(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new HardwareDeploymentError('Attachment is not a regular private file.', 409);
    const bytes = await fs.readFile(filePath);
    if (bytes.length !== attachment.sizeBytes || crypto.createHash('sha256').update(bytes).digest('hex') !== attachment.sha256) {
      throw new HardwareDeploymentError('Attachment integrity verification failed.', 409);
    }
    return new Response(bytes, {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Length': String(bytes.length),
        'Content-Disposition': `attachment; filename="${attachment.originalName.replace(/["\\\r\n]/g, '_')}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) { return hardwareErrorResponse(error); }
}
