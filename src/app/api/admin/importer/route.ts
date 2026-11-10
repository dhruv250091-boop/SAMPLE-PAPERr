import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import prisma from '@/lib/prisma';
import path from 'path';
import { scanLocalDirectory, executeSamplePaperImport, formatBytes } from '@/services/importer.service';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const defaultSourceDir = path.join(process.cwd(), 'Sample papers');

    // Fetch DB records for imported files
    const importedDbFiles = await prisma.importedFile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        samplePaper: {
          select: { id: true, title: true, isPublished: true, paperPdfUrl: true }
        }
      }
    });

    // Compute metrics
    const totalImported = importedDbFiles.filter((f) => f.status === 'IMPORTED').length;
    const totalDuplicates = importedDbFiles.filter((f) => f.status === 'DUPLICATE').length;
    const totalFailed = importedDbFiles.filter((f) => f.status === 'FAILED').length;
    const totalReviewNeeded = importedDbFiles.filter((f) => f.status === 'REVIEW_NEEDED').length;
    const totalSizeBytes = importedDbFiles.reduce((acc, f) => acc + f.fileSize, 0);

    return NextResponse.json({
      metrics: {
        totalDiscovered: importedDbFiles.length,
        totalImported,
        totalDuplicates,
        totalFailed,
        totalReviewNeeded,
        totalSizeBytes,
        totalSizeFormatted: formatBytes(totalSizeBytes)
      },
      sourceDirectory: defaultSourceDir,
      files: importedDbFiles
    });
  } catch (err) {
    console.error('Error in import manager API:', err);
    return NextResponse.json({ error: 'Failed to fetch import inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'SCAN_AND_IMPORT';

    if (action === 'UPDATE_ITEM') {
      const { id, subjectCode, detectedYear, title, isPublished } = body;
      const fileRecord = await prisma.importedFile.findUnique({
        where: { id },
        include: { samplePaper: true }
      });

      if (!fileRecord) {
        return NextResponse.json({ error: 'File record not found' }, { status: 404 });
      }

      // Update Subject & Year if changed
      const subject = await prisma.subject.findFirst({
        where: { code: subjectCode.toUpperCase() }
      });

      if (fileRecord.samplePaperId && subject) {
        await prisma.samplePaper.update({
          where: { id: fileRecord.samplePaperId },
          data: {
            subjectId: subject.id,
            year: Number(detectedYear),
            title: title || undefined,
            isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined
          }
        });
      }

      const updated = await prisma.importedFile.update({
        where: { id },
        data: {
          subjectCode: subjectCode.toUpperCase(),
          detectedYear: Number(detectedYear),
          status: 'IMPORTED'
        }
      });

      await logAdminAction(adminCheck.user.id, 'APPROVE_SAMPLE_PAPER', {
        id,
        filename: updated.originalFilename
      });

      return NextResponse.json({ success: true, updated });
    }

    // Default: Trigger folder scan & import
    const defaultSourceDir = path.join(process.cwd(), 'Sample papers');
    const { inventory, results } = await executeSamplePaperImport(defaultSourceDir);

    await logAdminAction(adminCheck.user.id, 'EXECUTE_FOLDER_IMPORT', {
      source: defaultSourceDir,
      importedCount: results.importedCount
    });

    return NextResponse.json({
      success: true,
      inventory,
      results
    });
  } catch (err) {
    console.error('Failed to execute import operation:', err);
    return NextResponse.json({ error: 'Failed to complete import process' }, { status: 500 });
  }
}
