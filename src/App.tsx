"use client"

import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { PageLoader } from "@/components/ui/page-loader"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import Index from "./pages/Index"
import Auth from "./pages/Auth"
import Onboarding from "./pages/Onboarding"
import Dashboard from "./pages/Dashboard"
import StudentDashboard from "./pages/StudentDashboard"
import LearningPath from "./pages/LearningPath"
import SyllabusDetail from "./pages/SyllabusDetail"
import TeacherDashboard from "./pages/TeacherDashboard"
import TeacherSyllabus from "./pages/TeacherSyllabus"
import Courses from "./pages/Courses"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"
import AdminDashboard from "./pages/AdminDashboard"

import ParentDashboard from "./pages/ParentDashboard"
import TeacherQuiz from "./pages/TeacherQuiz"
import TeacherLessonView from "./pages/TeacherLessonView"
import { ProtectedRoute } from "./components/ProtectedRoute"
const queryClient = new QueryClient()

// Loading fallback component
const LoadingFallback = () => <PageLoader text="Loading..." />

// Auth gate wrapper
const AppRoutes = () => {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingFallback />
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />


        {/* Role-based dispatcher - must be protected to ensure user is loaded */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Dashboard />} />
        </Route>

        {/* Student routes */}
        <Route path="/app/student/dashboard" element={<StudentDashboard />} />
        <Route path="/app/syllabus/:syllabusId" element={<LearningPath />} />
        <Route path="/app/syllabus/:syllabusId/lesson/:subchapterId" element={<SyllabusDetail />} />

        {/* Teacher routes - Allow ADMIN access to all teacher routes */}
        <Route element={<ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]} />}>
          <Route path="/app/teacher/dashboard" element={<TeacherDashboard />} />
          {/* Consolidated view for teacher management */}
          <Route path="/app/teacher/syllabus/:syllabusId/manage" element={<TeacherSyllabus />} />
          <Route path="/app/teacher/syllabus/:syllabusId" element={<TeacherSyllabus />} />
          {/* Teacher-specific lesson view with wizard state preservation */}
          <Route path="/app/teacher/syllabus/:syllabusId/lesson/:subchapterId" element={<TeacherLessonView />} />
          <Route path="/app/teacher/quiz/:syllabusId" element={<TeacherQuiz />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["PARENT"]} />}>
          <Route path="/app/parent/dashboard" element={<ParentDashboard />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/app/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/app/admin/users" element={<AdminDashboard />} />
          <Route path="/app/admin/courses" element={<AdminDashboard />} />
          <Route path="/app/admin/settings" element={<AdminDashboard />} />
        </Route>

        {/* Shared / New routes */}
        <Route path="/app/courses" element={<Courses />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/settings" element={<Settings />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
)

export default App
