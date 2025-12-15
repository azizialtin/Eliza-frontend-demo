// Quiz Performance Card Component
// Displays student's overall quiz performance on dashboard

import React from 'react';
import { useQuizPerformance } from '@/hooks/useQuizPerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Flame, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const QuizPerformanceCard: React.FC = () => {
  const navigate = useNavigate();
  const { data: performance, isLoading } = useQuizPerformance();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-eliza-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!performance) {
    return null;
  }

  const accuracyPercentage = Math.round(performance.overall_accuracy * 100);
  const hasStreak = performance.current_streak >= 3;
  const hasTroubleSpots = performance.trouble_spots.length > 0;

  // Get accuracy color
  const getAccuracyColor = () => {
    if (accuracyPercentage >= 90) return 'text-eliza-green';
    if (accuracyPercentage >= 80) return 'text-eliza-blue';
    if (accuracyPercentage >= 70) return 'text-eliza-yellow';
    return 'text-eliza-red';
  };

  return (
    <Card className="border-2 border-eliza-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-eliza-primary" />
          Quiz Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Accuracy */}
        <div className="text-center">
          <div className={cn('text-5xl font-bold mb-2', getAccuracyColor())}>
            {accuracyPercentage}%
          </div>
          <p className="text-sm text-eliza-text-secondary">
            Overall Accuracy
          </p>
          <p className="text-xs text-eliza-text-secondary mt-1">
            {performance.total_attempts} total attempts
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Streak */}
          <div className="p-4 bg-eliza-surface rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {hasStreak && <Flame className="w-5 h-5 text-eliza-orange" />}
              <span className="text-2xl font-bold text-eliza-text-primary">
                {performance.current_streak}
              </span>
            </div>
            <p className="text-xs text-eliza-text-secondary">Current Streak</p>
          </div>

          {/* Longest Streak */}
          <div className="p-4 bg-eliza-surface rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-bold text-eliza-text-primary">
                {performance.longest_streak}
              </span>
            </div>
            <p className="text-xs text-eliza-text-secondary">Longest Streak</p>
          </div>
        </div>

        {/* Trouble Spots */}
        {hasTroubleSpots && (
          <div className="p-4 bg-eliza-red/10 border border-eliza-red/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-eliza-red flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-eliza-text-primary mb-2">
                  Trouble Spots ({performance.trouble_spots.length})
                </h4>
                <div className="space-y-2">
                  {performance.trouble_spots.slice(0, 3).map((spot) => (
                    <div
                      key={spot.subchapter_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-eliza-text-primary truncate">
                        {spot.subchapter_title}
                      </span>
                      <Badge variant="outline" className="text-eliza-red border-eliza-red ml-2">
                        {Math.round(spot.accuracy * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
                {performance.trouble_spots.length > 3 && (
                  <p className="text-xs text-eliza-text-secondary mt-2">
                    +{performance.trouble_spots.length - 3} more
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Positive Message */}
        {!hasTroubleSpots && performance.total_attempts > 0 && (
          <div className="p-4 bg-eliza-green/10 border border-eliza-green/20 rounded-lg text-center">
            <p className="text-sm text-eliza-text-primary">
              🎉 Great work! You're doing well across all lessons.
            </p>
          </div>
        )}

        {/* View Full Analytics Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/app/analytics')}
        >
          View Full Analytics
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
