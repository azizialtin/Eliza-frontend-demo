"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Trophy, Clock, Target } from "lucide-react"
import { ELIZA_COLORS } from "@/lib/constants"

interface ProgressStats {
    completedLessons: number
    totalLessons: number
    averageQuizScore: number
    studyTimeHours: number
    currentStreak: number
}

interface ChildProgressCardProps {
    stats: ProgressStats
}

export function ChildProgressCard({ stats }: ChildProgressCardProps) {
    const progressPercentage = Math.round((stats.completedLessons / stats.totalLessons) * 100) || 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Progress */}
            <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.BLUE }}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-eliza-blue/10 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-eliza-blue" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Course Progress</p>
                            <h3 className="text-2xl font-bold font-brand">{progressPercentage}%</h3>
                        </div>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-gray-400 mt-2">
                        {stats.completedLessons} of {stats.totalLessons} lessons completed
                    </p>
                </CardContent>
            </Card>

            {/* Quiz Performance */}
            <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.RED }}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-eliza-red/10 flex items-center justify-center">
                            <Target className="w-6 h-6 text-eliza-red" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg. Quiz Score</p>
                            <h3 className="text-2xl font-bold font-brand">{stats.averageQuizScore}%</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Study Time */}
            <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.YELLOW }}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-eliza-yellow/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-eliza-yellow" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Study Time</p>
                            <h3 className="text-2xl font-bold font-brand">{stats.studyTimeHours}h</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Streak */}
            <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.GREEN }}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-eliza-green/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-eliza-green" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Current Streak</p>
                            <h3 className="text-2xl font-bold font-brand">{stats.currentStreak} Days</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
