"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useSyllabus } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  BookOpen,
  Settings,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  GripVertical,
  Save,
  X,
  RotateCcw,
  Plus,
  Users,
  BarChart3,
  List,
  MoreVertical,
  AlertTriangle,
  AlertCircle
} from "lucide-react"
import purpleCharacter from "@/assets/purple-character.png"
import { PDFViewerTab } from "@/components/tabs/PDFViewerTab"
import { SectionManagement } from "@/components/teacher/SectionManagement"
import { ChapterEditModal } from "@/components/teacher/ChapterEditModal"
import { PageLoader } from "@/components/ui/page-loader"
import { PageHeader } from "@/components/ui/page-header"
import { ELIZA_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSyllabusManagement } from "@/hooks/useSyllabusManagement"
import { StudentList } from "@/components/teacher/students/StudentList"
import { InviteStudentModal } from "@/components/teacher/students/InviteStudentModal"
import { StatisticsTab } from "@/components/teacher/tabs/StatisticsTab"
import { apiClient } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { ContentAssistantChat } from "@/components/teacher/chat/ContentAssistantChat"
import { SyllabusSteps } from "@/components/teacher/SyllabusSteps"
import { TopicReview } from "@/components/teacher/TopicReview"
import { TeacherPublishedSyllabus } from "@/components/teacher/TeacherPublishedSyllabus"

