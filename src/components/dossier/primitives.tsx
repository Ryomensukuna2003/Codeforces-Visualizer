"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared dossier chrome.
 *
 * Three rules hold the whole system together:
 *  - Type comes from the seven named steps in tailwind.config, never ad-hoc px.
 *  - Text uses three tiers: foreground / muted-foreground / faint. Rule colours
 *    are never used for text.
 *  - Rules divide sections (`border-rule`) and rows (`border-hair`). Columns are
 *    aligned, not fenced — vertical dividers are opt-in and rare.
 */

/* Labels ------------------------------------------------------------------ */

/**
 * The one label treatment. Uppercase + tracking is reserved for the two places
 * it genuinely aids scanning — the page eyebrow and table column headers — and
 * is opted into with `caps`.
 */
export function Label({
  children,
  caps,
  className,
}: {
  children: React.ReactNode;
  caps?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-label font-medium text-faint",
        caps && "uppercase",
        className
      )}
    >
      {children}
    </span>
  );
}

/* Page header ------------------------------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-rule px-5 pb-6 pt-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <Label caps className="mb-3 block font-display">
            {eyebrow}
          </Label>
          <h1 className="font-display text-title font-bold text-foreground">{title}</h1>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* Stat strip -------------------------------------------------------------- */

export type Stat = {
  label: string;
  value: React.ReactNode;
  /** Red — reserved for failure and urgency (worst drop, time wasted). */
  accent?: boolean;
};

export function StatStrip({
  items,
  children,
}: {
  items: Stat[];
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-stretch border-b border-rule">
      {items.map((s) => (
        <div key={s.label} className="min-w-[150px] flex-1 px-5 py-4">
          <Label className="mb-2.5 block">{s.label}</Label>
          <div
            className={cn(
              "font-display text-stat font-bold tabular-nums",
              s.accent ? "text-red-500" : "text-foreground"
            )}
          >
            {s.value}
          </div>
        </div>
      ))}
      {children}
    </div>
  );
}

/* Section caption --------------------------------------------------------- */

/**
 * Names a panel. Deliberately not numbered: these panels sit side by side and
 * are not a sequence, so `Fig. 1 / 2 / 3` decorated rather than informed.
 */
export function FigCaption({
  children,
  aside,
  className,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[44px] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-hair px-5 py-2.5",
        className
      )}
    >
      <span className="text-meta font-medium text-muted-foreground">{children}</span>
      {aside ? <span className="text-label text-faint">{aside}</span> : null}
    </div>
  );
}

/* Table ------------------------------------------------------------------- */

/** Column headers stay put on 100-row pages. */
export function THead({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex items-stretch border-b border-rule bg-inset">
      {children}
    </div>
  );
}

