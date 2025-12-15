// Progress Tracker Component
// Displays three-part progress indicator: video + sections + quiz + badges

import React from 'react';
import { useSubchapterProgress, useSubchapterCompletionPercentage } from '@/hooks/useProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, PlayCircle, BookOpen, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubchapterBadges } from '@/components/gamification/SubchapterBadges';

interface ProgressTrackerProps {
  subchapterId: string;
  className?: string;
  showDetails?: boolean;
  enabled?: boolean; // Whether to fetch progress (false for teachers/admins)
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  subchapterId,
  className,
  showDetails = true,
  enabled = true,
}) => {
  const { data: progress } = useSubchapterProgress(subchapterId, { enabled });
  const completionPercentage = useSubchapterCompletionPercentage(subchapterId, { enabled });

  if (!progress) {
    return null;
  }

  const components = [
    {
      id: 'video',
      label: 'Video',
      icon: PlayCircle,
      completed: progress.video_watched,
      progress: progress.video_progress_percentage,
      weight: 30,
    },
    {
      id: 'sections',
      label: 'Sections',
      icon: BookOpen,
      completed: progress.all_sections_viewed,
      progress: progress.all_sections_viewed ? 100 : 0,
      weight: 30,
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: ClipboardCheck,
      completed: progress.quiz_passed,
      progress: progress.quiz_score ? progress.quiz_score * 100 : 0,
      weight: 40,
    },
  ];

  return (
    <Card className={cn('border-2 border-eliza-border', className)}>
      <CardContent className="p-6">
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-eliza-text-primary">
              Lesson Progress
            </h3>
            <span className="text-2xl font-bold text-eliza-primary">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          {progress.is_completed && (
            <p className="text-sm text-eliza-green mt-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Lesson completed!
            </p>
          )}
        </div>

        {/* Component Breakdown */}
        {showDetails && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-eliza-text-secondary">
              Requirements
            </p>
            {components.map((component) => {
              const Icon = component.icon;
              return (
                <div key={component.id} className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      component.completed
                        ? 'bg-eliza-green text-white'
                        : 'bg-eliza-surface border-2 border-eliza-border'
                    )}
                  >
                    {component.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5 text-eliza-text-secondary" />
                    )}
                  </div>

                  {/* Component Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-eliza-text-secondary" />
                      <span className="text-sm font-medium text-eliza-text-primary">
                        {component.label}
                      </span>
                      <span className="text-xs text-eliza-text-secondary ml-auto">
                        {component.weight}% weight
                      </span>
                    </div>
                    <Progress
                      value={component.progress}
                      className="h-2"
                    />
                  </div>

                  {/* Progress Percentage */}
                  <div className="text-sm font-medium text-eliza-text-secondary w-12 text-right">
                    {Math.round(component.progress)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Time Spent */}
        {progress.total_time_spent_seconds > 0 && (
          <div className="mt-6 pt-4 border-t border-eliza-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-eliza-text-secondary">Time spent:</span>
              <span className="font-medium text-eliza-text-primary">
                {Math.round(progress.total_time_spent_seconds / 60)} minutes
              </span>
            </div>
          </div>
        )}

        {/* Last Accessed */}
        {progress.last_accessed_at && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-eliza-text-secondary">Last accessed:</span>
              <span className="font-medium text-eliza-text-primary">
                {new Date(progress.last_accessed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Completion Date */}
        {progress.completed_at && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-eliza-text-secondary">Completed:</span>
              <span className="font-medium text-eliza-green">
                {new Date(progress.completed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Badges Section */}
        <div className="mt-6 pt-6 border-t border-eliza-border">
          <SubchapterBadges subchapterId={subchapterId} />
        </div>
      </CardContent>
    </Card>
  );
};

// Compact version for inline display
export const ProgressTrackerCompact: React.FC<{
  subchapterId: string;
  className?: string;
}> = ({ subchapterId, className }) => {
  const { data: progress } = useSubchapterProgress(subchapterId);
  const completionPercentage = useSubchapterCompletionPercentage(subchapterId);

  if (!progress) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-eliza-text-secondary">Progress</span>
        <span className="text-sm font-bold text-eliza-primary">
          {completionPercentage}%
        </span>
      </div>
      <Progress value={completionPercentage} className="h-2" />
      <div className="flex items-center gap-4 text-xs text-eliza-text-secondary">
        <span className={progress.video_watched ? 'text-eliza-green' : ''}>
          {progress.video_watched ? '✓' : '○'} Video
        </span>
        <span className={progress.all_sections_viewed ? 'text-eliza-green' : ''}>
          {progress.all_sections_viewed ? '✓' : '○'} Sections
        </span>
        <span className={progress.quiz_passed ? 'text-eliza-green' : ''}>
          {progress.quiz_passed ? '✓' : '○'} Quiz
        </span>
      </div>
    </div>
  );
};
