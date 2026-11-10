import { NextRequest, NextResponse } from 'next/server';
import { getSamplePapers } from '@/services/sample-paper.service';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const subjectCode = url.searchParams.get('subject') || undefined;
  const yearStr = url.searchParams.get('year');
  const search = url.searchParams.get('search') || undefined;
  const answersOnly = url.searchParams.get('answers') === 'true';

  const year = yearStr ? parseInt(yearStr, 10) : undefined;

  try {
    const papers = await getSamplePapers({
      subjectCode,
      year: isNaN(year as number) ? undefined : year,
      search,
      answersOnly,
      publishedOnly: true
    });

    return NextResponse.json({ papers });
  } catch (err) {
    console.error('Error fetching sample papers:', err);
    return NextResponse.json({ error: 'Failed to retrieve sample papers' }, { status: 500 });
  }
}
