import { useEffect } from "react";
import { processHeatMapData } from "./utils";
// Types for better type safety
interface UserSubmission {
    verdict: string;
    problem: {
        rating?: number;
        name: string;
        tags?: string[];
    };
    creationTimeSeconds: number;
}

interface UserRating {
    contestName: string;
    newRating: number;
    oldRating: number;
    rank: number;
    ratingUpdateTimeSeconds: number;
}

interface UserInfo {
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    contribution?: number;
    friendOfCount?: number;
    titlePhoto?: string;
}

interface ParsedUserData {
    handle: string;
    rating: number | null;
    maxRating: number | null;
    rank: string | null;
    contribution: number | null;
    friendOfCount: number | null;
    avatar: string | null;
    problemSolved: number;
    contestsParticipated: number;
    RatingFrequency: Map<number, number>;
    HeatMapData: Array<{ date: string;[key: string]: number | string }>;
    RatingChangeData: Map<string, number>;
}

export const ParseData = (
    userInfoData: UserInfo,
    allSubmissionsData: { result?: UserSubmission[] },
    allRating: { result?: UserRating[] },
    username: string
): ParsedUserData | null => {
    // Early validation
    if (!userInfoData?.handle) return null;
    if (!allSubmissionsData?.result || !Array.isArray(allSubmissionsData.result)) return null;
    if (!allRating?.result || !Array.isArray(allRating.result)) return null;

    const RatingFrequency: Map<number, number> = new Map();
    const RatingChangeData: Map<string, number> = new Map();

    // Process valid submissions
    const validSubmissions = allSubmissionsData.result.filter(
        submission => submission?.verdict === "OK" && submission?.problem
    );

    // Process ratings with validation
    validSubmissions.forEach(submission => {
        if (submission.problem.rating) {
            RatingFrequency.set(
                submission.problem.rating,
                (RatingFrequency.get(submission.problem.rating) || 0) + 1
            );
        }
    });

    // Process rating changes with validation
    allRating.result.forEach(contest => {
        if (contest?.ratingUpdateTimeSeconds) {
            try {
                const ratingUpdateTimeISO = new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString();
                RatingChangeData.set(ratingUpdateTimeISO, contest.newRating);
            } catch (error) {
                console.error("Invalid date conversion:", error);
            }
        }
    });

    // Process heatmap data with validation
    const HeatMapData = processHeatMapData(
        { result: allSubmissionsData.result },
        username
    );


    return {
        handle: userInfoData.handle,
        rating: userInfoData.rating || null,
        maxRating: userInfoData.maxRating || null,
        rank: userInfoData.rank || null,
        contribution: userInfoData.contribution || null,
        friendOfCount: userInfoData.friendOfCount || null,
        avatar: userInfoData.titlePhoto || null,
        problemSolved: validSubmissions.length,
        contestsParticipated: allRating.result.length,
        RatingFrequency,
        HeatMapData,
        RatingChangeData
    };
};

// Enhanced CompareHeatMapData with better type safety and validation
export const CompareHeatMapData = (
    user1HeatMapData: { date: string;[key: string]: number | string }[],
    user2HeatMapData: { date: string;[key: string]: number | string }[],
    user1: string,
    user2: string
): { date: string;[key: string]: number | string }[] => {
    if (!Array.isArray(user1HeatMapData) || !Array.isArray(user2HeatMapData)) {
        return [];
    }

    const allDates = new Set<string>();
    const result: { date: string;[key: string]: number | string }[] = [];

    // Safely collect dates
    user1HeatMapData.forEach(data => {
        if (data?.date) allDates.add(data.date);
    });
    user2HeatMapData.forEach(data => {
        if (data?.date) allDates.add(data.date);
    });

    // Process dates with validation
    allDates.forEach(date => {
        const user1Solved = user1HeatMapData.find(data => data.date === date);
        const user2Solved = user2HeatMapData.find(data => data.date === date);

        if (user1Solved?.[user1] !== undefined && user2Solved?.[user2] !== undefined) {
            result.push({
                date,
                [user1]: user1Solved[user1],
                [user2]: user2Solved[user2]
            });
        }
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
};