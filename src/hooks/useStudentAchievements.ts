// Student Achievement Hooks
// API hooks for fetching student achievements, awarding badges, and revoking badges

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentAchievements, StudentBadge } from '../types/gamification';
import { apiClient } from '@/lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get authentication token from localStorage
 */
const getToken = (): string => {
  return localStorage.getItem('access_token') || '';
};

/**
 * Get current user from localStorage
 */
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Fetch student achievements
 * If studentId is provided and user is teacher/admin, fetch for that student
 * Otherwise, fetch for current user
 */
export const useStudentAchievements = (studentId?: string, syllabusId?: string) => {
  return useQuery({
    queryKey: ['student-achievements', studentId || 'me', syllabusId],
    queryFn: async (): Promise<StudentAchievements> => {
      // Use stubbed method from apiClient to prevent 404s for now
      return await apiClient.getStudentAchievements(studentId, syllabusId);
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Award a badge to a student (teacher only)
 */
export const useAwardBadge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      badgeDefinitionId,
      studentId,
      notes,
    }: {
      badgeDefinitionId: string;
      studentId: string;
      notes?: string;
    }): Promise<StudentBadge> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/gamification/teachers/badges/${badgeDefinitionId}/award`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            student_id: studentId,
            notes,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to award badge');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate student achievements for the specific student
      queryClient.invalidateQueries({
        queryKey: ['student-achievements', variables.studentId],
      });
      // Invalidate current user achievements (in case it's the same)
      queryClient.invalidateQueries({
        queryKey: ['student-achievements', 'me'],
      });
      // Invalidate teacher analytics
      queryClient.invalidateQueries({
        queryKey: ['quiz-analytics'],
      });
      queryClient.invalidateQueries({
        queryKey: ['teacher-analytics'],
      });
    },
  });
};

/**
 * Revoke a badge from a student (teacher only)
 */
export const useRevokeBadge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentBadgeId: string): Promise<void> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/gamification/teachers/student-badges/${studentBadgeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to revoke badge');
      }
    },
    onSuccess: () => {
      // Invalidate all student achievements queries
      queryClient.invalidateQueries({
        queryKey: ['student-achievements'],
      });
      // Invalidate teacher analytics
      queryClient.invalidateQueries({
        queryKey: ['quiz-analytics'],
      });
      queryClient.invalidateQueries({
        queryKey: ['teacher-analytics'],
      });
    },
  });
};
