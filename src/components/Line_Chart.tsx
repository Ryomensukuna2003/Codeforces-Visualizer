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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Linear</CardTitle>
        <CardDescription>Rating Changes Over Contests</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
            <LineChart
            accessibilityLayer
            data={data}
            >
            <CartesianGrid vertical={false} />
            <YAxis/>
            <XAxis
              dataKey="contestName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                let index = value.search("Div.");
                console.log("Index=> ", index);
                return "Div "+value.substr(index+4,2).trim();
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
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