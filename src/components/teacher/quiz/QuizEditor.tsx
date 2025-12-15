"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"

interface Question {
    id: string
    text: string
    type: "multiple_choice" | "true_false"
    options: string[]
    correctAnswer: string // index or value
}

interface QuizEditorProps {
    initialData?: { title: string; questions: Question[] }
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export const QuizEditor = ({ initialData, onSave, onCancel }: QuizEditorProps) => {
    const [title, setTitle] = useState(initialData?.title || "")
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions || [])
    const [saving, setSaving] = useState(false)

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Math.random().toString(36).substr(2, 9),
                text: "",
                type: "multiple_choice",
                options: ["", "", "", ""],
                correctAnswer: "0"
            }
        ])
    }

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        setQuestions(newQuestions)
    }

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions]
        const newOptions = [...newQuestions[qIndex].options]
        newOptions[oIndex] = value
        newQuestions[qIndex].options = newOptions
        setQuestions(newQuestions)
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await onSave({ title, questions })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {initialData ? "Edit Quiz" : "Create New Quiz"}
                </h2>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Introduction to Physics"
                    />
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, qIndex) => (
                    <Card key={q.id}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-base font-medium">Question {qIndex + 1}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Textarea
                                    placeholder="Enter your question here..."
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex gap-2 items-center">
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 cursor-pointer ${q.correctAnswer === oIndex.toString() ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200'}`}
                                            onClick={() => updateQuestion(qIndex, "correctAnswer", oIndex.toString())}
                                        >
                                            {String.fromCharCode(65 + oIndex)}
                                        </div>
                                        <Input
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            placeholder={`Option ${oIndex + 1}`}
                                            className={q.correctAnswer === oIndex.toString() ? 'border-green-500 ring-1 ring-green-100' : ''}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button onClick={addQuestion} variant="outline" className="w-full py-8 border-dashed">
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
            </div>

            <div className="sticky bottom-4 flex justify-end gap-4 bg-white p-4 border rounded-xl shadow-lg">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-eliza-purple hover:bg-eliza-purple/90">
                    <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Quiz"}
                </Button>
            </div>
        </div>
    )
}
