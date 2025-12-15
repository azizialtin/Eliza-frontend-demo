// Question Card Component
// Displays a single quiz question in Kahoot style

import React from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { FileText, Sparkles, User, Clock } from 'lucide-react';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  showTimer?: boolean;
  timeRemaining?: number;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  showTimer = false,
  timeRemaining,
  className,
}) => {
  // Get source badge config
  const getSourceBadge = () => {
    switch (question.source) {
      case 'pdf_extract':
        return {
          icon: FileText,
          label: 'From PDF',
          color: 'bg-eliza-blue/10 text-eliza-blue',
        };
      case 'ai_generated':
        return {
          icon: Sparkles,
          label: 'AI Variant',
          color: 'bg-eliza-purple/10 text-eliza-purple',
        };
      case 'teacher_created':
        return {
          icon: User,
          label: 'Teacher Authored',
          color: 'bg-eliza-green/10 text-eliza-green',
        };
      default:
        return {
          icon: FileText,
          label: 'Question',
          color: 'bg-eliza-surface text-eliza-text-secondary',
        };
    }
  };

  const sourceBadge = getSourceBadge();
  const SourceIcon = sourceBadge.icon;

  // Get difficulty color
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy':
        return 'text-eliza-green';
      case 'hard':
        return 'text-eliza-red';
      default:
        return 'text-eliza-yellow';
    }
  };

  return (
    <div
      className={cn(
        'question-card bg-gradient-to-br from-eliza-primary to-eliza-primary-hover p-8 rounded-2xl shadow-2xl',
        className
      )}
      role="radiogroup"
      aria-label={`Question ${questionNumber} of ${totalQuestions}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Source badge */}
          <span
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              sourceBadge.color
            )}
          >
            <SourceIcon className="w-4 h-4" />
            {sourceBadge.label}
          </span>

          {/* Difficulty badge */}
          <span
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 backdrop-blur',
              getDifficultyColor()
            )}
          >
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
        </div>

        {/* Timer (if enabled) */}
        {showTimer && timeRemaining !== undefined && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white font-mono font-bold">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Question body */}
      <div className="question-body">
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight whitespace-pre-wrap">
          {question.body}
        </h2>
      </div>

      {/* Question metadata */}
      <div className="mt-6 flex items-center gap-4 text-white/70 text-sm">
        <span>Question {questionNumber} of {totalQuestions}</span>
        {question.question_type === 'multiple_choice' && (
          <span>• Multiple Choice</span>
        )}
        {question.question_type === 'open_ended' && (
          <span>• Open Ended</span>
        )}
      </div>
    </div>
  );
};
