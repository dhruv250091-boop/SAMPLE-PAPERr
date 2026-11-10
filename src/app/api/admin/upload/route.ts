import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('type') || 'paper'; // 'paper' or 'answer'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Size verification: 15MB max
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum permitted limit (15MB)' }, { status: 400 });
    }

    // 2. MIME type verification
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only valid PDF documents (.pdf) are permitted' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Magic Number verification (Do not trust file extensions alone!)
    // PDF magic number header is "%PDF-" (Hex: 25 50 44 46 2D)
    const header = buffer.subarray(0, 5).toString('ascii');
    if (header !== '%PDF-') {
      return NextResponse.json(
        { error: 'Invalid file format. The file content does not match a valid PDF binary structure.' },
        { status: 400 }
      );
    }

    // 4. Sanitize file name
    const timestamp = Date.now();
    const cleanOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/\.pdf$/, '');
    const filename = `${documentType}-${cleanOriginalName}-${timestamp}.pdf`;

    const uploadDir = path.join(process.cwd(), 'public', 'sample-papers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/sample-papers/${filename}`;

    await logAdminAction(adminCheck.user.id, 'UPLOAD_PDF', {
      originalName: file.name,
      storedAs: filename,
      sizeBytes: file.size,
      url: publicUrl
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: filename,
      size: file.size
    });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Failed to process document upload' }, { status: 500 });
  }
}
