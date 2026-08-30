"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { NAV } from "@/lib/dossier";
import { Label } from "./primitives";

/**
 * The cover sheet of the dossier.
 *
 * What stood here before was a Radix dialog with `dismissable={username !== ""}`
 * — no close control — over a blank page, demanding a Codeforces handle before
 * it would say what it was for. A visitor without a handle to hand had no way
 * past it and nothing to read, and a crawler got a modal.
 *
 * This is deliberately not a marketing page. It says what the tool does, lists
 * what is inside, and asks for the one input it needs. Nothing here is new
 * vocabulary: the numerals, the rows and the rule are the same ones the sidebar
 * and every `PageHeader` already use, because this is the same document's cover
 * rather than a different kind of page.
 */
export function Landing() {
  const { setUsername } = useUsernameStore() as unknown as {
    setUsername: (username: string) => void;
  };
  const [handle, setHandle] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = handle.trim();
    // `setUsername` writes the handle into the URL and `DossierShell` fetches on
    // the change, so there is nothing else to kick off here.
    if (next) setUsername(next);
  };

  return (
    <div className="px-5 pb-16 pt-7">
      <Label caps className="mb-3 block font-display">
        Codeforces dossier
      </Label>

      <h1 className="max-w-[18ch] font-display text-title font-bold leading-none text-foreground sm:text-display">
        Read your Codeforces record.
      </h1>

      {/* The one accent rule on the page. Structural, not decorative: it marks
          the lead the way the verdict block on `/` is marked. */}
      <p className="mt-6 max-w-[62ch] border-l-2 border-primary pl-4 text-lead text-muted-foreground">
        Type a handle and this reads that account&apos;s public history from the
        Codeforces API — the rating curve against the rank bands, every
        submission by verdict and tag, coverage at each difficulty, and where any
        individual round went wrong.
      </p>

      <form onSubmit={submit} className="mt-10 max-w-[420px]">
        <FloatingLabelInput
          id="landing-handle"
          label="Handle"
          className="block caret-primary"
          style={{ caretShape: "block" } as React.CSSProperties}
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />
        <Button
          type="submit"
          className="mt-5 w-full bg-primary text-primary-foreground sm:w-auto"
        >
          View dossier
        </Button>
        <p className="mt-3 text-meta text-faint">
          No account, no sign-up. Everything is read from the public Codeforces
          API in your browser.
        </p>
      </form>

      {/* The same seven the sidebar numbers, in the same order, for the same
          reason: it is a fixed sequence people learn positionally. */}
      <div className="mt-14 border-t border-rule">
        <Label caps className="mb-0 block pt-6 font-display">
          What is inside
        </Label>
        <ul className="mt-4">
          {NAV.map((item) => (
            <li
              key={item.href}
              className="flex items-baseline gap-4 border-b border-rule py-3"
            >
              <span className="w-6 shrink-0 font-display text-meta text-faint">
                {item.num}
              </span>
              <span className="w-[124px] shrink-0 font-display text-body font-bold text-foreground">
                {item.label}
              </span>
              <span className="min-w-0 text-meta text-muted-foreground">
                {item.eyebrow}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
