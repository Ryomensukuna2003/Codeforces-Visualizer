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

export interface Rating {
  contestName: string;
  rating: number;
}

export interface ProblemRatingDistribution {
  rating: number;
  count: number;
}

export interface UpcomingContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds: number;
}

export interface TagStatistics {
  tag: string;
  count: number;
}