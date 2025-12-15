"use client"

import type React from "react"

import { useState } from "react"
import {
  BookOpen,
  Users,
  TrendingUp,
  ClipboardCheck,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CreateSyllabusModal } from "@/components/CreateSyllabusModal"
import { useNavigate } from "react-router-dom"
import { useEnrolledSyllabi } from "@/hooks/useStudentApi"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import purpleCharacter from "@/assets/purple-character.png"
import redCharacter from "@/assets/red-character.png"
import blueCharacter from "@/assets/blue-character.png"
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

import { CreateCourseCard } from "@/components/dashboard/CreateCourseCard"
import { CourseCard } from "@/components/dashboard/CourseCard"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"

export default function TeacherDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [syllabusToDelete, setSyllabusToDelete] = useState<string | null>(null)
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { syllabi, loading, refetch } = useEnrolledSyllabi()

  const handleSyllabusClick = (syllabusId: string) => {
    navigate(`/app/teacher/syllabus/${syllabusId}/manage`)
  }

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

  const handleDuplicate = async (syllabusId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toast({
      title: "Coming soon",
      description: "Course duplication will be available soon",
    })
  }

  // Calculate stats
  const totalCourses = syllabi.length
  const totalStudents = syllabi.reduce((sum, s) => sum + (s.student_count || 0), 0)
  const activeStudents = Math.floor(totalStudents * 0.7) // Mock data
  const pendingReviews = 0 // Mock data

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      type: "enrollment",
      message: "New student enrolled in Mathematics",
      time: "2 hours ago",
      courseId: syllabi[0]?.id,
    },
    { id: 2, type: "quiz", message: "Quiz completed in Physics", time: "5 hours ago", courseId: syllabi[1]?.id },
    { id: 3, type: "badge", message: "Badge awarded in Chemistry", time: "1 day ago", courseId: syllabi[2]?.id },
  ].filter((activity) => activityFilter === "all" || activity.courseId === activityFilter)

  return (
    <div className="flex min-h-screen bg-[#fafafa] relative overflow-hidden font-brand">
      {/* Left Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <DashboardSidebar className="fixed inset-y-0 w-64 z-20" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
        <div className="absolute top-8 right-8 hidden xl:block animate-fade-in pointer-events-none">
          <img src={purpleCharacter || "/placeholder.svg"} alt="" className="w-24 h-24 object-contain opacity-40" />
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || "Teacher"}!
            </h1>
            <p className="text-gray-500 mt-1">Manage your courses and students.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Total Courses */}
            <Card className="border-2 border-eliza-red/40 hover:border-eliza-red bg-white rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-brand text-sm text-gray-500 mb-1">Total Courses</p>
                    <p className="font-brand text-4xl font-bold text-gray-900">{totalCourses}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-eliza-red/10 flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-eliza-red" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Students */}
            <Card
              className="border-2 border-eliza-blue/40 hover:border-eliza-blue bg-white rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-brand text-sm text-gray-500 mb-1">Total Students</p>
                    <p className="font-brand text-4xl font-bold text-gray-900">{totalStudents}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-eliza-blue/10 flex items-center justify-center">
                    <Users className="h-7 w-7 text-eliza-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active This Week */}
            <Card
              className="border-2 border-eliza-green/40 hover:border-eliza-green bg-white rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-brand text-sm text-gray-500 mb-1">Active This Week</p>
                    <p className="font-brand text-4xl font-bold text-gray-900">{activeStudents}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-eliza-green/10 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-eliza-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Reviews */}
            <Card
              className="border-2 border-eliza-orange/40 hover:border-eliza-orange bg-white rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-brand text-sm text-gray-500 mb-1">Pending Reviews</p>
                    <p className="font-brand text-4xl font-bold text-gray-900">{pendingReviews}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-eliza-orange/10 flex items-center justify-center">
                    <ClipboardCheck className="h-7 w-7 text-eliza-orange" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <CreateCourseCard
            title="Create New Course"
            description="Upload materials and build your curriculum"
            characterImage={purpleCharacter}
            onClick={() => setIsCreateModalOpen(true)}
            themeColor="eliza-purple"
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="inline-block animate-spin mb-4">
                <Sparkles className="h-12 w-12 text-eliza-purple" />
              </div>
              <p className="font-brand text-xl text-gray-600">Loading your courses...</p>
            </div>
          ) : syllabi.length === 0 ? (
            <EmptyState
              title="Welcome to ELIZA!"
              description="Get started by creating your first course. Upload PDFs and let AI generate your curriculum structure automatically."
              characterImage={blueCharacter}
            >
              <div className="bg-eliza-yellow/10 border-2 border-eliza-yellow rounded-2xl p-6 max-w-lg mx-auto mt-6">
                <h4 className="font-brand text-lg font-bold text-gray-900 mb-3">Quick Start Guide:</h4>
                <ol className="font-brand text-left text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-eliza-yellow">1.</span>
                    <span>Click "Create New Course" above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-eliza-yellow">2.</span>
                    <span>Upload your course materials (PDFs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-eliza-yellow">3.</span>
                    <span>Generate chapters and content automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-eliza-yellow">4.</span>
                    <span>Customize and publish to students</span>
                  </li>
                </ol>
              </div>
            </EmptyState>
          ) : (
            <>
              {/* My Courses Section */}
              <div className="mb-8 mt-10">
                <h2 className="font-brand text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {syllabi.map((syllabus, index) => (
                    <CourseCard
                      key={syllabus.id}
                      syllabus={syllabus}
                      index={index}
                      isTeacher={true}
                      onClick={handleSyllabusClick}
                      onDelete={handleDeleteClick}
                      onEdit={(id) => navigate(`/app/teacher/syllabus/${id}/manage`)}
                      onDuplicate={handleDuplicate}
                      onAnalytics={() => toast({ title: "Analytics coming soon!" })}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-brand text-2xl font-bold text-gray-900">Recent Activity</h2>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="font-brand border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-eliza-purple bg-white"
                  >
                    <option value="all">All Courses</option>
                    {syllabi.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Card className="border-2 border-gray-200 rounded-3xl bg-white">
                  <CardContent className="p-6">
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-eliza-blue/10 flex items-center justify-center flex-shrink-0">
                              <Users className="h-5 w-5 text-eliza-blue" />
                            </div>
                            <div className="flex-1">
                              <p className="font-brand text-sm text-gray-900">{activity.message}</p>
                              <p className="font-brand text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="font-brand text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Create Syllabus Modal */}
      <CreateSyllabusModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSyllabus={(syllabusId) => navigate(`/app/teacher/syllabus/${syllabusId}/manage`)}
      />

      {/* Delete Confirmation Dialog */}
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
