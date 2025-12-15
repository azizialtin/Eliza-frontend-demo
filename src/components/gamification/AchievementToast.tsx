// Achievement Toast - Immediate feedback for XP and badge awards
// Shows brief notification that auto-dismisses

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { StudentBadge } from '@/types/gamification';

interface AchievementToastProps {
  xpAwarded?: number;
  badgesAwarded?: StudentBadge[];
}

export const useAchievementToast = () => {
  const { toast } = useToast();

  const showAchievementToast = ({ xpAwarded, badgesAwarded }: AchievementToastProps) => {
    // Show XP toast
    if (xpAwarded && xpAwarded > 0) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span>+{xpAwarded} XP</span>
          </div>
        ) as any,
        description: 'Experience points earned!',
        duration: 3000,
      });
    }

    // Show badge toasts
    if (badgesAwarded && badgesAwarded.length > 0) {
      badgesAwarded.forEach((badge, index) => {
        setTimeout(() => {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{badge.icon || '🏆'}</span>
                <span>Badge Earned!</span>
              </div>
            ) as any,
            description: badge.display_name,
            duration: 3000,
          });
        }, (xpAwarded ? 500 : 0) + index * 500); // Stagger badge toasts
      });
    }
  };

  return { showAchievementToast };
};

// Component version for direct use
export const AchievementToast = ({ xpAwarded, badgesAwarded }: AchievementToastProps) => {
  const { showAchievementToast } = useAchievementToast();

  useEffect(() => {
    if (xpAwarded || (badgesAwarded && badgesAwarded.length > 0)) {
      showAchievementToast({ xpAwarded, badgesAwarded });
    }
  }, [xpAwarded, badgesAwarded]);

  return null; // This component doesn't render anything
};
