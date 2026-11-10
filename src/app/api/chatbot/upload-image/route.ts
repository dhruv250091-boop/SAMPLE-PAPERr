import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/security';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function validateMagicBytes(buffer: Buffer): { isValid: boolean; detectedMime?: string } {
  if (buffer.length < 12) return { isValid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, detectedMime: 'image/png' };
  }

  // WEBP: RIFF .... WEBP
  const riff = buffer.subarray(0, 4).toString('ascii');
  const webp = buffer.subarray(8, 12).toString('ascii');
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { isValid: true, detectedMime: 'image/webp' };
  }

  return { isValid: false };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const user = await getCurrentUser();
    const rateLimitId = user ? `upload-user:${user.id}` : `upload-ip:${ip}`;

    // Rate limiting: 15 uploads per minute
    const rateCheck = checkRateLimit(rateLimitId, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Image upload limit reached. Please wait a minute before uploading another image.' },
        { status: 429 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let originalName = 'question-snapshot.jpg';
    let mimeType = 'image/jpeg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No image file found in form data' }, { status: 400 });
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image file exceeds maximum allowed size of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
          { status: 400 }
        );
      }

      mimeType = file.type;
      originalName = file.name || 'question.jpg';
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUrl, filename } = body;

      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json({ error: 'dataUrl is required for JSON upload' }, { status: 400 });
      }

      // Format: data:image/jpeg;base64,...
      const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
      }

      mimeType = match[1];
      const base64Data = match[2];
      buffer = Buffer.from(base64Data, 'base64');

      if (filename) originalName = filename;

      if (buffer.length > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image exceeds maximum allowed size of 10MB` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Unsupported Content-Type. Expected multipart/form-data or application/json' }, { status: 400 });
    }

    // Verify magic bytes
    const verification = validateMagicBytes(buffer);
    if (!verification.isValid) {
      return NextResponse.json(
        { error: 'Invalid or corrupted image file. Please provide a valid JPG, PNG, or WEBP document.' },
        { status: 400 }
      );
    }

    // Determine extension
    const detectedMime = verification.detectedMime || mimeType;
    if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are supported' }, { status: 400 });
    }

    const ext = detectedMime === 'image/png' ? 'png' : detectedMime === 'image/webp' ? 'webp' : 'jpg';

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'questions');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueId = crypto.randomUUID().slice(0, 12);
    const safeFilename = `question-${Date.now()}-${uniqueId}.${ext}`;
    const destinationPath = path.join(uploadsDir, safeFilename);

    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/questions/${safeFilename}`;
    const base64Url = `data:${detectedMime};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: originalName,
      safeFilename,
      size: buffer.length,
      mimeType: detectedMime,
      base64: base64Url
    });
  } catch (error: unknown) {
    console.error('Image upload handler error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the uploaded image.' },
      { status: 500 }
    );
  }
}
