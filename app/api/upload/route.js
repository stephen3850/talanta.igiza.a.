import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { authorizeRole } from '../../../lib/auth';

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized event managers can upload event images.' }, { status: auth.status });
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, message: 'No image file uploaded' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size < 1 || file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'Image must be between 1 byte and 5 MB.',
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    const extension = isPng ? 'png' : isJpeg ? 'jpg' : isWebp ? 'webp' : null;
    if (!extension) {
      return NextResponse.json({ success: false, message: 'File content is not a supported PNG, JPEG, or WEBP image.' }, { status: 400 });
    }

    const filename = `event-cover-${randomUUID()}.${extension}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, buffer, { flag: 'wx', mode: 0o644 });

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
      uploadedBy: auth.user.id,
    });
  } catch (err) {
    console.error('[Event image upload failed]', err);
    return NextResponse.json({ success: false, message: 'Event image upload failed.' }, { status: 500 });
  }
}
