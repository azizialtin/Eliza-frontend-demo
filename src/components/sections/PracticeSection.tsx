"use client"

// Practice Section Component
// Renders PRACTICE type sections with interactive elements

import type React from "react"
import { useState } from "react"
import type { ContentSection } from "@/types/content-sections"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PenTool, Upload, Mic, Check, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PracticeSectionProps {
  section: ContentSection
  className?: string
  onSubmit?: (answer: string, type: "text" | "image" | "voice") => Promise<void>
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({ section, className, onSubmit }) => {
  const [answer, setAnswer] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Get practice type from metadata
  const practiceType = section.metadata?.practice_type || "text"
  const allowedTypes = section.metadata?.allowed_input_types || ["text"]

  // Handle text submission
  const handleTextSubmit = async () => {
    if (!answer.trim()) {
      toast({
        title: "Answer required",
        description: "Please enter your answer before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(answer, "text")
      }
      setHasSubmitted(true)
      toast({
        title: "✅ Answer submitted",
        description: "Great work! Your answer has been recorded.",
      })
    } catch (error) {
      console.error("Failed to submit answer:", error)
      toast({
        title: "Submission failed",
        description: "Could not submit your answer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP).",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  // Handle image submission
  const handleImageSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Image required",
        description: "Please select an image before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Convert file to base64 or upload to server
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        if (onSubmit) {
          await onSubmit(base64, "image")
        }
        setHasSubmitted(true)
        toast({
          title: "✅ Image submitted",
          description: "Your image has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error("Failed to submit image:", error)
      toast({
        title: "Submission failed",
        description: "Could not upload your image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle voice recording (placeholder)
  const handleVoiceRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement actual voice recording with MediaRecorder API
    toast({
      title: "Voice recording",
      description: isRecording ? "Recording stopped" : "Recording started",
    })
  }

  return (
    <section
      className={cn("practice-section p-6 bg-eliza-yellow/10 border-l-4 border-eliza-yellow rounded-lg", className)}
      role="region"
      aria-label={`Practice section: ${section.title}`}
      aria-labelledby={`practice-title-${section.id}`}
    >
      {/* Section title */}
      {section.title && (
        <h3
          id={`practice-title-${section.id}`}
          className="text-2xl font-bold mb-4 text-eliza-text-primary flex items-center gap-2"
        >
          <PenTool className="w-6 h-6 text-eliza-yellow" aria-hidden="true" />
          {section.title}
        </h3>
      )}

      {/* Practice prompt */}
      {section.body && (
        <div className="mb-6">
          <p className="text-base text-eliza-text-primary leading-relaxed whitespace-pre-wrap">{section.body}</p>
        </div>
      )}

      {/* Input area based on allowed types */}
      <div className="space-y-4">
        {/* Text input */}
        {allowedTypes.includes("text") && (
          <div>
            <label
              htmlFor={`practice-text-${section.id}`}
              className="block text-sm font-medium text-eliza-text-primary mb-2"
            >
              Your Answer
            </label>
            <Textarea
              id={`practice-text-${section.id}`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[120px] resize-y"
              disabled={hasSubmitted || isSubmitting}
            />
            {section.metadata?.character_limit && (
              <p className="text-xs text-eliza-text-secondary mt-1">
                {answer.length} / {section.metadata.character_limit} characters
              </p>
            )}
          </div>
        )}

        {/* Image upload */}
        {allowedTypes.includes("image") && (
          <div>
            <label className="block text-sm font-medium text-eliza-text-primary mb-2">Upload Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id={`practice-image-${section.id}`}
                disabled={hasSubmitted || isSubmitting}
              />
              <label
                htmlFor={`practice-image-${section.id}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border border-eliza-border rounded-lg cursor-pointer hover:bg-eliza-surface transition-colors",
                  (hasSubmitted || isSubmitting) && "opacity-50 cursor-not-allowed",
                )}
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Choose Image</span>
              </label>
              {selectedFile && <span className="text-sm text-eliza-text-secondary">{selectedFile.name}</span>}
            </div>
            {selectedFile && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-xs rounded-lg border border-eliza-border"
                />
              </div>
            )}
          </div>
        )}

        {/* Voice recording */}
        {allowedTypes.includes("voice") && (
          <div>
            <label className="block text-sm font-medium text-eliza-text-primary mb-2">Voice Recording</label>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={handleVoiceRecording}
              disabled={hasSubmitted || isSubmitting}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </div>
        )}

        {/* Submit button */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={allowedTypes.includes("image") && selectedFile ? handleImageSubmit : handleTextSubmit}
            disabled={hasSubmitted || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : hasSubmitted ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Submitted
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>

          {hasSubmitted && <p className="text-sm text-eliza-green">✓ Your answer has been recorded</p>}
        </div>
      </div>
    </section>
  )
}
