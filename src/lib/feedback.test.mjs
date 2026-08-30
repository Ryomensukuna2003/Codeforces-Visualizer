/**
 * Self-check for the feedback validator — the one trust boundary in this
 * feature. Run with:  node src/lib/feedback.test.mjs
 *
 * Imports the real module (Node strips the types), so it exercises exactly the
 * code the API route runs. No test runner, no build step.
 */
import assert from "node:assert/strict";
import { MESSAGE_MAX, MESSAGE_MIN, validateFeedback } from "./feedback.ts";

const ok = (input) => validateFeedback(input);
const good = { category: "bug", message: "The rating chart overflows on mobile." };

// Accepts a well-formed note
assert.equal(ok(good).ok, true, "valid note should pass");
assert.equal(ok(good).value.rating, null, "rating defaults to null");
assert.equal(
  ok({ ...good, message: "   padded out to length   " }).value.message,
  "padded out to length",
  "message is trimmed"
);

// Category must be one we offer — no arbitrary strings reach the column
assert.equal(ok({ ...good, category: "'; DROP TABLE" }).ok, false, "unknown category rejected");
assert.equal(ok({ ...good, category: undefined }).ok, false, "missing category rejected");
assert.equal(ok({ ...good, category: 42 }).ok, false, "non-string category rejected");

// Length bounds, measured after trimming
assert.equal(ok({ ...good, message: "x".repeat(MESSAGE_MIN - 1) }).ok, false, "too short rejected");
assert.equal(ok({ ...good, message: "x".repeat(MESSAGE_MIN) }).ok, true, "min length accepted");
assert.equal(ok({ ...good, message: "x".repeat(MESSAGE_MAX) }).ok, true, "max length accepted");
assert.equal(ok({ ...good, message: "x".repeat(MESSAGE_MAX + 1) }).ok, false, "too long rejected");
assert.equal(ok({ ...good, message: "   " }).ok, false, "whitespace-only rejected");
assert.equal(ok({ ...good, message: 12345 }).ok, false, "non-string message rejected");

// Rating is optional, but bounded when present
assert.equal(ok({ ...good, rating: 1 }).value.rating, 1, "rating 1 accepted");
assert.equal(ok({ ...good, rating: 5 }).value.rating, 5, "rating 5 accepted");
assert.equal(ok({ ...good, rating: "" }).value.rating, null, "empty string means no rating");
assert.equal(ok({ ...good, rating: null }).value.rating, null, "null means no rating");
assert.equal(ok({ ...good, rating: 0 }).ok, false, "rating below range rejected");
assert.equal(ok({ ...good, rating: 6 }).ok, false, "rating above range rejected");
assert.equal(ok({ ...good, rating: 2.5 }).ok, false, "fractional rating rejected");
assert.equal(ok({ ...good, rating: "abc" }).ok, false, "non-numeric rating rejected");

// Only the three known fields survive — nothing else reaches Prisma
assert.deepEqual(
  Object.keys(ok({ ...good, isAdmin: true, id: "spoofed" }).value).sort(),
  ["category", "message", "rating"],
  "extra fields are dropped"
);

console.log("feedback validator: all checks passed");
