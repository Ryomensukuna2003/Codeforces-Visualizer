"use client";

import { useEffect, useMemo, useState } from "react";
import { Label, Notice, PageHeader } from "@/components/dossier/primitives";
import {
  FEEDBACK_CATEGORIES,
  HONEYPOT_FIELD,
  MESSAGE_MAX,
  MESSAGE_MIN,
  RATING_MAX,
  type FeedbackCategory,
} from "@/lib/feedback";
import { group } from "@/lib/dossier";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setCount(typeof d?.count === "number" ? d.count : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = message.trim();
  const remaining = MESSAGE_MAX - trimmed.length;
  const canSend = useMemo(
    () => Boolean(category) && trimmed.length >= MESSAGE_MIN && trimmed.length <= MESSAGE_MAX,
    [category, trimmed]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || status === "sending") return;

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating,
          message: trimmed,
          [HONEYPOT_FIELD]: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not send that note.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setCount((c) => (c === null ? c : c + 1));
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setCategory(null);
    setRating(null);
    setMessage("");
    setStatus("idle");
    setError(null);
  };

  if (status === "sent") {
    return (
      <>
        <PageHeader
          eyebrow="07 — Feedback"
          title="Noted"
          actions={
            <button
              type="button"
              onClick={reset}
              className="border border-rule px-3 py-2 text-meta text-muted-foreground transition-colors hover:bg-rowhover hover:text-foreground"
            >
              Leave another
            </button>
          }
        />
        <div className="border-b border-rule px-5 py-10">
          <p className="max-w-[60ch] text-lead text-foreground">
            Thanks — that went in anonymously.
          </p>
          <p className="mt-3 max-w-[60ch] text-body text-muted-foreground">
            Nothing was stored alongside it that could point back to you: no handle, no
            account, no IP address.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="07 — Feedback"
        title="What should change?"
        actions={
          count !== null ? (
            <span className="font-mono text-meta tabular-nums text-muted-foreground">
              {group(count)} {count === 1 ? "note" : "notes"} so far
            </span>
          ) : null
        }
      />

      <div className="border-b border-hair px-5 py-5">
        <p className="max-w-[70ch] text-body text-muted-foreground">
          Tell us what is wrong, slow, missing or confusing. Notes are anonymous — no
          handle, no account, no IP address is stored with them.
        </p>
      </div>

      <form onSubmit={submit}>
        {/* Category ---------------------------------------------------- */}
        <fieldset className="border-b border-hair px-5 py-5">
          <legend className="sr-only">What is your note about?</legend>
          <Label className="mb-3 block">What is it about?</Label>
          {/* One segmented control, not six floating buttons — they are a single
              choice, so they share edges. Red is for failure and urgency, so the
              selected state is the plain inverted fill the other tabs use. */}
          <div className="flex flex-wrap border border-field">
            {FEEDBACK_CATEGORIES.map((c, i) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={active}
                  className={cn(
                    "px-3 py-2 text-meta transition-colors",
                    i > 0 && "border-l border-field",
                    active
                      ? "bg-foreground font-medium text-background"
                      : "text-muted-foreground hover:bg-rowhover hover:text-foreground"
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Rating ------------------------------------------------------ */}
        <fieldset className="border-b border-hair px-5 py-5">
          <legend className="sr-only">Overall score</legend>
          <div className="mb-3 flex items-baseline justify-between">
            <Label>Overall, out of {RATING_MAX}</Label>
            <Label>optional</Label>
          </div>
          <div className="flex items-center gap-2">
            {/* One meter, not five floating cells — they fill left to right, so
                they share edges the way the Stand bars do. */}
            <div className="flex border border-field">
              {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  aria-label={`${n} out of ${RATING_MAX}`}
                  aria-pressed={rating !== null && n <= rating}
                  className={cn(
                    "h-8 w-10 transition-colors",
                    n > 1 && "border-l border-field",
                    rating !== null && n <= rating
                      ? "bg-foreground"
                      : "bg-track hover:bg-rowhover"
                  )}
                />
              ))}
            </div>
            <span className="ml-2 font-mono text-meta tabular-nums text-faint">
              {rating === null ? "—" : `${rating} / ${RATING_MAX}`}
            </span>
          </div>
        </fieldset>

        {/* Message ----------------------------------------------------- */}
        <div className="border-b border-hair px-5 py-5">
          <div className="mb-3 flex items-baseline justify-between">
            <Label>
              <label htmlFor="message">Your note</label>
            </Label>
            <span
              className={cn(
                "font-mono text-label tabular-nums",
                remaining < 0 ? "text-red-500" : "text-faint"
              )}
            >
              {trimmed.length < MESSAGE_MIN
                ? `${MESSAGE_MIN - trimmed.length} more to go`
                : `${group(remaining)} left`}
            </span>
          </div>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            maxLength={MESSAGE_MAX + 200}
            placeholder="The rating chart is hard to read on a phone…"
            className="w-full resize-y border border-field bg-transparent px-4 py-3 text-body text-foreground placeholder:text-faint focus:border-muted-foreground"
          />

          {/* Honeypot — off-screen rather than display:none so bots still find it. */}
          <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0">
            <label htmlFor={HONEYPOT_FIELD}>Website</label>
            <input
              id={HONEYPOT_FIELD}
              name={HONEYPOT_FIELD}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
        </div>

        {/* Submit ------------------------------------------------------ */}
        <div className="flex flex-wrap items-center gap-4 border-b border-rule px-5 py-5">
          <button
            type="submit"
            disabled={!canSend || status === "sending"}
            className="bg-foreground px-4 py-2.5 text-meta font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "sending" ? "Sending…" : "Send anonymously"}
          </button>
          {error ? (
            <span role="alert" className="text-meta text-red-500">
              {error}
            </span>
          ) : (
            <span className="text-meta text-faint">
              {canSend ? "Ready to send." : "Pick a topic and write a few words."}
            </span>
          )}
        </div>
      </form>

      {count === 0 ? <Notice>No notes yet. Yours would be the first.</Notice> : null}
    </>
  );
}
