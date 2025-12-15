"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { ContentSection } from "@/types/content-sections"
import { TextSection } from "./TextSection"
import { VideoSection } from "./VideoSection"
import { ImageSection } from "./ImageSection"
import { PracticeSection } from "./PracticeSection"
import { CTASection } from "./CTASection"
import { PersonalizedSectionSidebar } from "./PersonalizedSectionSidebar"
import { Button } from "@/components/ui/button"
import { HelpCircle, BookOpen, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionRendererProps {
  section: ContentSection
  onNeedHelp?: (sectionId: string) => void
  onPageNavigate?: (pageNumber: number) => void
  onSectionComplete?: (sectionId: string) => void
  showProvenance?: boolean
  isCompleted?: boolean
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  onNeedHelp,
  onPageNavigate,
  onSectionComplete,
  showProvenance = true,
  isCompleted = false,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Auto-mark as complete after viewing for 3 seconds
    // Simplified to just a timer on mount since we removed scroll visibility
    const timer = setTimeout(() => {
      if (onSectionComplete && !isCompleted) {
        onSectionComplete(section.id)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [section.id, onSectionComplete, isCompleted])

  // Render appropriate component based on content type
  const renderSectionContent = () => {
    switch (section.content_type) {
      case "INTRO":
      case "CONCEPT":
      case "SUMMARY":
      case "TEXT":
        return <TextSection section={section} />

      case "VIDEO":
        return <VideoSection section={section} />

      case "IMAGE":
        return <ImageSection section={section} />

      case "PRACTICE":
        return <PracticeSection section={section} />

      case "CTA":
        return <CTASection section={section} />

      case "STUDENT_EXTRA":
        return <PersonalizedSectionSidebar section={section} />

      default:
        console.warn(`Unknown section type: ${section.content_type}`)
        return <TextSection section={section} />
    }
  }

  const handleProvenanceClick = () => {
    if (section.source_page_start && onPageNavigate) {
      onPageNavigate(section.source_page_start)
    }
  }

  if (section.content_type === "STUDENT_EXTRA") {
    return null
  }

  return (
    <div
      ref={sectionRef}
      className={cn(
        "section-container mb-12 transition-all duration-300",
        isCompleted ? "opacity-75 hover:opacity-100" : "opacity-100"
      )}
      data-section-id={section.id}
      data-section-type={section.content_type}
    >
      {isCompleted && (
        <div className="flex items-center gap-2 mb-4 text-eliza-green/80 text-xs font-medium uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed</span>
        </div>
      )}

      {/* Main section content */}
      <div className="section-content prose prose-lg max-w-none prose-headings:font-brand prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
        {renderSectionContent()}
      </div>

      <div className="section-footer mt-4 flex items-center justify-between gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {showProvenance && section.source_page_start && (
          <button
            onClick={handleProvenanceClick}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gray-900 transition-colors"
            aria-label={`View source on page ${section.source_page_start}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              Page {section.source_page_start}
              {section.source_page_end && section.source_page_end !== section.source_page_start
                ? `-${section.source_page_end}`
                : ""}
            </span>
          </button>
        )}

        {onNeedHelp && section.content_type !== "CTA" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNeedHelp(section.id)}
            className="ml-auto h-8 text-xs font-medium text-muted-foreground hover:text-eliza-blue hover:bg-eliza-blue/5"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            Ask Tutor
          </Button>
        )}
      </div>
    </div>
  )
}
