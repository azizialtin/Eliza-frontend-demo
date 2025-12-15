// Achievement Celebration Modal - Celebration UI for XP and badges
// Shows confetti animation and achievement details after quiz completion

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import type { StudentBadge } from '@/types/gamification';

interface AchievementCelebrationProps {
  xpAwarded: number;
  badgesAwarded: StudentBadge[];
  totalXP: number;
  onClose: () => void;
}

export const AchievementCelebration = ({
  xpAwarded,
  badgesAwarded,
  totalXP,
  onClose,
}: AchievementCelebrationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Show XP first (index 0), then badges (index 1+)
  const totalItems = (xpAwarded > 0 ? 1 : 0) + badgesAwarded.length;
  const hasMultiple = totalItems > 1;

  const showNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const showingXP = currentIndex === 0 && xpAwarded > 0;
  const badgeIndex = xpAwarded > 0 ? currentIndex - 1 : currentIndex;
  const currentBadge = badgesAwarded[badgeIndex];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center py-8 space-y-6">
          {showingXP ? (
            // XP Celebration
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
                <span className="text-4xl">⚡</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-eliza-purple animate-pulse">
                  +{xpAwarded} XP
                </h2>
                <p className="text-lg text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{totalXP} XP</span>
                </p>
                <p className="text-sm text-gray-500">Great work! Keep it up!</p>
              </div>
            </div>
          ) : currentBadge ? (
            // Badge Celebration
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-eliza-purple to-eliza-blue flex items-center justify-center animate-bounce shadow-lg">
                <span className="text-5xl">{currentBadge.icon || '🏆'}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Badge Earned!</h2>
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-eliza-purple">
                  {currentBadge.display_name}
                </h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  {currentBadge.description}
                </p>
                {currentBadge.notes && (
                  <p className="text-xs text-gray-500 italic mt-2">
                    "{currentBadge.notes}"
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* Navigation */}
          <div className="flex flex-col items-center gap-2">
            {hasMultiple && (
              <div className="flex gap-1">
                {[...Array(totalItems)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-eliza-purple' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
            <Button
              onClick={showNext}
              className="bg-eliza-purple hover:bg-eliza-purple/90 px-8"
            >
              {currentIndex < totalItems - 1 ? 'Next' : 'Continue'}
            </Button>
          </div>
        </div>

        <style>{`
          .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            opacity: 0;
            animation: confetti-fall 3s linear infinite;
          }
          
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100%) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
