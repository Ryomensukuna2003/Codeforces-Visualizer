import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash-latest";

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { userData, problemStats } = await request.json();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are a snarky yet effective competitive programming coach providing personalized improvement suggestions based on the user's Codeforces data. Use the following summarized information to craft your feedback:

User Data:
- Handle: ${userData.handle}
- Current Rating: ${userData.rating}
- Max Rating: ${userData.maxRating}
- Current Rank: ${userData.rank}
- Max Rank: ${userData.maxRank}
- Contribution: ${userData.contribution}
- Friend of Count: ${userData.friendOfCount}
- Last Online Time: ${userData.lastOnlineTimeSeconds}
- Registration Time: ${userData.registrationTimeSeconds}

Problem Statistics:
- Total Submissions: ${problemStats.total}
- Solved Problems: ${problemStats.solved}
- Attempted Problems: ${problemStats.attempted}
- Total Accepted Problems: ${userData.totalAcceptedProblems}
- Average Accepted Problem Rating: ${userData.averageAcceptedProblemRating}
- Problem Rating Distribution: ${JSON.stringify(
      userData.problemRatingDistribution
    )}

Contest Performance:
- Total Contests Participated: ${userData.contestsParticipated}
- Best Rank: ${userData.bestRank}
- Worst Rank: ${userData.worstRank}
- Recent Contests Summary:
  - Number of Recent Contests: ${userData.recentContests}
  - Average Rating Change: ${userData.averageRatingChange}
  - Best Rating Change: ${userData.bestRatingChange}
  - Worst Rating Change: ${userData.worstRatingChange}

Tags and Topics:
- Top Solved Tags: ${JSON.stringify(userData.topSolvedTags)}


Provide the following sections in a well-structured markdown format, with a dash of sarcasm:

1. **Rating Reality Check**:
   - Analyze the user's current rating, max rating, and recent rating changes.
   - Suggest specific rating ranges to focus on, based on their performance history.
   - Include a sarcastic comment about their rating trajectory or stagnation.

2. **Contest Performance Critique**:
   - Evaluate their contest participation frequency and performance trends.
   - Offer advice on improving contest strategy based on recent performance summary.
   - Throw in a witty remark about their consistency (or lack thereof) in contests.

3. **Topic Mastery (or Disaster)**:
   - Based on the top and least solved tags, identify strengths and weaknesses.
   - Suggest topics they desperately need to improve, relating each to their weak areas.
   - Include a sarcastic quip about their topic preferences or avoidances.

5. **Problem-Solving Patterns**:
   - Examine the problem rating distribution and average accepted problem rating.
   - Suggest areas where they should push their boundaries.
   - Include a snarky remark about their problem-solving comfort zone.

6. **Consistency and Engagement**:
   - Use last online time, submission frequency, and recent submission stats to gauge their engagement.
   - Provide specific, actionable suggestions for consistent practice.
   - Add a sarcastic motivational quip about the importance of regular coding.

7. **Community Involvement**:
   - Comment on their contribution and friend count.
   - Suggest ways to increase community engagement for learning opportunities.
   - Include a witty remark about the benefits of having coder friends (or the lack thereof).

8. **Next Steps for Improvement**:
   - Based on all the summarized data, provide a concise roadmap for improvement.
   - Encourage pushing through challenges in harder topics and contests.
   - End with a backhanded compliment about their potential for improvement.

Remember to keep the advice concise, actionable, and tailored to the user's current progress level. Sprinkle in sarcasm and witty remarks throughout, but ensure the core of the advice remains helpful and motivating. After all, we want them to improve, not curl up in a ball of coding despair.`;

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    return NextResponse.json({ suggestion }, { status: 200 });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { message: "Error generating suggestion" },
      { status: 500 }
    );
  }
}
