"use client"

import type React from "react"
import { useState } from "react"
import type { ContentSection, MediaVersion } from "@/types/content-sections"
import { cn } from "@/lib/utils"
import { Play, Loader2, AlertCircle, Video } from "lucide-react"

interface VideoSectionProps {
  section: ContentSection
  className?: string
  onVideoProgress?: (progress: number) => void
}

export const VideoSection: React.FC<VideoSectionProps> = ({ section, className, onVideoProgress }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)

  const getLatestApprovedMedia = (): MediaVersion | null => {
    if (!section.media_versions || section.media_versions.length === 0) {
      return null
    }
    const approvedVersions = section.media_versions
      .filter((v) => v.status === "READY" || v.status === "approved" || v.status === "COMPLETED")
      .sort((a, b) => b.version_index - a.version_index)
    return approvedVersions[0] || null
  }

  const latestMedia = getLatestApprovedMedia()
  const hasPendingMedia = section.media_versions?.some((v) => v.status === "pending" || v.status === "processing")

  const handleVideoLoad = () => {
    setIsLoading(false)
    setHasError(false)
    setLoadProgress(100)
  }

  const handleVideoError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      const duration = video.duration
      if (duration > 0) {
        const progress = (bufferedEnd / duration) * 100
        setLoadProgress(Math.min(progress, 100))

        // Once we have enough buffered (e.g., 5%), we can hide the loading overlay
        if (progress > 5 && isLoading) {
          setIsLoading(false)
        }
      }
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const progress = (video.currentTime / video.duration) * 100
    if (onVideoProgress && !isNaN(progress)) {
      onVideoProgress(progress)
    }
  }

  return (
    <section
      className={cn(
        "video-section group relative",
        "mb-12",
        "animate-fade-in",
        className,
      )}
      role="region"
      aria-label={`Video section: ${section.title}`}
      aria-labelledby={`video-title-${section.id}`}
    >
      {/* Badge */}
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-eliza-red text-white shadow-lg">
          <Video className="w-5 h-5" />
          Video Lesson
        </span>
      </div>

      {/* Section title */}
      {section.title && (
        <h3
          id={`video-title-${section.id}`}
          className="text-3xl md:text-4xl font-brand font-bold mb-6 text-gray-900 leading-tight"
        >
          {section.title}
        </h3>
      )}

      {/* Video player container */}
      <div className="video-container relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video mb-6">
        {latestMedia && latestMedia.media_url ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 z-10">
                <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
                <p className="text-white font-medium mb-3">Loading video...</p>
                {/* Progress bar */}
                <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-eliza-red to-orange-500 transition-all duration-300 ease-out"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-white/70 text-sm mt-2">{Math.round(loadProgress)}%</p>
              </div>
            )}

            <video
              className="w-full h-full"
              controls
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              onProgress={handleVideoProgress}
              preload="auto"
            >
              <source src={latestMedia.media_url} type="video/mp4" />
              <track kind="captions" src={latestMedia.metadata?.captions_url} srcLang="en" label="English" />
              Your browser does not support the video tag.
            </video>

            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900 to-red-800">
                <AlertCircle className="w-16 h-16 text-white mb-4" />
                <p className="text-white font-bold text-xl mb-2">Oops! Video failed to load</p>
                <p className="text-white/80 text-sm">Please refresh the page or try again later</p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            {hasPendingMedia ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-white mb-4" />
                <p className="text-white font-bold text-xl mb-2">Creating your video...</p>
                <p className="text-white/80 text-sm">This usually takes a few minutes</p>
              </>
            ) : (
              <>
                <Play className="w-16 h-16 text-white/50 mb-4" />
                <p className="text-white font-bold text-xl mb-2">Video coming soon</p>
                <p className="text-white/80 text-sm">Check back later for video content</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Video description */}
      {section.body && (
        <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-lg text-gray-700 leading-relaxed">{section.body}</p>
        </div>
      )}
    </section>
  )
}
