"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Save, X, Loader2, Play, RefreshCw, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSyllabus, useSubchapter, useDocuments } from "@/hooks/useApi"
import { apiClient } from "@/lib/api"
import { PDFViewerTab } from "@/components/tabs/PDFViewerTab"
import { LessonTab } from "@/components/tabs/LessonTab"
import { QuizTab } from "@/components/tabs/QuizTab"
import { PageLoader } from "@/components/ui/page-loader"
import { toast } from "@/hooks/use-toast"
import { usePdfResolution } from "@/hooks/usePdfResolution"
import { useContentSections } from "@/hooks/useContentSections"

interface TeacherLessonDetailProps {
    syllabusId: string
    subchapterId: string
    onBack: () => void
}

export function TeacherLessonDetail({ syllabusId, subchapterId, onBack }: TeacherLessonDetailProps) {
    const [activeTab, setActiveTab] = useState("lesson")
    const { subchapter, loading, refetch } = useSubchapter(subchapterId)
    const { data: contentSections } = useContentSections(subchapterId)

    // Resolve PDF
    const { pdfUrl, isPdfSourceLoading, currentPdfPage, setCurrentPdfPage } = usePdfResolution(
        subchapterId,
        syllabusId,
        contentSections
    )

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState("")

    useEffect(() => {
        if (subchapter) {
            setEditTitle(subchapter.title)
        }
    }, [subchapter])

    const handleSaveTitle = async () => {
        try {
            await apiClient.updateSubchapterTitle(subchapterId, editTitle)
            toast({ title: "Title updated" })
            setIsEditing(false)
            refetch()
        } catch (e) {
            toast({ title: "Failed to update title", variant: "destructive" })
        }
    }

    const handleRegenerateBlog = async () => {
        if (!confirm("This will overwrite existing content. Continue?")) return
        try {
            toast({ title: "Regenerating content..." })
            await apiClient.generateChapterBlog(subchapterId)
            toast({ title: "Content regeneration started" })
            // Ideally poll or wait, but fire-and-forget for now
        } catch (e) {
            toast({ title: "Failed to regenerate", variant: "destructive" })
        }
    }

    if (loading || !subchapter) return <PageLoader text="Loading lesson details..." />

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Curriculum
                    </Button>
                    <div className="h-6 w-px bg-gray-200" />

                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="border rounded px-2 py-1 font-bold text-lg"
                                autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={handleSaveTitle}><Save className="w-4 h-4 text-green-600" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><X className="w-4 h-4 text-red-600" /></Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="font-brand text-lg font-bold text-gray-900">{subchapter.title}</h1>
                            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => setIsEditing(true)}>
                                <Edit2 className="w-3 h-3 text-gray-500" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRegenerateBlog}>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Regenerate Content
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white border p-1 rounded-xl h-auto w-auto inline-flex">
                        <TabsTrigger value="lesson" className="rounded-lg px-6">Lesson Content</TabsTrigger>
                        <TabsTrigger value="pdf" className="rounded-lg px-6">PDF Source</TabsTrigger>
                        <TabsTrigger value="quiz" className="rounded-lg px-6">Quiz</TabsTrigger>
                    </TabsList>

                    <TabsContent value="lesson" className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[600px] p-0 overflow-hidden">
                        {/* Re-using LessonTab - we might want to inject "Editable" props later if we update LessonTab */}
                        <div className="p-0">
                            <LessonTab subchapterId={subchapterId} onPageNavigate={(p) => {
                                setCurrentPdfPage(p)
                                setActiveTab("pdf")
                            }} />
                        </div>
                    </TabsContent>

                    <TabsContent value="pdf" className="h-[calc(100vh-200px)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <PDFViewerTab
                            pdfUrl={pdfUrl}
                            isSourceLoading={isPdfSourceLoading}
                            currentPage={currentPdfPage}
                            onPageChange={setCurrentPdfPage}
                        />
                    </TabsContent>

                    <TabsContent value="quiz" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                        <QuizTab subchapterId={subchapterId} canAccessQuiz={true} onClose={() => setActiveTab("lesson")} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
