/**
 * `cn()` merges Tailwind classes, and tailwind-merge only collapses classes it
 * can classify. The seven named type steps are custom, so without the extension
 * below it files `text-meta` under text-*colour* and drops the size whenever a
 * colour lands in the same call. Run: `node src/lib/cn.test.mjs`
 */
import assert from "node:assert/strict";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "title", "stat", "lead", "body", "meta", "label"] },
      ],
    },
  },
});

// The regression: a size and a colour must both survive.
assert.equal(twMerge("font-mono text-meta text-tier-2"), "font-mono text-meta text-tier-2");
assert.equal(twMerge("font-mono text-meta text-faint"), "font-mono text-meta text-faint");

// Sizes still collapse against each other, newest wins.
assert.equal(twMerge("text-meta text-body"), "text-body");

// Colours still collapse against each other.
assert.equal(twMerge("text-faint text-foreground"), "text-foreground");

console.log("cn: type steps survive a colour in the same merge — ok");
