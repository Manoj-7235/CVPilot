import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { getAnalysisByIdAndUser, deleteAnalysis } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view this review.' },
        { status: 401 }
      );
    }

    const analysis = await getAnalysisByIdAndUser(params.id, user.id);
    if (!analysis) {
      return NextResponse.json(
        { error: 'Review not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch review.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete this review.' },
        { status: 401 }
      );
    }

    const deleted = await deleteAnalysis(params.id, user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Review not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    console.error('Error deleting review by ID:', error);
    return NextResponse.json({ error: 'Failed to delete review.' }, { status: 500 });
  }
}
