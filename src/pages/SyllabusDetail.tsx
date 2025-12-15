"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  MessageSquare,
  BookOpen,
  FileText,
  ClipboardCheck,
  PenTool,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useSyllabus, useVideoStatusPolling, useSubchapter, useSyllabusStatusPolling } from "@/hooks/useApi"
import { useCanAccessQuiz } from "@/hooks/useProgress"
import { useAuth } from "@/contexts/AuthContext"
import { PDFViewerTab } from "@/components/tabs/PDFViewerTab"
import { LessonTab } from "@/components/tabs/LessonTab"
import { QuizTab } from "@/components/tabs/QuizTab"
import { useContentSections } from "@/hooks/useContentSections"
import { apiClient, type Subchapter } from "@/lib/api"
import { ELIZA_COLORS } from "@/lib/constants"
import { usePdfResolution } from "@/hooks/usePdfResolution"
import { PageLoader } from "@/components/ui/page-loader"
import { SyllabusHeader } from "@/components/syllabus/SyllabusHeader"
import { SyllabusNavigation } from "@/components/syllabus/SyllabusNavigation"
import { SyllabusTabs, type TabConfig } from "@/components/syllabus/SyllabusTabs"
import { TutorTab } from "@/components/tabs/TutorTab"
import { BlackboardTab } from "@/components/tabs/BlackboardTab"

interface SyllabusDetailProps {
  backUrlOverride?: string
}

