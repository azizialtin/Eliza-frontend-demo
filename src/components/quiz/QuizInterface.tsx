import React, { useState, useEffect } from "react"

import { X, Check, ArrowRight, AlertCircle, Award, RefreshCw, ChevronRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { QuizQuestion } from "@/types/quiz"

// Define the response type from the backend immediate feedback endpoint
export interface AnswerResponse {
  is_correct: boolean
  explanation: string
  correct_answer?: string
  all_questions_answered?: boolean
  next_question?: any
}

interface QuizInterfaceProps {
  questions: QuizQuestion[]
  onAnswerQuestion: (questionId: string, answerId: string) => Promise<any> // Using any to be safe with the type mismatch we identified
  onClose?: () => void
  className?: string
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  questions,
  onAnswerQuestion,
  onClose,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100

  // Effect to reset state on new question
  useEffect(() => {
    setSelectedOption(null)
    setAnswerResult(null)
    setIsSubmitting(false)
  }, [currentIndex])

  const handleSelectOption = (optionId: string) => {
    if (answerResult) return // Prevent changing after submission
    setSelectedOption(optionId)
  }

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Logic to handle string options (backward compatibility frontend-side logic if needed)
      // The backend expects the ID if dict, or value if string.
      // Our previous backend patch handled it, so we just send the ID.

      const result = await onAnswerQuestion(currentQuestion.id, selectedOption)
      setAnswerResult(result)

      if (result.is_correct) {
        setScore((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Failed to submit answer", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  // Calculate generic feedback if not provided (fallback)
  const isCorrect = answerResult?.is_correct ?? false
  const explanation = answerResult?.explanation || (isCorrect ? "Correct!" : "Incorrect.")

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100)
    let message = "Good effort!"
    if (percentage >= 90) message = "Outstanding!"
    else if (percentage >= 70) message = "Great job!"
    else if (percentage < 50) message = "Keep studying!"

    return (
      <div className={cn("fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300", className)}>
        <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-2xl border-t-8 border-eliza-purple rounded-3xl">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-eliza-purple to-eliza-blue rounded-full flex items-center justify-center shadow-lg mb-4">
            <Award className="w-12 h-12 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-brand font-bold text-gray-900 mb-2">{message}</h2>
            <p className="text-gray-500 font-medium">You've completed the quiz.</p>
          </div>

          <div className="py-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-eliza-purple to-eliza-blue">
              {percentage}%
            </div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-2">Final Score</p>
            <p className="text-gray-600 mt-1">{score} out of {questions.length} correct</p>
          </div>

          <div className="flex gap-3 pt-4">
            {onClose && (
              <Button onClick={onClose} className="w-full h-12 text-lg rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-lg transform transition active:scale-95">
                Finish Review
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // Fallback for options if they are strings
  const getOptions = (q: QuizQuestion) => {
    if (!q.options) return []
    // If backend returns objects
    if (typeof q.options[0] === 'object') return q.options
    // If backend returns strings (should match our patch but types might be loose)
    return q.options.map((opt: any, i: number) => ({
      id: opt,
      label: String.fromCharCode(65 + i), // A, B, C...
      text: opt
    }))
  }

  const renderOptions = getOptions(currentQuestion)

  return (
    <div className={cn("fixed inset-0 bg-gray-50/95 backdrop-blur-sm z-50 flex flex-col animate-in fade-in duration-200", className)}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </Button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">Score: {score}</span>
              </div>
            </div>
          </div>

          <div className="w-32 hidden sm:block">
            <Progress value={progress} className="h-2 bg-gray-100" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-brand font-bold text-gray-900 leading-tight mb-8">
              {currentQuestion.question}
            </h2>

            <div className="grid gap-4">
              {renderOptions.map((option: any) => {
                const isSelected = selectedOption === option.id
                const isCorrectAnswer = answerResult && answerResult.correct_answer === option.id // If provided

                // Determine variant
                let variantClass = "bg-white border-2 border-gray-200 text-gray-700 hover:border-eliza-blue/50 hover:bg-eliza-blue/5"
                if (isSelected) {
                  variantClass = "bg-eliza-blue/10 border-2 border-eliza-blue text-eliza-blue font-semibold shadow-inner"
                }

                // Feedback State overrides
                if (answerResult) {
                  if (isSelected && isCorrect) {
                    variantClass = "bg-green-50 border-2 border-green-500 text-green-700 font-bold"
                  } else if (isSelected && !isCorrect) {
                    variantClass = "bg-red-50 border-2 border-red-500 text-red-700"
                  } else if (isCorrectAnswer) {
                    // Highlight correct answer if we got it wrong and backend told us which one
                    variantClass = "bg-green-50 border-2 border-green-500 text-green-700 opacity-70"
                  } else {
                    variantClass = "opacity-50 grayscale border-gray-100"
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={!!answerResult || isSubmitting}
                    className={cn(
                      "w-full text-left p-4 md:p-6 rounded-2xl transition-all duration-200 flex items-center justify-between group",
                      variantClass
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                        isSelected || (answerResult && isSelected) ? "bg-current text-white border-transparent" : "bg-gray-50 border-gray-200 text-gray-500"
                      )}>
                        {option.label || String.fromCharCode(65)}
                      </span>
                      <span className="text-lg">{option.text}</span>
                    </div>

                    {answerResult && isSelected && isCorrect && <Check className="w-6 h-6 text-green-600" />}
                    {answerResult && isSelected && !isCorrect && <X className="w-6 h-6 text-red-600" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="h-32"> {/* Spacer/Container */}
            {answerResult ? (
              <div className={cn(
                "rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-2 duration-300 shadow-lg border",
                isCorrect ? "bg-green-600 text-white border-green-500" : "bg-white border-red-200 border-l-8 border-l-red-500 shadow-red-100"
              )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
                      <h3 className={cn("text-xl font-bold", isCorrect ? "text-white" : "text-red-700")}>
                        {isCorrect ? "That's Correct!" : "Not quite right"}
                      </h3>
                    </div>
                    <p className={cn("text-lg", isCorrect ? "text-white/90" : "text-gray-600")}>
                      {explanation}
                    </p>
                  </div>
                  <Button
                    onClick={handleNext}
                    className={cn(
                      "h-12 px-8 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform shrink-0",
                      isCorrect ? "bg-white text-green-700 hover:bg-green-50" : "bg-red-600 text-white hover:bg-red-700"
                    )}
                  >
                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedOption || isSubmitting}
                  className={cn(
                    "h-14 px-10 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300",
                    !selectedOption ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0",
                    "bg-gradient-to-r from-eliza-blue to-eliza-purple hover:scale-105 active:scale-95 text-white"
                  )}
                >
                  {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Check Answer"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
