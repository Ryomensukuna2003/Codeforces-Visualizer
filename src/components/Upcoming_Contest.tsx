"use client"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog"
import { UpcomingContest as UpcomingContestType } from "@/types/contests";
import Link from "next/link"
import { FileSpreadsheet, Mail, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "./Providers/fetchAPI"
import ContestSheet from "./contest-sheet"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { link } from "fs"

interface Contest {
  platform: string;
  event: string;
  name: string;
  start: Date;
  href: string;
  host?: string; // host is optional for non-Codeforces contests
  id?: string;  // id is optional for non-Codeforces contests
}

interface CodeforcesContest {
  id: string;
  name: string;
  phase: string;
  startTimeSeconds: number;
}



export const Upcoming_Contest = ({
  upcomingContest,
}: {
  upcomingContest: UpcomingContestType[]
}) => {
  const { UpcomingContestData, codforcesContestData } = useStore() as {
    UpcomingContestData: { objects: Contest[] },
    codforcesContestData: { result: CodeforcesContest[] }
  };

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const { toast } = useToast()
  const [contests, setContests] = useState<Contest[]>([]);
  const [fetching, setFetching] = useState(false);

  


  
  const parseContestData = () => {
    if (!UpcomingContestData?.objects) return;

    const contestSet = new Set<Contest>();
    const validHosts = ["codeforces.com", "codechef.com", "atcoder.jp"];

    // Process contests from UpcomingContestData
    UpcomingContestData.objects
      .filter((contest) => contest.host && validHosts.includes(contest.host)) // Filter by 'host' property
      .forEach((contest) => {
        contestSet.add({
          platform: contest.host || "", // Correctly using 'host'
          event: contest.event,    // Use 'event' for the contest name
          name: contest.event,    // Use 'event' for the contest name
          start: new Date(contest.start), // Convert the 'start' string to Date
          href: contest.href,      // Add the contest URL
        });
      });


    // Sort contests by start date
    const sortedContests = Array.from(contestSet).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );

    setContests(sortedContests); // Assuming setContests is a function to update state
  };

  useEffect(() => {
    if (UpcomingContestData && codforcesContestData) {
      parseContestData();
    }
  }, [UpcomingContestData, codforcesContestData]);

  const isToday = (dateString: string | Date) => {
    const specificDate = new Date(dateString);
    const today = new Date();
    return (
      specificDate.getDate() === today.getDate() &&
      specificDate.getMonth() === today.getMonth() &&
      specificDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card className="border-0 px-6">
      <CardHeader>
        <CardTitle>Upcoming Contests</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row  w-full px-0">
        <div className="flex-1 w-full">
          <Link href="/blogs" className="block w-full">
            <Button className="w-full h-full flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Codeforces Blogs
            </Button>
          </Link>
        </div>
        <div className="flex-1 w-full">
          <ContestSheet contests={contests} />
        </div>
      </CardContent>

      <CardContent>
        {contests.length > 0 ? (
          <ul className="space-y-3">
            {contests.slice(0, 6).map((contest, index) => {
              const isContestToday = isToday(contest.start);
              return (
                <li
                  key={contest.id || `${contest.platform}-${index}`}
                  className="flex items-center justify-between border-l-4 border-primary/20 pl-4 hover:bg-muted/50 transition-colors rounded"
                >
                  <Link
                    href={contest.href}
                    className="flex-grow mr-4 max-w-[70%]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-sm md:text-base font-medium break-words">
                      {contest.name}
                    </span>
                  </Link>
                  <Badge
                    className={`${
                      isContestToday ? "bg-red-500" : ""
                    } flex-shrink-0 text-xs md:text-sm`}
                  >
                    {isContestToday
                      ? "Today"
                      : new Date(contest.start).toLocaleString()}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">
            No upcoming contests found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}