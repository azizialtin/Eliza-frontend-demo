"use client"

import { useState, useRef, useEffect } from "react"
import { Send, MessageSquare, X, User, Bot, Sparkles, Volume2, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ELIZA_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    hasModalities?: boolean
}

interface TutorChatWidgetProps {
    isOpen?: boolean // Make optional since it might be embedded
    onClose?: () => void
    currentTopic?: string
    ragContext?: string
}

export const TutorChatWidget = ({ isOpen = true, onClose, currentTopic, ragContext }: TutorChatWidgetProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: `Hi there! I'm your AI Tutor. ${currentTopic ? `Do you have any questions about "${currentTopic}"?` : "How can I help you learn today?"}`,
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputValue.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInputValue("")
        setIsTyping(true)

        // Mock AI Response with Modalities
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Here is the explanation you requested.",
                timestamp: new Date(),
                hasModalities: true
            }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    if (!isOpen) return null

    return (
        <Card className="flex flex-col h-full shadow-none border-0" style={{ borderColor: ELIZA_COLORS.BLUE }}>
            {onClose && (
                <CardHeader className="bg-eliza-blue/5 border-b p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg flex items-center gap-2 font-brand text-eliza-blue">
                        <Bot className="w-5 h-5" />
                        AI Tutor
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-eliza-blue/10">
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3 max-w-[95%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                            msg.role === "user" ? "bg-gray-100" : "bg-eliza-blue text-white"
                        )}>
                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={cn(
                            "shadow-sm",
                            msg.role === "user"
                                ? "bg-eliza-blue text-white rounded-2xl rounded-tr-none p-3"
                                : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-0 overflow-hidden" // Removed padding for complex messages
                        )}>
                            {msg.hasModalities ? (
                                <MultimodalResponse />
                            ) : (
                                <div className="p-3">
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-eliza-blue text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-gray-50/50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 bg-white"
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping} className="bg-eliza-blue hover:bg-eliza-blue/90 text-white shadow-sm">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    )
}

// Sub-component for Multimodal Response
const MultimodalResponse = () => {
    const [mode, setMode] = useState<"text" | "video" | "voice">("text")
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (mode === "video") {
            setIsLoading(true)
            setCountdown(12)
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setIsLoading(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else if (mode === "voice") {
            setIsLoading(true)
            setCountdown(8)
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setIsLoading(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            setIsLoading(false)
            setCountdown(0)
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [mode])

    return (
        <div className="flex flex-col w-full min-w-[300px]">
            {/* Content Area */}
            <div className="p-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 min-h-[200px] gap-4">
                        <Loader2 className="w-8 h-8 text-eliza-blue animate-spin" />
                        <p className="text-sm font-medium text-gray-600">
                            Generating {mode} content...
                        </p>
                    </div>
                ) : (
                    <>
                        {mode === "text" && (
                            <div className="p-4 text-sm leading-relaxed text-gray-700 bg-white">
                                <p className="mb-2 font-semibold text-eliza-blue">The Fundamental Theorem of Calculus:</p>
                                <p>
                                    The Fundamental Theorem of Calculus bridges the gap between differentiation and integration.
                                    It states that if f is continuous on [a, b] and F is its antiderivative, then:
                                    ∫(a to b) f(x) dx = F(b) - F(a).
                                </p>
                                <p className="mt-2">
                                    This means accumulation (integration) is the inverse of instantaneous change (differentiation).
                                </p>
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    (This is a hardcoded sample explanation provided by your AI Tutor.)
                                </p>
                            </div>
                        )}

                        {mode === "video" && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-gray-500 font-medium">Video: Fundamental Theorem of Calculus</p>
                                <div className="bg-black aspect-video flex items-center justify-center relative w-full rounded-lg overflow-hidden">
                                    <video
                                        controls
                                        className="w-full h-full object-cover"
                                        src="/src/fundamental-theorem-calculus.mp4"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        )}

                        {mode === "voice" && (
                            <div className="p-6 bg-gray-50 flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-eliza-purple/10 flex items-center justify-center animate-pulse">
                                    <Volume2 className="w-8 h-8 text-eliza-purple" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">Playing Audio Explanation...</p>
                                <audio controls className="w-full max-w-[240px]">
                                    {/* Short sample audio */}
                                    <source src="https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav" type="audio/wav" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Mode Switcher */}
            <div className="flex border-t divide-x">
                <button
                    onClick={() => setMode("text")}
                    className={cn(
                        "flex-1 py-3 px-2 text-xs font-medium flex items-center justify-center gap-2 transition-colors hover:bg-gray-50",
                        mode === "text" ? "bg-eliza-blue/5 text-eliza-blue" : "text-gray-500"
                    )}
                >
                    <MessageSquare className="w-4 h-4" />
                    Text
                </button>
                <button
                    onClick={() => setMode("video")}
                    className={cn(
                        "flex-1 py-3 px-2 text-xs font-medium flex items-center justify-center gap-2 transition-colors hover:bg-gray-50",
                        mode === "video" ? "bg-eliza-blue/5 text-eliza-blue" : "text-gray-500"
                    )}
                >
                    <Play className="w-4 h-4" />
                    Video
                </button>
                <button
                    onClick={() => setMode("voice")}
                    className={cn(
                        "flex-1 py-3 px-2 text-xs font-medium flex items-center justify-center gap-2 transition-colors hover:bg-gray-50",
                        mode === "voice" ? "bg-eliza-blue/5 text-eliza-blue" : "text-gray-500"
                    )}
                >
                    <Volume2 className="w-4 h-4" />
                    Voice
                </button>
            </div>
        </div>
    )
}
