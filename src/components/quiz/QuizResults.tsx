// Quiz Results Component
// Displays quiz results with explanations, variant options, and achievements

import React, { useState, useEffect } from 'react';
import type { QuizQuestion, QuizAttempt } from '@/types/quiz';
import { DifficultySelector } from './DifficultySelector';
import { AchievementCelebration } from '@/components/gamification/AchievementCelebration';
import { useAchievementToast } from '@/components/gamification/AchievementToast';
import { useStudentAchievements } from '@/hooks/useStudentAchievements';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  XCircle,
  RotateCcw,
  BookOpen,
  Zap,
  Award,
  Sparkles
} from 'lucide-react';

interface QuizResultsProps {
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  onClose?: () => void;
  onRetake?: () => void;
  className?: string;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  attempts,
  onClose,
  onRetake,
  className,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const { showAchievementToast } = useAchievementToast();
  const { data: achievements } = useStudentAchievements();

  // Calculate overall score
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = totalScore / attempts.length;
  const percentageScore = Math.round(averageScore * 100);
  const correctCount = attempts.filter(a => a.is_correct).length;
  const isPassing = averageScore >= 0.7; // 70% passing threshold

  // Extract XP and badges from attempts
  const totalXPAwarded = attempts.reduce((sum, a) => sum + (a.xp_awarded || 0), 0);
  const badgesAwarded = attempts.flatMap(a => a.badges_awarded || []);

  // Get current total XP (assuming first syllabus for now)
  const currentTotalXP = achievements?.xp[0]?.total_xp || 0;

  // Show toasts and celebration on mount if achievements earned
  useEffect(() => {
    if (totalXPAwarded > 0 || badgesAwarded.length > 0) {
      // Show toast notifications immediately
      showAchievementToast({ xpAwarded: totalXPAwarded, badgesAwarded });
      
      // Show celebration modal after a brief delay
      setTimeout(() => {
        setShowCelebration(true);
      }, 1000);
    }
  }, [totalXPAwarded, badgesAwarded.length]);

  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Get attempt for a question
  const getAttempt = (questionId: string) => {
    return attempts.find(a => a.question_id === questionId);
  };

