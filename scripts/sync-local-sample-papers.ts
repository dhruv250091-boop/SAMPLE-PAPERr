import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const SAMPLE_PAPERS_ROOT = 'F:\\WEBSITE FOR STUDIES\\Sample papers\\sample paper';

const FOLDER_TO_SUBJECT_CODE: Record<string, string> = {
  bk: 'BK',
  economic: 'ECO',
  economics: 'ECO',
  english: 'ENG',
  ocm: 'OCM',
  'secretarial practice': 'SP',
  sp: 'SP'
};

function parseFilename(fileName: string): { month: string; year: number } {
  const clean = fileName.toLowerCase().replace('.pdf', '').trim();
  let month = 'March';
  let year = 2024;

  if (clean.includes('july')) month = 'July';
  else if (clean.includes('june')) month = 'June';
  else if (clean.includes('march') || clean.includes('mar')) month = 'March';
  else if (clean.includes('october') || clean.includes('oct')) month = 'October';

  const yearMatch = clean.match(/(20\d\d|\b\d{2}\b)/);
  if (yearMatch) {
    let y = parseInt(yearMatch[1], 10);
    if (y < 100) y += 2000;
    year = y;
  }

  return { month, year };
}

async function syncPapers() {
  console.log('--- SYNCING REAL LOCAL SAMPLE PAPERS ---');
  console.log('Root:', SAMPLE_PAPERS_ROOT);

  if (!fs.existsSync(SAMPLE_PAPERS_ROOT)) {
    console.error('Directory does not exist:', SAMPLE_PAPERS_ROOT);
    return;
  }

  // Ensure subjects exist
  const subjects = await prisma.subject.findMany();
  const subjectMap = new Map(subjects.map((s) => [s.code.toUpperCase(), s]));

  // Clear existing old/dummy sample papers
  console.log('Deleting existing sample papers to keep only genuine local files...');
  await prisma.answer.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.importedFile.deleteMany({});
  await prisma.samplePaper.deleteMany({});

  const folderEntries = fs.readdirSync(SAMPLE_PAPERS_ROOT, { withFileTypes: true });

  let count = 0;

  for (const entry of folderEntries) {
    if (!entry.isDirectory()) continue;
    const folderName = entry.name;
    const folderLower = folderName.toLowerCase();
    const subjectCode = FOLDER_TO_SUBJECT_CODE[folderLower];

    if (!subjectCode) {
      console.log(`Skipping unrecognized folder: ${folderName}`);
      continue;
    }

    const subject = subjectMap.get(subjectCode);
    if (!subject) {
      console.log(`Subject not found in database for code: ${subjectCode}`);
      continue;
    }

    const subDirPath = path.join(SAMPLE_PAPERS_ROOT, folderName);
    const files = fs.readdirSync(subDirPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.toLowerCase().endsWith('.pdf')) continue;

      const fullPath = path.join(subDirPath, file.name);
      const stat = fs.statSync(fullPath);
      const fileBuffer = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const { month, year } = parseFilename(file.name);
      const title = `${subject.code} Board Model Question Paper – ${month} ${year}`;
      const description = `Authentic Maharashtra State Board Class 12 Commerce Question Paper (${subject.name}) conducted in ${month} ${year}. File size: ${(stat.size / 1024).toFixed(1)} KB.`;

      // We will create the sample paper record with an initial ID
      const paper = await prisma.samplePaper.create({
        data: {
          subjectId: subject.id,
          title,
          year,
          month,
          description,
          paperPdfUrl: '', // Will update with /api/sample-papers/[id]/file
          fileSize: stat.size,
          fileHash: hash,
          originalFilename: file.name,
          isPublished: true
        }
      });

      // Update URL to use the dynamic streaming endpoint
      const streamUrl = `/api/sample-papers/${paper.id}/file`;
      await prisma.samplePaper.update({
        where: { id: paper.id },
        data: {
          paperPdfUrl: streamUrl
        }
      });

      // Create imported file tracking record
      await prisma.importedFile.create({
        data: {
          originalFilename: file.name,
          sourcePath: fullPath,
          fileSize: stat.size,
          fileHash: hash,
          subjectCode: subject.code,
          detectedYear: year,
          detectedMonth: month,
          status: 'IMPORTED',
          storageUrl: streamUrl,
          samplePaperId: paper.id
        }
      });

      count++;
      console.log(`[IMPORTED] ${subject.code} ${month} ${year} (${(stat.size / 1024).toFixed(1)} KB) -> ID: ${paper.id}`);
    }
  }

  // Also seed high-value sample questions for the AI and Q&A system
  console.log('Seeding model questions for OCM and BK papers...');
  const ocmPapers = await prisma.samplePaper.findMany({
    where: { subject: { code: 'OCM' } },
    take: 2
  });

  for (const p of ocmPapers) {
    const q1 = await prisma.question.create({
      data: {
        samplePaperId: p.id,
        questionNumber: 'Q.1',
        subQuestion: '(A)',
        questionText: "State Henri Fayol's 14 Principles of Management and explain any five in detail.",
        marks: 8,
        order: 1
      }
    });
    await prisma.answer.create({
      data: {
        questionId: q1.id,
        answerText: `**Henri Fayol's 14 Principles of Management:**\n\n1. **Division of Work:** Specialization increases output by making employees more efficient.\n2. **Authority and Responsibility:** Managers must be able to give orders, but responsibility is an essential counterpart.\n3. **Discipline:** Employees must obey and respect the rules of the organization.\n4. **Unity of Command:** Every employee should receive orders from only one superior.\n5. **Unity of Direction:** One head and one plan for a group of activities having the same objective.`,
        explanation: 'Maharashtra State Board Textbook Chapter 1: Principles of Management.',
        order: 1
      }
    });

    const q2 = await prisma.question.create({
      data: {
        samplePaperId: p.id,
        questionNumber: 'Q.4',
        subQuestion: 'Distinguish Between',
        questionText: 'Distinguish between District Commission, State Commission, and National Commission under Consumer Protection Act 2019.',
        marks: 4,
        order: 2
      }
    });
    await prisma.answer.create({
      data: {
        questionId: q2.id,
        answerText: `| Basis | District Commission | State Commission | National Commission |\n| :--- | :--- | :--- | :--- |\n| **Pecuniary Jurisdiction** | Up to Rs. 50 Lakhs | Rs. 50 Lakhs to Rs. 2 Crores | Exceeding Rs. 2 Crores |\n| **President** | District Judge / Qualified | High Court Judge / Qualified | Supreme Court Judge / Qualified |\n| **Territorial Limit** | Entire District | Entire State | Entire Nation |`,
        explanation: 'Consumer Protection Act 2019 key provisions.',
        order: 1
      }
    });
  }

  const bkPapers = await prisma.samplePaper.findMany({
    where: { subject: { code: 'BK' } },
    take: 2
  });

  for (const p of bkPapers) {
    const q1 = await prisma.question.create({
      data: {
        samplePaperId: p.id,
        questionNumber: 'Q.2',
        subQuestion: 'Final Accounts',
        questionText: 'Ramesh and Suresh are partners sharing profits and losses in the ratio 3:2. Prepare Trading and Profit & Loss Account and Balance Sheet.',
        marks: 12,
        order: 1
      }
    });
    await prisma.answer.create({
      data: {
        questionId: q1.id,
        answerText: `**Step-by-Step Mathematical Solution:**\n\n- Gross Profit: **Rs. 1,28,000**\n- Net Profit: **Rs. 1,05,000** (Ramesh: Rs. 63,000; Suresh: Rs. 42,000)\n- Balance Sheet Total: **Rs. 2,67,000**\n\n*Working notes: Depreciation on machinery @ 10% on Rs. 80,000 = Rs. 8,000.*`,
        explanation: 'Partnership Final Accounts with adjustments.',
        order: 1
      }
    });
  }

  console.log(`\nSUCCESS! Synced ${count} real sample papers from local Windows folder.`);
}

syncPapers()
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
