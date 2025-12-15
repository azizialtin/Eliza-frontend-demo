// Subchapter Performance Card Component
// Displays detailed performance for a specific subchapter

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizPerformance } from '@/types/quiz';

interface SubchapterPerformanceCardProps {
  subchapterPerformance: QuizPerformance['subchapters'][0];
  className?: string;
}

export const SubchapterPerformanceCard: React.FC<SubchapterPerformanceCardProps> = ({
  subchapterPerformance,
  className,
}) => {
  const accuracyPercentage = Math.round(subchapterPerformance.accuracy * 100);
  
  // Get accuracy color
  const getAccuracyColor = () => {
    if (accuracyPercentage >= 90) return 'text-eliza-green';
    if (accuracyPercentage >= 80) return 'text-eliza-blue';
    if (accuracyPercentage >= 70) return 'text-eliza-yellow';
    return 'text-eliza-red';
  };

  // Get difficulty breakdown
  const easyAccuracy = Math.round((subchapterPerformance.easy_correct / subchapterPerformance.easy_attempts || 0) * 100);
  const standardAccuracy = Math.round((subchapterPerformance.standard_correct / subchapterPerformance.standard_attempts || 0) * 100);
  const hardAccuracy = Math.round((subchapterPerformance.hard_correct / subchapterPerformance.hard_attempts || 0) * 100);

  // Get trend icon
  const getTrendIcon = () => {
    // This would compare to previous performance if available
    // For now, we'll use accuracy as a simple indicator
    if (accuracyPercentage >= 80) return <TrendingUp className="w-4 h-4 text-eliza-green" />;
    if (accuracyPercentage >= 60) return <Minus className="w-4 h-4 text-eliza-yellow" />;
    return <TrendingDown className="w-4 h-4 text-eliza-red" />;
  };

  // Get quick takeaway
  const getQuickTakeaway = () => {
    if (accuracyPercentage >= 90) {
      return "Excellent! You've mastered this lesson.";
    }
    if (accuracyPercentage >= 80) {
      return "Great work! Keep practicing to reach mastery.";
    }
    if (accuracyPercentage >= 70) {
      return "Good progress. Review the concepts and try again.";
    }
    if (subchapterPerformance.hard_attempts > 0 && hardAccuracy < 50) {
      return "Focus on easier questions first to build confidence.";
    }
    return "Review the lesson content and try easier questions.";
  };

  return (
    <Card className={cn('border-2 border-eliza-border', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {subchapterPerformance.subchapter_title}
          </CardTitle>
          {getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Accuracy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-eliza-text-secondary">
              Overall Accuracy
            </span>
            <span className={cn('text-2xl font-bold', getAccuracyColor())}>
              {accuracyPercentage}%
            </span>
          </div>
          <Progress value={accuracyPercentage} className="h-2" />
          <p className="text-xs text-eliza-text-secondary mt-1">
            {subchapterPerformance.total_attempts} attempts
          </p>
        </div>

        {/* Difficulty Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-eliza-text-secondary">
            By Difficulty
          </p>
          
          {/* Easy */}
          {subchapterPerformance.easy_attempts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-eliza-green/20 text-eliza-green">Easy</Badge>
                <span className="text-eliza-text-secondary">
                  {subchapterPerformance.easy_attempts} attempts
                </span>
              </div>
              <span className="font-medium text-eliza-text-primary">
                {easyAccuracy}%
              </span>
            </div>
          )}

          {/* Standard */}
          {subchapterPerformance.standard_attempts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-eliza-yellow/20 text-eliza-yellow">Standard</Badge>
                <span className="text-eliza-text-secondary">
                  {subchapterPerformance.standard_attempts} attempts
                </span>
              </div>
              <span className="font-medium text-eliza-text-primary">
                {standardAccuracy}%
              </span>
            </div>
          )}

          {/* Hard */}
          {subchapterPerformance.hard_attempts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-eliza-red/20 text-eliza-red">Hard</Badge>
                <span className="text-eliza-text-secondary">
                  {subchapterPerformance.hard_attempts} attempts
                </span>
              </div>
              <span className="font-medium text-eliza-text-primary">
                {hardAccuracy}%
              </span>
            </div>
          )}
        </div>

        {/* Last Attempt */}
        {subchapterPerformance.last_attempt_at && (
          <div className="text-xs text-eliza-text-secondary">
            Last attempt: {new Date(subchapterPerformance.last_attempt_at).toLocaleDateString()}
          </div>
        )}

        {/* Quick Takeaway */}
        <div className="p-3 bg-eliza-blue/10 border border-eliza-blue/20 rounded-lg">
          <p className="text-sm text-eliza-text-primary">
            💡 <strong>Tip:</strong> {getQuickTakeaway()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
