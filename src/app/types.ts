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

export interface AboutUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  contribution?: number;
  friendOfCount?: number;
  avatar?: string;
}

export interface ProblemStats {
  total: number;
  solved: number;
  attempted: number;
}

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

export interface ProblemStats {
  total: number;
  solved: number;
  attempted: number;
}

export interface CodeforcesUserCardProps {
  AboutUser: AboutUser;
  problemStats: ProblemStats;
}

export interface ImprovementSuggestionProps {
  userData: CodeforcesUserData;
  problemStats: ProblemStats;
}

export interface Problem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating: number;
  tags: string[];
}

export interface ProblemStatistics {
  contestId: number;
  index: string;
  solvedCount: number;
}

export interface CombinedData {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating: number;
  tags: string[];
  solvedCount: number;
}

export interface RatingChange {
  contestName: string;
  ratingUpdateTimeSeconds: number;
  rank: number;
  oldRating: number;
  newRating: number;
  id: number;
}

export interface SubmissionsType {
  verdict: string;
  problem: any;
  contestId: number;
  programmingLanguage: string;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  id: string;
}


export interface UsernameContextType {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  Attempted:string[];
  setAttempted: React.Dispatch<React.SetStateAction<string[]>>;
}