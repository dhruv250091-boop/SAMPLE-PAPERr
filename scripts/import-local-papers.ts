import path from 'path';
import { executeSamplePaperImport, scanLocalDirectory } from '../src/services/importer.service';
import prisma from '../src/lib/prisma';

async function main() {
  const sourceFolder = path.join(process.cwd(), 'Sample papers');
  console.log(`\n======================================================`);
  console.log(`IMPORTING LOCAL SAMPLE PAPERS FROM:`);
  console.log(`${sourceFolder}`);
  console.log(`======================================================\n`);

  // Step 1: Scan & Inventory
  console.log('1. Scanning source directory...');
  const inventory = await scanLocalDirectory(sourceFolder);

  console.log(`Found ${inventory.totalDiscoveredFiles} PDF files.`);
  console.log(`Total storage size: ${inventory.totalSizeFormatted}`);
  console.log('Subject Breakdown:', inventory.subjectBreakdown);
  console.log('Year Breakdown:', inventory.yearBreakdown);
  console.log(`Detected duplicates: ${inventory.duplicatesCount}`);

  // Step 2: Execute Import
  console.log('\n2. Executing persistent import into permanent public storage...');
  const { results } = await executeSamplePaperImport(sourceFolder);

  console.log('\n======================================================');
  console.log('IMPORT EXECUTION COMPLETED');
  console.log('======================================================');
  console.log(`Total Scanned: ${results.totalScanned}`);
  console.log(`Successfully Imported: ${results.importedCount}`);
  console.log(`Skipped Duplicates: ${results.skippedDuplicates}`);
  console.log(`Failed: ${results.failedCount}`);
  if (results.errors.length > 0) {
    console.log('Errors:', results.errors);
  }
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
