"use client"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Label } from "./ui/label"
import { UpcomingContest as UpcomingContestType } from "@/app/types"
import Link from "next/link"
import { Bell, Mail, KeyRound, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export const Upcoming_Contest = ({
  upcomingContest,
}: {
  upcomingContest: UpcomingContestType[]
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const { toast } = useToast()

  const handleSendOtp = () => {
    setIsOtpSent(true)
    toast({
      title: "OTP Sent",
      description: "Please check your email for the OTP.",
    })
  }

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
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Contests</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setIsModalOpen(true)} className="mb-4 w-full sm:w-auto">
          <Bell className="mr-2 h-4 w-4" />
          Get notified for Upcoming contest
        </Button>
        {/* Rest of the card content remains unchanged */}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Bell className="mr-2 h-6 w-6 text-primary" />
              Get Notified
            </DialogTitle>
            {/* <DialogDescription>
              Enter your email to receive notifications for upcoming Codeforces contests.
            </DialogDescription> */}
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
                  <div className="flex items-center gap-4">
                  <Label htmlFor="email" className="whitespace-nowrap">
                    Email
                  </Label>
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 rounded"
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
                <div className="flex items-center gap-4">
                <Label htmlFor="email" className="whitespace-nowrap">
                    OTP
                  </Label>
                  <div className="flex-1 relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-12 rounded"
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
          <ul className="space-y-2">
            {upcomingContest.map((contest) => {
              const contestDate = new Date(contest.startTimeSeconds * 1000);
              const isContestToday = isToday(contestDate);

              return (
                <li
                  key={contest.id}
                  className="flex justify-between items-center"
                >
                  <Link
                    href={`https://codeforces.com/contest/${contest.id}`}
                    className="space-x-2"
                  >
                    <span>{contest.name}</span>
                  </Link>
                    <Badge className={isContestToday ? "bg-red-500" : ""}>
                      {isContestToday
                        ? "Today"
                        : contestDate.toLocaleString([], {
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
          <p>No upcoming contests found.</p>
        )}
      </CardContent>
    </Card>
  )
}