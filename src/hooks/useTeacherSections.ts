// Teacher Content Sections Hook
// Manage section regeneration, editing, locking, and media versions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { ContentSection, RegenerateSectionsRequest, UpdateSectionRequest, MediaVersionRequest, MediaVersion } from '@/types/content-sections';
import { MANAGER_URL } from '@/lib/api';

// Use Manager service (port 8000) for lesson content management
// Content service has been merged into Manager service
const API_CONTENT_URL = MANAGER_URL;

/**
 * Fetch all sections for teacher management (includes personalized)
 */
export const useTeacherSections = (subchapterId: string, includePersonalized = true) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['teacher-sections', subchapterId, includePersonalized],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_CONTENT_URL}/api/v1/content/teachers/subchapters/${subchapterId}/sections?include_personalized=${includePersonalized}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const sections = await response.json() as ContentSection[];
      return sections.sort((a, b) => a.order_index - b.order_index);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!subchapterId,
  });
};

/**
 * Regenerate all sections for a subchapter
 * Polls for completion
 */
export const useRegenerateSections = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: RegenerateSectionsRequest = {}) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_CONTENT_URL}/api/v1/content/teachers/subchapters/${subchapterId}/sections/generate`,
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
        throw new Error('Failed to regenerate sections');
      }

      return response.json() as Promise<ContentSection[]>;
    },
    onSuccess: (newSections) => {
      // Update cache with new sections
      queryClient.setQueryData(
        ['teacher-sections', subchapterId, true],
        newSections
      );

      // Also update student view cache
      queryClient.invalidateQueries(['content-sections', subchapterId]);

      toast({
        title: 'Sections regenerated!',
        description: `Generated ${newSections.length} sections`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Regeneration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update section metadata (title, body, order, lock status)
 */
export const useUpdateSection = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sectionId, updates }: { sectionId: string; updates: UpdateSectionRequest }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_CONTENT_URL}/api/v1/content/teachers/sections/${sectionId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update section');
      }

      return response.json() as Promise<ContentSection>;
    },
    onSuccess: (updatedSection) => {
      // Update section in cache
      queryClient.setQueryData(
        ['teacher-sections', subchapterId, true],
        (old: ContentSection[] = []) => 
          old.map(s => s.id === updatedSection.id ? updatedSection : s)
      );

      // Invalidate student view
      queryClient.invalidateQueries(['content-sections', subchapterId]);

      toast({
        title: 'Section updated',
        description: 'Changes saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Request new media version (video/voiceover/script)
 */
export const useRequestMediaVersion = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sectionId, request }: { sectionId: string; request: MediaVersionRequest }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_CONTENT_URL}/api/v1/content/teachers/sections/${sectionId}/media/versions`,
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
        throw new Error('Failed to request media version');
      }

      return response.json() as Promise<MediaVersion>;
    },
    onSuccess: (newVersion, variables) => {
      // Update section's media_versions array
      queryClient.setQueryData(
        ['teacher-sections', subchapterId, true],
        (old: ContentSection[] = []) => 
          old.map(s => {
            if (s.id === variables.sectionId) {
              return {
                ...s,
                media_versions: [...s.media_versions, newVersion],
              };
            }
            return s;
          })
      );

      toast({
        title: 'Media request submitted',
        description: `${newVersion.media_type} generation queued`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Delete a section
 */
export const useDeleteSection = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sectionId: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_CONTENT_URL}/api/v1/content/teachers/sections/${sectionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      return sectionId;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.setQueryData(
        ['teacher-sections', subchapterId, true],
        (old: ContentSection[] = []) => old.filter(s => s.id !== deletedId)
      );

      queryClient.invalidateQueries(['content-sections', subchapterId]);

      toast({
        title: 'Section deleted',
        description: 'Section removed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
