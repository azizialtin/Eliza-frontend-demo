import React, { useState, useEffect } from "react"
import { X, Check, ArrowRight, AlertCircle, Award, RefreshCw, Trophy, Target, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { QuizQuestion, QuizSummary, AnswerResponse, RemedialQuestionResponse, SubmitRemedialAnswerResponse, Difficulty, PracticeSession, PracticeAnswerResponse } from "@/types/quiz"
import { toast } from "@/hooks/use-toast"

interface QuizInterfaceProps {
  quizId: string
  initialAttemptId?: string
  onClose?: () => void
  className?: string
}

type QuizPhase = "LOADING" | "START_SCREEN" | "QUESTION" | "FEEDBACK" | "SUMMARY" | "REMEDIATION_SELECT" | "REMEDIATION_QUESTION" | "REMEDIATION_FEEDBACK" | "COMPLETED" | "PRACTICE_SETUP" | "PRACTICE_QUESTION" | "PRACTICE_FEEDBACK"

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  quizId,
  initialAttemptId,
  onClose,
  className,
}) => {
  // State
  const [phase, setPhase] = useState<QuizPhase>("START_SCREEN")
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId || null)

  // Question State
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Feedback State
  const [answerFeedback, setAnswerFeedback] = useState<AnswerResponse | null>(null)

  // Summary State
  const [summary, setSummary] = useState<QuizSummary | null>(null)

  // Remediation State
  const [remedialQuestion, setRemedialQuestion] = useState<RemedialQuestionResponse | null>(null)
  const [remedialFeedback, setRemedialFeedback] = useState<SubmitRemedialAnswerResponse | null>(null)
  const [currentWrongQuestionIndex, setCurrentWrongQuestionIndex] = useState(0)

  // Practice State
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null)
  const [practiceFeedback, setPracticeFeedback] = useState<PracticeAnswerResponse | null>(null)

  // --- Handlers ---

  const handleStartQuizFlow = async () => {
    setPhase("LOADING")
    try {
      if (attemptId) {
        // Resume existing attempt
        const current = await apiClient.getCurrentQuestion(attemptId)
        if (current.question) {
          setCurrentQuestion(current.question)
          setQuestionIndex(current.question_index)
          setTotalQuestions(current.total_questions)
          setPhase("QUESTION")
        } else {
          fetchSummary(attemptId)
        }
      } else {
        // Start new attempt
        const start = await apiClient.startQuiz(quizId)
        setAttemptId(start.attempt_id)
        if (start.question) {
          setCurrentQuestion(start.question)
          setQuestionIndex(start.question_index)
          setTotalQuestions(start.total_questions)
          setPhase("QUESTION")
        } else {
          setPhase("COMPLETED")
        }
      }
    } catch (error) {
      console.error("Failed to start quiz", error)
      toast({ title: "Error", description: "Failed to start quiz", variant: "destructive" })
      setPhase("START_SCREEN")
    }
  }

  const handleStartPracticeFlow = () => {
    setPhase("PRACTICE_SETUP")
  }

  const handleStartPracticeSession = async (difficulty: Difficulty) => {
    setPhase("LOADING")
    try {
      const session = await apiClient.startPracticeSession(quizId, difficulty)
      setPracticeSession(session)
      setCurrentQuestion(session.questions[0])
      setQuestionIndex(0)
      setTotalQuestions(session.questions.length)
      setPhase("PRACTICE_QUESTION")
    } catch (error) {
      console.error("Failed to start practice", error)
      toast({ title: "Error", description: "Failed to start practice", variant: "destructive" })
      setPhase("START_SCREEN")
    }
  }

  const handleSubmitPractice = async () => {
    if (!practiceSession || !selectedOption || !currentQuestion) return
    setIsSubmitting(true)
    try {
      const response = await apiClient.submitPracticeAnswer(practiceSession.session_id, currentQuestion.id, selectedOption)
      setPracticeFeedback(response)
      setPhase("PRACTICE_FEEDBACK")
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit answer", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextPractice = () => {
    if (!practiceFeedback || !practiceSession) return
    setSelectedOption(null)
    setPracticeFeedback(null)

    const nextIdx = questionIndex + 1
    if (nextIdx < practiceSession.questions.length) {
      setCurrentQuestion(practiceSession.questions[nextIdx])
      setQuestionIndex(nextIdx)
      setPhase("PRACTICE_QUESTION")
    } else {
      // End of practice session
      setPhase("COMPLETED") // Or custom practice summary
    }
  }

  // --- Handlers ---


  // --- Handlers ---

  const handleSubmitAnswer = async () => {
    if (!attemptId || !currentQuestion || !selectedOption) return

    setIsSubmitting(true)
    try {
      const response = await apiClient.answerQuestion(attemptId, currentQuestion.id, selectedOption)
      setAnswerFeedback(response)
      setPhase("FEEDBACK")
    } catch (error) {
      console.error("Answer submission failed", error)
      toast({ title: "Error", description: "Failed to submit answer", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = async () => {
    if (!answerFeedback) return

    // Reset state
    setSelectedOption(null)
    setAnswerFeedback(null)

    if (answerFeedback.next_question) {
      setCurrentQuestion(answerFeedback.next_question)
      setQuestionIndex(prev => prev + 1)
      setPhase("QUESTION")
    } else if (answerFeedback.all_questions_answered) {
      fetchSummary(attemptId!)
    } else {
      // Should fetch manually if next_question not provided but not done
      // In our case, we expect next_question to be present or all_answered=true
      const next = await apiClient.getCurrentQuestion(attemptId!)
      if (next.question) {
        setCurrentQuestion(next.question)
        setQuestionIndex(next.question_index)
        setPhase("QUESTION")
      } else {
        fetchSummary(attemptId!)
      }
    }
  }

  const fetchSummary = async (id: string) => {
    setPhase("LOADING")
    try {
      const result = await apiClient.getQuizSummary(id)
      setSummary(result)

      if (result.remedial_plan || result.remediation_required) {
        // Prepare for remediation
        setPhase("SUMMARY") // We show summary first, then user clicks "Start Remediation"
      } else {
        setPhase("COMPLETED")
      }
    } catch (error) {
      console.error("Failed to fetch summary", error)
    }
  }

  const startRemediation = () => {
    setCurrentWrongQuestionIndex(0)
    setPhase("REMEDIATION_SELECT")
  }

  const handleSelectDifficulty = async (difficulty: Difficulty) => {
    if (!summary || !attemptId) return

    // Find the current wrong question ID we are remediating
    // The summary.questions includes all questions. We filter for wrong ones.
    const wrongQuestions = summary.wrong_questions || [] // Use wrong_questions array from summary
    const targetQ = wrongQuestions[currentWrongQuestionIndex]

    if (!targetQ) {
      // Done?
      setPhase("COMPLETED")
      return
    }

    setPhase("LOADING")
    try {
      const result = await apiClient.chooseRemedialDifficulty(attemptId, targetQ.question_id, difficulty)
      setRemedialQuestion(result)
      setPhase("REMEDIATION_QUESTION")
    } catch (error) {
      console.error("Failed to start remediation", error)
      setPhase("REMEDIATION_SELECT") // Go back
    }
  }

  const handleSubmitRemedial = async () => {
    if (!remedialQuestion || !selectedOption) return

    setIsSubmitting(true)
    try {
      const response = await apiClient.submitRemedialAnswer(remedialQuestion.remedial_id, selectedOption)
      setRemedialFeedback(response)
      setPhase("REMEDIATION_FEEDBACK")
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit answer", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextRemedial = () => {
    if (!remedialFeedback) return

    setSelectedOption(null)
    setRemedialFeedback(null)

    if (remedialFeedback.next_question) {
      // Continue same remedial set
      if (remedialQuestion) {
        setRemedialQuestion(prev => prev ? ({ ...prev, question: remedialFeedback.next_question! }) : null)
        setPhase("REMEDIATION_QUESTION")
      }
    } else if (remedialFeedback.remedial_completed) {
      // This concept is done. Move to next wrong question.
      const wrongQuestions = summary?.wrong_questions || []
      if (currentWrongQuestionIndex < wrongQuestions.length - 1) {
        setCurrentWrongQuestionIndex(prev => prev + 1)
        setPhase("REMEDIATION_SELECT")
      } else {
        setPhase("COMPLETED")
      }
    } else {
      // Default fallback
      setPhase("COMPLETED")
    }
  }

  // --- Render Helpers ---

  const renderProgress = () => {
    let val = 0
    if (phase === "QUESTION" || phase === "FEEDBACK") {
      val = ((questionIndex) / totalQuestions) * 100
    } else if (phase.startsWith("REMEDIATION")) {
      const wrongTotal = summary?.wrong_questions.length || 1
      val = (currentWrongQuestionIndex / wrongTotal) * 100
    } else if (phase === "COMPLETED") {
      val = 100
    }
    return <Progress value={val} className="h-2 bg-gray-100" />
  }

  const getOptions = (options?: any[]) => {
    if (!options) return []
    // Normalize options
    return options.map((opt, i) => {
      if (typeof opt === 'string') {
        return { id: opt, label: String.fromCharCode(65 + i), text: opt }
      }
      return { id: opt.id, label: opt.label || String.fromCharCode(65 + i), text: opt.text }
    })
  }

  // --- Views ---

  if (phase === "LOADING") {
    return (
      <div className={cn("fixed inset-0 bg-white/90 z-50 flex items-center justify-center", className)}>
        <Loader2 className="w-10 h-10 animate-spin text-eliza-blue" />
        <span className="ml-2 text-gray-500 font-medium">Loading...</span>
      </div>
    )
  }

  if (phase === "START_SCREEN") {
    return (
      <div className={cn("fixed inset-0 bg-gray-50/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4", className)}>
        <Card className="w-full max-w-md p-8 space-y-8 shadow-2xl rounded-3xl border border-gray-100">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-eliza-blue to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform rotate-3 mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-brand font-bold text-gray-900">Ready to learn?</h2>
            <p className="text-gray-500">Choose how you want to test your knowledge.</p>
          </div>

          <div className="space-y-4">
            <button onClick={handleStartQuizFlow} className="w-full group relative p-6 bg-white border-2 border-gray-100 hover:border-eliza-blue rounded-2xl transition-all shadow-sm hover:shadow-md text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-eliza-blue transition-colors">Take Quiz</h3>
                  <p className="text-sm text-gray-500">Scored assessment with feedback</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-gray-300 group-hover:text-eliza-blue transform group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button onClick={handleStartPracticeFlow} className="w-full group relative p-6 bg-white border-2 border-gray-100 hover:border-green-500 rounded-2xl transition-all shadow-sm hover:shadow-md text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Practice Mode</h3>
                  <p className="text-sm text-gray-500">Ungraded questions to build skills</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-gray-300 group-hover:text-green-600 transform group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <Button variant="ghost" onClick={onClose} className="w-full text-gray-400 hover:text-gray-600">
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (phase === "PRACTICE_SETUP") {
    return (
      <div className={cn("fixed inset-0 bg-gray-50/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4", className)}>
        <Card className="w-full max-w-lg p-8 space-y-6 shadow-2xl rounded-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Difficulty</h2>
            <p className="text-gray-500">Select a level to start your practice session.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "easy", label: "Easy", icon: Target, desc: "Start with basics" },
              { id: "standard", label: "Standard", icon: Star, desc: "Standard difficulty" },
              { id: "hard", label: "Challenge", icon: Trophy, desc: "Test your limits" }
            ].map((lvl) => {
              const Icon = lvl.icon
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleStartPracticeSession(lvl.id as any)}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-eliza-blue hover:bg-eliza-blue/5 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-eliza-blue" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{lvl.label}</div>
                    <div className="text-sm text-gray-500">{lvl.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
          <Button variant="ghost" onClick={() => setPhase("START_SCREEN")}>Back</Button>
        </Card>
      </div>
    )
  }

  // 1. SUMMARY VIEW
  if (phase === "SUMMARY") {
    const wrongCount = summary?.wrong_questions.length || 0

    return (
      <div className={cn("fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95", className)}>
        <Card className="w-full max-w-lg p-8 text-center space-y-6 shadow-2xl rounded-3xl">
          <AlertCircle className="w-20 h-20 text-eliza-orange mx-auto mb-4" />
          <h2 className="text-3xl font-brand font-bold text-gray-900">Quiz Completed</h2>

          <div className="py-4 border-y border-gray-100">
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-4xl font-bold text-gray-900">{summary?.score}</div>
                <div className="text-xs uppercase text-gray-500">Score</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{summary?.percentage}%</div>
                <div className="text-xs uppercase text-gray-500">Accuracy</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl text-left">
            <h3 className="font-bold text-red-900 mb-2">Remediation Needed</h3>
            <p className="text-red-700 text-sm mb-2">
              You missed <strong>{wrongCount}</strong> questions. To master this topic, let's work through some practice exercises.
            </p>
          </div>

          <Button onClick={startRemediation} className="w-full h-12 text-lg rounded-xl bg-eliza-blue hover:bg-eliza-blue/90 text-white shadow-lg">
            Start Remediation
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    )
  }

  // 2. COMPLETED VIEW (Final)
  if (phase === "COMPLETED") {
    return (
      <div className={cn("fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95", className)}>
        <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-2xl border-t-8 border-eliza-purple rounded-3xl">
          <Award className="w-20 h-20 text-eliza-purple mx-auto mb-4" />
          <h2 className="text-3xl font-brand font-bold text-gray-900">All Done!</h2>
          <p className="text-gray-600">You've completed the quiz and any necessary remediation.</p>

          <div className="py-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-eliza-purple to-eliza-blue">
              {summary?.percentage || 100}%
            </div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-2">Final Score</p>
          </div>

          {onClose && (
            <div className="space-y-3">
              <Button onClick={() => setPhase("PRACTICE_SETUP")} className="w-full h-12 text-lg rounded-xl bg-white text-eliza-blue border-2 border-eliza-blue hover:bg-eliza-blue/5 shadow-none">
                <Target className="w-5 h-5 mr-2" /> Practice More
              </Button>
              <Button onClick={onClose} className="w-full h-12 text-lg rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-lg">
                Finish Review
              </Button>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // 3. REMEDIATION SELECT DIFFICULTY
  if (phase === "REMEDIATION_SELECT") {
    const wrongQuestions = summary?.wrong_questions || []
    const currentQ = wrongQuestions[currentWrongQuestionIndex]

    return (
      <div className={cn("fixed inset-0 bg-gray-50/95 backdrop-blur-sm z-50 flex flex-col", className)}>
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Remediation: {currentWrongQuestionIndex + 1} / {wrongQuestions.length}</h2>
            {renderProgress()}
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-xl p-8 space-y-6 shadow-xl rounded-3xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Let's fix this concept</h3>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 italic">
              "{currentQ?.question_text}"
            </div>

            <p className="text-center text-gray-600">Choose a difficulty level to practice:</p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "easy", label: "Easy", icon: Target, desc: "Start with basics" },
                { id: "standard", label: "Standard", icon: Star, desc: "Try a similar problem" },
                { id: "hard", label: "Challenge", icon: Trophy, desc: "Master this concept" }
              ].map((lvl) => {
                const Icon = lvl.icon
                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleSelectDifficulty(lvl.id as any)}
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-eliza-blue hover:bg-eliza-blue/5 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-eliza-blue" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{lvl.label}</div>
                      <div className="text-sm text-gray-500">{lvl.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </main>
      </div>
    )
  }

  // 4. ACTIVE QUESTION (Normal, Remedial, or Practice)
  const isPractice = phase === "PRACTICE_QUESTION" || phase === "PRACTICE_FEEDBACK"
  const activeQ = isPractice ? currentQuestion : (phase === "QUESTION" || phase === "FEEDBACK" ? currentQuestion : remedialQuestion?.question)
  const activeFeedback = isPractice ? practiceFeedback : (phase === "FEEDBACK" ? answerFeedback : remedialFeedback)

  if (!activeQ) return null; // Should not happen

  const options = getOptions(activeQ.options)
  const isCorrect = activeFeedback?.is_correct ?? false

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
                {phase.includes("REMEDIATION") ? "Remediation" : (isPractice ? "Practice Session" : `Question ${questionIndex + 1}`)}
              </span>
            </div>
          </div>

          <div className="w-32 hidden sm:block">
            {renderProgress()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-brand font-bold text-gray-900 leading-tight mb-8">
              {activeQ.body} {/* Use 'body' as the question text as per types */}
            </h2>

            <div className="grid gap-4">
              {options.map((option) => {
                const isSelected = selectedOption === option.id
                const isCorrectAnswer = activeFeedback && activeFeedback.correct_answer === option.id

                // Determine variant
                let variantClass = "bg-white border-2 border-gray-200 text-gray-700 hover:border-eliza-blue/50 hover:bg-eliza-blue/5"
                if (isSelected) {
                  variantClass = "bg-eliza-blue/10 border-2 border-eliza-blue text-eliza-blue font-semibold shadow-inner"
                }

                // Feedback State overrides
                if (activeFeedback) {
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
                    onClick={() => !activeFeedback && setSelectedOption(option.id)}
                    disabled={!!activeFeedback || isSubmitting}
                    className={cn(
                      "w-full text-left p-4 md:p-6 rounded-2xl transition-all duration-200 flex items-center justify-between group",
                      variantClass
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                        isSelected || (activeFeedback && isSelected) ? "bg-current text-white border-transparent" : "bg-gray-50 border-gray-200 text-gray-500"
                      )}>
                        {option.label}
                      </span>
                      <span className="text-lg">{option.text}</span>
                    </div>

                    {activeFeedback && isSelected && isCorrect && <Check className="w-6 h-6 text-green-600" />}
                    {activeFeedback && isSelected && !isCorrect && <X className="w-6 h-6 text-red-600" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="h-32"> {/* Spacer/Container */}
            {activeFeedback ? (
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
                      {activeFeedback.explanation}
                    </p>
                  </div>
                  <Button
                    onClick={isPractice ? handleNextPractice : (phase === "FEEDBACK" ? handleNextQuestion : handleNextRemedial)}
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
                  onClick={isPractice ? handleSubmitPractice : (phase === "QUESTION" ? handleSubmitAnswer : handleSubmitRemedial)}
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
