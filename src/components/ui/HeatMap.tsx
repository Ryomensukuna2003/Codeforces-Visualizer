"use client"
import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "hsl(var(--foreground))",
  }
} satisfies ChartConfig

interface HeatMapGraphProps {
  data: { date: string; desktop: number }[];
}

export function HeatMapGraph({ data }: HeatMapGraphProps) {
  const [timeRange, setTimeRange] = React.useState("ALL")
  // Measured in an effect, not during render: reading window while rendering
  // breaks SSR and desyncs hydration. NavBar already does it this way.
  const [isWideScreen, setIsWideScreen] = React.useState(false)

  React.useEffect(() => {
    const onResize = () => setIsWideScreen(window.innerWidth > 768)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date()
    let startDate = new Date(0)
    switch (timeRange) {
      case "90d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "30d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "7d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "2024":
        startDate = new Date("2024-01-01");
        break;
      case "2023":
        startDate = new Date("2023-01-01");
        break;
    }

    return data
      .filter((item) => {
        const x = new Date(item.date)
        return x >= startDate
      }).reverse();
  }, [data, timeRange])

  const total = React.useMemo(
    () => filteredData.reduce((acc, curr) => acc + curr.desktop, 0),
    [filteredData]
  )

  const max_submissions = React.useMemo(
    () => filteredData.reduce((acc, curr) => Math.max(acc, curr.desktop), 0),
    [filteredData]
  )


  return (
    <div>
      {/* Controls strip — the figure caption above already names this chart. */}
      {/* A strip of cells, like the filter rows: the range picker fills the row
          rather than floating in it as a smaller bordered box. */}
      <div className="flex flex-wrap items-stretch border-b border-hair text-meta">
        <span className="flex items-center py-3 pl-5 pr-6 text-faint">
          Total <span className="ml-2 text-meta tabular-nums text-foreground">{total.toLocaleString()}</span>
        </span>
        <span className="flex items-center py-3 pr-6 text-faint">
          Busiest day <span className="ml-2 text-meta tabular-nums text-foreground">{max_submissions.toLocaleString()}</span>
        </span>
        <div className="flex-1" />
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="h-auto w-[170px] self-stretch rounded-none border-0 border-l border-hair px-5 text-meta"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="ALL" className="rounded-none">All time</SelectItem>
            <SelectItem value="90d" className="rounded-none">Last 3 months</SelectItem>
            <SelectItem value="30d" className="rounded-none">Last 30 days</SelectItem>
            <SelectItem value="7d" className="rounded-none">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[200px] w-full px-5 pt-3"
      >
        <LineChart accessibilityLayer data={filteredData} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--hair))" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fontSize: 11, fill: "hsl(var(--faint))" }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }}
          />
          {isWideScreen && (
            <YAxis dataKey="desktop" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--faint))" }} width={30} />
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px] rounded-none"
                nameKey="submissions"
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
            }
          />
          <Line
            dataKey="desktop"
            type="monotone"
            stroke={chartConfig.submissions.color}
            strokeWidth={1}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
