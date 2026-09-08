import { AnalysisResult, ReviewHistory } from '../types';

/**
 * Save an analysis result directly to the server-side SQLite database
 */
export async function saveReview(result: AnalysisResult): Promise<boolean> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
      credentials: 'include',
    });

    if (!res.ok) {
      console.warn('Failed to save review to server:', await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving review to database:', error);
    return false;
  }
}

/**
 * Fetch all review history entries belonging to the authenticated user from the database
 */
export async function getReviews(): Promise<ReviewHistory[]> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews from database:', error);
    return [];
  }
}

/**
 * Fetch a single full analysis result by ID belonging to the authenticated user
 */
export async function getReviewById(id: string): Promise<AnalysisResult | null> {
  try {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.analysis || null;
  } catch (error) {
    console.error('Error fetching review from database:', error);
    return null;
  }
}

/**
 * Delete a review by ID belonging to the authenticated user
 */
export async function deleteReview(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    return res.ok;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

/**
 * Clear all reviews belonging to the authenticated user
 */
export async function clearAllReviews(): Promise<boolean> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'DELETE',
      credentials: 'include',
    });

    return res.ok;
  } catch (error) {
    console.error('Error clearing reviews:', error);
    return false;
  }
}
