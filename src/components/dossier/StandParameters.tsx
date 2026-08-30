"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAND_METRIC_DESCRIPTIONS, type StandRadarDatum } from "@/lib/stand-radar-metrics";
import { Label } from "./primitives";

const SEG_WIDTH = 5;
const SEG_GAP = 2;

function calcSegments(w: number) {
  return Math.max(4, Math.floor((w + SEG_GAP) / (SEG_WIDTH + SEG_GAP)));
}

/** Luminance step per score — red below 35 is urgency, not hue. */
function meterFill(value: number | null): string {
  if (value === null) return "bg-hair";
  if (value >= 60) return "bg-foreground";
  if (value >= 35) return "bg-tier-2";
  return "bg-red-500";
}

/** The Stand meter — 5px segments on a 2px pitch, filled to the score. */
export function SegmentedStatBar({
  value,
  label,
  description,
  className,
  fillClass = "bg-foreground",
  emptyClass = "bg-hair",
}: {
  /** `null` renders an empty track — the metric has no data behind it yet. */
  value: number | null;
  label: string;
  /** What the metric means. Folded into the accessible name, because the row's
      `title` attribute never reaches keyboard or screen-reader users. */
  description?: string;
  className?: string;
  fillClass?: string;
  emptyClass?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [segments, setSegments] = React.useState(0);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setSegments(calcSegments(el.getBoundingClientRect().width));
    const ro = new ResizeObserver(([entry]) => {
      setSegments(calcSegments(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filled =
    value === null ? 0 : Math.round((Math.min(100, Math.max(0, value)) / 100) * segments);

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full min-w-0 items-stretch gap-[2px]",
        segments === 0 && "invisible",
        className
      )}
      role="img"
      aria-label={`${label}: ${
        value === null ? "not enough data yet" : `${value} out of 100`
      }.${description ? ` ${description}` : ""}`}
    >
      {segments > 0 &&
        Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={cn("h-full min-w-0 flex-1", i < filled ? fillClass : emptyClass)}
          />
        ))}
    </div>
  );
}

function countdown(startSeconds: number, now: number): string {
  const left = startSeconds - Math.floor(now / 1000);
  if (left <= 0) return "live now";
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

/** `Codeforces Round 1053 (Div. 2)` -> `Div. 2`, falling back to the full name. */
function divOf(name: string): string {
  return /\(([^)]*Div[^)]*)\)/i.exec(name)?.[1] ?? name;
}

export type UpcomingContest = { id?: number; name: string; startTimeSeconds: number };

/** `Sat 3 Sep, 17:35` — enough to plan around without a second line. */
function startLabel(startSeconds: number): string {
  return new Date(startSeconds * 1000).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The stand parameters panel on the overview. The segmented bars carry the
 * readout; the radar itself is optional in this direction and is not shown.
 */
export function StandParameters({
  data,
  contests = [],
}: {
  data: StandRadarDatum[];
  /** Every scheduled contest, soonest first. The first one is the headline. */
  contests?: UpcomingContest[];
}) {
  // A live countdown needs a ticking clock; one minute is fine at this precision.
  const [now, setNow] = React.useState<number | null>(null);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [nextContest, ...rest] = contests;

  return (
    <>
    <div className="px-5 pb-4 pt-4">
      {data.map((row) => (
        <div
          key={row.metric}
          className="flex items-center gap-3 py-2"
          title={STAND_METRIC_DESCRIPTIONS[row.metric]}
        >
          <span className="w-[74px] shrink-0 text-meta text-muted-foreground">{row.metric}</span>
          <SegmentedStatBar
            value={row.value}
            label={row.metric}
            description={STAND_METRIC_DESCRIPTIONS[row.metric]}
            className="h-4 min-w-0 flex-1"
            fillClass={meterFill(row.value)}
          />
          <span className="w-7 shrink-0 text-right font-mono text-meta tabular-nums text-faint">
            {row.value ?? "—"}
          </span>
        </div>
      ))}

    </div>

      {/* The headline plus a way to see the rest — the whole schedule was
          already fetched, only the first one was ever shown. */}
      <div className="border-t border-hair">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <Label>Next contest</Label>
          {nextContest ? (
            <span className="truncate text-meta text-red-500">
              {divOf(nextContest.name)}
              {now !== null ? ` · ${countdown(nextContest.startTimeSeconds, now)}` : ""}
            </span>
          ) : (
            <span className="text-meta text-faint">none scheduled</span>
          )}
        </div>

        {rest.length ? (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="upcoming-contest-list"
              className="flex w-full items-center justify-between gap-3 border-t border-hair px-5 py-2.5 text-left transition-colors hover:bg-rowhover"
            >
              <Label>
                {open ? "Hide the rest" : `${rest.length} more scheduled`}
              </Label>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-3.5 w-3.5 text-faint transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>

            {open ? (
              <div id="upcoming-contest-list">
                {rest.map((c, i) => (
                  <a
                    key={c.id ?? `${c.name}-${i}`}
                    href={
                      c.id
                        ? `https://codeforces.com/contests/${c.id}`
                        : "https://codeforces.com/contests"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between gap-3 border-t border-hair px-5 py-2.5 transition-colors hover:bg-rowhover"
                  >
                    <span className="min-w-0 truncate text-meta text-muted-foreground">
                      {c.name}
                    </span>
                    <span className="shrink-0 font-mono text-label tabular-nums text-faint">
                      {startLabel(c.startTimeSeconds)}
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}
