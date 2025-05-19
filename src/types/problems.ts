/**
 * Types related to Codeforces problems and submissions
 */

/**
 * Problem statistics including solved count
 */
export interface ProblemStats {
  total: number;
  solved: number;
  attempted: number;
}

/**
 * Individual problem from Codeforces API
 */
export interface Problem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating: number;
  tags: string[];
}

/**
 * Problem data with additional statistics
 */
export interface ProblemStatistics {
  contestId: number;
  index: string;
  solvedCount: number;
}

/**
 * Combined problem data with statistics
 */
export interface CombinedData {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating: number;
  tags: string[];
  solvedCount: number;
}

/**
 * Submission data from Codeforces API
 */
export interface Submissions {
  id: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    type: string;
    points?: number;
    rating?: number;
    tags: string[];
  };
  verdict: string;
  programmingLanguage: string;
}

/**
 * Extended submission type with additional details
 */
export interface SubmissionsType {
  verdict: string;
  problem: any;
  contestId: number;
  programmingLanguage: string;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  id: string;
}

/**
 * Distribution of problem ratings
 */
export interface ProblemRatingDistribution {
  rating: number;
  count: number;
}
