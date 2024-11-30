'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, Mail, KeyRound, ArrowRight,AlignRight } from "lucide-react"


export default function ContestSheet({ contests }: { contests: any[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>

        <Button variant="outline">View Upcoming Contests &nbsp; <AlignRight /></Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Upcoming Programming Contests</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div className="space-y-4 ">
            {contests.map((contest, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a href={contest.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {contest.name}
                    </a>
                  </CardTitle>
                  <CardDescription>
                    Starts: {new Date(contest.start).toLocaleString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

