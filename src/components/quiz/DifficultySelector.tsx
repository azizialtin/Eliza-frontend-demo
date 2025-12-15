// Difficulty Selector Component
// Allows students to request question variants at different difficulty levels

import React, { useState } from 'react';
import { useRequestVariant } from '@/hooks/useQuizQuestions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TrendingDown, Minus, TrendingUp, Loader2, Check } from 'lucide-react';
import type { QuizQuestion } from '@/types/quiz';

interface DifficultySelectorProps {
  questionId: string;
  subchapterId: string;
  currentDifficulty: QuizQuestion['difficulty'];
  onVariantGenerated?: (variant: QuizQuestion) => void;
  className?: string;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  questionId,
  subchapterId,
  currentDifficulty,
  onVariantGenerated,
  className,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'standard' | 'hard' | null>(null);
  const requestVariant = useRequestVariant(subchapterId);

  // Handle variant request
  const handleRequestVariant = async (difficulty: 'easy' | 'standard' | 'hard') => {
    setSelectedDifficulty(difficulty);
    
    try {
      const variant = await requestVariant.mutateAsync({
        questionId,
        request: { difficulty },
      });
      
      if (onVariantGenerated) {
        onVariantGenerated(variant);
      }
    } catch (error) {
      console.error('Failed to generate variant:', error);
      setSelectedDifficulty(null);
    }
  };

  const difficulties = [
    {
      value: 'easy' as const,
      label: 'Easier',
      icon: TrendingDown,
      color: 'bg-eliza-green hover:bg-eliza-green/90 text-white',
      description: 'Get a simpler version of this question',
    },
    {
      value: 'standard' as const,
      label: 'Same Difficulty',
      icon: Minus,
      color: 'bg-eliza-yellow hover:bg-eliza-yellow/90 text-white',
      description: 'Try another question at the same level',
    },
    {
      value: 'hard' as const,
      label: 'Harder',
      icon: TrendingUp,
      color: 'bg-eliza-red hover:bg-eliza-red/90 text-white',
      description: 'Challenge yourself with a harder version',
    },
  ];

  return (
    <div className={cn('difficulty-selector', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {difficulties.map((difficulty) => {
          const Icon = difficulty.icon;
          const isLoading = requestVariant.isPending && selectedDifficulty === difficulty.value;
          const isSuccess = requestVariant.isSuccess && selectedDifficulty === difficulty.value;
          const isDisabled = requestVariant.isPending || currentDifficulty === difficulty.value;

          return (
            <Button
              key={difficulty.value}
              onClick={() => handleRequestVariant(difficulty.value)}
              disabled={isDisabled}
              className={cn(
                'h-auto py-4 px-4 flex flex-col items-center gap-2 transition-all',
                difficulty.color,
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              title={difficulty.description}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isSuccess ? (
                <Check className="w-6 h-6" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
              <span className="font-semibold">{difficulty.label}</span>
              {currentDifficulty === difficulty.value && (
                <span className="text-xs opacity-80">(Current)</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Status message */}
      {requestVariant.isPending && (
        <p className="text-sm text-eliza-text-secondary text-center mt-3">
          Generating your variant question...
        </p>
      )}
      {requestVariant.isSuccess && (
        <p className="text-sm text-eliza-green text-center mt-3">
          ✓ Variant generated! Scroll down to see the new question.
        </p>
      )}
    </div>
  );
};
