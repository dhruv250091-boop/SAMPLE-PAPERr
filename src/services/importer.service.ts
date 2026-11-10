import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export interface ScannedFileItem {
  absolutePath: string;
  relativePath: string;
  originalFilename: string;
  fileSize: number;
  fileHash: string;
  detectedSubjectCode: string;
  detectedYear: number;
  detectedMonth: string;
  isDuplicate: boolean;
  status: 'PENDING' | 'IMPORTED' | 'DUPLICATE' | 'FAILED' | 'REVIEW_NEEDED';
}

export interface ImportInventoryReport {
  scannedDirectory: string;
  totalDiscoveredFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  duplicatesCount: number;
  subjectBreakdown: Record<string, number>;
  yearBreakdown: Record<number, number>;
  files: ScannedFileItem[];
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

export function detectSubjectFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();

  if (normalized.includes('/bk/') || normalized.includes('/book keeping')) {
    return 'BK';
  }
  if (normalized.includes('/economic') || normalized.includes('/eco/')) {
    return 'ECO';
  }
  if (normalized.includes('/english') || normalized.includes('/eng/')) {
    return 'ENG';
  }
  if (normalized.includes('/ocm/')) {
    return 'OCM';
  }
  if (normalized.includes('/secretarial practice') || normalized.includes('/sp/')) {
    return 'SP';
  }
  if (normalized.includes('/it/') || normalized.includes('/information technology')) {
    return 'IT';
  }

  return 'UNKNOWN';
}

export function parseYearAndMonth(filename: string): { year: number; month: string } {
  const lower = filename.toLowerCase();

  // Detect Month
  let month = 'March';
  if (lower.includes('july')) month = 'July';
  else if (lower.includes('june')) month = 'June';
  else if (lower.includes('march')) month = 'March';
  else if (lower.includes('oct') || lower.includes('october')) month = 'October';
  else if (lower.includes('nov') || lower.includes('november')) month = 'November';
  else if (lower.includes('feb') || lower.includes('february')) month = 'February';

  // Detect Year
  let year = 2025;
  const fourDigitMatch = lower.match(/\b(202[0-9])\b/);
  if (fourDigitMatch) {
    year = parseInt(fourDigitMatch[1], 10);
  } else {
    // Handle formats like "march 26.pdf" -> 2026
    const twoDigitMatch = lower.match(/\b(2[4-9])\b/);
    if (twoDigitMatch) {
      year = 2000 + parseInt(twoDigitMatch[1], 10);
    }
  }

  return { year, month };
}

export async function scanLocalDirectory(targetDir: string): Promise<ImportInventoryReport> {
  const files: ScannedFileItem[] = [];
  const seenHashes = new Set<string>();

  const subjectBreakdown: Record<string, number> = {};
  const yearBreakdown: Record<number, number> = {};
  let totalSizeBytes = 0;
  let duplicatesCount = 0;

  function traverse(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
        const stats = fs.statSync(fullPath);
        const fileHash = calculateFileHash(fullPath);
        const subjectCode = detectSubjectFromPath(fullPath);
        const { year, month } = parseYearAndMonth(entry.name);

        const isDuplicate = seenHashes.has(fileHash);
        if (isDuplicate) {
          duplicatesCount++;
        } else {
          seenHashes.add(fileHash);
        }

        totalSizeBytes += stats.size;
        subjectBreakdown[subjectCode] = (subjectBreakdown[subjectCode] || 0) + 1;
        yearBreakdown[year] = (yearBreakdown[year] || 0) + 1;

        files.push({
          absolutePath: fullPath,
          relativePath: path.relative(targetDir, fullPath),
          originalFilename: entry.name,
          fileSize: stats.size,
          fileHash,
          detectedSubjectCode: subjectCode,
          detectedYear: year,
          detectedMonth: month,
          isDuplicate,
          status: isDuplicate ? 'DUPLICATE' : subjectCode === 'UNKNOWN' ? 'REVIEW_NEEDED' : 'PENDING'
        });
      }
    }
  }

  traverse(targetDir);

  return {
    scannedDirectory: targetDir,
    totalDiscoveredFiles: files.length,
    totalSizeBytes,
    totalSizeFormatted: formatBytes(totalSizeBytes),
    duplicatesCount,
    subjectBreakdown,
    yearBreakdown,
    files
  };
}