export default function TeacherSyllabusManagement() {
  const { syllabusId } = useParams()
  const navigate = useNavigate()

  const { syllabus, loading: syllabusLoading, refetch: refetchSyllabus } = useSyllabus(syllabusId!)

  // Student Management State
  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const handleUpdateTopic = async (id: string, title: string, description?: string, is_published?: boolean) => {
    await updateTopicDetails(id, title, description, is_published)
  }

  // Derived state
  const [showChat, setShowChat] = React.useState(false)

  // Fetch students effect
  useEffect(() => {
    if (syllabusId) {
      setLoadingStudents(true)
      apiClient.getSyllabusStudents(syllabusId)
        .then(data => setStudents(data))
        .catch(err => console.error(err))
        .finally(() => setLoadingStudents(false))
    }
  }, [syllabusId])

  const handleInviteStudent = async (email: string) => {
    try {
      await apiClient.addStudentToSyllabus(syllabusId!, email)
      toast({ title: "Student invited successfully" })
      const updated = await apiClient.getSyllabusStudents(syllabusId!)
      setStudents(updated)
    } catch (error) {
      toast({ title: "Failed to invite student", variant: "destructive" })
    }
  }

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Remove this student?")) return
    try {
      await apiClient.removeStudentFromSyllabus(syllabusId!, studentId)
      toast({ title: "Student removed" })
      setStudents(students.filter(s => s.id !== studentId))
    } catch (error) {
      toast({ title: "Failed to remove student", variant: "destructive" })
    }
  }

  const {
    chapters,
    loadingChapters,
    expandedChapters,
    editingChapterId,
    editingSubchapterId,
    editingTitle,
    showChapterModal,
    draggedItem,
    hasUnsavedChanges,
    managingSectionsFor,
    uploadingFiles,
    uploadProgress,
    isGenerating,
    documents,
    documentsLoading,
    setEditingChapterId,
    setEditingSubchapterId,
    setEditingTitle,
    setShowChapterModal,
    setManagingSectionsFor,
    handleFileSelect,
    handleGenerateChapters,
    startEditingChapter,
    startEditingSubchapter,
    handleSaveChapterOrSubchapter,
    saveChapterTitle,
    saveSubchapterTitle,
    deleteChapter,
    deleteSubchapter,
    handleDragStart,
    handleDragOver,
    handleDropChapter,
    handleDropSubchapter,
    saveReordering,
    resetChanges,
    toggleChapter,
    generatingTopicId,
    localFileUrl,
    refetchChapters,
    updateTopicDetails,
    handleProcessPdf,
  } = useSyllabusManagement(syllabusId)

  // Filter out placeholder documents
  console.log("📄 Raw documents from hook:", documents);
  const realDocuments = documents?.filter(d => d.gcs_path !== "placeholder" && d.status !== "placeholder" as any) || []
  console.log("✅ Filtered realDocuments:", realDocuments);
  const hasDocuments = realDocuments.length > 0 || !!localFileUrl
  const hasChapters = chapters.length > 0 // This means we have TOPICS extracted
  // "Generated Content" means we have subchapters/lessons created from topics
  const hasGeneratedContent = chapters.some(ch => ch.subchapters && ch.subchapters.length > 0 && (ch.subchapters.length > 1 || ch.subchapters[0].id !== ch.id));


  // Determine current workflow step
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStepState] = useState(1);
  const isEditMode = searchParams.get("mode") === "edit";
  const isAdminMode = searchParams.get("asAdmin") === "true";

  // Initialize step from URL or Syllabus data
  useEffect(() => {
    if (syllabus?.current_step) {
      // Use syllabus step but respect URL overrides if we want better deep linking later
      setCurrentStepState(syllabus.current_step);
    }
  }, [syllabus]);


  // Wrapper to sync URL and Backend
  const setCurrentStep = (step: number) => {
    setCurrentStepState(step);
    setSearchParams(prev => {
      prev.set("step", step.toString());
      return prev;
    }, { replace: true });

    // Also save to backend immediately for persistence
    if (syllabusId) {
      apiClient.updateSyllabus(syllabusId, { current_step: step }).catch(err => console.error("Failed to save step:", err));
    }
  };

  // Auto-advance logic
  useEffect(() => {
    if (currentStep === 1 && hasGeneratedContent && !isGenerating && !loadingChapters) {
      console.log("🚀 Generation finished! Auto-advancing to Review Structure (Step 2)");
      setCurrentStep(2);
    }
  }, [currentStep, hasGeneratedContent, isGenerating, loadingChapters]);

  // Auto-trigger Chapter Generation
  useEffect(() => {
    if (hasChapters && !hasGeneratedContent && !isGenerating && !generatingTopicId) {
      console.log("⚡️ Auto-triggering Chapter Generation...");
      handleGenerateChapters(async () => { await refetchSyllabus(); });
    }
  }, [hasChapters, hasGeneratedContent, isGenerating, generatingTopicId, handleGenerateChapters, refetchSyllabus]);


  // Polling for topics
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (!isMounted) return;

      if (hasDocuments && !hasChapters) {
        try {
          if (refetchChapters) {
            await refetchChapters();
          }

          if (syllabusId && isMounted) {
            const docs = await apiClient.getSyllabusDocuments(syllabusId);
            const failedDoc = docs.find(d => d.status === 'failed' || d.processing_error);
            if (failedDoc && isMounted) {
              console.error("❌ Document processing failed:", failedDoc);
              toast({
                title: "Processing Failed",
                description: failedDoc.processing_error || "Failed to process PDF",
                variant: "destructive"
              });
              return;
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }

        if (isMounted) {
          timeoutId = setTimeout(poll, 3000);
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [hasDocuments, hasChapters, refetchChapters, syllabusId]);


  // State for generation loading tracking
  const [generatingSubchapterIds, setGeneratingSubchapterIds] = useState<Set<string>>(new Set());

  // Handler for manual step clicks
  const handleStepClick = async (step: number) => {
    let canMove = false;
    if (step === 1) canMove = true;
    if (step === 2 && (hasDocuments || hasChapters)) canMove = true;
    if (step === 3 && hasGeneratedContent) canMove = true;
    if (step === 4 && hasGeneratedContent) canMove = true;
    if (step === 5 && hasGeneratedContent) canMove = true;

    if (canMove) {
      setCurrentStep(step);
      if (syllabusId) {
        apiClient.updateSyllabus(syllabusId, { current_step: step }).catch(err => console.error("Failed to save step:", err));
      }
    }
  };

  // Handler for Blog Generation
  const handleGenerateBlogWithState = async (subchapterId: string) => {
    if (generatingSubchapterIds.has(`blog-${subchapterId}`)) return;

    setGeneratingSubchapterIds(prev => new Set(prev).add(`blog-${subchapterId}`));
    try {
      toast({ title: "Generating blog...", description: "This may take a few moments." });
      await apiClient.generateChapterBlog(subchapterId);
      await refetchChapters();
      toast({ title: "Blog generated successfully!" });
    } catch (e) {
      toast({ title: "Failed to generate blog", variant: "destructive" });
    } finally {
      setGeneratingSubchapterIds(prev => {
        const next = new Set(prev);
        next.delete(`blog-${subchapterId}`);
        return next;
      });
    }
  };

  // Handler for Quiz Generation
  const handleGenerateQuizWithState = async (subchapterId: string) => {
    if (generatingSubchapterIds.has(`quiz-${subchapterId}`)) return;

    setGeneratingSubchapterIds(prev => new Set(prev).add(`quiz-${subchapterId}`));
    try {
      toast({ title: "Generating quiz...", description: "This may take a few moments." });
      await apiClient.generateQuiz(subchapterId);
      await refetchChapters();
      toast({ title: "Quiz generated successfully!" });
    } catch (e) {
      toast({ title: "Failed to generate quiz", variant: "destructive" });
    } finally {
      setGeneratingSubchapterIds(prev => {
        const next = new Set(prev);
        next.delete(`quiz-${subchapterId}`);
        return next;
      });
    }
  };

  if (syllabusLoading && !syllabus) {
    return <PageLoader text="Loading syllabus..." />
  }

  if (!syllabus) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Syllabus not found</p>
          <Button onClick={() => navigate(isAdminMode ? "/app/admin/dashboard" : "/app/teacher/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  // If the class is published, switch to the Published View (Manager) unless in edit mode
  if (syllabus.is_published && !isEditMode) {
    return <TeacherPublishedSyllabus syllabusId={syllabusId!} />
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PageHeader
        title={syllabus?.name || "Untitled Course"}
        description={syllabus?.description || "No description"}
        backUrl={isAdminMode ? "/app/admin/dashboard" : "/app/teacher/dashboard"}
        icon={<img src={purpleCharacter || "/placeholder.svg"} alt="" className="w-20 h-20 object-contain" />}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Workflow Stepper */}
        <SyllabusSteps
          currentStep={currentStep}
          onStepClick={handleStepClick}
          maxCompletedStep={hasGeneratedContent ? 3 : hasChapters ? 2 : hasDocuments ? 1 : 0}
        />

        {/* STEP 1, 2, 3: CONTENT CREATION FLOW */}
        {currentStep <= 3 && (
          <div className="space-y-6 focus-visible:ring-0">

            {/* STEP 1: UPLOAD */}
            {currentStep === 1 && (
              <div className={cn(
                "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300",
                hasDocuments ? "h-[80vh] flex flex-col" : "p-8 md:p-16 border-dashed"
              )}>

                {!hasDocuments ? (
                  // DEFAULT STATE: Upload Box
                  <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-eliza-blue/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-eliza-blue" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Course Materials</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                      Upload your syllabus or textbook (PDF). We'll automatically extract topics and structure your course.
                    </p>

                    <div className="max-w-md mx-auto relative px-4">
                      <Button onClick={() => document.getElementById('pdf-upload-step1')?.click()} className="w-full bg-eliza-blue hover:bg-eliza-blue/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-eliza-blue/20 transition-transform hover:-translate-y-1">
                        {uploadingFiles.length > 0 ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-5 h-5 mr-2" /> Select PDF File</>
                        )}
                      </Button>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="pdf-upload-step1"
                        disabled={uploadingFiles.length > 0}
                      />
                    </div>

                    {uploadingFiles.length > 0 && (
                      <div className="max-w-md mx-auto mt-6">
                        {uploadingFiles.map((file) => (
                          <div key={file.name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">{file.name}</span>
                              <span className="text-eliza-blue font-bold">{uploadProgress[file.name] || 0}%</span>
                            </div>
                            <Progress value={uploadProgress[file.name] || 0} className="h-2" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // PROCESSING STATE: PDF Viewer + Generating Status
                  <div className="relative flex-1 flex flex-col h-full animate-fade-in">
                    {/* Status Header */}
                    <div className="bg-eliza-blue/5 border-b border-eliza-blue/10 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {realDocuments[0]?.status === 'failed' ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-sm font-medium text-red-600">
                              Processing Failed
                            </span>
                          </>
                        ) : (realDocuments[0]?.status === 'completed' || realDocuments[0]?.processing_status === 'DONE') && !hasChapters ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">
                              Analysis Complete (No Topics Found)
                            </span>
                          </>
                        ) : (realDocuments[0]?.processing_status === 'PENDING' || !realDocuments[0]?.processing_status) ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-sm font-medium text-blue-600">
                              Document Uploaded - Ready to Analyze
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 rounded-full bg-eliza-blue animate-pulse" />
                            <span className="text-sm font-medium text-eliza-blue">
                              Processing Document, Topics & Chapters...
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(realDocuments[0]?.processing_status === 'PENDING' || !realDocuments[0]?.processing_status) && (
                          <Button
                            onClick={handleProcessPdf}
                            className="bg-eliza-blue text-white hover:bg-eliza-blue/90"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Topics
                          </Button>
                        )}

                        <Button
                          onClick={() => setCurrentStep(2)}
                          disabled={!hasChapters || isGenerating || realDocuments[0]?.processing_status === 'IN_PROGRESS'}
                          className={cn(
                            "ml-4",
                            (hasChapters && !isGenerating && realDocuments[0]?.processing_status !== 'IN_PROGRESS') ? "bg-eliza-blue text-white hover:bg-eliza-blue/90" : "bg-gray-100 text-gray-400"
                          )}
                        >
                          {isGenerating ? "Generating..." : "Next: Review Structure"} <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* PDF Viewer */}
                    <div className="flex-1 overflow-hidden relative">
                      {/* Overlay to emphasize processing if desired, or just show viewer */}
                      <PDFViewerTab
                        pdfUrl={localFileUrl || realDocuments[0]?.signed_url || ""}
                        isSourceLoading={(!localFileUrl && realDocuments.length > 0 && !realDocuments[0]?.signed_url && realDocuments[0]?.status !== 'failed')}
                        className="h-full border-none"
                      />

                      {/* Floating processing card */}
                      {(realDocuments[0]?.status !== 'failed' && !(realDocuments[0]?.status === 'completed' && !hasChapters)) && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 flex items-center gap-4 z-10 max-w-sm w-full mx-4">
                          <div className="h-10 w-10 rounded-full bg-eliza-purple/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-eliza-purple animate-pulse" />
                          </div>
                          <div className="flex-1">
                            {isGenerating ? (
                              <>
                                <h4 className="text-sm font-bold text-gray-900">Generating Structure</h4>
                                <p className="text-xs text-gray-500">Creating topics and chapters...</p>
                              </>
                            ) : (
                              <>
                                <h4 className="text-sm font-bold text-gray-900">Analyzing Content</h4>
                                <p className="text-xs text-gray-500">Extracting topics from your PDF...</p>
                              </>
                            )}
                            <Progress value={45} className="h-1 mt-2 w-full bg-gray-100" />
                          </div>
                        </div>
                      )}

                      {/* Retry/Fail State Overlay */}
                      {(realDocuments[0]?.status === 'completed') && !hasChapters && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 flex items-center gap-4 z-10 max-w-sm w-full mx-4">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">No Topics Found</h4>
                            <p className="text-xs text-gray-500">We couldn't extract topics automatically.</p>
                            <Button size="sm" variant="link" onClick={() => setShowChapterModal({ mode: "create", type: "chapter" })} className="p-0 h-auto text-xs text-eliza-blue">
                              Manually add chapters
                            </Button>
                          </div>
                        </div>
                      )}


                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: REVIEW TOPICS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-brand text-gray-900">Review Structure</h2>
                    <p className="text-gray-500">We extracted {chapters.length} topic{chapters.length !== 1 ? 's' : ''} and generated lessons. Review them below.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back to Upload
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={isGenerating}
                      className="bg-eliza-purple text-white hover:bg-eliza-purple/90"
                    >
                      Next: Generate Content <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <TopicReview
                  topics={chapters}
                  onUpdateTopic={updateTopicDetails}
                  onDeleteTopic={deleteChapter}
                  onUpdateSubchapter={async (id, title) => {
                    try {
                      await apiClient.updateSubchapterTitle(id, title);
                      await refetchChapters();
                      toast({ title: "Lesson updated" });
                    } catch (e) {
                      toast({ title: "Failed to update lesson", variant: "destructive" });
                    }
                  }}
                  onDeleteSubchapter={deleteSubchapter}
                />
              </div>
            )}

            {/* STEP 3: GENERATE CONTENT */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-brand text-gray-900">Generate Content</h2>
                    <p className="text-gray-500">Generate blogs and quizzes for your lessons.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-eliza-blue text-white hover:bg-eliza-blue/90"
                    >
                      Next: Add Students <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <TopicReview
                  topics={chapters}
                  mode="generate"
                  onUpdateTopic={updateTopicDetails}
                  onDeleteTopic={deleteChapter}
                  onUpdateSubchapter={async (id, title) => {
                    await apiClient.updateSubchapterTitle(id, title);
                    await refetchChapters();
                  }}
                  onDeleteSubchapter={deleteSubchapter}
                  onGenerateBlog={handleGenerateBlogWithState}
                  onGenerateQuiz={handleGenerateQuizWithState}
                  onOpenBlog={(subId) => navigate(`/app/teacher/syllabus/${syllabusId}/lesson/${subId}?returnTo=wizard&step=${currentStep}`)}
                  onOpenQuiz={(subId) => navigate(`/app/teacher/syllabus/${syllabusId}/lesson/${subId}?tab=quiz&returnTo=wizard&step=${currentStep}`)}
                  generatingSubchapterIds={generatingSubchapterIds}
                />
              </div>
            )}

          </div>
        )}

        {/* STEP 4: STUDENTS */}
        {currentStep === 4 && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-brand text-gray-900">Add Students</h2>
                <p className="text-gray-500">Invite students to join this class.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back to Content
                </Button>
                <Button
                  onClick={() => setCurrentStep(5)}
                  className="bg-eliza-blue text-white hover:bg-eliza-blue/90"
                >
                  Next: Publish <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl border-2 shadow-md border-eliza-blue">
              <CardHeader className="bg-eliza-blue/5 border-b border-gray-100 flex flex-row items-center justify-between p-6">
                <div>
                  <CardTitle className="font-brand text-2xl text-eliza-blue">Enrolled Students</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Manage student access to this course.</p>
                </div>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-eliza-blue hover:bg-eliza-blue/90 text-white rounded-xl shadow-lg shadow-eliza-blue/20"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Invite Students
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <StudentList
                  students={students}
                  loading={loadingStudents}
                  onRemove={handleRemoveStudent}
                  onInvite={() => setShowInviteModal(true)}
                  hideInviteButton={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 5: PUBLISH */}
        {currentStep === 5 && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-eliza-green/10 text-eliza-green flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold font-brand text-gray-900 mb-4">Ready to Publish?</h2>
              <p className="text-gray-500 text-lg mb-8">
                Your class <strong>{syllabus?.name}</strong> is ready. Once published, students will be able to access the course materials you've unlocked.
              </p>

              <div className="mb-8 text-left max-w-2xl mx-auto">
                <h3 className="text-lg font-bold font-brand text-gray-900 mb-4">Select Topics to Publish</h3>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3 max-h-96 overflow-y-auto">
                  {chapters.map((chapter) => {
                    // Check if topic/chapter has generated content (subchapters with blog or quiz)
                    // Note: 'chapter' in state is the Topic. 'subchapters' are the Lessons (Backend Chapters).
                    const hasContent = chapter.subchapters && chapter.subchapters.length > 0 && chapter.subchapters.some(sub => sub.has_blog || sub.has_quiz);
                    // Also check if fallback "Topic as Subchapter" has content? Likely handled by backend map.

                    return (
                      <div key={chapter.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w - 2 h - 2 rounded - full ${chapter.is_published ? 'bg-green-500' : 'bg-gray-300'} `} />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{chapter.title}</p>
                            {!hasContent && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No content generated</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={chapter.is_published || false}
                            disabled={!hasContent}
                            onCheckedChange={(checked) => handleUpdateTopic(chapter.id, chapter.title, chapter.description, checked)}
                          />
                          <span className={`text - xs ${chapter.is_published ? 'text-green-600 font-bold' : 'text-gray-400'} `}>
                            {chapter.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {chapters.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">No topics available.</div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="lg" onClick={() => setCurrentStep(4)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  className="bg-eliza-green hover:bg-eliza-green/90 text-white font-bold px-8 shadow-xl shadow-eliza-green/20"
                  onClick={() => {
                    toast({ title: "Class Published!", description: "Your class is now live." });
                    navigate("/app/teacher/dashboard");
                  }}>
                  Finish & Publish
                </Button>
              </div>
            </div>
          </div>
        )}

        <InviteStudentModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteStudent}
        />

        {/* Content Assistant Chat FAB & Component */}
      </div >

      <div className="fixed bottom-6 right-6 z-40">
        {!showChat && (
          <Button
            onClick={() => setShowChat(true)}
            className="rounded-full w-14 h-14 shadow-xl bg-eliza-purple hover:bg-eliza-purple/90 text-white p-0 flex items-center justify-center transition-transform hover:scale-110"
          >
            <Sparkles className="w-7 h-7" />
          </Button>
        )}
      </div>

      <ContentAssistantChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        context={syllabus ? `Course: ${syllabus.name} ` : undefined}
      />

      {showChapterModal && (
        <ChapterEditModal
          type={showChapterModal.type}
          mode={showChapterModal.mode}
          currentTitle={showChapterModal.title}
          currentDescription={showChapterModal.description}
          onClose={() => setShowChapterModal(null)}
          onSave={handleSaveChapterOrSubchapter}
        />
      )}
    </div >
  )
}
