/**
 * Shared contract for the feedback form.
 *
 * Both the page and the route import from here so the options a person can pick
 * and the rules the server enforces can never drift apart. The server validates
 * independently regardless — the client is a convenience, not a trust boundary.
 */

export const FEEDBACK_CATEGORIES = [
  { value: "design", label: "Look and layout" },
  { value: "data", label: "Numbers and charts" },
  { value: "performance", label: "Speed" },
  { value: "feature", label: "Something missing" },
  { value: "bug", label: "Something broken" },
  { value: "other", label: "Something else" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

const CATEGORY_VALUES = new Set<string>(FEEDBACK_CATEGORIES.map((c) => c.value));

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Bots fill every field they find; people never see this one. */
export const HONEYPOT_FIELD = "website";

export type FeedbackInput = {
  category?: unknown;
  rating?: unknown;
  message?: unknown;
};

export type ValidFeedback = {
  category: FeedbackCategory;
  rating: number | null;
  message: string;
};

export type ValidationResult =
  | { ok: true; value: ValidFeedback }
  | { ok: false; error: string };

/**
 * Validate a submission. Returns a message safe to show the person — it names
 * what to fix rather than describing the failure.
 */
export function validateFeedback(input: FeedbackInput): ValidationResult {
  const { category, rating, message } = input;

  if (typeof category !== "string" || !CATEGORY_VALUES.has(category)) {
    return { ok: false, error: "Pick what your note is about." };
  }

  if (typeof message !== "string") {
    return { ok: false, error: `Write at least ${MESSAGE_MIN} characters.` };
  }
  const trimmed = message.trim();
  if (trimmed.length < MESSAGE_MIN) {
    return { ok: false, error: `Write at least ${MESSAGE_MIN} characters.` };
  }
  if (trimmed.length > MESSAGE_MAX) {
    return { ok: false, error: `Keep it under ${MESSAGE_MAX} characters.` };
  }

  let cleanRating: number | null = null;
  if (rating !== null && rating !== undefined && rating !== "") {
    const n = Number(rating);
    if (!Number.isInteger(n) || n < RATING_MIN || n > RATING_MAX) {
      return { ok: false, error: `A score runs from ${RATING_MIN} to ${RATING_MAX}.` };
    }
    cleanRating = n;
  }

  return {
    ok: true,
    value: { category: category as FeedbackCategory, rating: cleanRating, message: trimmed },
  };
}
