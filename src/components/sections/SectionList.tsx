"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import type { ContentSection } from "@/types/content-sections"
import { SectionRenderer } from "./SectionRenderer"
import { PersonalizedSectionInline } from "./PersonalizedSectionSidebar"
import { cn } from "@/lib/utils"
import { ChevronDown, Loader2, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SectionListProps {
  sections: ContentSection[]
  className?: string
  onNeedHelp?: (sectionId: string) => void
  onPageNavigate?: (pageNumber: number) => void
  showPersonalizedInline?: boolean
  isLoading?: boolean
  completedSections?: Set<string>
  onSectionComplete?: (sectionId: string) => void
}

export const SectionList: React.FC<SectionListProps> = ({
  sections = [],
  className,
  onNeedHelp,
  onPageNavigate,
  showPersonalizedInline = false,
  isLoading = false,
  completedSections = new Set(),
  onSectionComplete,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0)

  const estimatedReadingTime = useMemo(() => {
    const wordsPerMinute = 200
    const totalWords = sections.reduce((acc, section) => {
      const words = section.body?.split(/\s+/).length || 0
      return acc + words
    }, 0)
    return Math.ceil(totalWords / wordsPerMinute)
  }, [sections])

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(Math.min(progress, 100))
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const baseSections = sections.filter((s) => s.content_type !== "STUDENT_EXTRA")
  const personalizedSections = sections.filter((s) => s.content_type === "STUDENT_EXTRA")
  const sortedBaseSections = [...baseSections].sort((a, b) => a.order_index - b.order_index)

  const personalizedMap = new Map<string, ContentSection[]>()
  personalizedSections.forEach((section) => {
    if (section.base_section_id) {
      const existing = personalizedMap.get(section.base_section_id) || []
      personalizedMap.set(section.base_section_id, [...existing, section])
    }
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-eliza-primary mb-4" />
        <span className="text-eliza-text-secondary font-medium">Loading your lesson...</span>
      </div>
    )
  }

  if (sortedBaseSections.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-eliza-surface border-4 border-eliza-border flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-eliza-text-secondary" />
        </div>
        <h3 className="text-2xl font-bold text-eliza-text-primary mb-3">No Content Yet</h3>
        <p className="text-eliza-text-secondary max-w-md mx-auto">
          This lesson is being prepared. Check back soon for engaging content!
        </p>
      </div>
    )
  }

  return (
    <div className={cn("section-list relative", className)} role="main">
      {/* Progress bar fixed at top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-eliza-blue via-eliza-purple to-eliza-primary transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Content Sheet */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-[2rem] p-8 md:p-16 max-w-4xl mx-auto min-h-[80vh]">
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide uppercase">{estimatedReadingTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-eliza-blue bg-eliza-blue/5 px-3 py-1 rounded-full">
              {completedSections.size} / {sortedBaseSections.length} completed
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {sortedBaseSections.map((section, index) => {
            const personalizedForSection = personalizedMap.get(section.id) || []

            return (
              <article key={section.id} className="section-group relative group">
                <SectionRenderer
                  section={section}
                  onNeedHelp={onNeedHelp}
                  onPageNavigate={onPageNavigate}
                  onSectionComplete={onSectionComplete}
                  isCompleted={completedSections.has(section.id)}
                />

                {showPersonalizedInline && personalizedForSection.length > 0 && (
                  <div className="mt-6 pl-6 border-l-2 border-eliza-purple/30 space-y-4">
                    {personalizedForSection.map((personalizedSection) => (
                      <PersonalizedSectionInline key={personalizedSection.id} section={personalizedSection} />
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* Completion Footer */}
        {completedSections.size === sortedBaseSections.length && sortedBaseSections.length > 0 && (
          <div className="mt-24 pt-12 border-t border-gray-100 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-3xl mb-6">
              🎉
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-brand mb-3">Lesson Complete</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You've successfully completed all sections. Great work staying focused!
            </p>
            <Button
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8 h-12 font-medium transition-all hover:scale-105"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Review Lesson
            </Button>
          </div>
        )}
      </div>

      {/* Back to Top Floating Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-full shadow-lg hover:shadow-xl bg-white text-gray-900 border border-gray-100 h-12 w-12 transition-all hover:-translate-y-1"
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
        </Button>
      </div>
    </div>
  )
}

export const SectionListSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto p-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-2xl w-2/3 mb-6" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded-xl w-full" />
            <div className="h-4 bg-gray-200 rounded-xl w-5/6" />
            <div className="h-4 bg-gray-200 rounded-xl w-4/6" />
          </div>
        </div>
      ))}
    </div>
  )
}
