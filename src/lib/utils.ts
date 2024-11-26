import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils.ts
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
  setAverageAcceptedProblemRating((prev: number) => prev / totalAcceptedProblems);
};

export const processSubmissions = (
  allSubmissionsData: any, 
  setTagStatistics: Function, 
  setTotalAcceptedProblems: Function,
  uniqueProblems: Set<string>,
  ratingFreqMap: Map<number, number>
) => {
  let x: string[] = [];
  allSubmissionsData.result.forEach((submission: { verdict: string; problem: { tags: string[]; rating: number; name: string } }) => {
    if (submission.verdict === "OK") {
      submission.problem.tags.forEach((tag) => {
        x.push(tag);
      });
    }
  });
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

  allSubmissionsData.result.forEach((submission: { verdict: string; problem: { rating: number; name: string } }) => {
    const problemKey = `${submission.problem.name}|${submission.problem.rating}`;
    if (submission.verdict === "OK" && !uniqueProblems.has(problemKey)) {
      setTotalAcceptedProblems((prev: number) => prev + 1);
      uniqueProblems.add(problemKey);
      const problemRating = submission.problem.rating;
      if (problemRating) {
        ratingFreqMap.set(problemRating, (ratingFreqMap.get(problemRating) || 0) + 1);
      }
    }
  });
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

export const processRatingFreqGraph = (ratingFreqMap: Map<number, number>, ratingFreq: any[]) => {
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


export function processHeatMapData(allSubmissionsData: any): { date: string; desktop: number }[] {
  let HeatMapData= allSubmissionsData.result.map((submission:any) => {
    return {
      x: submission.creationTimeSeconds,
      y: submission.problem.rating,
      };
  });
  const groupedByDate = HeatMapData.reduce((acc: any, curr: any) => {
    const date = new Date(curr.x * 1000).toISOString().split('T')[0];
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