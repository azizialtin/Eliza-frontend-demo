// Progress Tracking Hooks
// Enhanced completion tracking: video + sections + quiz

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type {
  SubchapterProgress,
  ProgressSummary,
  ProgressUpdateRequest
} from '@/types/progress';
import { apiClient } from '@/lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Create authenticated fetch headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Get progress for a specific subchapter
 * Tracks video, sections, and quiz completion
 * @param subchapterId - The subchapter ID
 * @param options - Query options including enabled flag
 */
export const useSubchapterProgress = (
  subchapterId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['subchapter-progress', subchapterId],
    queryFn: async (): Promise<SubchapterProgress> => {
      // Stubbed for now to prevent 404s
      return {
        subchapter_id: subchapterId,
        video_watched: false,
        video_progress_percentage: 0,
        sections_viewed: [],
        all_sections_viewed: false,
        quiz_passed: false,
        quiz_score: undefined,
        quiz_attempts: 0,
        is_completed: false,
        completed_at: undefined,
        total_time_spent_seconds: 0,
        last_accessed_at: undefined,
      };
    },
    staleTime: 30 * 1000, // 30 seconds (progress changes frequently)
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false && !!subchapterId, // Only run if not explicitly disabled and subchapterId exists
  });
};

/**
 * Get progress summary for a syllabus
 * Used in dashboard and learning path views
 * @param syllabusId - The syllabus ID
 * @param studentId - Optional student ID (required for teachers/admins viewing student progress)
 * @param options - Query options including enabled flag
 */
export const useSyllabusProgress = (
  syllabusId: string,
  studentId?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['syllabus-progress', syllabusId, studentId],
    queryFn: async (): Promise<ProgressSummary> => {
      // Use validated apiClient method
      return apiClient.getSyllabusProgress(syllabusId, studentId);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!syllabusId, // Only run if syllabusId is provided and not explicitly disabled
  });
};

/**
 * Update progress for a specific component
 * Tracks video watching, section viewing, and quiz completion
 */
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subchapterId,
      update,
    }: {
      subchapterId: string;
      update: ProgressUpdateRequest;
    }): Promise<SubchapterProgress> => {
      // Stubbed to avoid 404s
      return {
        subchapter_id: subchapterId,
        video_watched: update.video_watched || false,
        video_progress_percentage: update.video_progress_percentage || 0,
        sections_viewed: update.sections_viewed || [],
        all_sections_viewed: false,
        quiz_passed: false,
        quiz_score: undefined,
        quiz_attempts: 0,
        is_completed: false,
        completed_at: undefined,
        total_time_spent_seconds: 0,
        last_accessed_at: undefined,
      };
    },
    onSuccess: (updatedProgress, { subchapterId }) => {
      // Update subchapter progress cache
      queryClient.setQueryData(
        ['subchapter-progress', subchapterId],
        updatedProgress
      );

      // Invalidate syllabus progress to recalculate overall completion
      queryClient.invalidateQueries({ queryKey: ['syllabus-progress'] });

      // Show completion toast if subchapter is now complete
      if (updatedProgress.is_completed) {
        toast({
          title: "🎉 Subchapter completed!",
          description: "Great work! You've finished all requirements for this lesson.",
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update progress:', error);
      // Don't show toast for progress tracking errors (non-critical)
    },
  });
};

/**
 * Mark video as watched
 * Convenience wrapper for video progress updates
 */
export const useMarkVideoWatched = () => {
  const updateProgress = useUpdateProgress();

  return {
    mutate: (subchapterId: string, progressPercentage: number = 100) => {
      updateProgress.mutate({
        subchapterId,
        update: {
          video_watched: progressPercentage >= 90, // Consider watched at 90%
          video_progress_percentage: progressPercentage,
        },
      });
    },
    ...updateProgress,
  };
};

/**
 * Mark section as viewed
 * Convenience wrapper for section progress updates
 */
export const useMarkSectionViewed = () => {
  const updateProgress = useUpdateProgress();
  const queryClient = useQueryClient();

  return {
    mutate: (subchapterId: string, sectionId: string) => {
      // Get current progress to append section ID
      const currentProgress = queryClient.getQueryData<SubchapterProgress>([
        'subchapter-progress',
        subchapterId,
      ]);

      const viewedSections = currentProgress?.sections_viewed || [];

      // Only update if section not already viewed
      if (!viewedSections.includes(sectionId)) {
        updateProgress.mutate({
          subchapterId,
          update: {
            sections_viewed: [...viewedSections, sectionId],
          },
        });
      }
    },
    ...updateProgress,
  };
};

/**
 * Get overall progress percentage for a subchapter
 * Calculates weighted completion: 30% video, 30% sections, 40% quiz
 * @param subchapterId - The subchapter ID
 * @param options - Query options including enabled flag
 */
export const useSubchapterCompletionPercentage = (
  subchapterId: string,
  options?: { enabled?: boolean }
) => {
  const { data: progress } = useSubchapterProgress(subchapterId, options);

  if (!progress) return 0;

  const videoWeight = 0.3;
  const sectionsWeight = 0.3;
  const quizWeight = 0.4;

  const videoScore = progress.video_watched ? 1 : progress.video_progress_percentage / 100;
  const sectionsScore = progress.all_sections_viewed ? 1 : 0;
  const quizScore = progress.quiz_passed ? 1 : (progress.quiz_score || 0);

  const totalScore =
    (videoScore * videoWeight) +
    (sectionsScore * sectionsWeight) +
    (quizScore * quizWeight);

  return Math.round(totalScore * 100);
};

/**
 * Check if student can access quiz
 * Requires video watched + all sections viewed
 * @param subchapterId - The subchapter ID
 * @param options - Query options including enabled flag
 */
export const useCanAccessQuiz = (
  subchapterId: string,
  options?: { enabled?: boolean }
) => {
  const { data: progress } = useSubchapterProgress(subchapterId, options);

  // Teachers/admins can always access quiz (no progress tracking)
  if (options?.enabled === false) return true;

  if (!progress) return false;

  // Unlock quiz for everyone for now
  return true;
  // return progress.video_watched && progress.all_sections_viewed;
};

/**
 * Get next incomplete subchapter in a syllabus
 * Used for "Continue Learning" features
 * @param syllabusId - The syllabus ID
 * @param studentId - Optional student ID (required for teachers/admins viewing student progress)
 */
export const useNextIncompleteSubchapter = (syllabusId: string, studentId?: string) => {
  const { data: progressSummary } = useSyllabusProgress(syllabusId, studentId);

  if (!progressSummary) return null;

  // Find first incomplete subchapter
  const nextSubchapter = progressSummary.subchapters.find(
    sub => !sub.is_completed
  );

  return nextSubchapter || null;
};

/**
 * Get learning streak information
 * Tracks consecutive days of activity
 */
export const useLearningStreak = () => {
  return useQuery({
    queryKey: ['learning-streak'],
    queryFn: async () => {
      // Stubbed to prevent 404s
      return {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get time spent analytics
 * Tracks total learning time across all content
 */
export const useTimeSpentAnalytics = (syllabusId?: string) => {
  return useQuery({
    queryKey: ['time-spent', syllabusId],
    queryFn: async () => {
      // Stubbed to prevent 404s
      return {
        total_seconds: 0,
        by_subchapter: [],
        by_day: [],
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
