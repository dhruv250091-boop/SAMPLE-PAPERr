import fs from 'fs';
import path from 'path';

export interface PaperFileMeta {
  id: string;
  year: number;
  month?: string | null;
  subject?: { code: string; name?: string } | null;
  importedFiles?: Array<{ originalFilename?: string | null; sourcePath?: string | null }> | null;
}

export function findPaperFileOnDisk(paper: PaperFileMeta): string | null {
  const imp = paper.importedFiles && paper.importedFiles.length > 0 ? paper.importedFiles[0] : null;

  // 1. If direct sourcePath exists, use it
  if (imp?.sourcePath && fs.existsSync(imp.sourcePath)) {
    return imp.sourcePath;
  }

  const code = paper.subject?.code?.toUpperCase() || '';
  const monthLower = paper.month ? paper.month.toLowerCase() : '';
  const filenameVariants = [
    imp?.originalFilename,
    monthLower ? `${monthLower} ${paper.year}.pdf` : null,
    monthLower ? `${monthLower} ${paper.year.toString().slice(-2)}.pdf` : null,
    monthLower ? `${monthLower}-${paper.year}.pdf` : null,
    `${paper.year}.pdf`
  ].filter(Boolean) as string[];

  const folderVariants = [
    code,
    code.toLowerCase(),
    paper.subject?.name,
    code === 'ECO' ? 'economic' : null,
    code === 'SP' ? 'SECRETARIAL PRACTICE' : null,
    code === 'ENG' ? 'english' : null,
    code === 'BK' ? 'BK' : null,
    code === 'OCM' ? 'OCM' : null
  ].filter(Boolean) as string[];

  const baseDirs = [
    path.join(process.cwd(), 'Sample papers', 'sample paper'),
    path.join(process.cwd(), 'Sample papers'),
    path.join(process.cwd(), 'public', 'sample-papers'),
    path.join(process.cwd(), 'public')
  ];

  for (const base of baseDirs) {
    for (const folder of folderVariants) {
      for (const fn of filenameVariants) {
        const candidate = path.join(base, folder, fn);
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  for (const base of baseDirs) {
    for (const fn of filenameVariants) {
      const candidate = path.join(base, fn);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}