export function TH({
  children,
  className,
  first,
}: {
  children: React.ReactNode;
  className?: string;
  first?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center py-2.5 text-label font-medium uppercase text-faint",
        first ? "flex-1 px-5" : "shrink-0 justify-center px-2",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Body cell matching a `<TH>` — pass the same width class.
 *
 * There is no `divided` prop: it drew a LEFT seam and every call site cancelled
 * it to draw a right one instead, so the one divided column in the system now
 * says so in its own className.
 */
export function TD({
  children,
  className,
  first,
}: {
  children: React.ReactNode;
  className?: string;
  first?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center",
        // Data cells never wrap — a two-line date in a one-line row reads as a
        // layout bug, not as information.
        first ? "min-w-0 flex-1 px-5" : "shrink-0 justify-center whitespace-nowrap px-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export const rowClass =
  "flex items-stretch border-b border-hair transition-colors hover:bg-rowhover";

/* Chips ------------------------------------------------------------------- */

export function TagChip({
  children,
  flagged,
  className,
}: {
  children: React.ReactNode;
  flagged?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap border px-1.5 py-px text-label lowercase tracking-normal",
        flagged ? "border-flag-rule text-flag-fg" : "border-chip text-faint",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Tags on one line. Uncapped tag lists were wrapping rows to two lines with up
 * to six chips, which is most of what made the tables feel noisy.
 */
export function TagList({
  tags,
  max = 2,
  flagged,
  className,
}: {
  tags: string[];
  max?: number;
  flagged?: boolean;
  className?: string;
}) {
  if (!tags?.length) return null;
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;
  return (
    <div className={cn("flex items-center gap-1.5 overflow-hidden", className)}>
      {shown.map((t) => (
        <TagChip key={t} flagged={flagged}>
          {t}
        </TagChip>
      ))}
      {rest > 0 ? (
        <span className="shrink-0 text-label text-faint" title={tags.join(", ")}>
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

/* Tabs -------------------------------------------------------------------- */

/** Boxed segmented control — `ALL / DIV 2 / DIV 3 / EDU`, `Recent / Top voted / …`. */
export function BoxTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex border border-field">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          aria-pressed={opt === value}
          className={cn(
            "px-3 py-2 text-meta transition-colors",
            i > 0 && "border-l border-field",
            opt === value
              ? "bg-foreground font-medium text-background"
              : "text-muted-foreground hover:bg-rowhover hover:text-foreground"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* Filter-row pieces ------------------------------------------------------- */

export function FilterCell({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // `items-stretch`, no vertical padding: the row's height comes from the
        // tab strip beside it and every control fills it, so nothing sits as a
        // small box floating inside a larger one. The first cell carries the
        // page rail; the rest keep the tighter interior gutter.
        "flex items-stretch gap-2 pl-4 pr-4 text-meta text-muted-foreground",
        "border-l border-hair first:border-l-0 first:pl-5",
        className
      )}
    >
      {label ? <span className="flex items-center text-faint">{label}</span> : null}
      {children}
    </div>
  );
}

/** `rating [800] to [3200]` — the from/to pair reused by /submissions and /problems. */
export function RatingRange({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: number;
  to: number;
  onFrom: (n: number) => void;
  onTo: (n: number) => void;
}) {
  // `self-stretch` + `border-x`: the field's top and bottom edges are the row's
  // own rules, so it reads as a cell in the strip rather than a chip inside it.
  // The side hairlines are what say "you can type here".
  const field =
    "w-[76px] self-stretch border-x border-field bg-transparent px-2 text-center font-mono text-meta tabular-nums text-foreground focus:border-x-muted-foreground";
  return (
    <>
      <span className="flex items-center text-faint">rating</span>
      <input
        type="number"
        step={100}
        value={from}
        aria-label="Minimum rating"
        onChange={(e) => onFrom(Number(e.target.value))}
        className={field}
      />
      <span className="flex items-center text-faint">to</span>
      <input
        type="number"
        step={100}
        value={to}
        aria-label="Maximum rating"
        onChange={(e) => onTo(Number(e.target.value))}
        className={field}
      />
    </>
  );
}

/* Pagination -------------------------------------------------------------- */

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const btn =
    "flex flex-1 items-center justify-center gap-2 py-4 text-meta transition-colors enabled:text-muted-foreground enabled:hover:bg-rowhover enabled:hover:text-foreground disabled:text-faint/50";
  return (
    <div className="flex items-stretch border-b border-rule">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className={btn}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Previous
      </button>
      <span className="flex items-center px-8 font-mono text-meta tabular-nums text-faint">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className={btn}
      >
        Next <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* Empty / loading --------------------------------------------------------- */

/**
 * The three states an empty panel can be in. They were being collapsed into one
 * line that told people to "set a handle in the sidebar" while their handle was
 * set and the fetch was still in flight.
 */
export function EmptyOrLoading({
  loading,
  hasHandle,
  filtered,
  empty,
}: {
  loading: boolean;
  hasHandle: boolean;
  /** Shown when there is data but the filters exclude all of it. */
  filtered?: React.ReactNode;
  /** Shown when the handle loaded and genuinely has nothing here. */
  empty: React.ReactNode;
}) {
  if (loading) return <Notice>Reading Codeforces…</Notice>;
  if (!hasHandle) return <Notice>Set a handle in the sidebar to load this.</Notice>;
  return <Notice>{filtered ?? empty}</Notice>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center border-b border-hair px-5 py-16 text-center text-body text-muted-foreground">
      {children}
    </div>
  );
}
