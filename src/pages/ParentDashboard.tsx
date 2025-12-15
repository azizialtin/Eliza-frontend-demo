"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { ChildSelector, type Child } from "@/components/parent/ChildSelector"
import { ChildProgressCard } from "@/components/parent/ChildProgressCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BookOpen, Calendar, ChevronRight } from "lucide-react"
import purpleCharacter from "@/assets/purple-character.png"
import { ELIZA_COLORS } from "@/lib/constants"
import { Button } from "@/components/ui/button"

// Mock Data
const MOCK_CHILDREN: Child[] = [
    { id: "1", name: "Alice Student" },
    { id: "2", name: "Bob Student" }
]

const MOCK_STATS = {
    "1": {
        completedLessons: 12,
        totalLessons: 20,
        averageQuizScore: 85,
        studyTimeHours: 14.5,
        currentStreak: 5,
        recentActivity: [
            { id: 1, type: "quiz", title: "Photosynthesis Quiz", score: 90, date: "2 hours ago" },
            { id: 2, type: "lesson", title: "Plant Biology", date: "Yesterday" },
            { id: 3, type: "login", title: "Logged in", date: "Yesterday" }
        ]
    },
    "2": {
        completedLessons: 5,
        totalLessons: 20,
        averageQuizScore: 72,
        studyTimeHours: 6.0,
        currentStreak: 2,
        recentActivity: [
            { id: 1, type: "lesson", title: "Introduction to Algebra", date: "3 hours ago" },
            { id: 2, type: "quiz", title: "Algebra Basics", score: 65, date: "Yesterday" }
        ]
    }
}

export default function ParentDashboard() {
    const [selectedChildId, setSelectedChildId] = useState<string>(MOCK_CHILDREN[0].id)

    const currentStats = MOCK_STATS[selectedChildId as keyof typeof MOCK_STATS]

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <PageHeader
                title="Parent Dashboard"
                description="Monitor your child's learning progress and achievements."
                icon={<img src={purpleCharacter || "/placeholder.svg"} alt="" className="w-20 h-20 object-contain" />}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

                {/* Child Selector */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-brand text-gray-800">Overview for</h2>
                    <ChildSelector
                        childrenList={MOCK_CHILDREN}
                        selectedChildId={selectedChildId}
                        onSelect={setSelectedChildId}
                    />
                </div>

                {/* Stats Cards */}
                <ChildProgressCard stats={currentStats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <Card className="lg:col-span-2 rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.PURPLE }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-brand">
                                <Activity className="w-5 h-5 text-eliza-purple" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {currentStats.recentActivity.map(activity => (
                                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                {activity.type === 'quiz' && <BookOpen className="w-5 h-5 text-eliza-red" />}
                                                {activity.type === 'lesson' && <BookOpen className="w-5 h-5 text-eliza-blue" />}
                                                {activity.type === 'login' && <Calendar className="w-5 h-5 text-eliza-green" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{activity.title}</p>
                                                <p className="text-sm text-gray-500">{activity.date}</p>
                                            </div>
                                        </div>
                                        {activity.score && (
                                            <span className="font-bold text-eliza-green">{activity.score}%</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions / Notifications (Placeholder) */}
                    <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.ORANGE }}>
                        <CardHeader>
                            <CardTitle className="text-xl font-brand">Parent Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-sm text-gray-700 font-medium">
                                    Encourage {MOCK_CHILDREN.find(c => c.id === selectedChildId)?.name.split(' ')[0]} to retry the "Algebra Basics" quiz to improve their score.
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-sm text-gray-700 font-medium">
                                    New Science module available next week!
                                </p>
                            </div>
                            <Button className="w-full rounded-xl font-brand bg-eliza-orange hover:bg-eliza-orange/90 text-white">
                                View Full Report
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
