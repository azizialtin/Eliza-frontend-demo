"use client"

import type React from "react"
import { useState } from "react"
import type { ContentSection } from "@/types/content-sections"
import { cn } from "@/lib/utils"
import { ZoomIn, X, Loader2, AlertCircle, ImageIcon } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageSectionProps {
  section: ContentSection
  className?: string
}

export const ImageSection: React.FC<ImageSectionProps> = ({ section, className }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const getLatestApprovedMedia = () => {
    if (!section.media_versions || section.media_versions.length === 0) {
      return null
    }

    const approvedVersions = section.media_versions
      .filter((v) => v.status === "approved")
      .sort((a, b) => b.version_index - a.version_index)

    return approvedVersions[0] || null
  }

  const latestMedia = getLatestApprovedMedia()
  const imageUrl = latestMedia?.media_url

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const openLightbox = () => {
    if (imageUrl && !hasError) {
      setIsLightboxOpen(true)
    }
  }

  return (
    <>
      <section
        className={cn(
          "group relative mb-12",
          className,
        )}
        role="region"
        aria-label={`Image section: ${section.title}`}
      >
        {/* Decorative gradient background */}


        <div className="relative p-6">
          {/* Section title with icon */}
          {section.title && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-eliza-blue flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
            </div>
          )}

          {/* Image container */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-50">
            {imageUrl ? (
              <>
                {/* Loading state */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-eliza-blue mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Loading image...</p>
                    </div>
                  </div>
                )}

                {/* Image with zoom effect */}
                <div className="relative group/image cursor-zoom-in" onClick={openLightbox}>
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={section.title || "Section image"}
                    className={cn(
                      "w-full h-auto transition-all duration-500",
                      isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100",
                      "group-hover/image:scale-105",
                    )}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                  />

                  {/* Zoom overlay */}
                  {!isLoading && !hasError && (
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="transform scale-0 group-hover/image:scale-100 transition-transform duration-300">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-eliza-blue" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error state */}
                {hasError && (
                  <div className="flex items-center justify-center p-16 bg-gray-50">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-eliza-red/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-eliza-red" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">Failed to load image</p>
                      <p className="text-sm text-gray-600">The image could not be displayed.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Placeholder when no image exists
              <div className="flex items-center justify-center p-16 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Image not available</p>
                  <p className="text-sm text-gray-600">No image has been generated for this section yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Image caption */}
          {section.body && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <p className="text-sm text-gray-700 italic text-center leading-relaxed">{section.body}</p>
            </div>
          )}

          {/* Provenance metadata */}
          {section.source_page_start && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Source: Page {section.source_page_start}
                {section.source_page_end && section.source_page_end !== section.source_page_start
                  ? `-${section.source_page_end}`
                  : ""}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full p-0 bg-black/95 border-0">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Full-size image */}
            {imageUrl && (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={section.title || "Section image"}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            )}

            {/* Caption in lightbox */}
            {(section.title || section.body) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8">
                {section.title && <p className="text-white text-xl font-bold mb-2">{section.title}</p>}
                {section.body && <p className="text-white/90 text-base">{section.body}</p>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
