// Quiz Performance Hook - Student analytics
// Track accuracy, streaks, trouble spots, badges, XP

import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { QuizPerformance } from '@/types/quiz';
import { useStudentAchievements } from './useStudentAchievements';
import type { StudentBadge, XPLedger, StreakInfo } from '@/types/gamification';
import { QUIZ_URL } from '@/lib/api';

// Use Quiz service (port 8003) for quiz performance data
const API_QUIZ_URL = QUIZ_URL;

/**
 * Enhanced quiz performance with achievements
 * Includes accuracy, streaks, trouble spots, badges, XP
 */
export interface EnhancedQuizPerformance extends QuizPerformance {
  badges: StudentBadge[];
  xp: XPLedger[];
  streaks: StreakInfo[];
}

/**
 * Fetch overall quiz performance for current student
 * Includes accuracy, streaks, trouble spots, per-subchapter breakdown, badges, and XP
 */
export const useQuizPerformance = () => {
  const { toast } = useToast();

  const performanceQuery = useQuery({
    queryKey: ['quiz-performance'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_QUIZ_URL}/api/v1/students/quizzes/performance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }

      return response.json() as Promise<QuizPerformance>;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error: Error) => {
      toast({
        title: 'Error loading performance',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fetch achievements in parallel
  const achievementsQuery = useStudentAchievements();

  // Merge performance with achievements
  const enhancedData: EnhancedQuizPerformance | undefined = performanceQuery.data
    ? {
        ...performanceQuery.data,
        badges: achievementsQuery.data?.badges || [],
        xp: achievementsQuery.data?.xp || [],
        streaks: achievementsQuery.data?.streaks || [],
      }
    : undefined;

  return {
    ...performanceQuery,
    data: enhancedData,
    isLoading: performanceQuery.isLoading || achievementsQuery.isLoading,
  };
};

/**
 * Get performance for specific subchapter
 */
export const useSubchapterPerformance = (subchapterId: string) => {
  const { data: performance } = useQuizPerformance();

  return {
    data: performance?.subchapters.find(s => s.subchapter_id === subchapterId),
    isLoading: !performance,
  };
};

/**
 * Check if subchapter is a trouble spot
 */
export const useIsTroubleSpot = (subchapterId: string) => {
  const { data: performance } = useQuizPerformance();

  return {
    isTroubleSpot: performance?.trouble_spots.includes(subchapterId) ?? false,
    isLoading: !performance,
  };
};
