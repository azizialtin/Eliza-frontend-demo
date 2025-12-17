import React, { useState, useEffect } from "react"
import { X, Check, ArrowRight, AlertCircle, Target, Star, Trophy, Loader2, Plus, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { QuizQuestion, PracticeSession, PracticeAnswerResponse, Difficulty } from "@/types/quiz"
import { toast } from "@/hooks/use-toast"

interface PracticeInterfaceProps {
  chapterId: string
  onClose?: () => void
  className?: string
}

type PracticePhase = "DIFFICULTY_SELECT" | "LOADING" | "QUESTION" | "FEEDBACK" | "SESSION_COMPLETE"

export const PracticeInterface: React.FC<PracticeInterfaceProps> = ({
  chapterId,
  onClose,
  className,
}) => {
  // State
  const [phase, setPhase] = useState<PracticePhase>("DIFFICULTY_SELECT")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  // Question State
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Feedback State
  const [feedback, setFeedback] = useState<PracticeAnswerResponse | null>(null)

  // Session Stats
  const [questionsCompleted, setQuestionsCompleted] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [quizContextUsed, setQuizContextUsed] = useState(false)

  // --- Handlers ---

  const handleStartPractice = async (selectedDifficulty: Difficulty) => {
    setPhase("LOADING")
    setDifficulty(selectedDifficulty)

    try {
      const session = await apiClient.startPracticeSession(chapterId, selectedDifficulty)
      setSessionId(session.session_id)
      setQuestions(session.questions)
      setQuizContextUsed(session.quiz_context_used)
      setCurrentQuestionIndex(0)
      setPhase("QUESTION")
    } catch (error) {
      console.error("Failed to start practice session", error)
      toast({ title: "Error", description: "Failed to start practice session", variant: "destructive" })
      setPhase("DIFFICULTY_SELECT")
    }
  }

  const handleSubmitAnswer = async () => {
    if (!sessionId || !selectedOption) return

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    setIsSubmitting(true)
    try {
      const response = await apiClient.answerPracticeQuestion(sessionId, currentQuestion.id, selectedOption)
      setFeedback(response)
      setQuestionsCompleted(response.questions_completed)
      setTotalCorrect(response.total_correct)
      setPhase("FEEDBACK")
    } catch (error) {
      console.error("Failed to submit answer", error)
      toast({ title: "Error", description: "Failed to submit answer", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (!feedback) return

    setSelectedOption(null)
    setFeedback(null)

    // Check if there are more questions
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setPhase("QUESTION")
    } else {
      // All initial questions answered
      setPhase("SESSION_COMPLETE")
    }
  }

  const handleGenerateMore = async () => {
    if (!sessionId) return

    setPhase("LOADING")
    try {
      const response = await apiClient.generateMorePracticeQuestion(sessionId)
      setQuestions(prev => [...prev, response.question])
      setCurrentQuestionIndex(questions.length) // Move to the new question
      setPhase("QUESTION")
      toast({ title: "New Question Generated!", description: "Keep practicing!" })
    } catch (error) {
      console.error("Failed to generate more questions", error)
      toast({ title: "Error", description: "Failed to generate question", variant: "destructive" })
      setPhase("SESSION_COMPLETE")
    }
  }

  const handleEndSession = () => {
    if (onClose) {
      onClose()
    }
  }

  // --- Render Helpers ---

  const getOptions = (options?: any[]) => {
    if (!options) return []
    return options.map((opt, i) => {
      if (typeof opt === 'string') {
        return { id: opt, label: String.fromCharCode(65 + i), text: opt }
      }
      return { id: opt.id, label: opt.label || String.fromCharCode(65 + i), text: opt.text }
    })
  }

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case "easy": return Target
      case "standard": return Star
      case "hard": return Trophy
      default: return Star
    }
  }

  // --- Views ---

  if (phase === "LOADING") {
    return (
      <div className={cn("fixed inset-0 bg-white/90 z-50 flex items-center justify-center", className)}>
        <Loader2 className="w-10 h-10 animate-spin text-eliza-blue" />
        <span className="ml-2 text-gray-500 font-medium">Loading practice session...</span>
      </div>
    )
  }

  // 1. DIFFICULTY SELECTION
  if (phase === "DIFFICULTY_SELECT") {
    return (
      <div className={cn("fixed inset-0 bg-gray-50/95 backdrop-blur-sm z-50 flex flex-col", className)}>
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Practice Mode</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-xl p-8 space-y-6 shadow-xl rounded-3xl border border-gray-200">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-eliza-blue/10 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-eliza-blue" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Start Practice Session</h3>
              <p className="text-gray-600">
                Practice questions in an ungraded sandbox environment. Build confidence and master concepts at your own pace.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Practice Mode Features:</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>Ungraded practice (no scores saved)</li>
                <li>Immediate feedback on every question</li>
                <li>Generate more questions anytime</li>
                <li>Context-aware questions from your quiz mistakes</li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-gray-700">Choose your difficulty level:</p>

              {[
                { id: "easy", label: "Easy", icon: Target, desc: "Build confidence with basics", color: "green" },
                { id: "standard", label: "Standard", icon: Star, desc: "Standard difficulty level", color: "blue" },
                { id: "hard", label: "Challenge", icon: Trophy, desc: "Test yourself with harder topics", color: "purple" }
              ].map((lvl) => {
                const Icon = lvl.icon
                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleStartPractice(lvl.id as Difficulty)}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-eliza-blue hover:bg-eliza-blue/5 transition-all text-left group w-full"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform",
                      lvl.color === "green" && "bg-green-100",
                      lvl.color === "blue" && "bg-blue-100",
                      lvl.color === "purple" && "bg-purple-100"
                    )}>
                      <Icon className={cn(
                        "w-7 h-7",
                        lvl.color === "green" && "text-green-600",
                        lvl.color === "blue" && "text-blue-600",
                        lvl.color === "purple" && "text-purple-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900">{lvl.label}</div>
                      <div className="text-sm text-gray-500">{lvl.desc}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-eliza-blue group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })}
            </div>
          </Card>
        </main>
      </div>
    )
  }

  // 2. SESSION COMPLETE
  if (phase === "SESSION_COMPLETE") {
    const accuracy = questionsCompleted > 0 ? Math.round((totalCorrect / questionsCompleted) * 100) : 0

    return (
      <div className={cn("fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95", className)}>
        <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-2xl rounded-3xl">
          <div className="w-20 h-20 bg-eliza-blue/10 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-10 h-10 text-eliza-blue" />
          </div>

          <div>
            <h2 className="text-3xl font-brand font-bold text-gray-900 mb-2">Great Practice Session!</h2>
            <p className="text-gray-600">You've completed {questionsCompleted} questions</p>
          </div>

          <div className="py-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">{questionsCompleted}</div>
                <div className="text-xs uppercase text-gray-500">Answered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{totalCorrect}</div>
                <div className="text-xs uppercase text-gray-500">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-eliza-blue">{accuracy}%</div>
                <div className="text-xs uppercase text-gray-500">Accuracy</div>
              </div>
            </div>
          </div>

          {quizContextUsed && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <AlertCircle className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-900">
                These questions were tailored based on your quiz performance!
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handleGenerateMore} className="w-full h-12 text-lg rounded-xl bg-eliza-blue hover:bg-eliza-blue/90 text-white shadow-lg">
              <Plus className="mr-2 w-5 h-5" />
              Practice More Questions
            </Button>
            <Button onClick={handleEndSession} variant="outline" className="w-full h-12 text-lg rounded-xl">
              End Session
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 3. ACTIVE QUESTION
  const currentQuestion = questions[currentQuestionIndex]
  if (!currentQuestion) return null

  const options = getOptions(currentQuestion.options)
  const isCorrect = feedback?.is_correct ?? false

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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Practice {difficulty && `(${difficulty.toUpperCase()})`}
              </span>
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{totalCorrect} / {questionsCompleted}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Session Stats Banner */}
          {questionsCompleted > 0 && (
            <div className="bg-gradient-to-r from-eliza-blue/10 to-eliza-purple/10 rounded-2xl p-4 border border-eliza-blue/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-eliza-blue" />
                  <span className="text-sm font-medium text-gray-700">Session Progress</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Answered: </span>
                    <span className="font-bold text-gray-900">{questionsCompleted}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div>
                    <span className="text-gray-600">Correct: </span>
                    <span className="font-bold text-green-600">{totalCorrect}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div>
                    <span className="text-gray-600">Accuracy: </span>
                    <span className="font-bold text-eliza-blue">
                      {questionsCompleted > 0 ? Math.round((totalCorrect / questionsCompleted) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-brand font-bold text-gray-900 leading-tight mb-8">
              {currentQuestion.body}
            </h2>

            <div className="grid gap-4">
              {options.map((option) => {
                const isSelected = selectedOption === option.id

                // Find correct answer for feedback
                let isCorrectAnswer = false
                if (feedback) {
                  if ('correct_answer' in feedback && feedback.correct_answer) {
                    isCorrectAnswer = feedback.correct_answer === option.id
                  } else {
                    const correctOpt = currentQuestion.options?.find(o => o.is_correct)
                    isCorrectAnswer = correctOpt?.id === option.id
                  }
                }

                // Determine variant
                let variantClass = "bg-white border-2 border-gray-200 text-gray-700 hover:border-eliza-blue/50 hover:bg-eliza-blue/5"
                if (isSelected) {
                  variantClass = "bg-eliza-blue/10 border-2 border-eliza-blue text-eliza-blue font-semibold shadow-inner"
                }

                // Feedback State overrides
                if (feedback) {
                  if (isSelected && isCorrect) {
                    variantClass = "bg-green-50 border-2 border-green-500 text-green-700 font-bold"
                  } else if (isSelected && !isCorrect) {
                    variantClass = "bg-red-50 border-2 border-red-500 text-red-700"
                  } else if (isCorrectAnswer) {
                    variantClass = "bg-green-50 border-2 border-green-500 text-green-700 opacity-70"
                  } else {
                    variantClass = "opacity-50 grayscale border-gray-100"
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => !feedback && setSelectedOption(option.id)}
                    disabled={!!feedback || isSubmitting}
                    className={cn(
                      "w-full text-left p-4 md:p-6 rounded-2xl transition-all duration-200 flex items-center justify-between group",
                      variantClass
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                        isSelected || (feedback && isSelected) ? "bg-current text-white border-transparent" : "bg-gray-50 border-gray-200 text-gray-500"
                      )}>
                        {option.label}
                      </span>
                      <span className="text-lg">{option.text}</span>
                    </div>

                    {feedback && isSelected && isCorrect && <Check className="w-6 h-6 text-green-600" />}
                    {feedback && isSelected && !isCorrect && <X className="w-6 h-6 text-red-600" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="h-32">
            {feedback ? (
              <div className={cn(
                "rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-2 duration-300 shadow-lg border",
                isCorrect ? "bg-green-600 text-white border-green-500" : "bg-white border-red-200 border-l-8 border-l-red-500 shadow-red-100"
              )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
                      <h3 className={cn("text-xl font-bold", isCorrect ? "text-white" : "text-red-700")}>
                        {isCorrect ? "Correct! Keep it up!" : "Not quite right"}
                      </h3>
                    </div>
                    <p className={cn("text-lg", isCorrect ? "text-white/90" : "text-gray-600")}>
                      {feedback.explanation}
                    </p>
                  </div>
                  <Button
                    onClick={handleNextQuestion}
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
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || isSubmitting}
                  className={cn(
                    "h-14 px-10 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300",
                    !selectedOption ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0",
                    "bg-gradient-to-r from-eliza-blue to-eliza-purple hover:scale-105 active:scale-95 text-white"
                  )}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check Answer"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
