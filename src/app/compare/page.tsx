"use client";
import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Code2, Trophy, Users, Search, BellRing, Settings, UserPlus, ArrowRightLeft, Star, TrendingUp, Award } from 'lucide-react'

export default function EnhancedUserComparison() {
    const [user1, setUser1] = useState("tourist")
    const [user2, setUser2] = useState("Petr")

    // Mock data for demonstration
    const userData: { [key: string]: any } = {
        tourist: {
            username: "tourist",
            rating: 3779,
            maxRating: 3858,
            rank: "Legendary Grandmaster",
            solved: 4215,
            contests: 323,
            contributions: 78,
            friendsCount: 215,
            ratingHistory: [
                { contest: 1, rating: 3000 },
                { contest: 2, rating: 3200 },
                { contest: 3, rating: 3400 },
                { contest: 4, rating: 3600 },
                { contest: 5, rating: 3779 },
            ],
            problemRatings: [
                { rating: 1200, count: 100 },
                { rating: 1400, count: 200 },
                { rating: 1600, count: 300 },
                { rating: 1800, count: 400 },
                { rating: 2000, count: 500 },
                { rating: 2200, count: 400 },
                { rating: 2400, count: 300 },
            ],
            tags: [
                { name: "dp", count: 500 },
                { name: "graphs", count: 450 },
                { name: "math", count: 400 },
                { name: "data structures", count: 350 },
                { name: "greedy", count: 300 },
            ],
        },
        Petr: {
            username: "Petr",
            rating: 3517,
            maxRating: 3743,
            rank: "International Grandmaster",
            solved: 3876,
            contests: 298,
            contributions: 62,
            friendsCount: 189,
            ratingHistory: [
                { contest: 1, rating: 2800 },
                { contest: 2, rating: 3000 },
                { contest: 3, rating: 3200 },
                { contest: 4, rating: 3400 },
                { contest: 5, rating: 3517 },
            ],
            problemRatings: [
                { rating: 1200, count: 150 },
                { rating: 1400, count: 250 },
                { rating: 1600, count: 350 },
                { rating: 1800, count: 450 },
                { rating: 2000, count: 400 },
                { rating: 2200, count: 300 },
                { rating: 2400, count: 200 },
            ],
            tags: [
                { name: "dp", count: 450 },
                { name: "graphs", count: 400 },
                { name: "math", count: 350 },
                { name: "data structures", count: 300 },
                { name: "greedy", count: 250 },
            ],
        },
    }

    const compareUsers = () => {
        // In a real application, this would fetch data for the two users
        console.log(`Comparing ${user1} and ${user2}`)
    }

    const getRankColor = (rank: keyof typeof rankColors) => {
        const rankColors = {
            "Legendary Grandmaster": "text-[hsl(var(--destructive))]",
            "International Grandmaster": "text-[hsl(var(--destructive))]",
            "Grandmaster": "text-[hsl(var(--destructive))]",
            "International Master": "text-[hsl(var(--primary))]",
            "Master": "text-[hsl(var(--primary))]",
            "Candidate Master": "text-[hsl(var(--accent))]",
            "Expert": "text-[hsl(var(--secondary))]",
            "Specialist": "text-[hsl(var(--muted))]",
            "Pupil": "text-[hsl(var(--foreground))]",
            "Newbie": "text-[hsl(var(--border))]",
        }
        return rankColors[rank] || "text-[hsl(var(--border))]"
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Compare Codeforces Users</CardTitle>
                    <CardDescription>Enter two Codeforces IDs to compare their performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="user1" className="block text-sm font-medium text-gray-700 mb-1">
                                User 1
                            </label>
                            <Input
                                id="user1"
                                placeholder="Enter Codeforces ID"
                                value={user1}
                                onChange={(e) => setUser1(e.target.value)}
                            />
                        </div>
                        <ArrowRightLeft className="hidden sm:block" />
                        <div className="flex-1">
                            <label htmlFor="user2" className="block text-sm font-medium text-gray-700 mb-1">
                                User 2
                            </label>
                            <Input
                                id="user2"
                                placeholder="Enter Codeforces ID"
                                value={user2}
                                onChange={(e) => setUser2(e.target.value)}
                            />
                        </div>
                        <Button onClick={compareUsers}>Compare</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {[userData[user1 as keyof typeof userData], userData[user2 as keyof typeof userData]].map((user, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-card">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`} />
                                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{user.username}</CardTitle>
                                    <CardDescription className={`text-lg font-semibold ${getRankColor(user.rank)}`}>
                                        {user.rank}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{user.rating}</div>
                                    <div className="text-sm text-gray-500">Current Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{user.maxRating}</div>
                                    <div className="text-sm text-gray-500">Max Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{user.solved}</div>
                                    <div className="text-sm text-gray-500">Problems Solved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{user.contests}</div>
                                    <div className="text-sm text-gray-500">Contests</div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Trophy className="w-5 h-5 mr-2" />
                                    <span className="font-medium mr-2">Contributions:</span>
                                    <span>{user.contributions}</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    <span className="font-medium mr-2">Friends:</span>
                                    <span>{user.friendsCount}</span>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <Tabs defaultValue="rating" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="rating">Rating History</TabsTrigger>
                                    <TabsTrigger value="problems">Problem Ratings</TabsTrigger>
                                    <TabsTrigger value="tags">Top Tags</TabsTrigger>
                                </TabsList>
                                <TabsContent value="rating">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={user.ratingHistory}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="contest" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="rating" stroke="#8884d8" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </TabsContent>
                                <TabsContent value="problems">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={user.problemRatings}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="rating" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </TabsContent>
                                <TabsContent value="tags">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RadarChart data={user.tags}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="name" />
                                            <PolarRadiusAxis />
                                            <Radar name="Tags" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </TabsContent>
                            </Tabs>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>Problem Solving Efficiency</span>
                                        <span>{Math.round((user.solved / user.contests) * 10) / 10} problems/contest</span>
                                    </div>
                                    <Progress value={Math.min((user.solved / user.contests / 10) * 100, 100)} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>Rating Percentile</span>
                                        <span>{Math.round((user.rating / 4000) * 100)}%</span>
                                    </div>
                                    <Progress value={(user.rating / 4000) * 100} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}