export default function SyllabusDetail({ backUrlOverride }: SyllabusDetailProps = {}) {
  const { syllabusId, subchapterId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [ragContent, setRagContent] = useState<string>("")
  const [allSubchapters, setAllSubchapters] = useState<Subchapter[]>([])

  const [blackboardData, setBlackboardData] = useState<string | null>(null)
  const [blackboardAnalysis, setBlackboardAnalysis] = useState<string>("")
  const [blackboardVideo, setBlackboardVideo] = useState<string>("")

  const { user } = useAuth()


  // Enable polling if syllabus is in 'GENERATING_STRUCTURE' state
  const { status: syllabus, refetch: refetchSyllabus } = useSyllabusStatusPolling(syllabusId!, true, 5000)

  const { subchapter, error: subchapterError, markComplete } = useSubchapter(subchapterId || "")

  const shouldStopPolling = subchapter?.video_status === "COMPLETED" && subchapter?.video_progress === 100
  const pollingEnabled = !!subchapterId && !shouldStopPolling

  const { status: videoStatus } = useVideoStatusPolling(subchapterId || "", pollingEnabled)

  // Get active tab from URL or default to 'lesson'
  const activeTab = searchParams.get("tab") || "lesson"

  // Check if student can access quiz (only track progress for students)
  const isStudent = user?.role === "STUDENT"
  const canAccessQuiz = useCanAccessQuiz(subchapterId || "", { enabled: isStudent })

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Fetch student sections (for page anchors)
  const { data: contentSections } = useContentSections(subchapterId || "", { refetchInterval: false })

  // Use custom hook for PDF resolution
  const { pdfUrl, isPdfSourceLoading, currentPdfPage, setCurrentPdfPage } = usePdfResolution(
    subchapterId,
    syllabusId,
    contentSections
  )

  // Handle PDF page navigation from lesson sections
  const handlePageNavigate = (pageNumber: number) => {
    setCurrentPdfPage(pageNumber)
    setSearchParams({ tab: "pdf" })
  }

  // Fetch all subchapters for navigation
  useEffect(() => {
    const fetchAllSubchapters = async () => {
      if (!syllabusId) return

      try {
        const chapters = await apiClient.getSyllabusChapters(syllabusId)
        const allSubs: Subchapter[] = []

        // Get subchapters from all chapters in order
        for (const chapter of chapters.sort((a, b) => a.order_index - b.order_index)) {
          const chapterDetails = await apiClient.getChapter(chapter.id)
          if (chapterDetails.subchapters) {
            const sortedSubs = chapterDetails.subchapters.sort((a, b) => a.order_index - b.order_index)
            allSubs.push(...sortedSubs)
          }
        }

        setAllSubchapters(allSubs)
      } catch (error) {
        console.error("Failed to fetch subchapters:", error)
      }
    }

    if (syllabus?.status === "READY" || !syllabus) {
      fetchAllSubchapters()
    }
  }, [syllabusId, syllabus?.status])

  // Auto-redirect to first chapter if at root
  useEffect(() => {
    if (!subchapterId && allSubchapters.length > 0) {
      // Redirect to first subchapter
      navigate(`/app/syllabus/${syllabusId}/lesson/${allSubchapters[0].id}`, { replace: true })
    }
  }, [subchapterId, allSubchapters, syllabusId, navigate])

  useEffect(() => {
    const fetchRagContent = async () => {
      if (!subchapterId) {
        setRagContent("")
        return
      }

      try {
        const ragResponse = await apiClient.getRagContent(subchapterId)
        setRagContent(ragResponse.rag_content || "")
      } catch (error) {
        console.error("Failed to fetch RAG content:", error)
        setRagContent("")
      }
    }

    fetchRagContent()
  }, [subchapterId])

  // Calculate current position and navigation
  const currentIndex = allSubchapters.findIndex(sub => sub.id === subchapterId)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allSubchapters.length - 1
  const previousSubchapter = hasPrevious ? allSubchapters[currentIndex - 1] : null
  const nextSubchapter = hasNext ? allSubchapters[currentIndex + 1] : null

  const handleNavigate = (targetSubchapterId: string) => {
    navigate(`/app/syllabus/${syllabusId}/lesson/${targetSubchapterId}?tab=${activeTab}`)
  }

  const queryClient = useQueryClient()

  const enhancedSubchapter = useMemo(() => {
    if (!subchapter) return null

    if (videoStatus) {
      return {
        ...subchapter,
        video_status: videoStatus.video_status || subchapter.video_status,
        video_progress: videoStatus.video_progress ?? subchapter.video_progress,
        video_message: videoStatus.video_message || subchapter.video_message,
        video_file_path: videoStatus.video_file_path || subchapter.video_file_path,
      }
    }

    return subchapter
  }, [subchapter, videoStatus])

  // Effect to refetch content when video is completed
  useEffect(() => {
    if (videoStatus?.video_status === "COMPLETED" && subchapterId) {
      queryClient.invalidateQueries({ queryKey: ["content-sections", subchapterId] })
      queryClient.invalidateQueries({ queryKey: ["subchapter", subchapterId] })
    }
  }, [videoStatus?.video_status, subchapterId, queryClient])

  const handleSubchapterComplete = async (checked: boolean) => {
    if (!subchapterId || !checked) return

    try {
      await markComplete()
    } catch (error) {
      // Error handled by hook
    }
  }

  // Only show loader if we are trying to view a specific subchapter but it hasn't loaded yet
  if (subchapterId && !enhancedSubchapter) {
    console.log("🔍 SyllabusDetail: Waiting for subchapter...", { subchapterId, enhancedSubchapter, subchapterError });
    if (subchapterError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Failed to load lesson</h2>
            <p className="text-gray-600">{subchapterError}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 hover:underline">Retry</button>
          </div>
        </div>
      )
    }
    return <PageLoader text="Loading lesson... (this may take a while)" />
  }

  console.log("✅ SyllabusDetail: Loaded!", enhancedSubchapter);

  const tabs: TabConfig[] = [
    { id: "pdf", label: "PDF", icon: FileText, color: `hsl(${ELIZA_COLORS.PURPLE})` },
    { id: "lesson", label: "Lesson", icon: BookOpen, color: `hsl(${ELIZA_COLORS.BLUE})` },
    { id: "tutor", label: "AI Tutor", icon: MessageSquare, color: `hsl(${ELIZA_COLORS.YELLOW})` },
    { id: "quiz", label: "Quiz", icon: ClipboardCheck, color: `hsl(${ELIZA_COLORS.RED})`, locked: !canAccessQuiz },
    { id: "blackboard", label: "Blackboard", icon: PenTool, color: `hsl(${ELIZA_COLORS.GREEN})` },
  ]

  if (syllabus?.status === "GENERATING_STRUCTURE") {
    return <PageLoader text="Generating your personalized curriculum... This may take a minute." />
  }

  // Calculate final back URL: use override if provided, otherwise fall back to role-based logic
  const finalBackUrl = backUrlOverride || (user?.role === "TEACHER" || user?.role === "ADMIN"
    ? `/app/teacher/syllabus/${syllabusId}`
    : undefined)

  return (
    <div className="min-h-screen bg-gray-50">
      {enhancedSubchapter && (
        <SyllabusHeader
          courseTitle={syllabus?.name || "Course"}
          lessonTitle={enhancedSubchapter.title}
          subchapter={enhancedSubchapter}
          onComplete={handleSubchapterComplete}
          backUrl={finalBackUrl}
        />
      )}

      {enhancedSubchapter && (
        <SyllabusNavigation
          previousSubchapter={previousSubchapter}
          nextSubchapter={nextSubchapter}
          onNavigate={handleNavigate}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="space-y-8">
          {enhancedSubchapter && (
            <SyllabusTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          <div className="animate-fade-in">
            {activeTab === "pdf" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                <PDFViewerTab
                  pdfUrl={pdfUrl}
                  isSourceLoading={isPdfSourceLoading}
                  currentPage={currentPdfPage}
                  onPageChange={setCurrentPdfPage}
                />
              </div>
            )}

            {activeTab === "lesson" && enhancedSubchapter && (
              <div className="max-w-5xl mx-auto">
                <LessonTab subchapterId={enhancedSubchapter.id} onPageNavigate={handlePageNavigate} />
              </div>
            )}

            {activeTab === "tutor" && enhancedSubchapter && (
              <TutorTab
                title={enhancedSubchapter.title}
                textDescription={enhancedSubchapter.text_description}
                subtitles={enhancedSubchapter.subtitles}
                ragContent={ragContent}
              />
            )}

            {activeTab === "quiz" && enhancedSubchapter && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                <QuizTab
                  subchapterId={enhancedSubchapter.id}
                  canAccessQuiz={canAccessQuiz}
                  onClose={() => handleTabChange("lesson")}
                />
              </div>
            )}

            {activeTab === "blackboard" && enhancedSubchapter && (
              <BlackboardTab
                subchapterId={enhancedSubchapter.id}
                subchapterTitle={enhancedSubchapter.title}
                blackboardData={blackboardData}
                blackboardAnalysis={blackboardAnalysis}
                blackboardVideo={blackboardVideo}
                setBlackboardData={setBlackboardData}
                setBlackboardAnalysis={setBlackboardAnalysis}
                setBlackboardVideo={setBlackboardVideo}
              />
            )}

            {!enhancedSubchapter && syllabus?.status === "READY" && (
              <div className="text-center py-12">
                <p className="text-gray-500 font-brand">Select a lesson to start learning.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
