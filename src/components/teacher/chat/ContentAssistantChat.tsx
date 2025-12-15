"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, X, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ELIZA_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

interface ContentAssistantChatProps {
    isOpen: boolean
    onClose: () => void
    context?: string // Optional context like "Chapter 1: Photosynthesis"
}

export const ContentAssistantChat = ({ isOpen, onClose, context }: ContentAssistantChatProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: `Hello! I'm your Content Assistant. ${context ? `I see you're working on "${context}". ` : ""}How can I help you improve your course content today?`,
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
                content: "I'm a simulated AI assistant. I can help you draft lessons, create quiz questions, or summarize topics. (Real AI integration coming soon!)",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    if (!isOpen) return null

    return (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 border-2" style={{ borderColor: ELIZA_COLORS.PURPLE }}>
            <CardHeader className="bg-eliza-purple/5 border-b p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg flex items-center gap-2 font-brand text-eliza-purple">
                    <Sparkles className="w-5 h-5" />
                    Content Assistant
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-eliza-purple/10">
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>

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
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            msg.role === "user" ? "bg-gray-100" : "bg-eliza-purple/10"
                        )}>
                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-eliza-purple" />}
                        </div>
                        <div className={cn(
                            "p-3 rounded-2xl text-sm",
                            msg.role === "user"
                                ? "bg-eliza-purple text-white rounded-tr-none"
                                : "bg-gray-100 text-gray-800 rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-eliza-purple/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-eliza-purple" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask for help..."
                        className="flex-1"
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping} className="bg-eliza-purple hover:bg-eliza-purple/90 text-white">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    )
}
