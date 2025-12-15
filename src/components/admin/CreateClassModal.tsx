"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { apiClient, User } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface CreateClassModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export const CreateClassModal = ({ isOpen, onClose, onSuccess }: CreateClassModalProps) => {
    const [loading, setLoading] = useState(false)
    const [teachers, setTeachers] = useState<User[]>([])
    const [loadingTeachers, setLoadingTeachers] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        teacher_id: "",
    })

    useEffect(() => {
        if (isOpen) {
            fetchTeachers()
        }
    }, [isOpen])

    const fetchTeachers = async () => {
        setLoadingTeachers(true)
        try {
            const users = await apiClient.getUsers()
            // Filter only teachers
            const teacherList = users.filter(u => u.role === "TEACHER")
            setTeachers(teacherList)
        } catch (error) {
            console.error("Failed to fetch teachers", error)
            toast({
                title: "Error",
                description: "Failed to load teachers list",
                variant: "destructive"
            })
        } finally {
            setLoadingTeachers(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!formData.teacher_id) {
            toast({
                title: "Validation Error",
                description: "Please select a teacher for this class.",
                variant: "destructive"
            })
            setLoading(false)
            return
        }

        try {
            await apiClient.createClass({
                title: formData.title,
                description: formData.description,
                teacher_id: formData.teacher_id
            })

            toast({
                title: "Class created successfully",
                description: `Class "${formData.title}" has been created.`
            })
            onSuccess()
            onClose()
            setFormData({ title: "", description: "", teacher_id: "" })
        } catch (error) {
            toast({
                title: "Failed to create class",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <DialogDescription>
                        Create a class and assign it to a teacher.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Class Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Advanced Mathematics"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the class..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="teacher">Assign Teacher</Label>
                        <Select
                            value={formData.teacher_id}
                            onValueChange={(val) => setFormData({ ...formData, teacher_id: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select a teacher"} />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.first_name} {teacher.last_name} ({teacher.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading || loadingTeachers}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Class
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
