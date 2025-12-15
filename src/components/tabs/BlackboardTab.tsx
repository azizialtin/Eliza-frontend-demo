import { PenTool } from "lucide-react"
import { DrawingCanvas } from "@/components/DrawingCanvas"
import { ELIZA_COLORS } from "@/lib/constants"

interface BlackboardTabProps {
    subchapterId: string
    subchapterTitle: string
    blackboardData: string | null
    blackboardAnalysis: string
    blackboardVideo: string
    setBlackboardData: (data: string) => void
    setBlackboardAnalysis: (data: string) => void
    setBlackboardVideo: (data: string) => void
}

export function BlackboardTab({
    subchapterId,
    subchapterTitle,
    blackboardData,
    blackboardAnalysis,
    blackboardVideo,
    setBlackboardData,
    setBlackboardAnalysis,
    setBlackboardVideo,
}: BlackboardTabProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `hsl(${ELIZA_COLORS.GREEN})` }}
                    >
                        <PenTool className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-xl text-gray-900">Interactive Blackboard</h3>
                </div>
                <p className="text-sm text-muted-foreground font-medium ml-13">
                    Draw, sketch, and visualize concepts. Get AI feedback on your work!
                </p>
            </div>
            <DrawingCanvas
                subchapterId={subchapterId}
                subchapterTitle={subchapterTitle}
                persistedCanvasData={blackboardData}
                persistedAnalysis={blackboardAnalysis}
                persistedVideo={blackboardVideo}
                onCanvasDataChange={setBlackboardData}
                onAnalysisChange={setBlackboardAnalysis}
                onVideoChange={setBlackboardVideo}
            />
        </div>
    )
}
