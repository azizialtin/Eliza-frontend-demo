// Quiz Questions Hook - Student view
// DEMO MODE: Returns hardcoded mock data only (no backend calls)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { QuizQuestion, QuizAttempt, SubmitAttemptRequest, RequestVariantRequest } from '@/types/quiz';

// Hardcoded Integrals Quiz Questions (DEMO ONLY)
const MOCK_INTEGRALS_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-demo-1',
    subchapter_id: 'demo',
    source_type: 'ai_generated',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    status: 'published',
    body: 'What is the primary goal of integration in calculus?',
    answer_explanation: 'Integration is fundamentally about finding the total accumulation - whether it\'s area under a curve, distance from velocity, or any other accumulated quantity. It reverses differentiation by summing up infinitely small pieces.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_chunk_ids: [],
    additional_metadata: {},
    options: [
      { id: 'opt1-q1', question_id: 'q-demo-1', label: 'A', text: 'To find the slope of a curve', is_correct: false },
      { id: 'opt2-q1', question_id: 'q-demo-1', label: 'B', text: 'To find the area under a curve or total accumulation', is_correct: true },
      { id: 'opt3-q1', question_id: 'q-demo-1', label: 'C', text: 'To solve algebraic equations', is_correct: false },
      { id: 'opt4-q1', question_id: 'q-demo-1', label: 'D', text: 'To find maximum and minimum values', is_correct: false }
    ]
  },
  {
    id: 'q-demo-2',
    subchapter_id: 'demo',
    source_type: 'ai_generated',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    status: 'published',
    body: 'What does the \'C\' represent in an indefinite integral like ∫f(x)dx = F(x) + C?',
    answer_explanation: 'The constant of integration \'C\' represents any constant value that could have been in the original function. Since the derivative of any constant is zero, when we reverse differentiation through integration, we must account for all possible constants that could have been there.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_chunk_ids: [],
    additional_metadata: {},
    options: [
      { id: 'opt1-q2', question_id: 'q-demo-2', label: 'A', text: 'Coefficient', is_correct: false },
      { id: 'opt2-q2', question_id: 'q-demo-2', label: 'B', text: 'Constant of Integration', is_correct: true },
      { id: 'opt3-q2', question_id: 'q-demo-2', label: 'C', text: 'Circumference', is_correct: false },
      { id: 'opt4-q2', question_id: 'q-demo-2', label: 'D', text: 'Calculus notation', is_correct: false }
    ]
  },
  {
    id: 'q-demo-3',
    subchapter_id: 'demo',
    source_type: 'ai_generated',
    question_type: 'multiple_choice',
    difficulty: 'standard',
    status: 'published',
    body: 'Using the power rule for integration, what is ∫x³ dx?',
    answer_explanation: 'The power rule for integration states: add 1 to the exponent, then divide by the new exponent. So ∫x³ dx = x⁴/4 + C. We go from x³ to x⁴ (add 1 to exponent 3), then divide by 4.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_chunk_ids: [],
    additional_metadata: {},
    options: [
      { id: 'opt1-q3', question_id: 'q-demo-3', label: 'A', text: '3x² + C', is_correct: false },
      { id: 'opt2-q3', question_id: 'q-demo-3', label: 'B', text: 'x⁴ + C', is_correct: false },
      { id: 'opt3-q3', question_id: 'q-demo-3', label: 'C', text: 'x⁴/4 + C', is_correct: true },
      { id: 'opt4-q3', question_id: 'q-demo-3', label: 'D', text: '4x³ + C', is_correct: false }
    ]
  },
  {
    id: 'q-demo-4',
    subchapter_id: 'demo',
    source_type: 'ai_generated',
    question_type: 'multiple_choice',
    difficulty: 'standard',
    status: 'published',
    body: 'What is the relationship between differentiation and integration?',
    answer_explanation: 'Integration and differentiation are inverse operations - they undo each other. If you differentiate a function and then integrate the result, you get back to the original function (plus a constant). This is formalized in the Fundamental Theorem of Calculus.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_chunk_ids: [],
    additional_metadata: {},
    options: [
      { id: 'opt1-q4', question_id: 'q-demo-4', label: 'A', text: 'They are unrelated concepts', is_correct: false },
      { id: 'opt2-q4', question_id: 'q-demo-4', label: 'B', text: 'They are inverse operations', is_correct: true },
      { id: 'opt3-q4', question_id: 'q-demo-4', label: 'C', text: 'Integration is always easier than differentiation', is_correct: false },
      { id: 'opt4-q4', question_id: 'q-demo-4', label: 'D', text: 'They produce the same result', is_correct: false }
    ]
  },
  {
    id: 'q-demo-5',
    subchapter_id: 'demo',
    source_type: 'ai_generated',
    question_type: 'multiple_choice',
    difficulty: 'hard',
    status: 'published',
    body: 'A car\'s velocity is given by v(t) = 3t² + 2t meters per second. What is the displacement (distance) function s(t)?',
    answer_explanation: 'Displacement is the integral of velocity. Using the power rule: ∫(3t² + 2t)dt = 3(t³/3) + 2(t²/2) + C = t³ + t² + C. Since we typically measure from rest, C = 0, giving s(t) = t³ + t².',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_chunk_ids: [],
    additional_metadata: {},
    options: [
      { id: 'opt1-q5', question_id: 'q-demo-5', label: 'A', text: 's(t) = 6t + 2', is_correct: false },
      { id: 'opt2-q5', question_id: 'q-demo-5', label: 'B', text: 's(t) = t³ + t² + C', is_correct: true },
      { id: 'opt3-q5', question_id: 'q-demo-5', label: 'C', text: 's(t) = 3t² + 2t + C', is_correct: false },
      { id: 'opt4-q5', question_id: 'q-demo-5', label: 'D', text: 's(t) = t⁴/4 + t³/3', is_correct: false }
    ]
  },
  {
    id: 'q-demo-6',
    subchapter_id: 'demo',
    source_type: 'ai_generated',
    question_type: 'multiple_choice',
    difficulty: 'hard',
    status: 'published',
    body: 'What is the definite integral ∫₁³ 2x dx equal to?',
    answer_explanation: 'First find the antiderivative: ∫2x dx = x² + C. For definite integrals, evaluate at the bounds: [x²]₁³ = 3² - 1² = 9 - 1 = 8. The definite integral gives us a specific numerical value representing the area under the curve between x=1 and x=3.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_chunk_ids: [],
    additional_metadata: {},
    options: [
      { id: 'opt1-q6', question_id: 'q-demo-6', label: 'A', text: '4', is_correct: false },
      { id: 'opt2-q6', question_id: 'q-demo-6', label: 'B', text: '6', is_correct: false },
      { id: 'opt3-q6', question_id: 'q-demo-6', label: 'C', text: '8', is_correct: true },
      { id: 'opt4-q6', question_id: 'q-demo-6', label: 'D', text: '10', is_correct: false }
    ]
  }
];

