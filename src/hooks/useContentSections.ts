// Content Sections Hook - Student view
// Fetches and manages blog-style lesson sections

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { ContentSection, PersonalizedSectionRequest } from '@/types/content-sections';
import { CONTENT_URL, MANAGER_URL, apiClient } from '@/lib/api';

// Use Manager service URL (port 8000) for lesson content and progress tracking
// Content service has been merged into Manager service
const API_CONTENT_URL = MANAGER_URL;
const API_MANAGER_URL = MANAGER_URL;

/**
 * Fetch content sections for a subchapter (student view)
 * Returns base sections sorted by order_index
 *
 * Backend behavior:
 * - If sections exist: returns the list
 * - If none exist: auto-triggers generation and returns []
 * - Empty array means "generation in progress" - poll until populated
 * - 500 error means generation failed
 */
export const useContentSections = (subchapterId: string, options?: { refetchInterval?: number | false }) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['content-sections', subchapterId],
    queryFn: async () => {
      const sections = await apiClient.getStudentContentSections(subchapterId);
      // Sort by order_index
      return sections.sort((a, b) => a.order_index - b.order_index);
    },
    staleTime: 0, // Don't cache when polling for generation
    enabled: !!subchapterId,
    refetchInterval: options?.refetchInterval, // Allow polling configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 500 errors (generation failed)
      if (error?.status === 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Fetch personalized sections for current student
 * Filters sections where student_id matches current user
 */
export const usePersonalizedSections = (subchapterId: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['personalized-sections', subchapterId],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_CONTENT_URL}/api/v1/content/students/subchapters/${subchapterId}/sections`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch personalized sections');
      }

      const sections = await response.json() as ContentSection[];
      // Filter to only STUDENT_EXTRA sections
      return sections.filter(s => s.content_type === 'STUDENT_EXTRA');
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!subchapterId,
  });
};

/**
 * Request a personalized explanation section
 * Cached by signature hash on backend
 */
export const useRequestPersonalizedSection = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: PersonalizedSectionRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_CONTENT_URL}/api/v1/content/students/subchapters/${subchapterId}/sections/personalized`,
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
        throw new Error('Failed to generate personalized section');
      }

      return response.json() as Promise<ContentSection>;
    },
    onSuccess: (newSection) => {
      // Add to personalized sections cache
      queryClient.setQueryData(
        ['personalized-sections', subchapterId],
        (old: ContentSection[] = []) => [...old, newSection]
      );

      toast({
        title: 'Explanation generated!',
        description: 'Your personalized content is ready',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate explanation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Track section view for progress tracking
 */
export const useTrackSectionView = () => {
  return useMutation({
    mutationFn: async ({ subchapterId, sectionId }: { subchapterId: string; sectionId: string }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_MANAGER_URL}/api/v1/subchapters/${subchapterId}/sections/${sectionId}/view`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to track section view');
      }

      return response.json();
    },
  });
};
