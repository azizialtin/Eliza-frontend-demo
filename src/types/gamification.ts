// Gamification type definitions for badge management, XP tracking, and achievements

export type BadgeCriteriaType = 'manual' | 'quiz_score' | 'streak' | 'completion' | 'participation';

export interface BadgeCriteria {
  type: BadgeCriteriaType;
  notes_required?: boolean; // For manual awards
  minimum_score?: number; // For quiz_score (0-100)
  days_required?: number; // For streak
  sections_required?: boolean; // For completion
  [key: string]: any; // Extensible for future criteria types
}

export interface BadgeDefinition {
  id: string;
  subchapter_id: string;
  badge_key: string;
  display_name: string;
  description: string;
  criteria: BadgeCriteria;
  is_teacher_awardable: boolean;
  icon?: string; // Emoji or unicode
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BadgeDefinitionResponse extends BadgeDefinition {
  // Matches backend response structure exactly
}

export interface StudentBadge {
  id: string;
  badge_definition_id: string;
  subchapter_id: string;
  badge_key: string;
  display_name: string;
  description: string;
  icon?: string;
  awarded_at: string;
  awarded_via: 'auto' | 'teacher';
  awarded_by_id?: string;
  notes?: string;
}

export interface XPLedger {
  syllabus_id: string;
  total_xp: number;
}

export interface StreakInfo {
  syllabus_id: string;
  current_streak: number;
  longest_streak: number;
}

export interface StudentAchievements {
  badges: StudentBadge[];
  xp: XPLedger[];
  streaks: StreakInfo[];
}
