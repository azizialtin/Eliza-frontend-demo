// Achievements Card - Student dashboard display for badges, XP, and streaks
// Shows earned badges and gamification stats

import { Award, Zap, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudentAchievements } from '@/hooks/useStudentAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AchievementsCardProps {
  syllabusId?: string; // Optional filter
  variant?: 'default' | 'sidebar';
}

export const AchievementsCard = ({ syllabusId, variant = 'default' }: AchievementsCardProps) => {
  const { data: achievements, isLoading } = useStudentAchievements(undefined, syllabusId);

  const filteredXP = syllabusId
    ? achievements?.xp.filter((x) => x.syllabus_id === syllabusId)
    : achievements?.xp;

  const filteredStreaks = syllabusId
    ? achievements?.streaks.filter((s) => s.syllabus_id === syllabusId)
    : achievements?.streaks;

  const totalXP = filteredXP?.reduce((sum, x) => sum + x.total_xp, 0) || 0;
  const currentStreak = filteredStreaks?.[0]?.current_streak || 0;
  const longestStreak = filteredStreaks?.[0]?.longest_streak || 0;

  const isSidebar = variant === 'sidebar';

  if (isLoading) {
    return (
      <Card className={isSidebar ? "border-none shadow-none p-0" : ""}>
        <CardHeader className={isSidebar ? "px-0 pt-0" : ""}>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className={isSidebar ? "px-0 space-y-4" : "space-y-4"}>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isSidebar ? "border-none shadow-none" : ""}>
      <CardHeader className={isSidebar ? "px-0 pt-0 pb-4" : ""}>
        <CardTitle className={cn("flex items-center gap-2", isSidebar ? "text-lg" : "")}>
          <Award className="h-5 w-5 text-eliza-purple" />
          Badges & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-6", isSidebar ? "px-0" : "")}>
        {/* XP and Streak Summary */}
        <div className={cn("grid gap-4", isSidebar ? "grid-cols-1" : "grid-cols-2")}>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalXP}</div>
              <div className="text-xs text-gray-600">Total XP</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
              <div className="text-xs text-gray-600">
                Day Streak
                {longestStreak > currentStreak && !isSidebar && (
                  <span className="text-gray-400"> (Best: {longestStreak})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Earned Badges ({achievements?.badges.length || 0})
            </h4>
          </div>

          {!achievements?.badges || achievements.badges.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600">No badges yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Complete quizzes to earn your first badge!
              </p>
            </div>
          ) : (
            <>
              <div className={cn("grid gap-3", isSidebar ? "grid-cols-3" : "grid-cols-3")}>
                {achievements.badges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                    title={badge.description}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-eliza-purple to-eliza-blue flex items-center justify-center text-2xl mb-2">
                      {badge.icon || '🏆'}
                    </div>
                    <div className="text-xs font-medium text-gray-900 text-center line-clamp-2">
                      {badge.display_name}
                    </div>
                    {!isSidebar && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(badge.awarded_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {achievements.badges.length > 6 && (
                <Link
                  to="/achievements"
                  className="block text-center text-sm text-eliza-purple hover:text-eliza-purple/80 font-medium"
                >
                  View All {achievements.badges.length} Badges →
                </Link>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
