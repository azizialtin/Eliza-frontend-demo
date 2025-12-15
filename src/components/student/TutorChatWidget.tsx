"use client"

import { useState, useRef, useEffect } from "react"
import { Send, MessageSquare, X, User, Bot, Sparkles } from "lucide-react"
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

        // Mock AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "That's a great question! I'm currently in demo mode, but soon I'll be able to answer questions based on your lesson content using RAG (Retrieval-Augmented Generation).",
                timestamp: new Date()
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
                            "flex gap-3 max-w-[85%]",
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
                            "p-3 rounded-2xl text-sm shadow-sm",
                            msg.role === "user"
                                ? "bg-eliza-blue text-white rounded-tr-none"
                                : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                        )}>
                            {msg.content}
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
