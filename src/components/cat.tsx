"use client";

/**
 * The sleeping oneko.
 *
 * The sprite sheet's sleep cycle is the two frames at x = -64px, alternating on
 * a 1s step. This used to be set through an inline `animation: sleepingCat …`,
 * but no `sleepingCat` keyframe was ever defined — Tailwind declares the cycle
 * as `oneko`, and inline styles can't reference a Tailwind keyframe that no
 * utility emits. The cat has been sitting on a single static frame. Using the
 * `animate-oneko` utility both emits the keyframes and applies them.
 */
const SleepingCat = () => (
  <div
    aria-hidden
    className="h-8 w-8 animate-oneko bg-[url('https://raw.githubusercontent.com/adryd325/oneko.js/14bab15a755d0e35cd4ae19c931d96d306f99f42/oneko.gif')] [image-rendering:pixelated]"
  />
);

export default SleepingCat;
