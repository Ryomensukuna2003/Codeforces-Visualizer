import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function processSingleHeatMapData(
  allSubmissionsData: any
): { date: string; desktop: number }[] {
  let HeatMapData = allSubmissionsData.result.map((submission: any) => {
    return {
      x: submission.creationTimeSeconds,
      y: submission.problem.rating,
    };
  });
  const groupedByDate = HeatMapData.reduce((acc: any, curr: any) => {
    const date = new Date(curr.x * 1000).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {});

  const groupedHeatMapData = Object.keys(groupedByDate).map((date) => {
    return {
      date: date,
      desktop: groupedByDate[date],
    };
  });
  return groupedHeatMapData;
}

export const processRatings = (
  allRating: any,
  setBestRatingChange: Function,
  setWorstRatingChange: Function,
  setBestRank: Function,
  setWorstRank: Function,
  setAverageRatingChange: Function
) => {
  let totalRatingChange = 0;
  allRating.result.forEach(
    (element: { rank: number; oldRating: number; newRating: number }) => {
      if (element.rank) {
        const ratingChange = element.newRating - element.oldRating;
        totalRatingChange += ratingChange;
        setBestRatingChange((prev: number) => Math.max(prev, ratingChange));
        setWorstRatingChange((prev: number) => Math.min(prev, ratingChange));
        setBestRank((prev: number) => Math.min(prev, element.rank));
        setWorstRank((prev: number) => Math.max(prev, element.rank));
      }
    }
  );
  setAverageRatingChange(totalRatingChange / allRating.result.length);
};

export const processBarGraphData = (
  barGraphData: any,
  setAverageAcceptedProblemRating: Function,
  totalAcceptedProblems: number
) => {
  barGraphData?.forEach((element: { rating: number }) => {
    setAverageAcceptedProblemRating((prev: number) => prev + element.rating);
  });
  setAverageAcceptedProblemRating(
    (prev: number) => prev / totalAcceptedProblems
  );
};

export const processSubmissions = (
  allSubmissionsData: any,
  setTagStatistics: Function,
  setTotalAcceptedProblems: Function,
  uniqueProblems: Set<string>,
  ratingFreqMap: Map<number, number>
) => {
  let x: string[] = [];
  allSubmissionsData.result.forEach(
    (submission: {
      verdict: string;
      problem: { tags: string[]; rating: number; name: string };
    }) => {
      if (submission.verdict === "OK") {
        submission.problem.tags.forEach((tag) => {
          x.push(tag);
        });
      }
    }
  );
  x.sort();
  let count = 1;
  for (let i = 1; i < x.length; i++) {
    if (x[i] === x[i - 1]) {
      count++;
    } else {
      setTagStatistics((prev: any[]) => [...prev, { tag: x[i - 1], count }]);
      count = 1;
    }
  }

  allSubmissionsData.result.forEach(
    (submission: {
      verdict: string;
      problem: { rating: number; name: string };
    }) => {
      const problemKey = `${submission.problem.name}|${submission.problem.rating}`;
      if (submission.verdict === "OK" && !uniqueProblems.has(problemKey)) {
        setTotalAcceptedProblems((prev: number) => prev + 1);
        uniqueProblems.add(problemKey);
        const problemRating = submission.problem.rating;
        if (problemRating) {
          ratingFreqMap.set(
            problemRating,
            (ratingFreqMap.get(problemRating) || 0) + 1
          );
        }
      }
    }
  );
};

export const processRatingGraph = (allRating: any, ratingArr: any[]) => {
  allRating.result.forEach(
    (element: { contestName: string; newRating: number }) => {
      let x = {
        contestName: element.contestName,
        rating: element.newRating,
      };
      ratingArr.push(x);
    }
  );
};

export const processRatingFreqGraph = (
  ratingFreqMap: Map<number, number>,
  ratingFreq: any[]
) => {
  ratingFreqMap.forEach((count, rating) => {
    let x = {
      rating: rating,
      count: count,
    };
    ratingFreq.push(x);
  });
  ratingFreq.sort((a, b) => a.rating - b.rating);
};

export const getUpcomingContests = (contestData: any, now: number) => {
  return contestData.result
    .filter(
      (contest: { phase: string; startTimeSeconds: number }) =>
        contest.phase === "BEFORE" && contest.startTimeSeconds > now
    )
    .sort(
      (a: { startTimeSeconds: number }, b: { startTimeSeconds: number }) =>
        a.startTimeSeconds - b.startTimeSeconds
    )
    .slice(0, 5);
};

export const FetchUserData = async (handle: string) => {
  const [userInfoData, allSubmissionsData, allRating] = await Promise.all([
    axios
      .get(`https://codeforces.com/api/user.info?handles=${handle}`)
      .then((res) => res.data),
    axios
      .get(`https://codeforces.com/api/user.status?handle=${handle}&from=1`)
      .then((res) => res.data),
    axios
      .get(`https://codeforces.com/api/user.rating?handle=${handle}`)
      .then((res) => res.data),
  ]);
  if (userInfoData.status === "FAILED") {
    return {
      userInfoData: `${handle} is not Valid`,
      allSubmissionsData: null,
      allRating: null,
    };
  }
  return {
    userInfoData: userInfoData.result[0],
    allSubmissionsData,
    allRating,
  };
};

export const CompareRatingFrequencies = (
  user1RatingFreq: Map<number, number>,
  user2RatingFreq: Map<number, number>,
  user1: string,
  user2: string
): { rating: number; [key: string]: number }[] => {
  const allRatings = new Set<number>();

  // Collect all unique ratings from both users
  user1RatingFreq.forEach((_, rating) => allRatings.add(rating));
  user2RatingFreq.forEach((_, rating) => allRatings.add(rating));

  const result: { rating: number; [key: string]: number }[] = [];

  // Iterate over all unique ratings and create the array dynamically
  allRatings.forEach((rating) => {
    const user1Solved = user1RatingFreq.get(rating) || 0;
    const user2Solved = user2RatingFreq.get(rating) || 0;
    result.push({ rating, [user1]: user1Solved, [user2]: user2Solved });
  });

  // Sort the result by rating
  result.sort((a, b) => a.rating - b.rating);

  return result;
};

// Compare Rating Change Utils Start ------------------------------------------
export const CompareRatingChange = (
  user1RatingChangeData: Map<number, number>,
  user2RatingChangeData: Map<number, number>,
  user1: string,
  user2: string
): { date: number; [key: string]: number }[] => {
  const allDates = new Set<number>();
  const result: { date: number; [key: string]: number }[] = [];

  // Collect all unique dates from both users
  user1RatingChangeData.forEach((_, date) => allDates.add(date));
  user2RatingChangeData.forEach((_, date) => allDates.add(date));

  // Sort all dates in ascending order
  const sortedDates = Array.from(allDates).sort((a, b) => a - b);

  // Initialize cumulative ratings for both users
  let user1Rating = 0;
  let user2Rating = 0;

  // Iterate over all sorted dates and compute cumulative ratings
  sortedDates.forEach((date) => {
    if (user1RatingChangeData.has(date)) {
      user1Rating = user1RatingChangeData.get(date)!;
    }
    if (user2RatingChangeData.has(date)) {
      user2Rating = user2RatingChangeData.get(date)!;
    }

    result.push({
      date,
      [user1]: user1Rating,
      [user2]: user2Rating,
    });
  });

  return result;
};

// Compare Rating Change Utils End ------------------------------------------

// Compare HeatMapData Utils Start ------------------------------------------

export function processHeatMapData(allSubmissionsData: any, username: string) {
  if (allSubmissionsData?.result) {
    // Group submissions by date
    const groupedByDate = allSubmissionsData.result.reduce(
      (acc: Record<string, number>, submission: any) => {
        const date = new Date(submission.creationTimeSeconds * 1000)
          .toISOString()
          .split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    // Map grouped data to the final structure
    const ExtractedHeatMapData = Object.keys(groupedByDate).map((date) => ({
      date: date,
      [username]: groupedByDate[date],
    }));

    // Sort by date in ascending order
    ExtractedHeatMapData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return ExtractedHeatMapData;
  }

  console.dir("No result in allSubmissionsData, returning empty array");
  return [];
}

export const CompareHeatMapData = (
  user1HeatMapData: { date: string; [key: string]: number | string }[],
  user2HeatMapData: { date: string; [key: string]: number | string }[],
  user1: string,
  user2: string
) => {
  const allDates = new Set<string>();
  // Collect all unique dates from both users
  user1HeatMapData.forEach((data) => allDates.add(data.date));
  user2HeatMapData.forEach((data) => allDates.add(data.date));

  const result: { date: string; [key: string]: number | string }[] = [];

  // Iterate over all unique dates and create the array dynamically
  allDates.forEach((date) => {
    const user1Solved = user1HeatMapData.find((data) => data.date === date);
    const user2Solved = user2HeatMapData.find((data) => data.date === date);

    // If either user has data for this date, include it
    if (user1Solved || user2Solved) {
      result.push({
        date: date.toString(),
        [user1]: user1Solved ? user1Solved[user1] || 0 : 0,
        [user2]: user2Solved ? user2Solved[user2] || 0 : 0,
      });
    }
  });
  result.sort((a, b) => (a.date > b.date ? 1 : -1));
  return result;
};

// Compare HeatMapData Utils End ------------------------------------------
