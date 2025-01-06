import { processHeatMapData } from "./utils";

export const ParseData = (
    userInfoData: any,
    allSubmissionsData: any,
    allRating: any,
    username: string
) => {
    let RatingFrequency: Map<number, number> = new Map();
    let RatingChangeData:Map<string,number> = new Map();

    // Problem Solved of Rating Processing
    allSubmissionsData.result.forEach((submission: any) => {
        if (submission.verdict === "OK") {
            const rating = submission.problem.rating;
            if (rating) {
                RatingFrequency.set(rating, (RatingFrequency.get(rating) || 0) + 1);
            }
        }
    });




    allRating.result.forEach((contest:any)=>{
        const ratingUpdateTimeISO = new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString();
        RatingChangeData.set(ratingUpdateTimeISO,contest.newRating);
    })

    // HeatMapData Processing
    let HeatMapData = processHeatMapData(allSubmissionsData,username);
    
    const userData = {
        handle: userInfoData.handle,
        rating: userInfoData.rating,
        maxRating: userInfoData.maxRating,
        rank: userInfoData.rank,
        contribution: userInfoData.contribution,
        friendOfCount: userInfoData.friendOfCount,
        avatar: userInfoData.titlePhoto,
        problemSolved: allSubmissionsData.result.length,
        contestsParticipated: allRating.result.length,
        RatingFrequency: RatingFrequency,
        HeatMapData: HeatMapData,
        RatingChangeData:RatingChangeData
    };
    return userData;
};
