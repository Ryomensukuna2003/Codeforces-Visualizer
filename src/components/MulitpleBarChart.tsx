"use client"

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

interface MultipleBarChartProps {
  user1: string;
  user2: string;
  chartData: any[];
}

export function MultipleBarChart({ user1, user2, chartData }: MultipleBarChartProps) {
  const chartConfig: ChartConfig = {
    [user1]: {
      label: user1,
      color: "hsl(var(--chart-1))",
    },
    [user2]: {
      label: user2,
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card className='border-0 border-b border-r'>
      <CardHeader>
        <CardTitle className='flex gap-4'>Accepted Solutions <TrendingUp /></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rating"
              tickLine={true}
              tickMargin={10}
              axisLine={true}
              tickFormatter={(value) => String(value).slice(0, 4)}
            />
            <YAxis />
            <Bar dataKey={user1} name={user1} fill="hsl(var(--chart-1))" radius={4} />
            <Bar dataKey={user2} name={user2} fill="hsl(var(--chart-2))" radius={4} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
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
              } cursor={false}
              defaultIndex={1}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

