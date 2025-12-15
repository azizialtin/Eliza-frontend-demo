// Progress Tracking Types
// Enhanced completion tracking: video + sections + quiz

/**
 * Progress tracking for a single subchapter
 * Tracks video, sections, and quiz completion
 */
export interface SubchapterProgress {
  subchapter_id: string;
  
  // Video progress
  video_watched: boolean;
  video_progress_percentage: number; // 0-100
  
  // Section progress
  sections_viewed: string[]; // Array of section IDs
  all_sections_viewed: boolean;
  
  // Quiz progress
  quiz_passed: boolean;
  quiz_score?: number; // 0-1 (average score across attempts)
  quiz_attempts: number;
  
  // Overall completion
  is_completed: boolean; // All three components complete
  completed_at?: string; // ISO timestamp
  
  // Analytics
  total_time_spent_seconds: number;
  last_accessed_at?: string; // ISO timestamp
}

/**
 * Progress summary for a syllabus
 * Aggregates progress across all subchapters
 */
export interface ProgressSummary {
  syllabus_id: string;
  
  // Overall metrics
  total_subchapters: number;
  completed_subchapters: number;
  completion_percentage: number; // 0-100
  
  // Component-specific metrics
  videos_watched: number;
  sections_viewed_count: number;
  quizzes_passed: number;
  
  // Per-subchapter breakdown
  subchapters: SubchapterProgressSummary[];
  
  // Time tracking
  total_time_spent_seconds: number;
  average_time_per_subchapter_seconds: number;
  
  // Streak information
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date?: string; // ISO date (YYYY-MM-DD)
}

/**
 * Condensed progress info for a subchapter in summary view
 */
export interface SubchapterProgressSummary {
  subchapter_id: string;
  subchapter_title: string;
  is_completed: boolean;
  completion_percentage: number; // 0-100 (weighted)
  video_watched: boolean;
  all_sections_viewed: boolean;
  quiz_passed: boolean;
  last_accessed_at?: string;
}

/**
 * Request to update progress
 * Partial updates allowed
 */
export interface ProgressUpdateRequest {
  // Video updates
  video_watched?: boolean;
  video_progress_percentage?: number;
  
  // Section updates
  sections_viewed?: string[]; // Full array or append
  
  // Quiz updates (typically updated via quiz attempt submission)
  quiz_passed?: boolean;
  quiz_score?: number;
  
  // Time tracking
  time_spent_seconds?: number; // Increment to total
}

/**
 * Learning streak information
 */
export interface LearningStreak {
  current_streak: number; // Days
  longest_streak: number; // Days
  last_activity_date: string | null; // ISO date
  streak_active: boolean; // True if activity today or yesterday
}

/**
 * Time spent analytics
 */
export interface TimeSpentAnalytics {
  total_seconds: number;
  
  // Breakdown by subchapter
  by_subchapter: {
    subchapter_id: string;
    subchapter_title: string;
    seconds: number;
  }[];
  
  // Breakdown by day (last 30 days)
  by_day: {
    date: string; // ISO date
    seconds: number;
  }[];
}

/**
 * Progress milestone event
 * Triggered when student reaches significant milestones
 */
export interface ProgressMilestone {
  type: 'first_video' | 'first_quiz' | 'first_completion' | 
        'streak_5' | 'streak_10' | 'streak_30' |
        'syllabus_25' | 'syllabus_50' | 'syllabus_75' | 'syllabus_100';
  achieved_at: string; // ISO timestamp
  title: string;
  description: string;
  icon: string; // Emoji or icon name
}

/**
 * Teacher view of student progress
 * Used in teacher analytics dashboards
 */
export interface StudentProgressOverview {
  student_id: string;
  student_name: string;
  student_email: string;
  
  // Overall metrics
  syllabi_enrolled: number;
  total_subchapters_available: number;
  completed_subchapters: number;
  overall_completion_percentage: number;
  
  // Recent activity
  last_activity_date?: string;
  days_since_last_activity?: number;
  current_streak: number;
  
  // Performance indicators
  average_quiz_score: number; // 0-1
  total_quiz_attempts: number;
  videos_watched: number;
  
  // Flags
  is_struggling: boolean; // Low quiz scores or no recent activity
  needs_attention: boolean; // Teacher alert triggered
}

/**
 * Class-wide progress analytics for teachers
 */
export interface ClassProgressAnalytics {
  syllabus_id: string;
  syllabus_title: string;
  
  // Overall metrics
  total_students: number;
  active_students_last_7_days: number;
  average_completion_percentage: number;
  
  // Distribution
  completion_distribution: {
    range: string; // "0-25%", "26-50%", etc.
    student_count: number;
  }[];
  
  // Per-subchapter breakdown
  subchapter_analytics: {
    subchapter_id: string;
    subchapter_title: string;
    students_completed: number;
    average_quiz_score: number;
    average_time_spent_seconds: number;
  }[];
  
  // Students needing attention
  struggling_students: StudentProgressOverview[];
}
