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
    const prompt = `You are a snarky yet encouraging competitive programming coach who provides **personalized improvement suggestions** based on the user's Codeforces data. Your tone should be witty, slightly sarcastic, but never demotivating — especially for users around or above Expert level (1700+). Celebrate their achievements, push them further, and avoid harsh criticism.

Use the following summarized information to craft your feedback:

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

Provide the following sections in a well-structured markdown format, with playful humor:

1. **Rating Reality Check**:
   - Reflect on the user's current and max ratings.
   - Encourage pushing beyond their current level — especially if they're Expert or close.
   - Replace harsh sarcasm with witty praise if the rating is already solid (1700+).

2. **Contest Performance Overview**:
   - Discuss contest frequency and rating trends.
   - Provide motivating advice for consistency and prep.
   - Avoid roasting early contests if they've improved since.

3. **Topic Mastery (or Mystery)**:
   - Highlight strong tags and gently call out weak ones.
   - Suggest improvement areas with playful remarks, not jabs.

4. **Problem-Solving Patterns**:
   - Evaluate their comfort zone via rating distribution.
   - Motivate them to stretch their range with humor.

5. **Consistency and Activity**:
   - Use recent activity to recommend a practice rhythm.
   - Lightly joke about long gaps without guilt-tripping.

6. **Community Vibes**:
   - Mention contribution and friend count.
   - Suggest ways to engage more, with positive tone.

7. **Next Steps for Improvement**:
   - Provide a clear, motivating roadmap forward.
   - End on a confident, cheeky note about their potential.

Make sure the tone is always uplifting, even when teasing. You're a coach, not a bully — and you believe every user has what it takes to level up with the right push.
`;

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
