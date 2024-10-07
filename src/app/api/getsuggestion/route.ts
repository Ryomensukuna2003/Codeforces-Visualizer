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
    console.log(userData.barGraphData);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are a competitive programming coach providing personalized improvement suggestions based on the user's Codeforces data. Use the information below to guide your feedback:
    Handle: ${userData.handle}
    Rating: ${userData.rating}
    Rank: ${userData.rank}
    Solved Problems: ${problemStats.solved}
    Attempted Problems: ${problemStats.attempted}
    Submissions: ${problemStats.total}
    Problem Distribution by Rating: ${userData.barGraphData}
 Provide the following sections in a well-structured markdown format:

1. **Problem Rating Focus**:
   - Analyze the problem ratings where the user has solved fewer problems.
   - Suggest specific rating ranges (e.g., 1300-1500, 1600-1800) where they should focus to improve their overall rating.
   
2. **Topic Recommendations**:
   - Based on the user's performance, suggest competitive programming topics (e.g., dynamic programming, graphs, data structures) that they should focus on.
   - Relate each topic to their weak rating areas. For example, if the user struggles with problems rated 1600+, recommend more advanced topics like "Segment Trees" or "Dynamic Programming on Trees".
   
3. **Consistency Advice**:
   - Evaluate the user's consistency based on the total vs. solved problems.
   - Provide specific suggestions for practicing regularly (e.g., solve at least 5 problems each week from the 1600-1800 range).
   
4. **Learning from Mistakes**:
   - Identify areas where the user has attempted many problems but solved few.
   - Recommend reviewing those problem types and topics. Suggest reattempting the hardest problems they failed to solve and learning from editorial solutions.

5. **Next Steps**:
   - Encourage the user to push through challenges in harder topics.
   - Recommend participating in more contests (e.g., at least 2 per month) and tracking their progress.
   

Ensure the advice is concise, actionable, and tailored to the user's current progress level and be a little bit sarcastic too 😉.`;

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