/**
 * DEMO MODE: Returns hardcoded Integrals questions (no backend call)
 */
export const useQuizQuestions = (subchapterId: string) => {
  return useQuery({
    queryKey: ['quiz-questions', subchapterId],
    queryFn: async () => {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('📚 [DEMO] Returning hardcoded Integrals quiz questions');
      return MOCK_INTEGRALS_QUESTIONS;
    },
    staleTime: Infinity, // Never refetch in demo mode
    enabled: !!subchapterId,
  });
};

/**
 * DEMO MODE: Get single question from mock data
 */
export const useQuizQuestion = (questionId: string) => {
  return useQuery({
    queryKey: ['quiz-question', questionId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const question = MOCK_INTEGRALS_QUESTIONS.find(q => q.id === questionId);
      if (!question) {
        throw new Error('Question not found');
      }
      console.log('📚 [DEMO] Returning single question:', questionId);
      return question;
    },
    enabled: !!questionId,
  });
};

/**
 * DEMO MODE: Mock submit quiz attempt (no backend call)
 */
export const useSubmitAttempt = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, attempt }: { questionId: string; attempt: SubmitAttemptRequest }) => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const question = MOCK_INTEGRALS_QUESTIONS.find(q => q.id === questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Check if answer is correct
      const isCorrect = question.options?.some(
        opt => opt.id === attempt.selected_option_id && opt.is_correct
      ) || false;

      console.log('📝 [DEMO] Submitting answer:', { questionId, isCorrect });

      const mockAttempt: QuizAttempt = {
        id: `attempt-${Date.now()}`,
        student_id: 'demo-student',
        question_id: questionId,
        selected_option_id: attempt.selected_option_id,
        is_correct: isCorrect,
        submitted_at: new Date().toISOString(),
        feedback: question.answer_explanation
      };

      return mockAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-performance'] });
      queryClient.invalidateQueries({ queryKey: ['subchapter-progress', subchapterId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * DEMO MODE: Mock variant generation (returns same questions)
 */
export const useRequestVariant = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, request }: { questionId: string; request: RequestVariantRequest }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Just return a random question from our mock set as a "variant"
      const randomQuestion = MOCK_INTEGRALS_QUESTIONS[
        Math.floor(Math.random() * MOCK_INTEGRALS_QUESTIONS.length)
      ];

      console.log('✨ [DEMO] Generating mock variant');

      return {
        ...randomQuestion,
        id: `variant-${Date.now()}`,
        difficulty: request.difficulty
      };
    },
    onSuccess: (newVariant) => {
      queryClient.setQueryData(
        ['quiz-questions', subchapterId],
        (old: QuizQuestion[] = []) => [...old, newVariant]
      );

      toast({
        title: 'New question generated!',
        description: `${newVariant.difficulty} variant ready`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * DEMO MODE: Mock batch submit (no backend call)
 */
export const useSubmitQuizAttempts = (subchapterId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (attempts: Array<{ questionId: string; attempt: SubmitAttemptRequest }>) => {
      await new Promise(resolve => setTimeout(resolve, 800));

      const results: QuizAttempt[] = attempts.map(({ questionId, attempt }) => {
        const question = MOCK_INTEGRALS_QUESTIONS.find(q => q.id === questionId);
        const isCorrect = question?.options?.some(
          opt => opt.id === attempt.selected_option_id && opt.is_correct
        ) || false;

        return {
          id: `attempt-${Date.now()}-${questionId}`,
          student_id: 'demo-student',
          question_id: questionId,
          selected_option_id: attempt.selected_option_id,
          is_correct: isCorrect,
          submitted_at: new Date().toISOString(),
          feedback: question?.answer_explanation || ''
        };
      });

      console.log('📝 [DEMO] Batch submitting quiz attempts');
      return results;
    },
    onSuccess: (results) => {
      const correct = results.filter(r => r.is_correct).length;
      const total = results.length;
      const percentage = Math.round((correct / total) * 100);

      queryClient.invalidateQueries({ queryKey: ['quiz-performance'] });
      queryClient.invalidateQueries({ queryKey: ['subchapter-progress', subchapterId] });

      toast({
        title: 'Quiz submitted!',
        description: `You scored ${percentage}% (${correct}/${total} correct)`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
