"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface DataPoint {
  rating: number;
  count: number;
}

interface ChartLineBarProps {
  data: DataPoint[];
}

export function ChartLineBar({ data }: ChartLineBarProps) {

  const max_Submissions= data.reduce((max, p) => p.count > max ? p.count : max, data[0].count);

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Problems Rating</CardTitle>
        <CardDescription>Rating of various problems.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rating" // Corrected to use "rating"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis domain={[0, Math.ceil(max_Submissions / 50) * 50]} />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent />}
              />
            <Bar dataKey="count" type="natural"
              fill="var(--color-desktop)"
              fillOpacity={1}
              stroke="var(--color-desktop)"   radius={8}>
              <LabelList
                dataKey="count" // Displaying the count values
                position="top"
                offset={20}
                className="p-5 border border-red border-5px"
                fontSize={12}
                angle={0} // Removed the angle to show count clearly
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing the total number of questions for each rating.{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}
