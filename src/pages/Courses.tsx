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
import purpleCharacter from "@/assets/purple-character.png"
import { CreateCourseCard } from "@/components/dashboard/CreateCourseCard"
import { CreateSyllabusModal } from "@/components/CreateSyllabusModal"
import { useState } from "react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"


export default function Courses() {
    const { user } = useAuth()

    const navigate = useNavigate()
    const isTeacher = user?.role === "TEACHER"
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [syllabusToDelete, setSyllabusToDelete] = useState<string | null>(null)
    const { toast } = useToast()
    const { syllabi, loading, refetch } = useEnrolledSyllabi() // Ensure we refetch on delete


    const handleSyllabusClick = (syllabusId: string) => {
        navigate(`/app/syllabus/${syllabusId}`)
    }

    // We can reuse the same delete/rename handlers as Dashboard, or simplify for now since this is a list view
    const handleDeleteClick = (syllabusId: string, _name: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSyllabusToDelete(syllabusId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (syllabusToDelete) {
            try {
                await apiClient.deleteSyllabus(syllabusToDelete)
                toast({ title: "Course deleted successfully" })
                refetch()
            } catch (error) {
                toast({
                    title: "Failed to delete course",
                    variant: "destructive",
                })
            }
        }
        setDeleteDialogOpen(false)
        setSyllabusToDelete(null)
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
                        <div className="space-y-8">
                            {isTeacher && (
                                <CreateCourseCard
                                    title="Create New Course"
                                    description="Upload materials and build your curriculum"
                                    characterImage={purpleCharacter}
                                    onClick={() => setIsCreateModalOpen(true)}
                                    themeColor="eliza-purple"
                                />
                            )}
                            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {syllabi.map((syllabus: any, index: number) => (
                                    <CourseCard
                                        key={syllabus.id}
                                        syllabus={syllabus}
                                        index={index}
                                        isTeacher={isTeacher}
                                        onClick={handleSyllabusClick}
                                        onDelete={handleDeleteClick}
                                        onEdit={(id, e) => {
                                            e.stopPropagation()
                                            navigate(`/app/teacher/syllabus/${id}/manage?mode=edit&step=2`)
                                        }}
                                        onRename={handleRenameClick}
                                    />
                                ))}
                            </div>
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

            {/* Modals */}
            <CreateSyllabusModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateSyllabus={(syllabusId) => navigate(`/app/teacher/syllabus/${syllabusId}/manage`)}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="font-brand">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this course and all its content. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}
