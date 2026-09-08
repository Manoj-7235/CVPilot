import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { getAnalysesByUserId, saveAnalysis, clearAnalysesByUserId } from '@/lib/db';
import { AnalysisResult } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view your reviews.' },
        { status: 401 }
      );
    }

    const reviews = await getAnalysesByUserId(user.id);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to save your review.' },
        { status: 401 }
      );
    }

    const analysis = (await request.json()) as AnalysisResult;
    if (!analysis || !analysis.id) {
      return NextResponse.json(
        { error: 'Invalid analysis payload.' },
        { status: 400 }
      );
    }

    // Strictly enforce ownership to authenticated user
    analysis.userId = user.id;

    await saveAnalysis(analysis, user.id);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error saving review:', error);
    return NextResponse.json({ error: 'Failed to save review.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to clear reviews.' },
        { status: 401 }
      );
    }

    await clearAnalysesByUserId(user.id);
    return NextResponse.json({ success: true, message: 'All reviews cleared.' });
  } catch (error) {
    console.error('Error clearing reviews:', error);
    return NextResponse.json({ error: 'Failed to clear reviews.' }, { status: 500 });
  }
}