export async function executeSamplePaperImport(
  targetDir: string,
  destinationPublicDir: string = path.join(process.cwd(), 'public', 'sample-papers', 'imported')
) {
  const inventory = await scanLocalDirectory(targetDir);

  if (!fs.existsSync(destinationPublicDir)) {
    fs.mkdirSync(destinationPublicDir, { recursive: true });
  }

  const results = {
    totalScanned: inventory.totalDiscoveredFiles,
    importedCount: 0,
    skippedDuplicates: 0,
    failedCount: 0,
    errors: [] as string[]
  };

  for (const item of inventory.files) {
    try {
      // Check if this hash is already imported in DB
      const existingImport = await prisma.importedFile.findUnique({
        where: { fileHash: item.fileHash }
      });

      if (existingImport && existingImport.status === 'IMPORTED') {
        results.skippedDuplicates++;
        continue;
      }

      // Check subject in DB
      const subject = await prisma.subject.findFirst({
        where: { code: item.detectedSubjectCode }
      });

      if (!subject) {
        // Place in review
        await prisma.importedFile.upsert({
          where: { fileHash: item.fileHash },
          update: {
            status: 'REVIEW_NEEDED',
            errorMessage: `Subject code ${item.detectedSubjectCode} not found in database.`
          },
          create: {
            originalFilename: item.originalFilename,
            sourcePath: item.absolutePath,
            fileSize: item.fileSize,
            fileHash: item.fileHash,
            subjectCode: item.detectedSubjectCode,
            detectedYear: item.detectedYear,
            detectedMonth: item.detectedMonth,
            status: 'REVIEW_NEEDED',
            errorMessage: `Subject code ${item.detectedSubjectCode} not found in database.`
          }
        });
        continue;
      }

      // 1. Copy file to persistent public storage
      const subjectFolder = path.join(destinationPublicDir, item.detectedSubjectCode.toLowerCase());
      if (!fs.existsSync(subjectFolder)) {
        fs.mkdirSync(subjectFolder, { recursive: true });
      }

      const cleanMonth = item.detectedMonth.toLowerCase();
      const cleanTargetName = `${item.detectedSubjectCode.toLowerCase()}-${cleanMonth}-${item.detectedYear}.pdf`;
      const targetFilePath = path.join(subjectFolder, cleanTargetName);

      fs.copyFileSync(item.absolutePath, targetFilePath);

      const persistentWebUrl = `/sample-papers/imported/${item.detectedSubjectCode.toLowerCase()}/${cleanTargetName}`;

      // 2. Upsert SamplePaper in Database
      const paperTitle = `${subject.code} Board Examination Paper – ${item.detectedMonth} ${item.detectedYear}`;

      const samplePaper = await prisma.samplePaper.create({
        data: {
          subjectId: subject.id,
          title: paperTitle,
          year: item.detectedYear,
          month: item.detectedMonth,
          description: `Official authentic Class 12 Commerce ${subject.name} question paper (${item.detectedMonth} examination ${item.detectedYear}).`,
          paperPdfUrl: persistentWebUrl,
          fileSize: item.fileSize,
          fileHash: item.fileHash,
          originalFilename: item.originalFilename,
          isPublished: true
        }
      });

      // 3. Record ImportedFile metadata
      await prisma.importedFile.upsert({
        where: { fileHash: item.fileHash },
        update: {
          status: 'IMPORTED',
          storageUrl: persistentWebUrl,
          samplePaperId: samplePaper.id,
          errorMessage: null
        },
        create: {
          originalFilename: item.originalFilename,
          sourcePath: item.absolutePath,
          fileSize: item.fileSize,
          fileHash: item.fileHash,
          subjectCode: item.detectedSubjectCode,
          detectedYear: item.detectedYear,
          detectedMonth: item.detectedMonth,
          status: 'IMPORTED',
          storageUrl: persistentWebUrl,
          samplePaperId: samplePaper.id
        }
      });

      results.importedCount++;
    } catch (err: unknown) {
      results.failedCount++;
      const msg = `Error importing ${item.originalFilename}: ${(err as Error).message}`;
      results.errors.push(msg);
      console.error(msg);
    }
  }

  return { inventory, results };
}
