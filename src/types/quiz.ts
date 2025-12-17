// Quiz Types for ELIZA Learning Platform
// Comprehensive quiz system with MCQ, open-ended, variants, and analytics

import { StudentBadge } from './gamification';

export type QuestionType = 'multiple_choice' | 'open_ended';

export type QuestionStatus = 'draft' | 'published' | 'archived';

export type QuestionSource = 'pdf_extract' | 'ai_generated' | 'teacher_created';

export type Difficulty = 'easy' | 'standard' | 'hard';

/**
 * Quiz Option - Answer choice for multiple choice questions
 */
export interface QuizOption {
  id: string;
  question_id: string;
  label: string;  // A, B, C, D
  text: string;
  is_correct: boolean;
  source_snippet?: string;
}

/**
 * Quiz Question - Assessment item tied to a subchapter
 */
export interface QuizQuestion {
  id: string;
  subchapter_id: string;
  parent_question_id?: string;  // For variants
  source_type: QuestionSource;
  question_type: QuestionType;
  difficulty: Difficulty;
  status: QuestionStatus;
  body: string;
  answer_explanation: string;
  source_snippet?: string;
  source_chunk_ids: string[];
  options?: QuizOption[];  // For MCQ only
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  additional_metadata: {
    requested_difficulty?: Difficulty;
    generated_for_student?: string;
    extraction_confidence?: number;
  };
}

/**
 * Quiz Attempt - Student submission record
 */
export interface QuizAttempt {
  id: string;
  student_id: string;
  question_id: string;
  difficulty_requested: Difficulty;
  selected_option_id?: string;  // For MCQ
  text_answer?: string;  // For open-ended
  student_submission_url?: string;  // Image/voice upload
  is_correct: boolean;
  score: number;
  time_spent_seconds: number;
  created_at: string;
  xp_awarded?: number;  // XP earned from this attempt
  badges_awarded?: StudentBadge[];  // Badges earned from this attempt
}

/**
 * Quiz Attempt Response - API response after submitting attempt
 */
export interface QuizAttemptResponse extends QuizAttempt {
  xp_awarded: number;
  badges_awarded: StudentBadge[];
}

/**
 * Difficulty Breakdown - Performance by difficulty level
 */
export interface DifficultyBreakdown {
  difficulty: Difficulty;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
}

/**
 * Subchapter Performance - Student performance for one subchapter
 */
export interface SubchapterPerformance {
  subchapter_id: string;
  subchapter_title: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  avg_time_seconds: number;
  last_attempt_at: string;
  difficulty_breakdown: DifficultyBreakdown[];
}

/**
 * Quiz Performance - Overall student quiz analytics
 */
export interface QuizPerformance {
  overall_accuracy: number;
  total_attempts: number;
  current_streak: number;
  longest_streak: number;
  trouble_spots: string[];  // subchapter IDs with <60% accuracy
  subchapters: SubchapterPerformance[];
}

/**
 * Struggling Student - Student needing attention
 */
export interface StrugglingStudent {
  student_id: string;
  student_name: string;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
  last_attempt_at: string;
}

/**
 * Teacher Analytics - Per-subchapter metrics for teachers
 */
export interface TeacherAnalytics {
  subchapter_id: string;
  subchapter_title: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  avg_time_seconds: number;
  unique_students: number;
  difficulty_breakdown: DifficultyBreakdown[];
  top_struggling_students: StrugglingStudent[];
}

/**
 * Teacher Alert - Notification for struggling student
 */
export interface TeacherAlert {
  subchapter_id: string;
  subchapter_title: string;
  student_id: string;
  student_name: string;
  attempts: number;
  correct_attempts: number;
  accuracy: number;
  last_attempt_at: string;
  recommended_action: string;
}

/**
 * Quiz Stats - Coverage summary for teachers
 */
export interface QuizStats {
  total_questions: number;
  draft_count: number;
  published_count: number;
  archived_count: number;
  by_source: {
    pdf_extract: number;
    ai_generated: number;
    teacher_created: number;
  };
  by_subchapter: Array<{
    subchapter_id: string;
    subchapter_title: string;
    question_count: number;
  }>;
}

/**
 * Request body for creating question
 */
export interface CreateQuestionRequest {
  syllabus_id: string;
  subchapter_id: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  body: string;
  answer_explanation: string;
  options?: Array<{
    label: string;
    text: string;
    is_correct: boolean;
  }>;
}

/**
 * Request body for updating question
 */
export interface UpdateQuestionRequest {
  body?: string;
  answer_explanation?: string;
  difficulty?: Difficulty;
  options?: Array<{
    id?: string;
    label: string;
    text: string;
    is_correct: boolean;
  }>;
}

/**
 * Request body for submitting attempt
 */
export interface SubmitAttemptRequest {
  selected_option_id?: string;  // For MCQ
  text_answer?: string;  // For open-ended
  student_submission_url?: string;  // Image/voice upload
  time_spent_seconds: number;
}

/**
 * Request body for requesting variant
 */
export interface RequestVariantRequest {
  difficulty: Difficulty;
}

/**
 * Request body for bulk quiz generation
 */
export interface GenerateQuizRequest {
  subchapter_id: string;
  num_questions?: number;  // Default: 5, range: 1-20
  difficulty_mix?: boolean;  // Default: true
  auto_approve?: boolean;  // Default: false
}

/**
 * Quiz filters for teacher management
 */
export interface QuizFilters {
  status?: QuestionStatus | 'all';
  source?: QuestionSource | 'all';
  syllabus_id?: string;
  subchapter_id?: string;
  document_id?: string;
}

/**
 * Answer Response - Immediate feedback after answering a question
 */
export interface AnswerResponse {
  is_correct: boolean;
  explanation: string;
  correct_answer?: string;
  all_questions_answered?: boolean;
  next_question?: QuizQuestion;
}

/**
 * Quiz Summary - Results after completing a quiz
 */
export interface QuizSummary {
  attempt_id: string;
  score: number;
  total: number;
  percentage: number;
  wrong_questions: Array<{
    question_id: string;
    question_text: string;
    your_answer: string;
    correct_answer: string;
    explanation: string;
    recommended_difficulty: Difficulty;
  }>;
  remediation_required: boolean;
  remedial_plan?: any;
}

/**
 * Remedial Question Response - Response when starting remediation
 */
export interface RemedialQuestionResponse {
  remedial_id: string;
  difficulty: Difficulty;
  progress: {
    completed: number;
    required: number;
  };
  question: QuizQuestion;
}

/**
 * Submit Remedial Answer Response - Feedback for remedial questions
 */
export interface SubmitRemedialAnswerResponse {
  is_correct: boolean;
  explanation: string;
  correct_answer?: string;
  progress: {
    completed: number;
    required: number;
  };
  remedial_completed: boolean;
  next_question?: QuizQuestion;
}

/**
 * Practice Session - Practice mode session data
 */
export interface PracticeSession {
  session_id: string;
  questions: QuizQuestion[];
  quiz_context_used: boolean;
}

/**
 * Practice Answer Response - Feedback for practice questions
 */
export interface PracticeAnswerResponse {
  is_correct: boolean;
  explanation: string;
  correct_answer?: string;
  questions_completed: number;
  total_correct: number;
  next_question?: QuizQuestion;
}
