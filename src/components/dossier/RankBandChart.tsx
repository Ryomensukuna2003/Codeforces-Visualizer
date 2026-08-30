"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RANK_BANDS, TIER_STROKE, snapDomain } from "@/lib/dossier";
import { cn } from "@/lib/utils";

const FG = "hsl(var(--foreground))";
const RIVAL = "hsl(var(--muted-foreground))";
/** #3f3f3f on black — the boundary hairline between bands. */
const BOUNDARY_OPACITY = 0.25;

export type Series = {
  key: string;
  label: string;
  /** The rival curve on /compare: muted, 2px, dasharray 7 5. */
  dashed?: boolean;
};

function DossierTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-rule bg-card px-3 py-2 text-meta">
      <div className="mb-1 text-faint">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-baseline gap-3 tabular-nums">
          <span className="text-faint">{p.name}</span>
          <span className="text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Rating curve on rank bands — the shared chart object behind `/`,
 * `/rating_change` and `/compare`.
 *
 * Bands are `ReferenceArea`s stacked behind the series with a `ReferenceLine`
 * at each boundary; tier names sit in an absolutely-positioned overlay row
 * rather than as axis ticks, so the chart keeps its full width.
 */
export function RankBandChart({
  data,
  series,
  xKey = "label",
  height,
  className,
}: {
  data: Record<string, any>[];
  series: Series[];
  xKey?: string;
  /** Omit to fill the parent — used where the panel's height is set by its neighbour. */
  height?: number;
  className?: string;
}) {
  const domain = React.useMemo<[number, number]>(() => {
    const values = data.flatMap((d) =>
      series.map((s) => d[s.key]).filter((v): v is number => typeof v === "number")
    );
    if (!values.length) return [1000, 1800];
    return snapDomain(Math.min(...values), Math.max(...values));
  }, [data, series]);

  const visibleBands = RANK_BANDS.filter((b) => b.hi > domain[0] && b.lo < domain[1]);

  if (!data.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-meta text-faint",
          height === undefined && "h-full",
          className
        )}
        style={height === undefined ? undefined : { height }}
      >
        No rated contests yet.
      </div>
    );
  }

  return (
    <div
      className={cn("relative", height === undefined && "h-full", className)}
      style={height === undefined ? undefined : { height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey={xKey} hide />
          <YAxis domain={domain} hide />

          {visibleBands.map((b) => (
            <ReferenceArea
              key={`band-${b.name}`}
              y1={Math.max(b.lo, domain[0])}
              y2={Math.min(b.hi, domain[1])}
              fill={FG}
              fillOpacity={b.opacity}
              ifOverflow="hidden"
              isFront={false}
            />
          ))}
          {visibleBands
            .filter((b) => b.hi < domain[1])
            .map((b) => (
              <ReferenceLine
                key={`line-${b.name}`}
                y={b.hi}
                stroke={FG}
                strokeOpacity={BOUNDARY_OPACITY}
                strokeWidth={1}
              />
            ))}

          {series.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              name={s.label}
              type="linear"
              stroke={s.dashed ? RIVAL : FG}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "7 5" : undefined}
              fill={FG}
              fillOpacity={s.dashed ? 0 : 0.07}
              dot={false}
              activeDot={{ r: 3, fill: s.dashed ? RIVAL : FG, stroke: "none" }}
              connectNulls
              isAnimationActive={false}
            />
          ))}

          <Tooltip content={<DossierTooltip />} cursor={{ stroke: FG, strokeOpacity: 0.2 }} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Each band names itself, inside itself. The old overlay stacked all the
          names in one horizontal row at the top, which reads as an x-axis legend
          — exactly the wrong axis for bands that are horizontal stripes. */}
      <div className="pointer-events-none absolute inset-0">
        {visibleBands.map((b) => {
          const lo = Math.max(b.lo, domain[0]);
          const hi = Math.min(b.hi, domain[1]);
          const span = domain[1] - domain[0];
          const heightPct = ((hi - lo) / span) * 100;
          // Under ~5% the band is thinner than its own label; leave it unlabelled
          // rather than let the name spill into its neighbour.
          if (heightPct < 5) return null;
          return (
            <span
              key={b.name}
              className="absolute left-5 text-label uppercase"
              style={{
                top: `${(1 - (hi - domain[0]) / span) * 100}%`,
                marginTop: 4,
                color: TIER_STROKE[b.tier],
              }}
            >
              {b.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Per-contest delta row, sat immediately beneath a `RankBandChart` at the same
 * x-scale: same data length and same zero margins, so the columns line up with
 * the points above. Gains grow up in foreground, losses grow down in red,
 * normalised against the largest absolute delta.
 */
export function DeltaRow({
  data,
  dataKey = "delta",
  xKey = "label",
  height = 56,
}: {
  data: Record<string, any>[];
  dataKey?: string;
  xKey?: string;
  height?: number;
}) {
  const peak = React.useMemo(
    () => Math.max(1, ...data.map((d) => Math.abs(Number(d[dataKey]) || 0))),
    [data, dataKey]
  );

  if (!data.length) return null;

  return (
    <div className="border-t border-hair" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="12%">
          {/* Not quite the same x-scale as the chart above: recharts gives an
              AreaChart a point scale and a BarChart a band scale, so bar i sits
              half a band — width / 2n — right of point i. At the 100+ contests
              this row is built for that is ~4px; forcing `scale="point"` here
              makes recharts emit no bar geometry at all, and forcing the band
              scale onto the curve insets it by a third of the width for a
              handful of contests. Left as is, deliberately. */}
          <XAxis dataKey={xKey} hide />
          <YAxis domain={[-peak, peak]} hide />
          <ReferenceLine y={0} stroke={FG} strokeOpacity={BOUNDARY_OPACITY} />
          <Bar dataKey={dataKey} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={Number(d[dataKey]) >= 0 ? FG : "#ef4444"}
              />
            ))}
          </Bar>
          <Tooltip content={<DossierTooltip />} cursor={{ fill: FG, fillOpacity: 0.06 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
