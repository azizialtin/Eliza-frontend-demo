"use client"

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardRightPanel } from "@/components/dashboard/DashboardRightPanel"
import { useAuth } from "@/contexts/AuthContext"
import { useEnrolledSyllabi } from "@/hooks/useStudentApi"
import { CourseCard } from "@/components/dashboard/CourseCard"
import { useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { EmptyState } from "@/components/dashboard/EmptyState"
import blueCharacter from "@/assets/blue-character.png"

export default function Courses() {
    const { user } = useAuth()
    const { syllabi, loading } = useEnrolledSyllabi()
    const navigate = useNavigate()
    const isTeacher = user?.role === "TEACHER"

    const handleSyllabusClick = (syllabusId: string) => {
        navigate(`/app/syllabus/${syllabusId}`)
    }

    // We can reuse the same delete/rename handlers as Dashboard, or simplify for now since this is a list view
    const handleDeleteClick = (syllabusId: string, syllabusName: string, e: React.MouseEvent) => {
        e.stopPropagation()
        // For now, simpler implementation or pass proper handlers if needed
    }

    const handleRenameClick = (syllabusId: string, syllabusName: string, e: React.MouseEvent) => {
        e.stopPropagation()
    }


    return (
        <div className="flex min-h-screen bg-gray-50 relative overflow-hidden font-brand">
            <div className="hidden lg:block w-64 flex-shrink-0">
                <DashboardSidebar className="fixed inset-y-0 w-64 z-20" />
            </div>

            <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
                <div className="w-full max-w-4xl mx-auto relative z-10 pb-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="inline-block animate-spin mb-4">
                                <Sparkles className="h-12 w-12 text-eliza-purple" />
                            </div>
                            <p className="font-brand text-xl text-gray-600">Loading your courses...</p>
                        </div>
                    ) : syllabi.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {syllabi.map((syllabus: any, index: number) => (
                                <CourseCard
                                    key={syllabus.id}
                                    syllabus={syllabus}
                                    index={index}
                                    isTeacher={isTeacher}
                                    onClick={handleSyllabusClick}
                                    onDelete={handleDeleteClick}
                                    onRename={handleRenameClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No courses yet"
                            description="Go to Dashboard to start a new learning journey!"
                            characterImage={blueCharacter}
                        />
                    )}
                </div>
            </main>

            <div className="hidden xl:block w-80 flex-shrink-0">
                <DashboardRightPanel className="fixed inset-y-0 right-0 w-80 z-20" isTeacher={isTeacher} />
            </div>
        </div>
    )
}
