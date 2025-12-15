"use client"

import { useState, useEffect } from "react"
import { Plus, LogOut, Sparkles, BookOpen, Users, Clock, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CreateSyllabusModal } from "@/components/CreateSyllabusModal"
import { LearningJourneyModal } from "@/components/LearningJourneyModal"
import { PublicSyllabiModal } from "@/components/PublicSyllabiModal"
import { useNavigate } from "react-router-dom"
import { useEnrolledSyllabi } from "@/hooks/useStudentApi"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { ContactMessagesPanel } from "@/components/ContactMessagesPanel"
import { AchievementsCard } from "@/components/student/AchievementsCard"
import { apiClient } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import redCharacter from "@/assets/red-character.png"
import blueCharacter from "@/assets/blue-character.png"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { CreateCourseCard } from "@/components/dashboard/CreateCourseCard"
import { CourseCard } from "@/components/dashboard/CourseCard"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardRightPanel } from "@/components/dashboard/DashboardRightPanel"

export default function StudentDashboard() {
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [syllabusToDelete, setSyllabusToDelete] = useState<{ id: string; name: string } | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [syllabusToRename, setSyllabusToRename] = useState<{ id: string; name: string } | null>(null)
  const [newName, setNewName] = useState("")
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
  const { toast } = useToast()

  const studentResult = useEnrolledSyllabi()
  const syllabi = studentResult.syllabi
  const loading = studentResult.loading

  const handleStartJourney = () => {
    setIsJourneyModalOpen(true)
  }

  const handleSyllabusClick = (syllabusId: string) => {
    navigate(`/app/syllabus/${syllabusId}`)
  }

  const handleDeleteClick = (syllabusId: string, syllabusName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSyllabusToDelete({ id: syllabusId, name: syllabusName })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (syllabusToDelete) {
      try {
        await apiClient.deleteSyllabus(syllabusToDelete.id)
        toast({
          title: "Course removed successfully",
          description: "The course has been removed from your dashboard."
        })
        window.location.reload()
      } catch (error) {
        toast({
          title: "Failed to remove course",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      }
    }
    setDeleteDialogOpen(false)
    setSyllabusToDelete(null)
  }

  const handleRenameClick = (syllabusId: string, syllabusName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSyllabusToRename({ id: syllabusId, name: syllabusName })
    setNewName(syllabusName)
    setRenameDialogOpen(true)
  }

  const handleConfirmRename = async () => {
    if (syllabusToRename && newName.trim()) {
      try {
        await apiClient.updateSyllabus(syllabusToRename.id, { name: newName })
        toast({
          title: "Course renamed successfully",
          description: "The course name has been updated."
        })
        window.location.reload()
      } catch (error) {
        toast({
          title: "Failed to rename course",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      }
    }
    setRenameDialogOpen(false)
    setSyllabusToRename(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative overflow-hidden font-brand">
      {/* Left Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <DashboardSidebar className="fixed inset-y-0 w-64 z-20" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
        {/* Decorative characters - Main area only */}
        <div className="absolute top-8 right-8 hidden xl:block animate-fade-in pointer-events-none">
          <img src={redCharacter || "/placeholder.svg"} alt="" className="w-24 h-24 object-contain opacity-40" />
        </div>

        <div className="w-full max-w-4xl mx-auto relative z-10 pb-20">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || "Student"}!
            </h1>
            <p className="text-gray-500 mt-1">Ready to learn something new today?</p>
          </div>

          <CreateCourseCard
            title="Start a New Learning Journey"
            description="Create your own or browse public courses"
            characterImage={redCharacter}
            onClick={handleStartJourney}
            themeColor="eliza-red"
          />

          {/* Syllabi Grid */}
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">My Courses</h2>
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
                  isTeacher={false}
                  onClick={handleSyllabusClick}
                  onDelete={handleDeleteClick}
                  onRename={handleRenameClick}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No courses yet"
              description="Click the card above to create your first learning adventure and start your journey!"
              characterImage={blueCharacter}
            />
          )}

        </div>
      </main>

      {/* Right Stats Panel */}
      <div className="hidden xl:block w-80 flex-shrink-0">
        <DashboardRightPanel className="fixed inset-y-0 right-0 w-80 z-20" isTeacher={false} />
      </div>

      <LearningJourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        onCreateOwn={() => setIsCreateModalOpen(true)}
        onBrowsePublic={() => setIsPublicModalOpen(true)}
      />

      <CreateSyllabusModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSyllabus={(syllabusId) => navigate(`/app/syllabus/${syllabusId}`)}
      />

      <PublicSyllabiModal
        isOpen={isPublicModalOpen}
        onClose={() => setIsPublicModalOpen(false)}
        onEnroll={(syllabusId) => navigate(`/app/syllabus/${syllabusId}`)}
      />

      {/* Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="font-brand">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this course?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{syllabusToDelete?.name}" from your dashboard?
              This will unenroll you from the course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px] font-brand">
          <DialogHeader>
            <DialogTitle>Rename Course</DialogTitle>
            <DialogDescription>
              Enter a new name for your course.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Course Name"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmRename} disabled={!newName.trim() || newName === syllabusToRename?.name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