  return (
    <div
      className={cn(
        'quiz-results min-h-screen bg-eliza-background',
        className
      )}
      role="main"
      aria-label="Quiz results"
    >
      {/* Header */}
      <header className="bg-eliza-surface border-b border-eliza-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-eliza-text-primary">
              Quiz Results
            </h1>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close results"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Score summary */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <div
          className={cn(
            'score-card p-8 rounded-2xl shadow-xl text-center',
            isPassing
              ? 'bg-gradient-to-br from-eliza-green to-eliza-green/80'
              : 'bg-gradient-to-br from-eliza-yellow to-eliza-yellow/80'
          )}
        >
          <Trophy className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-5xl font-bold text-white mb-2">
            {percentageScore}%
          </h2>
          <p className="text-xl text-white/90 mb-4">
            {correctCount} out of {questions.length} correct
          </p>
          <p className="text-lg text-white/80">
            {isPassing
              ? 'Great job! You passed the quiz!'
              : 'Keep practicing! You can retake the quiz or try easier variants.'}
          </p>
        </div>

        {/* Achievements Section */}
        {(totalXPAwarded > 0 || badgesAwarded.length > 0) && (
          <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-eliza-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Achievements Unlocked!
              </h3>
            </div>

            <div className="space-y-4">
              {/* XP Display */}
              {totalXPAwarded > 0 && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900">
                      +{totalXPAwarded} XP
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {currentTotalXP} XP
                    </p>
                  </div>
                </div>
              )}

              {/* Badges Display */}
              {badgesAwarded.length > 0 && (
                <div className="space-y-3">
                  {badgesAwarded.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-eliza-purple to-eliza-blue flex items-center justify-center text-2xl">
                        {badge.icon || '🏆'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-eliza-purple" />
                          <p className="font-bold text-gray-900">
                            {badge.display_name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View All Achievements Link */}
              <Link
                to="/achievements"
                className="block text-center text-sm text-eliza-purple hover:text-eliza-purple/80 font-medium mt-2"
              >
                View All Achievements →
              </Link>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {onRetake && (
            <Button
              size="lg"
              onClick={onRetake}
              variant="outline"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake Quiz
            </Button>
          )}
          {onClose && (
            <Button
              size="lg"
              onClick={onClose}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Back to Lesson
            </Button>
          )}
        </div>
      </section>

      {/* Achievement Celebration Modal */}
      {showCelebration && (
        <AchievementCelebration
          xpAwarded={totalXPAwarded}
          badgesAwarded={badgesAwarded}
          totalXP={currentTotalXP}
          onClose={() => setShowCelebration(false)}
        />
      )}
    

      {/* Question breakdown */}
      <section className="container mx-auto px-4 pb-12 max-w-4xl">
        <h3 className="text-xl font-bold text-eliza-text-primary mb-6">
          Question Breakdown
        </h3>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const attempt = getAttempt(question.id);
            const isExpanded = expandedQuestions.has(question.id);
            const isCorrect = attempt?.is_correct || false;

            return (
              <div
                key={question.id}
                className={cn(
                  'question-result bg-eliza-surface rounded-lg border-2 transition-colors',
                  isCorrect ? 'border-eliza-green' : 'border-eliza-red'
                )}
              >
                {/* Question header */}
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-eliza-background/50 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`question-details-${question.id}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Correctness indicator */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isCorrect ? 'bg-eliza-green' : 'bg-eliza-red'
                      )}
                    >
                      {isCorrect ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <XCircle className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Question info */}
                    <div className="text-left">
                      <p className="font-semibold text-eliza-text-primary">
                        Question {index + 1}
                      </p>
                      <p className="text-sm text-eliza-text-secondary line-clamp-1">
                        {question.body}
                      </p>
                    </div>
                  </div>

                  {/* Score and expand icon */}
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'text-lg font-bold',
                        isCorrect ? 'text-eliza-green' : 'text-eliza-red'
                      )}
                    >
                      {Math.round((attempt?.score || 0) * 100)}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-eliza-text-secondary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-eliza-text-secondary" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    id={`question-details-${question.id}`}
                    className="border-t border-eliza-border p-6 space-y-6"
                  >
                    {/* Question body */}
                    <div>
                      <h4 className="font-semibold text-eliza-text-primary mb-2">
                        Question
                      </h4>
                      <p className="text-eliza-text-primary">{question.body}</p>
                    </div>

                    {/* Answer explanation */}
                    {question.answer_explanation && (
                      <div>
                        <h4 className="font-semibold text-eliza-text-primary mb-2">
                          Explanation
                        </h4>
                        <p className="text-eliza-text-primary leading-relaxed">
                          {question.answer_explanation}
                        </p>
                      </div>
                    )}

                    {/* Source snippet */}
                    {question.source_snippet && (
                      <div>
                        <h4 className="font-semibold text-eliza-text-primary mb-2">
                          Source Reference
                        </h4>
                        <blockquote className="border-l-4 border-eliza-primary pl-4 italic text-eliza-text-secondary">
                          {question.source_snippet}
                        </blockquote>
                      </div>
                    )}

                    {/* Variant breadcrumbs */}
                    {question.parent_question_id && (
                      <div>
                        <p className="text-sm text-eliza-text-secondary">
                          This is a variant of the original question
                        </p>
                      </div>
                    )}

                    {/* Difficulty selector */}
                    {!isCorrect && (
                      <div>
                        <h4 className="font-semibold text-eliza-text-primary mb-3">
                          Try a different version
                        </h4>
                        <DifficultySelector
                          questionId={question.id}
                          currentDifficulty={question.difficulty}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
