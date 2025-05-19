/**
 * Component prop types for the application
 */

import { CodeforcesUserData, AboutUser } from './user';
import { ProblemStats, Submissions } from './problems';
import { UpcomingContest } from './contests';

/**
 * Props for CodeforcesUserCard component
 */
export interface CodeforcesUserCardProps {
  userInfo: CodeforcesUserData;
  problemStats: ProblemStats;
}

/**
 * Props for ImprovementSuggestion component
 */
export interface ImprovementSuggestionProps {
  userData: CodeforcesUserData;
  problemStats: ProblemStats;
}

/**
 * Props for Upcoming_Contest component
 */
export interface UpcomingContestProps {
  upcomingContest: UpcomingContest[];
}

/**
 * Props for RecentSubmissions component
 */
export interface RecentSubmissionsProps {
  submissions: Submissions[];
}

/**
 * Props for charts and graphs
 */
export interface ChartProps {
  data: any[];
}
