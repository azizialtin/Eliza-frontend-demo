// Quiz Questions Hook - Student view
// Fetch published questions and submit attempts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { QuizQuestion, QuizAttempt, SubmitAttemptRequest, RequestVariantRequest } from '@/types/quiz';
import { QUIZ_URL } from '@/lib/api';

// Use Quiz service (port 8003) for quiz questions and attempts
const API_QUIZ_URL = QUIZ_URL;

/**
 * Fetch published quiz questions for a subchapter
 * Includes any personalized variants for the student
 */
export const useQuizQuestions = (subchapterId: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['quiz-questions', subchapterId],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_QUIZ_URL}/api/v1/quizzes/subchapters/${subchapterId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }

      return response.json() as Promise<QuizQuestion[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!subchapterId,
  });
};

/**
 * Get single question details (with parent info for variants)
 */
export const useQuizQuestion = (questionId: string) => {
  return useQuery({
    queryKey: ['quiz-question', questionId],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_QUIZ_URL}/api/v1/students/quizzes/${questionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      return response.json() as Promise<QuizQuestion>;
    },
    enabled: !!questionId,
  });
};

/**
 * Submit quiz attempt
 * Auto-scores MCQ, records open-ended submissions
 */
export const useSubmitAttempt = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, attempt }: { questionId: string; attempt: SubmitAttemptRequest }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_QUIZ_URL}/api/v1/quizzes/subchapters/${subchapterId}/questions/${questionId}/answer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attempt),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit attempt');
      }

      return response.json() as Promise<QuizAttempt>;
    },
    onSuccess: () => {
      // Invalidate performance data to refresh
      queryClient.invalidateQueries({ queryKey: ['quiz-performance'] });
      queryClient.invalidateQueries({ queryKey: ['subchapter-progress', subchapterId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Request a question variant (easier/same/harder)
 * Generates on-demand with loading state
 */
export const useRequestVariant = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, request }: { questionId: string; request: RequestVariantRequest }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_QUIZ_URL}/api/v1/students/quizzes/${questionId}/variants`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate variant');
      }

      return response.json() as Promise<QuizQuestion>;
    },
    onSuccess: (newVariant) => {
      // Add variant to questions list
      queryClient.setQueryData(
        ['quiz-questions', subchapterId],
        (old: QuizQuestion[] = []) => [...old, newVariant]
      );

      toast({
        title: 'New question generated!',
        description: `${newVariant.difficulty} variant ready`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Batch submit multiple attempts (for full quiz submission)
 */
export const useSubmitQuizAttempts = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (attempts: Array<{ questionId: string; attempt: SubmitAttemptRequest }>) => {
      const token = localStorage.getItem('access_token');

      // Submit all attempts in parallel
      const promises = attempts.map(({ questionId, attempt }) =>
        fetch(`${API_QUIZ_URL}/api/v1/quizzes/subchapters/${subchapterId}/questions/${questionId}/answer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attempt),
        }).then(res => res.json())
      );

      return Promise.all(promises) as Promise<QuizAttempt[]>;
    },
    onSuccess: (results) => {
      // Calculate score
      const correct = results.filter(r => r.is_correct).length;
      const total = results.length;
      const percentage = Math.round((correct / total) * 100);

      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['quiz-performance'] });
      queryClient.invalidateQueries({ queryKey: ['subchapter-progress', subchapterId] });

      toast({
        title: 'Quiz submitted!',
        description: `You scored ${percentage}% (${correct}/${total} correct)`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
