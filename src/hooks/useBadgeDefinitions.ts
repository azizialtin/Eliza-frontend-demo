// Badge Definition Management Hooks
// API hooks for creating, reading, updating, and deleting badge definitions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeDefinition, BadgeDefinitionResponse } from '../types/gamification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get authentication token from localStorage
 */
const getToken = (): string => {
  return localStorage.getItem('access_token') || '';
};

/**
 * Fetch badge definitions for a subchapter
 */
export const useBadgeDefinitions = (subchapterId: string) => {
  return useQuery({
    queryKey: ['badge-definitions', subchapterId],
    queryFn: async (): Promise<BadgeDefinitionResponse[]> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/gamification/teachers/subchapters/${subchapterId}/badges`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch badge definitions');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!subchapterId,
  });
};

/**
 * Create a new badge definition
 */
export const useCreateBadgeDefinition = (subchapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<BadgeDefinition>): Promise<BadgeDefinitionResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/gamification/teachers/subchapters/${subchapterId}/badges`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create badge definition');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate badge definitions for this subchapter
      queryClient.invalidateQueries({ queryKey: ['badge-definitions', subchapterId] });
    },
  });
};

/**
 * Update an existing badge definition
 */
export const useUpdateBadgeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      badgeId,
      updates,
    }: {
      badgeId: string;
      updates: Partial<BadgeDefinition>;
    }): Promise<BadgeDefinitionResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/gamification/teachers/badges/${badgeId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update badge definition');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all badge definitions queries
      queryClient.invalidateQueries({ queryKey: ['badge-definitions'] });
    },
  });
};

/**
 * Delete a badge definition
 * Note: Deletion is blocked if students have already earned the badge
 */
export const useDeleteBadgeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeId: string): Promise<void> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/gamification/teachers/badges/${badgeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete badge definition');
      }
    },
    onSuccess: () => {
      // Invalidate all badge definitions queries
      queryClient.invalidateQueries({ queryKey: ['badge-definitions'] });
    },
  });
};
