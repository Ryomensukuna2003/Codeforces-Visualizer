"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  const chartConfig = {
    [user1]: {
      label: user1,
      color: "hsl(var(--chart-1))",
    },
    [user2]: {
      label: user2,
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig
  return (
    <Card className="border-0 border-b ">
      <CardHeader>
        <CardTitle className="flex gap-4">Rating Changes <TrendingUp /> </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
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
              <YAxis className="pl-5" tickCount={22} scale={"linear"} ticks={[1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
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
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey={user2}
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
            <ChartLegend content={<ChartLegendContent />} />
          </>
        </ChartContainer>

      </CardContent>
    </Card>
  )
}
