import { useState, useEffect, useCallback } from 'react';
import { apiClient, Syllabus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Hook for fetching public syllabi
export function usePublicSyllabi() {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSyllabi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPublicSyllabi();
      setSyllabi(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load public courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSyllabi();
  }, [fetchSyllabi]);

  const enrollInSyllabus = async (syllabusId: string) => {
    try {
      const result = await apiClient.enrollInSyllabus(syllabusId);
      toast({
        title: 'Success!',
        description: `Enrolled in ${result.syllabus_name}`,
      });
      return result;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to enroll in course',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return { syllabi, loading, error, refetch: fetchSyllabi, enrollInSyllabus };
}

// Hook for enrolled syllabi with progress (unified for students and teachers)
export function useEnrolledSyllabi() {
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEnrolledSyllabi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getEnrolledSyllabi();
      setSyllabi(data);
    } catch (err: any) {
      setError(err.message);
      // Don't show toast for silent failures (e.g., during auth check)
      if (err.message !== 'Not authenticated') {
        toast({
          title: 'Error',
          description: 'Failed to load your courses',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEnrolledSyllabi();
  }, [fetchEnrolledSyllabi]);

  return { syllabi, loading, error, refetch: fetchEnrolledSyllabi };
}

// Backward compatibility alias
export const useStudentEnrolledSyllabi = useEnrolledSyllabi;

// Hook for detailed syllabus progress (chapter/subchapter breakdown)
export function useSyllabusProgress(syllabusId: string | null, studentId?: string) {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProgress = useCallback(async () => {
    if (!syllabusId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSyllabusProgress(syllabusId, studentId);
      setProgress(data);
    } catch (err: any) {
      setError(err.message);
      // Don't show toast for 400 errors (missing student_id for teachers)
      if (!err.message.includes('Student ID required')) {
        toast({
          title: 'Error',
          description: 'Failed to load progress details',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [syllabusId, studentId, toast]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
}
