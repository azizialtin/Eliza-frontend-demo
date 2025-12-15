import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Clock, Trophy } from "lucide-react"
import { ELIZA_COLORS } from "@/lib/constants"
import { apiClient } from "@/lib/api"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

const MOCK_DATA = [
    { name: "Week 1", completed: 12 },
    { name: "Week 2", completed: 19 },
    { name: "Week 3", completed: 15 },
    { name: "Week 4", completed: 22 },
    { name: "Week 5", completed: 28 },
]

interface StatisticsTabProps {
    syllabusId: string
}

export function StatisticsTab({ syllabusId }: StatisticsTabProps) {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiClient.getSyllabusStats(syllabusId)
                setStats(data)
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [syllabusId])

    const totalStudents = stats?.total_students || 0
    const avgProgress = Math.round(stats?.average_progress || 0)
    const avgScore = Math.round(stats?.average_quiz_score || 0)
    const studyTime = stats?.total_study_time ? Math.round(stats.total_study_time / 60) : 0 // Assuming stats returns minutes

    return (
        <div className="space-y-6 animate-fade-in">
            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.PURPLE }}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-eliza-purple/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-eliza-purple" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Students</p>
                                <h3 className="text-2xl font-bold font-brand">{loading ? "-" : totalStudents}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.BLUE }}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-eliza-blue/10 flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-eliza-blue" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg. Progress</p>
                                <h3 className="text-2xl font-bold font-brand">{loading ? "-" : `${avgProgress}%`}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.GREEN }}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-eliza-green/10 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-eliza-green" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg. Quiz Score</p>
                                <h3 className="text-2xl font-bold font-brand">{loading ? "-" : `${avgScore}%`}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-2 shadow-sm" style={{ borderColor: ELIZA_COLORS.YELLOW }}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-eliza-yellow/10 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-eliza-yellow" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg. Study Time</p>
                                <h3 className="text-2xl font-bold font-brand">{loading ? "-" : `${studyTime}m`}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Chart */}
            <Card className="rounded-2xl border-2 shadow-sm">
                <CardHeader>
                    <CardTitle>Lesson Completion Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip cursor={{ fill: "transparent" }} />
                                <Bar dataKey="completed" fill={`hsl(${ELIZA_COLORS.PURPLE})`} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-gray-500 text-sm mt-8">
                Detailed analytics coming soon!
            </div>
        </div>
    )
}
