"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Medal, Award, Crown, Sparkles, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useLeaderboard } from "@/hooks/useGamification"

interface LeaderboardProps {
  syllabusId: string
  className?: string
}

export function Leaderboard({ syllabusId, className }: LeaderboardProps) {
  const [scope, setScope] = useState<"syllabus" | "school" | "global">("syllabus")
  const { user } = useAuth()

  const { leaderboard, loading } = useLeaderboard(scope, syllabusId)

  const leaderboardData = leaderboard.map((entry) => ({
    ...entry,
    is_current_user: entry.student_id === user?.id,
    level: Math.floor(entry.total_xp / 300), // Simple level calculation: 300 XP per level
  }))

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200"
      case 2:
        return "bg-gray-50 border-gray-200"
      case 3:
        return "bg-amber-50 border-amber-200"
      default:
        return "bg-white border-gray-100"
    }
  }

  return (
    <Card className={`rounded-3xl border-4 border-eliza-purple ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-brand text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-eliza-yellow" />
            Leaderboard
          </CardTitle>
        </div>
        <Select value={scope} onValueChange={(value: any) => setScope(value)}>
          <SelectTrigger className="w-full mt-2 font-brand">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="syllabus" className="font-brand">
              This Course
            </SelectItem>
            <SelectItem value="school" className="font-brand">
              My School
            </SelectItem>
            <SelectItem value="global" className="font-brand">
              Global
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-eliza-purple" />
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-brand text-sm text-gray-500">No rankings yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] px-6 pb-6">
            <div className="space-y-2">
              {leaderboardData.map((entry) => (
                <div
                  key={entry.student_id}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                    ${
                      entry.is_current_user
                        ? "bg-eliza-purple/10 border-eliza-purple ring-2 ring-eliza-purple/20"
                        : getRankColor(entry.rank)
                    }
                    ${entry.rank <= 3 ? "shadow-sm" : ""}
                  `}
                >
                  {/* Rank Icon */}
                  <div className="flex-shrink-0">{getRankIcon(entry.rank)}</div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-brand font-bold text-sm truncate ${entry.is_current_user ? "text-eliza-purple" : "text-gray-900"}`}
                      >
                        {entry.student_name}
                      </p>
                      {entry.is_current_user && (
                        <Badge className="bg-eliza-purple text-white text-xs px-2 py-0">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-eliza-yellow" />
                        <span className="text-xs font-brand text-gray-600">{entry.total_xp} XP</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-brand text-gray-600">Level {entry.level}</span>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  {entry.rank <= 3 && (
                    <Badge
                      className={`
                        font-brand font-bold
                        ${entry.rank === 1 ? "bg-yellow-500 text-white" : ""}
                        ${entry.rank === 2 ? "bg-gray-400 text-white" : ""}
                        ${entry.rank === 3 ? "bg-amber-600 text-white" : ""}
                      `}
                    >
                      #{entry.rank}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
