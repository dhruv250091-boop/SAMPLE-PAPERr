import { NextResponse } from 'next/server';
import { getPublishedSubjects } from '@/services/sample-paper.service';

export async function GET() {
  try {
    const subjects = await getPublishedSubjects();
    return NextResponse.json({ subjects });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
