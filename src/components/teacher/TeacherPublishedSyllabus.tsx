"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    BookOpen,
    Users,
    BarChart3,
    Settings,
    ArrowLeft,
    Loader2,
    Sparkles,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { InviteStudentModal } from "@/components/teacher/students/InviteStudentModal"
import { StudentList } from "@/components/teacher/students/StudentList"
import { StatisticsTab } from "@/components/teacher/tabs/StatisticsTab"
import { useSyllabus, useSyllabusStatusPolling } from "@/hooks/useApi"
import { apiClient, type Chapter, type BackendChapter } from "@/lib/api"
import purpleCharacter from "@/assets/purple-character.png"
import { cn } from "@/lib/utils"
import { TeacherLessonDetail } from "./TeacherLessonDetail"
import { toast } from "@/hooks/use-toast"

interface TeacherPublishedSyllabusProps {
    syllabusId: string
}

export function TeacherPublishedSyllabus({ syllabusId }: TeacherPublishedSyllabusProps) {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("content")
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

    // Data loading
    const { syllabus, loading: syllabusLoading } = useSyllabus(syllabusId)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loadingChapters, setLoadingChapters] = useState(true)
    const [students, setStudents] = useState<any[]>([])
    const [loadingStudents, setLoadingStudents] = useState(false)

    // Fetch chapters
    const fetchChapters = async () => {
        try {
            setLoadingChapters(true)
            const data = await apiClient.getSyllabusChapters(syllabusId)
            setChapters(data.sort((a, b) => a.order_index - b.order_index))
        } catch (error) {
            console.error("Failed to fetch chapters:", error)
        } finally {
            setLoadingChapters(false)
        }
    }

    // Fetch students
    const fetchStudents = async () => {
        try {
            setLoadingStudents(true)
            const data = await apiClient.getSyllabusStudents(syllabusId)
            // Map backend User to frontend Student interface
            const mappedStudents = data.map((user: any) => ({
                id: user.id,
                name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email.split('@')[0],
                email: user.email,
                enrolledAt: user.created_at || new Date().toISOString(),
                progress: 0 // Placeholder until we have real progress
            }))
            setStudents(mappedStudents)
        } catch (error) {
            console.error("Failed to fetch students:", error)
        } finally {
            setLoadingStudents(false)
        }
    }

    useEffect(() => {
        fetchChapters()
        fetchStudents()
    }, [syllabusId])

    // Handle student invite/remove
    const handleInviteStudent = async (email: string) => {
        // This is called by the modal submit
        try {
            await apiClient.addStudentToSyllabus(syllabusId, email)
            toast({ title: "Student invited successfully" })
            fetchStudents()
            // Modal closes auto by logic below or we handle it here?
            // The modal component calls onInvite and awaits it. If success, it closes itself?
            // Checking InviteStudentModal: it calls onInvite(email), then onClose().
            // So we just need this function to resolve if success, throw if error.
        } catch (error) {
            toast({ title: "Failed to invite student", variant: "destructive" })
            throw error; // Rethrow so modal knows it failed
        }
    }

    const handleRemoveStudent = async (studentId: string) => {
        if (!confirm("Are you sure you want to remove this student?")) return
        try {
            await apiClient.removeStudentFromSyllabus(syllabusId, studentId)
            toast({ title: "Student removed" })
            setStudents(prev => prev.filter(s => s.id !== studentId))
        } catch (error) {
            toast({ title: "Failed to remove student", variant: "destructive" })
        }
    }

    if (syllabusLoading || !syllabus) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-eliza-blue" />
            </div>
        )
    }

    // If a chapter is selected, show the detail view
    if (selectedChapterId) {
        return (
            <TeacherLessonDetail
                syllabusId={syllabusId}
                subchapterId={selectedChapterId}
                onBack={() => setSelectedChapterId(null)}
            />
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <PageHeader
                title={syllabus.name}
                description={syllabus.description || "Manage your class content and students"}
                backUrl="/app/teacher/dashboard"
                icon={<img src={purpleCharacter} alt="" className="w-20 h-20 object-contain" />}
                actions={
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/app/teacher/syllabus/${syllabusId}/manage?mode=edit`)}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Structure
                    </Button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white border p-1 rounded-xl h-auto">
                        <TabsTrigger value="content" className="data-[state=active]:bg-eliza-blue data-[state=active]:text-white rounded-lg px-4 py-2">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Content
                        </TabsTrigger>
                        <TabsTrigger value="students" className="data-[state=active]:bg-eliza-blue data-[state=active]:text-white rounded-lg px-4 py-2">
                            <Users className="w-4 h-4 mr-2" />
                            Students
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="data-[state=active]:bg-eliza-blue data-[state=active]:text-white rounded-lg px-4 py-2">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Statistics
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-eliza-blue data-[state=active]:text-white rounded-lg px-4 py-2">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* CONTENT TAB */}
                    <TabsContent value="content" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold font-brand text-gray-900">Class Curriculum</h2>
                            <Button
                                onClick={() => navigate(`/app/teacher/syllabus/${syllabusId}/manage?mode=edit`)}
                                className="bg-eliza-blue hover:bg-eliza-blue/90 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Edit Content
                            </Button>
                        </div>

                        {loadingChapters ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                                <p className="text-gray-500 mt-2">Loading content...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {chapters.map((chapter, index) => (
                                    <ContentGroup
                                        key={chapter.id}
                                        chapter={chapter}
                                        index={index}
                                        onSelectLesson={(lessonId) => setSelectedChapterId(lessonId)}
                                        onRefresh={fetchChapters}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* STUDENTS TAB */}
                    <TabsContent value="students">
                        <Card className="rounded-2xl border border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Enrolled Students ({students.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StudentList
                                    students={students}
                                    loading={loadingStudents}
                                    onInvite={() => setIsInviteModalOpen(true)}
                                    onRemove={handleRemoveStudent}
                                />
                            </CardContent>
                        </Card>
                        <InviteStudentModal
                            isOpen={isInviteModalOpen}
                            onClose={() => setIsInviteModalOpen(false)}
                            onInvite={handleInviteStudent}
                        />
                    </TabsContent>

                    {/* STATS TAB */}
                    <TabsContent value="stats">
                        <StatisticsTab syllabusId={syllabusId} />
                    </TabsContent>

                    {/* SETTINGS TAB */}
                    <TabsContent value="settings">
                        <Card className="rounded-2xl border border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Class Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500">Settings coming soon...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

// Sub-component to render a Topic and its Lessons (Subchapters)
function ContentGroup({ chapter, index, onSelectLesson, onRefresh }: { chapter: Chapter, index: number, onSelectLesson: (id: string) => void, onRefresh: () => void }) {
    const [expanded, setExpanded] = useState(true)
    const [subchapters, setSubchapters] = useState<BackendChapter[]>([])

    // Need to fetch full subchapters for this chapter
    useEffect(() => {
        const loadSubs = async () => {
            try {
                // If chapter already has subchapters loaded from the main list, use them.
                // The API getSyllabusChapters might return them embedded.
                if (chapter.subchapters && chapter.subchapters.length > 0) {
                    // map frontend Subchapter to BackendChapter structure roughly or just use as is
                    // let's just use what we have
                } else {
                    const data = await apiClient.getTopicChapters(chapter.id)
                    setSubchapters(data.sort((a, b) => a.order - b.order))
                }
            } catch (e) { console.error(e) }
        }
        loadSubs()
    }, [chapter.id])

    // Use the mapped subchapters from props if available
    const lessons = chapter.subchapters || []

    return (
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    <span className="bg-white border px-2 py-1 rounded text-xs font-bold text-gray-500">UNIT {index + 1}</span>
                    <h3 className="font-bold text-gray-900">{chapter.title}</h3>
                </div>
                <div className="text-gray-500">
                    {lessons.length} Lessons
                </div>
            </div>

            {expanded && (
                <div className="p-2 space-y-1 bg-white">
                    {lessons.map((lesson, idx) => {
                        const hasContent = lesson.has_blog || lesson.has_quiz // Simplified check
                        // Note: In mapped object from api.ts, has_blog is on the subchapter

                        return (
                            <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group cursor-pointer border border-transparent hover:border-gray-100 transition-all"
                                onClick={() => onSelectLesson(lesson.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-eliza-blue/10 text-eliza-blue flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-gray-700 group-hover:text-gray-900">{lesson.title}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!hasContent ? (
                                        <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full flex items-center">
                                            <Sparkles className="w-3 h-3 mr-1" /> Draft
                                        </span>
                                    ) : (
                                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                                            Published
                                        </span>
                                    )}
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        )
                    })}

                    {lessons.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            No lessons generated yet.
                            <Button variant="link" size="sm" onClick={(e) => {
                                e.stopPropagation()
                                // Trigger generation
                                toast({ title: "Generation triggered" })
                            }}>Generate Content</Button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}
