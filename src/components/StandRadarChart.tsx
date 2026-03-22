"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  buildStandRadarData,
  STAND_METRIC_DESCRIPTIONS,
  STAND_SEGMENTS,
} from "@/lib/stand-radar-metrics";
import type { Rating, TagStatistics } from "@/types/contests";

const chartConfig = {
  stand: {
    label: "Stand",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

type SubmissionRow = {
  verdict: string;
  creationTimeSeconds?: number;
  problem: { name: string; rating?: number; tags: string[] };
};

type StandRadarChartProps = {
  submissions: SubmissionRow[];
  tagStatistics: TagStatistics[];
  contestsParticipated: number;
  averageAcceptedProblemRating: number;
  userRating: number;
  registrationTimeSeconds: number;
  ratingHistory: Rating[];
};

const SEG_WIDTH = 6;
const SEG_GAP = 1.5;

function calcSegments(w: number) {
  return Math.max(4, Math.floor((w + SEG_GAP) / (SEG_WIDTH + SEG_GAP)));
}

function SegmentedStatBar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
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

  const filled = Math.round((Math.min(100, Math.max(0, value)) / 100) * segments);

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full min-w-0 items-stretch gap-[1.5px]",
        segments === 0 && "invisible",
        className
      )}
      role="img"
      aria-label={`${label}: ${value} out of 100`}
    >
      {segments > 0 &&
        Array.from({ length: segments }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-full min-w-0 flex-1 rounded-full",
              i < filled ? "bg-foreground" : "bg-muted"
            )}
          />
        ))}
    </div>
  );
}

function StandStatsTable({ data }: { data: { metric: string; value: number }[] }) {
  return (
    <div className="flex w-full flex-col gap-2 sm:gap-3">
      {data.map((row) => {
        const help =
          STAND_METRIC_DESCRIPTIONS[row.metric] ??
          "Heuristic score from your Codeforces activity (0–100).";
        return (
          <div
            key={row.metric}
            className="group relative flex items-center gap-x-3 outline-none transition-colors hover:bg-muted/20 sm:gap-x-4"
            tabIndex={0}
          >
            <span className="flex w-[5.5rem] shrink-0 items-center text-sm font-medium leading-tight tracking-tight sm:w-24 sm:text-[0.9375rem]">
              {row.metric}
            </span>
            <div className="min-w-0 flex-1">
              <SegmentedStatBar
                value={row.value}
                label={row.metric}
                className="h-8 sm:h-10"
              />
            </div>
            <span className="flex w-14 shrink-0 items-center justify-end text-sm tabular-nums leading-tight text-muted-foreground sm:w-16 sm:text-[0.9375rem]">
              {row.value}
              <span className="text-muted-foreground/80">/100</span>
            </span>

            {/* Tooltip anchored to the row, not a narrow cell */}
            <div
              className={cn(
                "pointer-events-none absolute left-0 top-full z-30 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-popover p-3 text-left text-xs leading-snug text-popover-foreground shadow-md",
                "invisible opacity-0 transition-all duration-150",
                "group-hover:visible group-hover:opacity-100",
                "group-focus-within:visible group-focus-within:opacity-100"
              )}
              role="tooltip"
            >
              <span className="font-medium text-foreground">How it&apos;s calculated</span>
              <span className="mt-1 block text-muted-foreground">{help}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StandRadarChart({
  submissions,
  tagStatistics,
  contestsParticipated,
  averageAcceptedProblemRating,
  userRating,
  registrationTimeSeconds,
  ratingHistory,
}: StandRadarChartProps) {
  const data = React.useMemo(
    () =>
      buildStandRadarData({
        submissions,
        tagStatistics,
        contestsParticipated,
        averageAcceptedProblemRating,
        userRating,
        registrationTimeSeconds,
        ratingHistory,
      }),
    [
      submissions,
      tagStatistics,
      contestsParticipated,
      averageAcceptedProblemRating,
      userRating,
      registrationTimeSeconds,
      ratingHistory,
    ]
  );

  return (
    <Card className="overflow-visible border-0 border-x-0 border-t border-b border-neutral-600">
      <CardHeader className="space-y-0 p-4 pb-2 pt-4 sm:px-5 sm:pt-4 sm:pb-2">
        <CardTitle className="pb-2">Stand parameters</CardTitle>
        <CardDescription className="pb-4">Inspired by Jojo's Bizarre Adventure.</CardDescription>

      </CardHeader>
      <CardContent className="overflow-visible p-4 pt-0 pb-4 sm:px-5 sm:pb-4">
        {/* 60% stats / 40% chart — no inner borders */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-stretch lg:gap-6">
          <div className="flex min-h-[min(20rem,65vh)] min-w-0 flex-col lg:h-full lg:min-h-0">
            <StandStatsTable data={data} />
          </div>

          <div className="flex min-h-[min(20rem,65vh)] min-w-0 flex-col lg:h-full lg:min-h-0">
            <div className="min-h-0 w-full flex-1">
              <ChartContainer
                config={chartConfig}
                className="h-full w-full p-0 [&_.recharts-responsive-container]:h-full [&_.recharts-responsive-container]:min-h-0 [&_.recharts-responsive-container]:w-full [&_.recharts-text]:fill-muted-foreground [&_.recharts-surface]:outline-none"
              >
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={data}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tickLine={false}
                    tick={{ fontSize: 11, dy: 0 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="var(--color-stand)"
                    fill="var(--color-stand)"
                    fillOpacity={0.45}
                    dot={{
                      r: 4,
                      fillOpacity: 1,
                      fill: "hsl(var(--foreground))",
                    }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
