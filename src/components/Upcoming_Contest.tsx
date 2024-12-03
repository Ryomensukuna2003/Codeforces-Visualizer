"use client"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Label } from "./ui/label"
import { UpcomingContest as UpcomingContestType } from "@/app/types"
import Link from "next/link"
import { Bell, Mail, KeyRound, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "./Providers/fetchAPI";
import ContestSheet from "./contest-sheet"

export const Upcoming_Contest = ({
  upcomingContest,
}: {
  upcomingContest: UpcomingContestType[]
}) => {
  const { UpcomingContestData } = useStore() as { UpcomingContestData: any };
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const { toast } = useToast()
  const [Contests, setContests] = useState<any>([]);

  const handleSendOtp = () => {
    setIsOtpSent(true)
    toast({
      title: "OTP Sent",
      description: "Please check your email for the OTP.",
    })
  }

  interface Contest {
    host: string;
    [key: string]: any;
  }

  interface UpcomingContestData {
    objects: Contest[];
  }

  const ParseContestData = (UpcomingContestData: UpcomingContestData) => {
    const filteredContests = UpcomingContestData.objects.filter((contest: Contest) => 
      contest.host === "codeforces.com" || contest.host === "codechef.com" || contest.host === "atcoder.jp"
    ).map((contest: Contest) => ({
      name: contest.event,
      start: new Date(contest.start),
      href: contest.href
    }));
    setContests(filteredContests.sort((a, b) => a.start.getTime() - b.start.getTime()));
  };

  useEffect(() => {
    ParseContestData(UpcomingContestData);
  }, [UpcomingContestData]);

  const handleVerifyOtp = () => {
    setIsModalOpen(false)
    setIsOtpSent(false)
    setEmail("")
    setOtp("")
    toast({
      title: "Verification Successful",
      description: "You will now receive notifications for upcoming contests.",
    })
  }

  const isToday = (dateString: string) => {
    const specificDate = new Date(dateString);
    const today = new Date();
    return (
      specificDate.getDate() === today.getDate() &&
      specificDate.getMonth() === today.getMonth() &&
      specificDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Contests</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full sm:w-auto"
        >
          <Bell className="mr-2 h-4 w-4" />
          Get notified for Upcoming contest
        </Button>
        <div className="w-full sm:w-auto">
          <ContestSheet contests={Contests} />
        </div>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-full max-w-full mx-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Bell className="mr-2 h-6 w-6 text-primary" />
              Get Notified
            </DialogTitle>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {!isOtpSent ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Label htmlFor="email" className="whitespace-nowrap">
                      Email
                    </Label>
                    <div className="flex-1 relative w-full">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 rounded w-full"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Label htmlFor="email" className="whitespace-nowrap">
                      OTP
                    </Label>
                    <div className="flex-1 relative w-full">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="pl-12 rounded w-full"
                        placeholder="Enter OTP"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <DialogFooter>
            <Button
              onClick={!isOtpSent ? handleSendOtp : handleVerifyOtp}
              className="w-full sm:w-auto rounded"
            >
              {!isOtpSent ? "Send OTP" : "Verify OTP"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardContent>
        {upcomingContest && upcomingContest.length > 0 ? (
          <ul className="space-y-3">
            {Contests.slice(0, 6).map((contest: any) => {
              const isContestToday = isToday(contest.start);
              return (
                <li 
                  key={contest.id}
                  className="flex items-center justify-between border-l-4 border-primary/20 pl-4  hover:bg-muted/50 transition-colors rounded"
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
                    className={`${isContestToday ? "bg-red-500" : ""} flex-shrink-0 text-xs md:text-sm`}
                  >
                    {isContestToday
                      ? "Today"
                      : contest.start.toLocaleString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })}
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
  )
}