"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { GitCommitVertical } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface MultipleLineChartProps {
  user1: string;
  user2: string;
  chartData: any[];
}


export function MultipleLineChart({ user1, user2, chartData }: MultipleLineChartProps) {
  if (!chartData || chartData.length === 0) return null;

  const chartConfig: ChartConfig = {
    [user1]: {
      label: user1,
      color: "hsl(var(--id1-color))",
    },
    [user2]: {
      label: user2,
      color: "hsl(var(--id2-color))",
    },
  }

  return (
    <Card className="border-0 border-b ">
      <CardHeader>
        <CardTitle className="flex gap-4">Rating Change  <TrendingUp /> </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 10)}
            />
            <YAxis className="pl-5" scale={"linear"} ticks={[1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000]} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  // hideLabeltickCount={22}
                  indicator="line"
                  formatter={(value, name) => (
                    <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                      </div>
                    </div>
                  )}
                />
              } cursor={true}

              defaultIndex={1}
            />
            <Line
              dataKey={user1}
              type="monotone"

              stroke="hsl(var(--id1-color))"
              strokeWidth={2}
              dot={false}
              activeDot={(props: any) => {
                const { cx, cy, payload } = props;
                const r = 24;
                return (
                  <GitCommitVertical
                    key={payload.month}
                    x={cx - r / 2}
                    y={cy - r / 2}
                    width={r}
                    height={r}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--id2-color))"
                  />
                );
              }}
            />
            <Line
              dataKey={user2}

              type="monotone"
              stroke="hsl(var(--id2-color))"
              strokeWidth={2}
              dot={false}
              activeDot={(props: any) => {
                const { cx, cy, payload } = props;
                const r = 24;
                return (
                  <GitCommitVertical
                    key={payload.month}
                    x={cx - r / 2}
                    y={cy - r / 2}
                    width={r}
                    height={r}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--id2-color))"
                  />
                );
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>

        </ChartContainer>
      </CardContent>

    </Card>
  )
}