"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Play, BarChart3, Loader2 } from "lucide-react"

interface Quiz {
    id: string
    title: string
    questionCount: number
    status: "DRAFT" | "PUBLISHED"
    createdAt: string
}

interface QuizListProps {
    quizzes: Quiz[]
    loading?: boolean
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export const QuizList = ({ quizzes, loading, onEdit, onDelete }: QuizListProps) => {
    return (
        <div className="border rounded-xl bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            </TableCell>
                        </TableRow>
                    ) : quizzes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                No quizzes found. Create one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        quizzes.map((quiz) => (
                            <TableRow key={quiz.id}>
                                <TableCell className="font-medium">{quiz.title}</TableCell>
                                <TableCell>{quiz.questionCount}</TableCell>
                                <TableCell>
                                    <Badge variant={quiz.status === "PUBLISHED" ? "default" : "secondary"}>
                                        {quiz.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500 text-xs">{new Date(quiz.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => onEdit(quiz.id)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(quiz.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
