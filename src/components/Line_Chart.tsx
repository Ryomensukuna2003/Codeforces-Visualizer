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
} from "@/components/ui/chart"

interface DataPoint {
  contestName: string;
  rating: number;
}

interface ChartLineLinearProps {
  data: DataPoint[];
}

export default function ChartLineLinear({ data }: ChartLineLinearProps) {
  const chartConfig = {
    desktop: {
      label: "Rating",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const max_Rating = data.map((item) => item.rating).reduce((a, b) => Math.max(a, b));
  const current_Rating = data[data.length - 1].rating;

  return (
    <Card className="border-0 border-l" >
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Line Chart - Linear</CardTitle>
          <CardDescription>Rating Changes Over Contests</CardDescription>
        </div>
        <div className="relative z-30 flex flex-col justify-center gap-1 border-t  px-6 py-4 text-left bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
          <span className="text-sm text-muted-foreground">Current Rating</span>
          <span className="text-lg font-bold">{current_Rating}</span>
        </div>
        <div className="relative z-30 flex flex-col justify-center gap-1  border-t px-6 py-4 text-left bg-muted/50 border-r sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
          <span className="text-sm text-muted-foreground">Max Rating</span>
          <span className="text-lg font-bold">{max_Rating}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full overflow-x-auto">
          <LineChart width={656} height={369} data={data}>
            <CartesianGrid vertical={false} />
            <YAxis className="pl-5" tickCount={22} scale={"linear"} ticks={[1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000]} />
            <XAxis
              dataKey="contestName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                let index = value.search("Div.");
                return "Div " + value.substr(index + 4, 2).trim();
              }}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Line
              dataKey="rating"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing rating changes over contests <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}
