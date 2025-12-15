import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

export function useLeaderboard(scope: "syllabus" | "school" | "global", syllabusId?: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["leaderboard", scope, syllabusId],
    queryFn: () => apiClient.getLeaderboard(scope, syllabusId),
    enabled: !!scope && (scope !== "syllabus" || !!syllabusId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })

  return {
    leaderboard: data || [],
    loading: isLoading,
    error,
    refetch,
  }
}

export function useStudentXP(syllabusId: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["student-xp", syllabusId],
    queryFn: () => apiClient.getStudentXP(syllabusId),
    enabled: !!syllabusId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  return {
    xp: data,
    loading: isLoading,
    error,
    refetch,
  }
}

export function useStudentBadges() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["student-badges"],
    queryFn: () => apiClient.getStudentBadges(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    badges: data || [],
    loading: isLoading,
    error,
    refetch,
  }
}
