'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlignRight } from "lucide-react"

export default function ContestSheet({ contests }: { contests: any[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="w-full h-full flex items-center justify-center gap-2 px-6 py-3 font-mono text-sm bg-foreground text-background hover:bg-foreground/80 transition-colors">
          View Upcoming Contests <AlignRight className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[540px] rounded-none border-l border-neutral-600">
        <SheetHeader>
          <SheetTitle className="pt-4 font-mono">Upcoming Programming Contests</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div>
            {contests.map((contest, index) => (
              <a
                key={index}
                href={contest.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-neutral-600 px-4 py-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="font-mono text-sm text-foreground hover:underline">
                  {contest.name}
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  {contest.platform}
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  Starts: {new Date(contest.start).toLocaleString()}
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
