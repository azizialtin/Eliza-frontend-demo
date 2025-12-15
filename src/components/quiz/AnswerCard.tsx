// Answer Card Component
// Kahoot-style answer card with color coding

import React from 'react';
import type { QuizOption } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface AnswerCardProps {
  option: QuizOption;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  option,
  index,
  isSelected,
  isCorrect,
  showResult = false,
  onSelect,
  disabled = false,
  className,
}) => {
  // Color mapping for Kahoot-style answers
  const colors = [
    { bg: 'bg-eliza-red hover:bg-eliza-red/90', label: 'bg-eliza-red', text: 'text-white' },
    { bg: 'bg-eliza-blue hover:bg-eliza-blue/90', label: 'bg-eliza-blue', text: 'text-white' },
    { bg: 'bg-eliza-yellow hover:bg-eliza-yellow/90', label: 'bg-eliza-yellow', text: 'text-white' },
    { bg: 'bg-eliza-green hover:bg-eliza-green/90', label: 'bg-eliza-green', text: 'text-white' },
  ];

  const colorScheme = colors[index % colors.length];
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const label = labels[index];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onSelect();
      }
    }
  };

  return (
    <button
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'answer-card group relative p-6 rounded-xl transition-all duration-200 text-left',
        'focus:outline-none focus:ring-4 focus:ring-eliza-primary/50',
        !showResult && !disabled && colorScheme.bg,
        !showResult && !disabled && 'hover:scale-105 hover:shadow-xl',
        isSelected && !showResult && 'ring-4 ring-white scale-105 shadow-xl',
        showResult && isCorrect && 'bg-eliza-green ring-4 ring-eliza-green',
        showResult && !isCorrect && isSelected && 'bg-eliza-red ring-4 ring-eliza-red',
        showResult && !isCorrect && !isSelected && 'bg-eliza-surface opacity-50',
        disabled && 'cursor-not-allowed opacity-75',
        className
      )}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${label}: ${option.text}`}
      tabIndex={0}
    >
      {/* Label badge */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold',
            showResult && isCorrect
              ? 'bg-white text-eliza-green'
              : showResult && !isCorrect && isSelected
              ? 'bg-white text-eliza-red'
              : 'bg-white/20 text-white'
          )}
        >
          {showResult && isCorrect ? (
            <Check className="w-6 h-6" />
          ) : (
            label
          )}
        </div>

        {/* Answer text */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-lg font-semibold leading-tight break-words',
              showResult ? 'text-white' : colorScheme.text
            )}
          >
            {option.text}
          </p>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && !showResult && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <Check className="w-4 h-4 text-eliza-primary" />
          </div>
        </div>
      )}

      {/* Hover effect overlay */}
      {!disabled && !showResult && (
        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
      )}
    </button>
  );
};
