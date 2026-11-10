import { NextRequest, NextResponse } from 'next/server';
import { getSamplePaperById } from '@/services/sample-paper.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const paper = await getSamplePaperById(id);
    if (!paper || !paper.isPublished) {
      return NextResponse.json({ error: 'Sample paper not found' }, { status: 404 });
    }
    return NextResponse.json({ paper });
  } catch (err) {
    console.error('Error fetching sample paper:', err);
    return NextResponse.json({ error: 'Failed to fetch sample paper' }, { status: 500 });
  }
}
