"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/components/Providers/fetchAPI";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { HeatMapGraph } from "@/components/ui/HeatMap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyOrLoading,
  FigCaption,
  FilterCell,
  Label,
  PageHeader,
  Pagination,
  RatingRange,
  TD,
  TH,
  THead,
  TagList,
  rowClass,
} from "@/components/dossier/primitives";
import {
  VERDICT_FILTERS,
  bytes,
  clock,
  group,
  ratingText,
  shortDate,
  verdictShort,
  verdictLong,
  type VerdictFilter,
} from "@/lib/dossier";
import {
  processSingleHeatMapData,
  submissionSummary,
  verdictTape,
  type DossierSubmission,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const PER_PAGE = 100;
const ANY = "__any__";

export default function SubmissionsPage() {
  const { allSubmissionsData, isLoading } = useStore() as any;
  const { username } = useUsernameStore() as any;

  const [verdict, setVerdict] = useState<VerdictFilter>("ALL");
  const [from, setFrom] = useState(800);
  const [to, setTo] = useState(3500);
  const [tag, setTag] = useState(ANY);
  const [lang, setLang] = useState(ANY);
  const [page, setPage] = useState(1);

  const all: DossierSubmission[] = allSubmissionsData?.result ?? [];

  const summary = useMemo(() => submissionSummary(allSubmissionsData), [allSubmissionsData]);
  const tape = useMemo(() => verdictTape(allSubmissionsData, 60), [allSubmissionsData]);
  const tempo = useMemo(
    () => (allSubmissionsData?.result ? processSingleHeatMapData(allSubmissionsData) : []),
    [allSubmissionsData]
  );

  const tags = useMemo(
    () =>
      Array.from(new Set(all.flatMap((s) => s.problem?.tags ?? []))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [all]
  );
  const langs = useMemo(
    () => Array.from(new Set(all.map((s) => s.programmingLanguage).filter(Boolean))).sort(),
    [all]
  );

  const filtered = useMemo(
    () =>
      all.filter((s) => {
        if (verdict !== "ALL" && verdictShort(s.verdict) !== verdict) return false;
        const r = s.problem?.rating;
        // Unrated problems only survive when the range is left wide open.
        if (r == null) {
          if (from > 800 || to < 3500) return false;
        } else if (r < from || r > to) return false;
        if (tag !== ANY && !(s.problem?.tags ?? []).includes(tag)) return false;
        if (lang !== ANY && s.programmingLanguage !== lang) return false;
        return true;
      }),
    [all, verdict, from, to, tag, lang]
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const dirty = verdict !== "ALL" || from !== 800 || to !== 3500 || tag !== ANY || lang !== ANY;

  const reset = () => {
    setVerdict("ALL");
    setFrom(800);
    setTo(3500);
    setTag(ANY);
    setLang(ANY);
    setPage(1);
  };

  const change = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const exportCsv = () => {
    const head = "verdict,problem,rating,language,time_ms,memory_bytes,date";
    const body = filtered.map((s) =>
      [
        verdictShort(s.verdict),
        `"${(s.problem?.name ?? "").replace(/"/g, '""')}"`,
        s.problem?.rating ?? "",
        `"${s.programmingLanguage ?? ""}"`,
        s.timeConsumedMillis ?? "",
        s.memoryConsumedBytes ?? "",
        new Date(s.creationTimeSeconds * 1000).toISOString(),
      ].join(",")
    );
    const url = URL.createObjectURL(
      new Blob([[head, ...body].join("\n")], { type: "text/csv" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "submissions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // No focus classes here: the app has one focus treatment, the global
  // :focus-visible outline in globals.css.
  const selectTrigger =
    "h-auto self-stretch gap-2 rounded-none border-0 bg-transparent p-0 text-meta text-foreground";

  return (
    <>
      <PageHeader
        eyebrow="02 — Submission log"
        title="All submissions"
        intro="Every submission this handle has made on Codeforces, filtered by verdict, rating, tag and language — with a tempo chart of practice volume over time and the last 60 outcomes at a glance. Useful for finding which topic your wrong answers actually cluster in."
        actions={
          <>
            <span className="font-mono text-meta tabular-nums text-muted-foreground">
              {group(summary.total)} total · {group(summary.ac)} AC
            </span>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!filtered.length}
              className="border border-rule px-3 py-2 text-meta text-muted-foreground transition-colors hover:bg-rowhover hover:text-foreground disabled:opacity-40"
            >
              Export CSV
            </button>
          </>
        }
      />

      {/* Summary strip -------------------------------------------------- */}
      <div className="flex flex-wrap items-stretch border-b border-rule">
        {[
          { label: "AC rate", value: `${summary.acRate}%` },
          { label: "Attempts per solve", value: summary.attemptsPerSolve || "—" },
          {
            label: "Fastest AC",
            value: summary.fastestAc === null ? "—" : clock(summary.fastestAc),
          },
          { label: "Most failed tag", value: summary.mostFailedTag ?? "—", accent: true },
        ].map((s) => (
          <div key={s.label} className="min-w-[180px] flex-1 px-5 py-4">
            <Label className="mb-2.5 block whitespace-nowrap">{s.label}</Label>
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
      </div>

      {/* Verdict tape — its own row. Cheap to compute, very high signal:
          the last 60 verdicts at a glance, newest on the right. */}
      <div className="border-b border-rule px-5 py-4">
        <div className="mb-2.5 flex items-baseline justify-between">
          <Label>Last 60 verdicts</Label>
          <Label>newest right</Label>
        </div>
        {/* One labelled image, not 60 unlabelled spans — `title` on a generic
            element is not surfaced as an accessible name, and the spans are
            neither focusable nor touch-reachable. */}
        <div
          className="flex h-6 gap-[2px]"
          role={tape.length ? "img" : undefined}
          aria-label={
            tape.length
              ? `Last ${tape.length} verdicts, newest last: ${
                  tape.filter(Boolean).length
                } accepted, ${tape.filter((v) => !v).length} failed`
              : undefined
          }
        >
          {tape.length ? (
            tape.map((ac, i) => (
              <span
                key={i}
                aria-hidden
                title={ac ? "AC" : "failed"}
                className={cn("flex-1", ac ? "bg-foreground" : "bg-red-500")}
              />
            ))
          ) : (
            <span className="flex-1 bg-track" />
          )}
        </div>
      </div>

      {/* Filters --------------------------------------------------------- */}
      <div className="flex flex-wrap border-b border-rule">
        <div className="flex">
          {VERDICT_FILTERS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => change(setVerdict)(v)}
              aria-pressed={v === verdict}
              className={cn(
                "px-3.5 py-3 font-mono text-meta transition-colors first:pl-5",
                v === verdict
                  ? "bg-foreground font-semibold text-background"
                  : "text-muted-foreground hover:bg-rowhover hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <FilterCell>
          <RatingRange from={from} to={to} onFrom={change(setFrom)} onTo={change(setTo)} />
        </FilterCell>

        <FilterCell label="tag">
          <Select value={tag} onValueChange={change(setTag)}>
            <SelectTrigger className={cn(selectTrigger, "w-[130px]")} aria-label="Filter by tag">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value={ANY} className="rounded-none">
                any
              </SelectItem>
              {tags.map((t) => (
                <SelectItem key={t} value={t} className="rounded-none">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterCell>

        <FilterCell label="language">
          <Select value={lang} onValueChange={change(setLang)}>
            <SelectTrigger
              className={cn(selectTrigger, "w-[150px]")}
              aria-label="Filter by language"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value={ANY} className="rounded-none">
                any
              </SelectItem>
              {langs.map((l) => (
                <SelectItem key={l} value={l} className="rounded-none">
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterCell>

        <div className="flex-1" />
        {dirty ? (
          <button
            type="button"
            onClick={reset}
            className="px-5 py-3 text-meta text-red-500 transition-colors hover:bg-rowhover"
          >
            Reset filters
          </button>
        ) : null}
      </div>

      {/* Tempo ----------------------------------------------------------- */}
      {tempo.length ? (
        <div className="border-b border-rule">
          <FigCaption aside={`${group(summary.total)} submissions`}>
            Submission tempo
          </FigCaption>
          <HeatMapGraph data={tempo} />
        </div>
      ) : null}

      {/* Table ----------------------------------------------------------- */}
      <THead>
        <TH className="w-[72px]">Verdict</TH>
        <TH first>Problem</TH>
        <TH className="w-[72px]">Rating</TH>
        <TH className="hidden w-[150px] lg:flex">Language</TH>
        <TH className="hidden w-[80px] sm:flex">Time</TH>
        <TH className="hidden w-[88px] sm:flex">Memory</TH>
        <TH className="w-[96px]">Date</TH>
      </THead>

      {visible.length ? (
        visible.map((s) => {
          const ac = s.verdict === "OK";
          return (
            <Link
              key={s.id}
              href={`https://codeforces.com/contest/${s.problem.contestId}/submission/${s.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(rowClass, !ac && "bg-flag")}
            >
              <TD className="w-[72px] border-r border-hair">
                <span
                  className={cn(
                    "font-mono text-label font-semibold",
                    ac ? "text-foreground" : "text-red-500"
                  )}
                >
                  <span aria-hidden>{verdictShort(s.verdict)}</span>
                  <span className="sr-only">{verdictLong(s.verdict)}</span>
                </span>
              </TD>
              <TD first className="gap-3 py-3">
                <span className="truncate text-body text-foreground">
                  {s.problem.index}. {s.problem.name}
                </span>
                <TagList tags={s.problem.tags ?? []} flagged={!ac} className="hidden md:flex" />
              </TD>
              <TD
                className={cn(
                  "w-[72px] font-mono text-meta tabular-nums",
                  ratingText(s.problem.rating)
                )}
              >
                {s.problem.rating ?? "—"}
              </TD>
              <TD className="hidden w-[150px] lg:flex">
                <span className="truncate text-meta text-faint">{s.programmingLanguage}</span>
              </TD>
              <TD className="hidden w-[80px] font-mono text-meta tabular-nums text-faint sm:flex">
                {s.timeConsumedMillis != null ? `${group(s.timeConsumedMillis)} ms` : "—"}
              </TD>
              <TD className="hidden w-[88px] font-mono text-meta tabular-nums text-faint sm:flex">
                {bytes(s.memoryConsumedBytes)}
              </TD>
              <TD className="w-[96px] font-mono text-meta tabular-nums text-faint">
                {shortDate(s.creationTimeSeconds)}
              </TD>
            </Link>
          );
        })
      ) : (
        <EmptyOrLoading
          loading={isLoading}
          hasHandle={Boolean(username)}
          filtered={all.length ? "No submissions match these filters." : undefined}
          empty="No submissions on this handle yet."
        />
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </>
  );
}
