import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AskQuestionWidgetProps {
    contextText: string
    onClose?: () => void
}

export function AskQuestionWidget({ contextText, onClose }: AskQuestionWidgetProps) {
    const [question, setQuestion] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!question.trim()) return

        setIsSending(true)

        // Simulate API call
        setTimeout(() => {
            setIsSending(false)
            toast({
                title: "Question Sent",
                description: "We'll analyze this context and get back to you!",
            })
            setQuestion("")
            if (onClose) onClose()
        }, 1500)
    }

    const toggleListening = () => {
        setIsListening(!isListening)
        if (!isListening) {
            toast({
                title: "Listening...",
                description: "Speak your question now.",
            })
            // Simulate voice input after 2 seconds
            setTimeout(() => {
                setQuestion("What does this concept mean in real life?")
                setIsListening(false)
            }, 2000)
        }
    }

    return (
        <div className="p-4 w-80 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="mb-3">
                <h4 className="text-sm font-bold text-gray-900 mb-1">Ask about this section</h4>
                <p className="text-xs text-gray-500 line-clamp-2 italic border-l-2 border-eliza-purple pl-2">
                    "{contextText}"
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="pr-8"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isListening ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        <Mic className="h-4 w-4" />
                    </button>
                </div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={!question.trim() || isSending}
                    className="bg-eliza-purple hover:bg-eliza-purple/90 text-white shrink-0"
                >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    )
}
