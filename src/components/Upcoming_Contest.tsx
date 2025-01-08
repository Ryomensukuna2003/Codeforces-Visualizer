"use client"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog"
import { UpcomingContest as UpcomingContestType } from "@/app/types"
import Link from "next/link"
import { Bell, Mail, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "./Providers/fetchAPI"
import ContestSheet from "./contest-sheet"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface Contest {
  platform: string;
  name: string;
  start: string | Date;
  href: string;
  id?: string;
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

  const generate_OTP = async (email: string) => {
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return "Invalid email address";
    }

    try {
      const response = await fetch("/api/generate_OTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 400) {
        return "Email already registered";
      }
      if (response.ok) {
        setIsOtpSent(true);
        return "OTP sent successfully";
      }
      return "Failed to send OTP";
    } catch (error) {
      console.error("OTP Generation error:", error);
      return "OTP Generation error";
    }
  }

  const verify_otp = async (email: string, otp: string) => {
    if (!otp || otp.length !== 6) {
      return "Invalid OTP";
    }

    try {
      const response = await fetch("/api/verify_OTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        await fetch("/api/add_subscriber", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        return "OTP verified successfully";
      }
      return "Invalid OTP, please try again";
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      return "Verification failed, please try again";
    }
  }

  const handleSendOtp = async () => {
    const toast_title = await generate_OTP(email);
    if (toast_title === "Email already registered") {
      setIsModalOpen(false);
    }
    toast({
      variant: toast_title === "OTP sent successfully" ? "default" : "destructive",
      title: toast_title,
      description: toast_title === "OTP sent successfully"
        ? "Please check your email for the OTP."
        : "Please try again with a valid email address.",
    })
  }

  const handleVerifyOtp = async () => {
    setFetching(true);
    try {
      const toast_title = await verify_otp(email, otp);
      if (toast_title === "OTP verified successfully") {
        setIsModalOpen(false);
        setIsOtpSent(false);
        setEmail("");
        setOtp("");
      }
      toast({
        variant: toast_title === "OTP verified successfully" ? "default" : "destructive",
        title: toast_title,
        description: toast_title === "OTP verified successfully"
          ? "You will now receive notifications for upcoming contests."
          : "Please try again with the correct OTP.",
      });
    } finally {
      setFetching(false);
    }
  }

  const parseContestData = () => {
    if (!UpcomingContestData?.objects || !codforcesContestData?.result) return;

    const contestSet = new Set<Contest>();
    const validHosts = ["codeforces.com", "codechef.com", "atcoder.jp"];

    // Process contests from UpcomingContestData
    UpcomingContestData.objects
      .filter(contest => validHosts.includes(contest.host)) // Changed from contest.platform to contest.host
      .forEach(contest => {
        contestSet.add({
          platform: contest.host, // Changed to use host instead of platform
          name: contest.event,    // Changed from name to event
          start: new Date(contest.start),
          href: contest.href,
        });
      });

    // Process Codeforces contests
    codforcesContestData.result
      .filter(contest => contest.phase === "BEFORE")
      .forEach(contest => {
        contestSet.add({
          platform: "codeforces.com",
          name: contest.name,
          start: new Date(contest.startTimeSeconds * 1000),
          href: `https://codeforces.com/contests/${contest.id}`,
          id: contest.id
        });
      });

    const sortedContests = Array.from(contestSet)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    setContests(sortedContests);
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
      <CardContent className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex-1"
        >
          <Bell className="mr-2 h-4 w-4" />
          Get notified for Upcoming contest
        </Button>

        <ContestSheet contests={contests} />
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
                    <div className="flex-1 relative w-full">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
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
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      className="pl-12"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="flex items-center justify-center">
            <Button
              onClick={!isOtpSent ? handleSendOtp : handleVerifyOtp}
              className="w-full sm:w-auto rounded"
              disabled={fetching || (!isOtpSent && !email) || (isOtpSent && otp.length !== 6)}
            >
              {!isOtpSent ? "Send OTP" : fetching ? "Verifying..." : "Verify OTP"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    className={`${isContestToday ? "bg-red-500" : ""} flex-shrink-0 text-xs md:text-sm`}
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
  )
}