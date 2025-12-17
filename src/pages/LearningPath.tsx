"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Play,
  BookOpen,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/page-loader"
import { useSyllabus, useSyllabusStatusPolling } from "@/hooks/useApi"
import { type Chapter, type BackendChapter, apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function LearningPath() {
  const { syllabusId } = useParams()
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [generatedChapters, setGeneratedChapters] = useState<Record<string, BackendChapter[]>>({})
  const [generatingChapters, setGeneratingChapters] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { toast } = useToast()

  const { syllabus, loading: syllabusLoading, error: syllabusError } = useSyllabus(syllabusId!)
  const isTeacher = user?.role === "TEACHER"

  const shouldPollSyllabus =
    syllabus?.status === "GENERATING_STRUCTURE" || syllabus?.status === "CREATED"
  const { status: syllabusStatus } = useSyllabusStatusPolling(syllabusId!, shouldPollSyllabus, 10000)

  const currentSyllabus = syllabusStatus || syllabus

  // Theme configuration
  const getThemeColor = (index: number) => {
    const colors = [
      "border-l-eliza-red",
      "border-l-eliza-yellow",
      "border-l-eliza-blue",
      "border-l-eliza-purple",
      "border-l-eliza-orange",
    ]
    return colors[index % colors.length]
  }

  // Fetch chapters (topics) and their subchapters (real chapters)
  const fetchChapters = async () => {
    if (!currentSyllabus) return
    try {
      const syllabusChapters = await apiClient.getSyllabusChapters(currentSyllabus.id)
      const sortedChapters = syllabusChapters.sort((a, b) => a.order_index - b.order_index)
      setChapters(sortedChapters)

      // Fetch subchapters for each topic
      const subchaptersMap: Record<string, BackendChapter[]> = {}
      await Promise.all(sortedChapters.map(async (chapter) => {
        try {
          const subs = await apiClient.getTopicChapters(chapter.id)
          if (subs && subs.length > 0) {
            subchaptersMap[chapter.id] = subs.sort((a, b) => a.order - b.order)
          }
        } catch (e) {
          // Ignore if no chapters found
        }
      }))
      setGeneratedChapters(subchaptersMap)

    } catch (error) {
      console.error("Failed to fetch chapters:", error)
    }
  }

  useEffect(() => {
    fetchChapters()
  }, [currentSyllabus])

  const handleGenerateChapter = async (chapterId: string) => {
    try {
      setGeneratingChapters(prev => new Set(prev).add(chapterId))

      const newChapters = await apiClient.generateTopicChapters(chapterId)

      setGeneratedChapters(prev => ({
        ...prev,
        [chapterId]: newChapters.sort((a, b) => a.order - b.order)
      }))

      toast({
        title: "Content Generated",
        description: "Lessons have been created for this topic.",
      })

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate content",
        variant: "destructive",
      })
    } finally {
      setGeneratingChapters(prev => {
        const next = new Set(prev)
        next.delete(chapterId)
        return next
      })
    }
  }

  if (syllabusLoading) {
    return <PageLoader text="Loading your path..." />
  }

  if (syllabusError || !currentSyllabus) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Syllabus Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't load the requested syllabus.</p>
          <Button onClick={() => navigate("/app")} variant="default">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app")} className="hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="font-brand font-bold text-lg text-gray-900 truncate max-w-md">
            {currentSyllabus.name}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-10">
          <h2 className="font-brand text-3xl font-bold text-gray-900 mb-3">Your Learning Topics</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Review the extracted topics below. Click "Generate Content" to create detailed lessons.
          </p>
        </div>

        <div className="grid gap-6">
          {chapters.map((chapter, index) => {
            const isGenerating = generatingChapters.has(chapter.id)
            const subchapters = generatedChapters[chapter.id] || []
            const hasSubchapters = subchapters.length > 0

            const description = chapter.description

            return (
              <Card
                key={chapter.id}
                className={cn(
                  "overflow-hidden border-l-4 transition-all duration-200",
                  chapter.is_published ? "hover:shadow-md" : "opacity-75 bg-gray-50",
                  getThemeColor(index)
                )}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                          Unit {index + 1}
                        </span>
                        {!chapter.is_published && (
                          <span className="flex items-center text-xs font-bold text-gray-500 border border-gray-200 px-2 py-1 rounded bg-white">
                            <span className="mr-1">🔒</span> Locked
                          </span>
                        )}
                        {chapter.is_published && hasSubchapters && (
                          <span className="flex items-center text-xs font-bold text-green-600 border border-green-200 px-2 py-1 rounded bg-green-50">
                            Published
                          </span>
                        )}
                      </div>
                      <CardTitle className="font-brand text-xl mb-2 text-gray-900">
                        {chapter.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-4">
                        {description}
                      </p>
                    </div>

                    <div className="min-w-[160px]">
                      {/* ONLY SHOW ACTIONS IF PUBLISHED */}
                      {chapter.is_published ? (
                        !hasSubchapters ? (
                          !isTeacher ? (
                            <Button variant="outline" disabled className="w-full opacity-75">
                              No Content Yet
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleGenerateChapter(chapter.id)}
                              disabled={isGenerating}
                              className="w-full bg-eliza-blue hover:bg-eliza-blue/90 text-white font-semibold shadow-sm"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Generate Content
                                </>
                              )}
                            </Button>
                          )
                        ) : null
                      ) : (
                        <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Generated Subchapters List - Only if Published */}
                  {chapter.is_published && hasSubchapters && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                        Lessons
                      </h4>
                      <div className="grid gap-2">
                        {subchapters.map((sub, idx) => {
                          const isBlogGenerating = generatingChapters.has(sub.id)
                          const hasContent = sub.has_blog;

                          return (
                            <div
                              key={sub.id}
                              className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-eliza-blue/30 hover:bg-blue-50/30 transition-all"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600">
                                  {idx + 1}
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                                  {sub.title}
                                </span>
                              </div>

                              <div className="flex items-center flex-shrink-0 ml-2">
                                {hasContent ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600"
                                    onClick={() => navigate(`/app/syllabus/${syllabusId}/lesson/${sub.id}`)}
                                  >
                                    <Play className="h-3 w-3 fill-current" />
                                    <span className="sr-only">Start Lesson</span>
                                  </Button>
                                ) : (
                                  !isTeacher ? (
                                    <span className="text-xs text-gray-400 italic">Coming soon</span>
                                  ) : (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      disabled={isBlogGenerating}
                                      onClick={async () => {
                                        try {
                                          setGeneratingChapters(prev => new Set(prev).add(sub.id))
                                          await apiClient.generateChapterBlog(sub.id)
                                          toast({
                                            title: "Generation Started",
                                            description: "Your lesson content is being created. The list will refresh shortly.",
                                          })

                                          setTimeout(() => fetchChapters(), 2000)

                                        } catch (e) {
                                          toast({
                                            title: "Failed",
                                            description: "Could not generate content.",
                                            variant: "destructive"
                                          })
                                        } finally {
                                          setGeneratingChapters(prev => {
                                            const next = new Set(prev);
                                            next.delete(sub.id);
                                            return next;
                                          })
                                        }
                                      }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-7 text-xs px-3"
                                    >
                                      {isBlogGenerating ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <Sparkles className="h-3 w-3 mr-1" />
                                      )}
                                      {isBlogGenerating ? "Creating..." : "Generate"}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}

          {chapters.length === 0 && !syllabusLoading && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No topics found. Please verify your document upload.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
