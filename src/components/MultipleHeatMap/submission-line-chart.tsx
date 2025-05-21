"use client"

import React, { useEffect } from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { GitCommitVertical } from "lucide-react"

interface SubmissionData {
  date: string
  id1: number
  id2: number
}
interface SubmissionLineChartProps {
  data: SubmissionData[]
  id1: string
  id2: string
}

export function SubmissionLineChart({ data, id1, id2 }: SubmissionLineChartProps): React.ReactElement {

  const chartConfig = {
    id1: {
      label: `${id1}`,
      color: "hsl(var(--id1-color))",
    },
    id2: {
      label: `${id2}`,
      color: "hsl(var(--id2-color))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis/>
          <ChartTooltip content={<ChartTooltipContent indicator="line" className="w-[150px]" />} />
          <Legend />
          <Line type="monotone" dot={false}
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
            }} dataKey={id1} strokeWidth={2} stroke={chartConfig.id1.color} name={`${chartConfig.id1.label} `} />
          <Line
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
            type="monotone"
            dataKey={id2}
            strokeWidth={2}
            stroke={chartConfig.id2.color}
            name={`${chartConfig.id2.label}`}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}