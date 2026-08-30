import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai";

// Allow up to 60s for Gemini to respond (Vercel Pro; Hobby plan is capped at 10s)
export const maxDuration = 60;

const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Tried in order, first success wins.
 *
 * `gemini-flash-latest` used to be the only entry, and it is a rolling alias
 * onto whatever the newest flash preview is — which is exactly the model that
 * gets overloaded. It was returning 503 UNAVAILABLE ("high demand") on every
 * call, so the coach button had been failing in production. Pinned versions
 * first, the alias last as a backstop for when the pins are eventually retired.
 */
/**
 * `noThinking` is per-model on purpose: not every model accepts a zero thinking
 * budget. `gemini-3.6-flash` rejects `thinkingBudget: 0` with a 400, so sending
 * it there would turn a healthy fallback into a hard failure.
 */
const MODELS = [
  { name: "gemini-3.5-flash", noThinking: true },
  { name: "gemini-3.6-flash", noThinking: false },
  { name: "gemini-flash-latest", noThinking: false },
] as const;

/**
 * Thinking off where the model allows it. Measured against this exact prompt:
 * 18.1s with thinking (1135 thinking tokens on top of the answer) versus 10.8s
 * without — and the faster run produced *more* finished output, because none of
 * the budget went to deliberation. Writing seven sections of encouragement from
 * a table of numbers is not a reasoning task.
 */
function configFor(noThinking: boolean): GenerationConfig {
  const base = { temperature: 0.9, maxOutputTokens: 2048 };
  if (!noThinking) return base;
  // `thinkingConfig` postdates @google/generative-ai@0.21 (which Google has
  // since superseded with @google/genai), so it is absent from the SDK's types.
  // The SDK forwards `generationConfig` to the request body verbatim — verified
  // by intercepting the outgoing request — so the key still reaches the API.
  // The cast is about stale type definitions, not an unsupported field.
  return { ...base, thinkingConfig: { thinkingBudget: 0 } } as unknown as GenerationConfig;
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function POST(request: NextRequest) {
  if (!genAI) {
    return NextResponse.json(
      { error: "Gemini API key is not configured" },
      { status: 503 }
    );
  }

  try {
    const { userData, problemStats } = await request.json();
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

    // Walk the list rather than failing on the first overloaded model: a 503 on
    // the shared tier is transient and model-specific, and the next pin usually
    // answers immediately.
    //
    // Only an auth failure stops the walk. A 400 is NOT a reason to give up —
    // it is usually one model rejecting a config another accepts, and treating
    // it as fatal is what turned a working fallback into a 500.
    let lastError: unknown = null;

    for (const { name, noThinking } of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: name,
          generationConfig: configFor(noThinking),
        });
        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();
        if (!suggestion?.trim()) throw new Error(`${name} returned an empty response`);
        return NextResponse.json({ suggestion, model: name }, { status: 200 });
      } catch (error) {
        lastError = error;
        const status = (error as { status?: number })?.status;
        console.error(`[getsuggestion] ${name} failed:`, status ?? error);
        // A bad or unauthorised key fails identically everywhere.
        if (status === 401 || status === 403) break;
      }
    }

    throw lastError ?? new Error("No model produced a suggestion");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { message: "Error generating suggestion" },
      { status: 500 }
    );
  }
}
