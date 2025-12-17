"use client"

// Quiz Tab Component
// Displays quiz interface with question fetching and submission

import type React from "react"
import { useState } from "react"
import { useQuizQuestions, useSubmitAttempt } from "@/hooks/useQuizQuestions"
import { QuizInterface } from "@/components/quiz/QuizInterface"
import { PracticeInterface } from "@/components/quiz/PracticeInterface"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Lock, Trophy, Star, ArrowRight, BookOpen, Clock, Target, Dumbbell } from "lucide-react"
import type { QuizAttempt } from "@/types/quiz"
import { cn } from "@/lib/utils"

interface QuizTabProps {
  subchapterId: string
  canAccessQuiz?: boolean
  onClose?: () => void
  className?: string
}

export const QuizTab: React.FC<QuizTabProps> = ({ subchapterId, canAccessQuiz = true, onClose, className }) => {
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [isPracticeActive, setIsPracticeActive] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "standard" | "hard">("standard")

  const { data: questions, isLoading, error } = useQuizQuestions(subchapterId)
  const submitAttempt = useSubmitAttempt(subchapterId)

  // Handle single question answer
  const handleAnswerQuestion = async (questionId: string, answerId: string): Promise<QuizAttempt> => {
    try {
      return await submitAttempt.mutateAsync({
        questionId,
        attempt: {
          selected_option_id: answerId,
          time_spent_seconds: 0, // Should measure this in the UI
        },
      })
    } catch (error) {
      console.error(`Failed to submit answer for question ${questionId}:`, error)
      throw error
    }
  }

  // Start quiz
  const handleStartQuiz = () => {
    setIsQuizActive(true)
  }

  // Start practice
  const handleStartPractice = () => {
    setIsPracticeActive(true)
  }

  // Close quiz
  const handleCloseQuiz = () => {
    setIsQuizActive(false)
    if (onClose) {
      onClose()
    }
  }

  // Close practice
  const handleClosePractice = () => {
    setIsPracticeActive(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-24 min-h-[400px]", className)}>
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-eliza-purple animate-spin" />
          <Loader2 className="w-8 h-8 text-eliza-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <span className="mt-6 text-lg font-medium text-gray-600 animate-pulse">Preparing your quiz...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">Failed to load quiz questions. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Access restricted state
  if (!canAccessQuiz) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-20 min-h-[400px] text-center", className)}>
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-brand font-bold text-gray-900 mb-3">Quiz Locked</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
          Complete the video and review all lesson sections to unlock this quiz and test your mastery.
        </p>
        <Button variant="outline" onClick={onClose} className="rounded-xl h-12 px-8 border-gray-300 text-gray-600 hover:bg-gray-50">
          Back to Lesson
        </Button>
      </div>
    )
  }

  // Empty state
  if (!questions || questions.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-20 min-h-[400px] text-center", className)}>
        <div className="w-24 h-24 bg-eliza-blue/10 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-eliza-blue" />
        </div>
        <h3 className="text-2xl font-brand font-bold text-gray-900 mb-3">No Quiz Available</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
          There are no published quiz questions for this lesson yet. Check back later!
        </p>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="rounded-xl h-12 px-8 border-gray-300 text-gray-600 hover:bg-gray-50">
            Back to Lesson
          </Button>
        )}
      </div>
    )
  }

  const filteredQuestions = selectedDifficulty
    ? questions?.filter((q) => q.difficulty === selectedDifficulty || !q.difficulty) // Include matching or undefined difficulty
    : questions

  // Create a display list. If filtered is empty (e.g. no questions with that difficulty info), show all.
  const displayQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;

  // Show practice interface if active
  if (isPracticeActive) {
    return (
      <PracticeInterface
        chapterId={subchapterId}
        onClose={handleClosePractice}
        className={className}
      />
    )
  }

  // Show quiz interface if active
  if (isQuizActive) {
    // For the new QuizInterface, we need a quizId
    // Using subchapterId as quizId for demo purposes
    return (
      <QuizInterface
        quizId={subchapterId}
        onClose={handleCloseQuiz}
        className={className}
      />
    )
  }

  // Design Constants
  const difficulties = [
    {
      id: "easy",
      label: "Easy",
      icon: Target,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      activeBorder: "border-green-500",
      desc: "Warm up with fundamental concepts"
    },
    {
      id: "standard",
      label: "Standard",
      icon: Star,
      color: "text-eliza-blue",
      bg: "bg-eliza-blue/5",
      border: "border-gray-200",
      activeBorder: "border-eliza-blue",
      desc: "Test your core understanding"
    },
    {
      id: "hard",
      label: "Expert",
      icon: Trophy,
      color: "text-eliza-purple",
      bg: "bg-eliza-purple/5",
      border: "border-purple-200",
      activeBorder: "border-eliza-purple",
      desc: "Challenge yourself with complex problems"
    }
  ] as const;

  // Quiz start screen
  return (
    <div className={cn("max-w-4xl mx-auto py-8 animate-in fade-in duration-500", className)}>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-eliza-blue/10 to-eliza-purple/10 rounded-2xl mb-6 shadow-sm border border-white">
          <Trophy className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-eliza-blue to-eliza-purple" strokeWidth={2.5} style={{ stroke: 'url(#gradient)' }} />
          <svg width="0" height="0">
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop stopColor="#3b82f6" offset="0%" />
              <stop stopColor="#8b5cf6" offset="100%" />
            </linearGradient>
          </svg>
        </div>
        <h2 className="text-4xl md:text-5xl font-brand font-bold text-gray-900 mb-4 tracking-tight">
          Ready to Ace This?
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Test your knowledge with <span className="font-bold text-gray-900">{questions.length} questions</span> designed to master the material.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">{questions.length}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Questions</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-1"><Clock className="w-5 h-5 opacity-40" /> 10m</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Est. Time</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">70%</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Pass Score</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">All</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Attempts</div>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-12">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Select Difficulty</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficulties.map((diff) => {
            const Icon = diff.icon;
            const isSelected = selectedDifficulty === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id as any)}
                className={cn(
                  "relative p-6 rounded-3xl text-left transition-all duration-300 border-2",
                  isSelected ? `${diff.activeBorder} ${diff.bg} shadow-md scale-[1.02]` : "border-transparent bg-white hover:bg-gray-50 hover:border-gray-200"
                )}
              >
                <div className={cn("inline-flex p-3 rounded-2xl mb-4 transition-colors", isSelected ? "bg-white shadow-sm" : "bg-gray-100")}>
                  <Icon className={cn("w-6 h-6", diff.color)} />
                </div>
                <div className="font-brand font-bold text-lg text-gray-900 mb-1">{diff.label}</div>
                <p className="text-sm text-gray-500 leading-snug">{diff.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-6">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleStartQuiz}
            className="h-14 pl-10 pr-8 rounded-2xl bg-gradient-to-r from-eliza-blue to-eliza-purple hover:scale-105 active:scale-95 transition-all text-white font-bold text-lg shadow-xl shadow-eliza-blue/20 w-full sm:w-auto flex items-center justify-center gap-2 group"
          >
            Start Chapter Quiz
            <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>

          <Button
            onClick={handleStartPractice}
            variant="outline"
            className="h-14 pl-10 pr-8 rounded-2xl border-2 border-eliza-blue/30 hover:border-eliza-blue hover:bg-eliza-blue/5 text-eliza-blue font-bold text-lg w-full sm:w-auto flex items-center justify-center gap-2 group"
          >
            Practice Mode
            <Dumbbell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>

        {/* Practice Mode Info */}
        <div className="text-center max-w-md mx-auto">
          <p className="text-sm text-gray-500">
            <strong className="text-gray-700">Practice Mode:</strong> Ungraded sandbox with instant feedback.
            Perfect for building confidence before taking the quiz!
          </p>
        </div>

        {/* Cancel Button */}
        {onClose && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-12 px-8 rounded-xl font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              Maybe Later
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}
