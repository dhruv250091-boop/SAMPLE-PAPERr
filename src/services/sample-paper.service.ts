import prisma from '@/lib/prisma';

export interface PaperFilter {
  subjectCode?: string;
  year?: number;
  search?: string;
  answersOnly?: boolean;
  publishedOnly?: boolean;
}

export async function getPublishedSubjects() {
  return await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          samplePapers: {
            where: { isPublished: true }
          }
        }
      }
    }
  });
}

export async function getAllSubjects() {
  return await prisma.subject.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { samplePapers: true }
      }
    }
  });
}

export async function getSubjectByCode(code: string) {
  return await prisma.subject.findFirst({
    where: {
      code: {
        equals: code.toUpperCase()
      }
    },
    include: {
      samplePapers: {
        where: { isPublished: true },
        orderBy: { year: 'desc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              answers: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      }
    }
  });
}

export async function getSamplePapers(filters: PaperFilter = {}) {
  const whereClause: Record<string, unknown> = {};

  if (filters.publishedOnly !== false) {
    whereClause.isPublished = true;
  }

  if (filters.subjectCode) {
    whereClause.subject = {
      code: filters.subjectCode.toUpperCase()
    };
  }

  if (filters.year) {
    whereClause.year = filters.year;
  }

  if (filters.answersOnly) {
    whereClause.answerPdfUrl = {
      not: null
    };
  }

  if (filters.search) {
    whereClause.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } }
    ];
  }

  return await prisma.samplePaper.findMany({
    where: whereClause,
    orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    include: {
      subject: true,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          answers: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });
}

export async function getSamplePaperById(id: string) {
  return await prisma.samplePaper.findUnique({
    where: { id },
    include: {
      subject: true,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          answers: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });
}
