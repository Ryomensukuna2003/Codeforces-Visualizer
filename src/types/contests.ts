/**
 * Types related to Codeforces contests and ratings
 */

/**
 * Rating information for a contest
 */
export interface Rating {
  contestName: string;
  rating: number;
}

/**
 * Upcoming contest information
 */
export interface UpcomingContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds: number;
}

/**
 * Rating change data for a single contest
 */
export interface RatingChange {
  contestName: string;
  ratingUpdateTimeSeconds: number;
  rank: number;
  oldRating: number;
  newRating: number;
  id: number;
}

/**
 * Tag-based problem statistics
 */
export interface TagStatistics {
  tag: string;
  count: number;
}
