"use client"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { UpcomingContest as UpcomingContestType } from "@/app/types"
import Link from "next/link"
import { Bell, Mail, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "./Providers/fetchAPI";
import ContestSheet from "./contest-sheet"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"


export const Upcoming_Contest = ({
  upcomingContest,
}: {
  upcomingContest: UpcomingContestType[]
}) => {
  const { UpcomingContestData, codforcesContestData } = useStore() as { UpcomingContestData: any, codforcesContestData: any };
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const { toast } = useToast()
  const [Contests, setContests] = useState<any>([]);
  const [allContests, setAllContests] = useState<any>([]);
  const [fetching, setFetching] = useState(false);
  const [ContestData, setContestData] = useState(() => new Set());

  const generate_OTP = async (email: string) => {
    try {
      const response = await fetch("/api/generate_OTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (response.status === 400) {
        return "Email already registered";
      }
      if (response.ok) {
        return "OTP sent successfully";
      } else {
        return "Failed to send OTP";
      }
    } catch (error) {
      return "OTP Generation error";
    }
  }

  const verify_otp = async (email: string, otp: string) => {
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
        }
        )
        return "OTP verified successfully";
      } else {
        console.error("Failed to verify OTP");
        return "Failed to verify OTP";
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
    }
  }

  const handleSendOtp = async () => {
    const toast_title = await generate_OTP(email);
    setIsOtpSent(true)
    toast({
      title: toast_title,
      description: toast_title === 'Email already registered' ? "Bitch ass nigga." : "Please check your email for the OTP.",
    })
  }

  const handleVerifyOtp = async () => {
    setFetching(true);
    const toast_title = await verify_otp(email, otp);
    setFetching(false);
    setIsModalOpen(false)
    setIsOtpSent(false)
    setEmail("")
    setOtp("")
    toast({
      title: toast_title,
      description: toast_title === "OTP verified successfully" ? "You will now receive notifications for upcoming contests." : "Please try again.",
    })
  }

  interface Contest {
    host: string;
    event: string;
    start: string;
    href: string;
    [key: string]: any;
  }

  interface CodeforcesContest {
    host: string,
    name: string,
    href: string,
    start: string,
    [key: string]: any;
  }

  interface UpcomingContestData {
    objects: Contest[];
  }

  const ParseContestData = (UpcomingContestData: UpcomingContestData) => {
    if (!UpcomingContestData) return;

    const newContestData = new Set();

    UpcomingContestData.objects.forEach((contest: Contest) => {
      if (
        contest.host === "codeforces.com" ||
        contest.host === "codechef.com" ||
        contest.host === "atcoder.jp"
      ) {
        let x = {
          platform: contest.host,
          name: contest.event,
          start: new Date(contest.start),
          href: contest.href,
        };
        newContestData.add(x);
      }
    });

    codforcesContestData.result.forEach((contest: CodeforcesContest) => {
      if (contest.phase !== "BEFORE") return;
      let x = {
        platform: "codeforces.com",
        name: contest.name,
        start: new Date(contest.startTimeSeconds * 1000).toISOString(),
        href: `codeforces.com/contests/${contest.id}`,
      };
      newContestData.add(x);
    });

    setContests(Array.from(newContestData).sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime()));
  };


  useEffect(() => {
    if (UpcomingContestData && codforcesContestData) {
      ParseContestData(UpcomingContestData);
    }
  }, [UpcomingContestData, codforcesContestData]);



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

        <ContestSheet contests={Contests} />
      </CardContent>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-full max-w-full mx-2" aria-describedby="notification-dialog-description">
          <DialogTitle className="hidden">Welcome to Codeforces Visualizer</DialogTitle>

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
                    <InputOTP maxLength={6} className="pl-12" value={otp} onChange={(otp) => setOtp(otp)}>
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
              disabled={fetching}
            >
              {!isOtpSent ? "Send OTP" : fetching ? "Verifying" : "Verify OTP"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardContent>
        {upcomingContest && upcomingContest.length > 0 ? (
          <ul className="space-y-3">
            {Contests.slice(0, 6).map((contest: any, index: number) => {
              const isContestToday = isToday(contest.start);
              return (
                <li
                  key={contest.id || index}
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