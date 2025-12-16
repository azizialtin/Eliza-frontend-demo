import React, { useState, useEffect } from "react"
import { X, Check, ArrowRight, AlertCircle, RefreshCw, Zap, Target, Star, Trophy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { apiClient, QuizQuestion, PracticeStartResponse, PracticeAnswerResponse } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface PracticeInterfaceProps {
    topicId: string
    topicName: string
    onClose?: () => void
    className?: string
}

type PracticePhase = "LOADING" | "QUESTION" | "FEEDBACK" | "SUMMARY"

export const PracticeInterface: React.FC<PracticeInterfaceProps> = ({
    topicId,
    topicName,
    onClose,
    className,
}) => {
    const [phase, setPhase] = useState<PracticePhase>("LOADING")
    const [sessionId, setSessionId] = useState<string | null>(null)

    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)

    const [feedback, setFeedback] = useState<PracticeAnswerResponse | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    // Session Stats
    const [stats, setStats] = useState({
        answered: 0,
        correct: 0,
        streak: 0
    })

    // Initialize Session
    useEffect(() => {
        const startSession = async () => {
            try {
                const response = await apiClient.startPracticeSession(topicId, "adaptive")
                setSessionId(response.session_id)
                setCurrentQuestion(response.first_question)
                setStats({
                    answered: response.total_questions_answered,
                    correct: response.correct_count,
                    streak: response.current_streak
                })
                setPhase("QUESTION")
            } catch (error) {
                console.error("Failed to start practice session", error)
                toast({ title: "Error", description: "Could not start practice session", variant: "destructive" })
                onClose?.()
            }
        }

        startSession()
    }, [topicId])

    const handleSubmit = async () => {
        if (!sessionId || !currentQuestion || !selectedOption) return

        setIsSubmitting(true)
        try {
            const response = await apiClient.answerPracticeQuestion(sessionId, currentQuestion.id, selectedOption)
            setFeedback(response)

            setStats(prev => ({
                answered: prev.answered + 1,
                correct: response.is_correct ? prev.correct + 1 : prev.correct,
                streak: response.is_correct ? prev.streak + 1 : 0
            }))

            setPhase("FEEDBACK")
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit answer", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleNext = async () => {
        if (!sessionId) return

        // Check if next question was already provided in answer response?
        // The interface has optional next_question
        if (feedback?.next_question) {
            setCurrentQuestion(feedback.next_question)
            resetQuestionState()
        } else {
            // Generate more
            setIsGenerating(true)
            try {
                const res = await apiClient.generateMorePracticeQuestions(sessionId)
                setCurrentQuestion(res.next_question)
                resetQuestionState()
            } catch (error) {
                toast({ title: "Error", description: "Failed to generate next question", variant: "destructive" })
            } finally {
                setIsGenerating(false)
            }
        }
    }

    const resetQuestionState = () => {
        setSelectedOption(null)
        setFeedback(null)
        setPhase("QUESTION")
    }

    const getOptions = (options?: string[] | { id: string; text: string }[]) => {
        if (!options) return []
        if (typeof options[0] === 'string') {
            return (options as string[]).map((opt, i) => ({
                id: opt,
                label: String.fromCharCode(65 + i),
                text: opt
            }))
        }
        return (options as { id: string; text: string }[]).map((opt, i) => ({
            id: opt.id,
            label: String.fromCharCode(65 + i),
            text: opt.text
        }))
    }

    // --- Views ---

    if (phase === "LOADING") {
        return (
            <div className={cn("fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center animate-in fade-in", className)}>
                <Loader2 className="w-12 h-12 animate-spin text-eliza-blue mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Starting Practice Session...</h3>
                <p className="text-gray-500">Preparing adaptive questions for {topicName}</p>
            </div>
        )
    }

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
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">{topicName}</h2>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Practice Mode</span>
                                {stats.streak > 1 && (
                                    <span className="flex items-center gap-1 text-orange-500 font-bold animate-pulse">
                                        <Zap className="w-3 h-3 fill-current" /> {stats.streak} Streak!
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold uppercase text-gray-400">Questions</div>
                            <div className="text-lg font-bold text-gray-900">{stats.answered}</div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold uppercase text-gray-400">Accuracy</div>
                            <div className="text-lg font-bold text-gray-900">
                                {stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto py-8 px-4">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Question Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                currentQuestion.difficulty === 'hard' ? "bg-red-100 text-red-600" :
                                    currentQuestion.difficulty === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                        "bg-green-100 text-green-600"
                            )}>
                                {currentQuestion.difficulty}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-brand font-bold text-gray-900 leading-tight mb-8">
                            {currentQuestion.question}
                        </h2>

                        <div className="grid gap-4">
                            {options.map((option) => {
                                const isSelected = selectedOption === option.id
                                const isCorrectAnswer = feedback && feedback.correct_answer === option.id

                                // Determine variant
                                let variantClass = "bg-white border-2 border-gray-200 text-gray-700 hover:border-eliza-blue/50 hover:bg-eliza-blue/5"
                                if (isSelected) {
                                    variantClass = "bg-eliza-blue/10 border-2 border-eliza-blue text-eliza-blue font-semibold shadow-inner"
                                }

                                // Feedback State
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
                                                {isCorrect ? "That's Correct!" : "Not quite right"}
                                            </h3>
                                        </div>
                                        <p className={cn("text-lg", isCorrect ? "text-white/90" : "text-gray-600")}>
                                            {feedback.explanation}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleNext}
                                        disabled={isGenerating}
                                        className={cn(
                                            "h-12 px-8 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform shrink-0",
                                            isCorrect ? "bg-white text-green-700 hover:bg-green-50" : "bg-red-600 text-white hover:bg-red-700"
                                        )}
                                    >
                                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next Question <ArrowRight className="ml-2 w-5 h-5" /></>}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="h-14 px-6 rounded-2xl text-gray-500 hover:bg-gray-100 font-bold"
                                >
                                    End Session
                                </Button>
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
