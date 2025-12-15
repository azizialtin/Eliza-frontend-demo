// Subchapter Badges - Display available and earned badges for a subchapter
// Shows badge criteria and progress toward earning them

import { Award, Check } from 'lucide-react';
import { useBadgeDefinitions } from '@/hooks/useBadgeDefinitions';
import { useStudentAchievements } from '@/hooks/useStudentAchievements';
import { Skeleton } from '@/components/ui/skeleton';
import type { BadgeDefinition } from '@/types/gamification';

interface SubchapterBadgesProps {
  subchapterId: string;
}

export const SubchapterBadges = ({ subchapterId }: SubchapterBadgesProps) => {
  const { data: badgeDefinitions, isLoading: loadingDefinitions } =
    useBadgeDefinitions(subchapterId);
  const { data: achievements, isLoading: loadingAchievements } =
    useStudentAchievements();

  const isLoading = loadingDefinitions || loadingAchievements;

  // Get earned badge IDs for this subchapter
  const earnedBadgeKeys = new Set(
    achievements?.badges
      .filter((b) => b.subchapter_id === subchapterId)
      .map((b) => b.badge_key) || []
  );

  const getCriteriaText = (badge: BadgeDefinition) => {
    const { criteria } = badge;
    switch (criteria.type) {
      case 'manual':
        return 'Awarded by teacher for outstanding work';
      case 'quiz_score':
        return `Score ${criteria.minimum_score || 90}% or higher on the quiz`;
      case 'streak':
        return `Maintain a ${criteria.days_required || 5} day learning streak`;
      case 'completion':
        return criteria.sections_required
          ? 'Complete all sections and pass the quiz'
          : 'Pass the quiz with 70% or higher';
      case 'participation':
        return 'Awarded for active participation';
      default:
        return 'Complete the requirements';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!badgeDefinitions || badgeDefinitions.length === 0) {
    return null; // No badges for this subchapter
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Award className="h-4 w-4 text-eliza-purple" />
        Available Badges ({badgeDefinitions.length})
      </h4>

      <div className="grid gap-3">
        {badgeDefinitions.map((badge) => {
          const isEarned = earnedBadgeKeys.has(badge.badge_key);

          return (
            <div
              key={badge.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                isEarned
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-eliza-purple/50'
              }`}
            >
              {/* Badge Icon */}
              <div className="flex-shrink-0 relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    isEarned
                      ? 'bg-gradient-to-br from-green-400 to-green-600'
                      : 'bg-gradient-to-br from-gray-200 to-gray-300'
                  }`}
                >
                  {badge.icon || '🏆'}
                </div>
                {isEarned && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                      {badge.display_name}
                      {isEarned && (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                          Earned
                        </span>
                      )}
                    </h5>
                    <p className="text-xs text-gray-600 mt-1">
                      {badge.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">How to earn:</span>{' '}
                      {getCriteriaText(badge)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
