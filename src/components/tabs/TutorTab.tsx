import { useState } from "react"
import { MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TutorChatWidget } from "@/components/student/TutorChatWidget"
import { ELIZA_COLORS } from "@/lib/constants"

interface TutorTabProps {
    title: string
    textDescription?: string
    subtitles?: string
    ragContent: string
}

export function TutorTab({ title, textDescription, subtitles, ragContent }: TutorTabProps) {
    const [isTutorActive, setIsTutorActive] = useState(false)

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            <div
                className="border-b border-gray-200 p-6"
                style={{ backgroundColor: `hsl(${ELIZA_COLORS.YELLOW} / 0.05)` }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `hsl(${ELIZA_COLORS.YELLOW})` }}
                    >
                        <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-brand font-bold text-xl text-gray-900">AI Tutor</h3>
                        <p className="text-sm text-muted-foreground font-medium">
                            Get personalized help with this lesson
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ height: "600px", position: "relative" }}>
                {!isTutorActive ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md"
                            style={{ backgroundColor: `hsl(${ELIZA_COLORS.YELLOW})` }}
                        >
                            <MessageSquare className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="font-brand text-2xl font-bold mb-3 text-foreground">Ready to Learn?</h3>
                        <p className="text-muted-foreground mb-8 max-w-md leading-relaxed font-medium">
                            Chat with your AI tutor about "{title}" and get instant answers to your
                            questions!
                        </p>
                        <Button
                            onClick={() => setIsTutorActive(true)}
                            className="px-10 py-6 rounded-xl font-['Space_Grotesk'] font-semibold text-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-0"
                            style={{ backgroundColor: `hsl(${ELIZA_COLORS.YELLOW})`, color: "white" }}
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Start Conversation
                        </Button>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div
                            className="flex justify-between items-center p-4 border-b border-gray-200"
                            style={{ backgroundColor: `hsl(${ELIZA_COLORS.YELLOW} / 0.05)` }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `hsl(${ELIZA_COLORS.YELLOW})` }}
                                >
                                    <MessageSquare className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-brand font-bold text-card-foreground">AI Tutor</h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Discussing: {title}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsTutorActive(false)}
                                className="hover:bg-red-50 hover:text-[hsl(0,96.9%,62.4%)] hover:border-[hsl(0,96.9%,62.4%)] border font-['Space_Grotesk'] font-semibold rounded-xl"
                            >
                                End Chat
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden h-full">
                            <TutorChatWidget
                                isOpen={true}
                                currentTopic={title}
                                onClose={() => setIsTutorActive(false)}
                                ragContext={`## Main Content:
${textDescription || ""}

${subtitles
                                        ? `## Video Content:
${subtitles}`
                                        : ""
                                    }

${ragContent
                                        ? `## Related Materials:
${ragContent}`
                                        : ""
                                    }`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
