"use client"

import type React from "react"
import type { ContentSection } from "@/types/content-sections"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageSquare, PenTool, ClipboardCheck, ArrowRight, Sparkles, Clock } from "lucide-react"

interface CTASectionProps {
  section: ContentSection
  className?: string
  onAction?: (action: string) => void
}

export const CTASection: React.FC<CTASectionProps> = ({ section, className, onAction }) => {
  const ctaAction = section.metadata?.cta_action as string | undefined
  const ctaLabel = section.metadata?.cta_label as string | undefined

  // Map actions to icons, colors, and default labels
  const getActionConfig = () => {
    switch (ctaAction) {
      case "quiz":
        return {
          icon: ClipboardCheck,
          label: ctaLabel || "Take the Quiz",
          color: "eliza-blue",
          bgGradient: "from-eliza-blue/10 to-eliza-purple/10",
          description: "Test your understanding with interactive questions",
        }
      case "tutor":
        return {
          icon: MessageSquare,
          label: ctaLabel || "Ask AI Tutor",
          color: "eliza-purple",
          bgGradient: "from-eliza-purple/10 to-eliza-blue/10",
          description: "Get personalized help from your AI tutor",
        }
      case "blackboard":
        return {
          icon: PenTool,
          label: ctaLabel || "Open Blackboard",
          color: "eliza-green",
          bgGradient: "from-eliza-green/10 to-eliza-yellow/10",
          description: "Practice with the interactive blackboard",
        }
      default:
        return {
          icon: Sparkles,
          label: ctaLabel || "Continue Learning",
          color: "eliza-orange",
          bgGradient: "from-eliza-orange/10 to-eliza-red/10",
          description: section.body || "Take the next step in your learning journey",
        }
    }
  }

  const config = getActionConfig()
  const Icon = config.icon

  const handleClick = () => {
    if (onAction && ctaAction) {
      onAction(ctaAction)
    }
  }

  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-3xl border-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
        `border-${config.color}`,
        className,
      )}
      role="region"
      aria-label={`Call to action: ${section.title}`}
    >
      {/* Decorative gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", config.bgGradient)} />

      <div className="relative p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon with animated pulse */}
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                `bg-${config.color}`,
              )}
            >
              <Icon className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            {section.title && <h3 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{section.title}</h3>}
            <p className="text-lg text-gray-700 leading-relaxed">{section.body || config.description}</p>
          </div>

          {/* Action button */}
          <div className="flex-shrink-0">
            <Button
              size="lg"
              onClick={handleClick}
              className={cn(
                "text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105",
                `bg-${config.color}`,
                `hover:bg-${config.color}/90`,
              )}
            >
              {config.label}
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Additional metadata */}
        {section.metadata?.estimated_time && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <p className="text-sm font-medium">Estimated time: {section.metadata.estimated_time} minutes</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
