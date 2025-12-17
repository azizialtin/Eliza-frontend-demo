"use client"

import { useState, useMemo } from "react"
import { ContentSection } from "@/types/content-sections"
import { cn } from "@/lib/utils"
import { PlayCircle, Loader2, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface VideoSectionProps {
  section: ContentSection
  className?: string
  onVideoProgress?: (progress: number) => void
}

export const VideoSection = ({ section, className, onVideoProgress }: VideoSectionProps) => {
  const { toast } = useToast()

  // Video state (simplified for this mocked version, assuming native controls or basic playback)
  const [isPlaying, setIsPlaying] = useState(false)

  // Edit / AI state
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // Find the latest approved version or the most recent one
  // In a real app, we might also check for a pending version to show a "processing" state
  const currentVersion = useMemo(() => {
    if (!section.media_versions?.length) return null
    // Prefer approved, then pending, then rejected? Or just latest?
    // Let's take the latest COMPLETED one for display.
    return section.media_versions.find(v => v.status === "COMPLETED") || section.media_versions[0]
  }, [section.media_versions])

  const isProcessing = section.media_versions?.some(v => v.status === "PENDING" || v.status === "PROCESSING") || isAiGenerating

  // Local override for AI generated video
  const [overrideUrl, setOverrideUrl] = useState<string | null>(null)

  const handleAiVideoEdit = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const newUrl = await apiClient.aiEditVideo(section.id, aiPrompt);
      setOverrideUrl(newUrl);
      setIsAiDialogOpen(false);
      setAiPrompt("");
      toast({
        title: "Video Updated",
        description: "Your new video is ready.",
      });
      // In a real app, we'd refetch or the server would push an update. 
      // Here we just rely on the 'isAiGenerating' state or simulated delay.
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger video generation.",
        variant: "destructive"
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <section
      className={cn(
        "video-section my-12 scroll-mt-20",
        className
      )}
      aria-label={`Video: ${section.title}`}
    >
      {/* Header with Title and Edit Button */}
      <div className="flex items-center justify-between mb-4">
        {section.title && (
          <h3 className="text-xl font-brand font-semibold text-gray-900 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-eliza-blue" />
            {section.title}
          </h3>
        )}

        {/* Edit Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAiDialogOpen(true)}
          className="h-8 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          disabled={isProcessing}
        >
          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
          {isProcessing ? "Generating..." : "Edit Video"}
        </Button>
      </div>

      <div className={cn(
        "relative rounded-2xl overflow-hidden bg-black aspect-video shadow-lg ring-1 ring-black/5",
        isProcessing && "opacity-90 pointer-events-none"
      )}>
        {overrideUrl || currentVersion?.media_url ? (
          <video
            src={overrideUrl || currentVersion?.media_url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 bg-gray-900">
            {isProcessing ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Generating video...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
                <span>No video available</span>
              </>
            )}
          </div>
        )}

        {/* Overlay if processing changes */}
        {isProcessing && currentVersion && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
            <div className="bg-white p-4 rounded-full shadow-xl mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <p className="text-white font-medium text-lg drop-shadow-md">AI is updating this video...</p>
            <p className="text-white/80 text-sm mt-1">This usually takes about a minute.</p>
          </div>
        )}
      </div>

      {/* AI Edit Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              AI Video Director
            </DialogTitle>
            <DialogDescription>
              Describe how you want to change the video.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. 'Use a more enthusiastic tone', 'Add subtitles', 'Focus on the formula steps'..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiVideoEdit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAiVideoEdit}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isAiGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
