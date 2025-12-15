"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Sparkles, AlertCircle } from "lucide-react"
import { QuizList } from "@/components/teacher/quiz/QuizList"
import { QuizEditor } from "@/components/teacher/quiz/QuizEditor"
import { AIQuizGenerator } from "@/components/teacher/quiz/AIQuizGenerator"
import { useSyllabus } from "@/hooks/useApi"
import { PageLoader } from "@/components/ui/page-loader"
import purpleCharacter from "@/assets/purple-character.png"

export default function TeacherQuiz() {
    const { syllabusId } = useParams()
    const navigate = useNavigate()
    const { syllabus, loading: syllabusLoading } = useSyllabus(syllabusId!)

    const [view, setView] = useState<"list" | "create">("list")
    const [isAIModalOpen, setIsAIModalOpen] = useState(false)
    const [quizzes, setQuizzes] = useState<any[]>([]) // Mock state for now

    const handleManualCreate = () => {
        setView("create")
    }

    const handleSaveQuiz = async (data: any) => {
        console.log("Saving quiz:", data)
        // Here we'd call API to save
        setQuizzes([...quizzes, {
            id: Date.now().toString(),
            title: data.title,
            questionCount: data.questions.length,
            status: "DRAFT",
            createdAt: new Date().toISOString()
        }])
        setView("list")
    }

    const handleAIGenerate = async (prompt: string) => {
        console.log("Generating with prompt:", prompt)
        // Mock API call
        await new Promise(r => setTimeout(r, 2000))
        // Add mock generated quiz
        setQuizzes([...quizzes, {
            id: Date.now().toString(),
            title: "AI Generated Quiz",
            questionCount: 5,
            status: "DRAFT",
            createdAt: new Date().toISOString()
        }])
    }

    if (syllabusLoading) return <PageLoader text="Loading course..." />

    if (!syllabus) return (
        <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold">Course Not Found</h2>
            <Button onClick={() => navigate("/app/teacher/dashboard")} className="mt-4">Go Back</Button>
        </div>
    )

    if (view === "create") {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <QuizEditor
                    onSave={handleSaveQuiz}
                    onCancel={() => setView("list")}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Quiz Management"
                description={`Manage quizzes for ${syllabus.name}`}
                backUrl={`/app/teacher/syllabus/${syllabusId}/manage`}
                icon={<img src={purpleCharacter || "/placeholder.svg"} alt="" className="w-20 h-20 object-contain" />}
            />

            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
                    <div className="flex gap-3">
                        <Button onClick={() => setIsAIModalOpen(true)} className="bg-gradient-to-r from-eliza-purple to-indigo-600 border-0">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate with AI
                        </Button>
                        <Button onClick={handleManualCreate} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Manually
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList>
                                <TabsTrigger value="all">All Quizzes</TabsTrigger>
                                <TabsTrigger value="published">Published</TabsTrigger>
                                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all" className="mt-6">
                                <QuizList
                                    quizzes={quizzes}
                                    onEdit={(id) => console.log("Edit", id)}
                                    onDelete={(id) => setQuizzes(quizzes.filter(q => q.id !== id))}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <AIQuizGenerator
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={handleAIGenerate}
            />
        </div>
    )
}
