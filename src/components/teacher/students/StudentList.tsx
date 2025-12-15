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
import { UserPlus, Trash2, Loader2, Mail } from "lucide-react"

interface Student {
    id: string
    name: string
    email: string
    enrolledAt: string
    progress: number
}

interface StudentListProps {
    students: Student[]
    loading: boolean
    onInvite: () => void
    onRemove: (studentId: string) => void
    hideInviteButton?: boolean
}

export const StudentList = ({ students, loading, onInvite, onRemove, hideInviteButton }: StudentListProps) => {
    return (
        <div className="space-y-4">
            {!hideInviteButton && (
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Enrolled Students ({students.length})</h3>
                    <Button onClick={onInvite} className="bg-eliza-blue hover:bg-eliza-blue/90">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Student
                    </Button>
                </div>
            )}

            <div className="border rounded-xl bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Enrolled</TableHead>
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
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <Mail className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No students enrolled yet.</p>
                                        <p className="text-sm">Invite students to join this course.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.progress}%</TableCell>
                                    <TableCell className="text-gray-500 text-xs">
                                        {new Date(student.enrolledAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => onRemove(student.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
