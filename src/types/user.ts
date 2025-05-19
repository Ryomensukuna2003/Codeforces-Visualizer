/**
 * Core user information types used across the application
 */

import { ProblemRatingDistribution } from './problems';
import { TagStatistics } from './contests';

/**
 * Basic Codeforces user information
 */
export interface UserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  contribution?: number;
  friendOfCount?: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  titlePhoto?: string;
}

/**
 * Enhanced user data with additional calculated stats
 */
export interface CodeforcesUserData {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  contribution: number;
  friendOfCount: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  avatar?: string;
  problemRatingDistribution: ProblemRatingDistribution[];
  contestsParticipated: number;
  bestRank: number;
  worstRank: number;
  topSolvedTags: TagStatistics[];
  totalAcceptedProblems: number;
  averageAcceptedProblemRating: number;
  recentContests: number;
  averageRatingChange: number;
  bestRatingChange: number;
  worstRatingChange: number;
}

/**
 * Simplified user data for display in UI components
 */
export interface AboutUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  contribution?: number;
  friendOfCount?: number;
  avatar?: string;
}

/**
 * Context type for username management
 */
export interface UsernameContextType {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  Attempted: string[];
  setAttempted: React.Dispatch<React.SetStateAction<string[]>>;
}
