"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { SubchapterDocument, LinkDocumentRequest } from "@/types/content-sections"

// Hook for managing students in a syllabus
export function useSyllabusStudents(syllabusId: string | null) {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchStudents = useCallback(async () => {
    if (!syllabusId) return

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getSyllabusStudents(syllabusId)
      setStudents(data)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [syllabusId, toast])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const addStudent = async (studentEmail: string) => {
    if (!syllabusId) return

    try {
      const result = await apiClient.addStudentToSyllabus(syllabusId, studentEmail)
      toast({
        title: "Success!",
        description: `Added student to course`,
      })
      await fetchStudents()
      return result
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add student",
        variant: "destructive",
      })
      throw err
    }
  }

  const removeStudent = async (studentId: string) => {
    if (!syllabusId) return

    try {
      await apiClient.removeStudentFromSyllabus(syllabusId, studentId)
      toast({
        title: "Success",
        description: "Student removed from course",
      })
      await fetchStudents()
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to remove student",
        variant: "destructive",
      })
      throw err
    }
  }

  return { students, loading, error, refetch: fetchStudents, addStudent, removeStudent }
}

// Hook for content management
export function useContentManagement() {
  const { toast } = useToast()

  // These are replaced by batch reorder methods in TeacherSyllabusManagement

  const updateChapterTitle = async (chapterId: string, title: string) => {
    try {
      await apiClient.updateChapterTitle(chapterId, title)
      toast({
        title: "Success",
        description: "Chapter title updated",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateSubchapterTitle = async (subchapterId: string, title: string) => {
    try {
      await apiClient.updateSubchapterTitle(subchapterId, title)
      toast({
        title: "Success",
        description: "Lesson title updated",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteChapter = async (chapterId: string) => {
    try {
      await apiClient.deleteChapter(chapterId)
      toast({
        title: "Success",
        description: "Chapter deleted",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteSubchapter = async (subchapterId: string) => {
    try {
      await apiClient.deleteSubchapter(subchapterId)
      toast({
        title: "Success",
        description: "Lesson deleted",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      })
      throw err
    }
  }

  const createChapter = async (syllabusId: string, title: string, orderIndex?: number) => {
    try {
      const newChapter = await apiClient.createChapter(syllabusId, { title, order_index: orderIndex })
      toast({
        title: "Success",
        description: "Chapter created",
      })
      return newChapter
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to create chapter",
        variant: "destructive",
      })
      throw err
    }
  }

  const createSubchapter = async (
    chapterId: string,
    title: string,
    options?: {
      text_description?: string
      order_index?: number
      auto_generate_sections?: boolean
      max_sections?: number
    },
  ) => {
    try {
      const newSubchapter = await apiClient.createSubchapter(chapterId, { title, ...options })
      toast({
        title: "Success",
        description: "Subchapter created",
      })
      return newSubchapter
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to create subchapter",
        variant: "destructive",
      })
      throw err
    }
  }

  return {
    updateChapterTitle,
    updateSubchapterTitle,
    deleteChapter,
    deleteSubchapter,
    createChapter,
    createSubchapter,
  }
}

// Hook for managing subchapter documents
export function useSubchapterDocuments(subchapterId: string | null) {
  const [documents, setDocuments] = useState<SubchapterDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    if (!subchapterId) return

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getSubchapterDocuments(subchapterId)
      setDocuments(data)
    } catch (err: any) {
      setError(err.message)
      console.error("[v0] Failed to fetch subchapter documents:", err)
    } finally {
      setLoading(false)
    }
  }, [subchapterId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const linkDocument = async (request: LinkDocumentRequest) => {
    if (!subchapterId) return

    try {
      const result = await apiClient.linkDocumentToSubchapter(subchapterId, request)
      toast({
        title: "Success",
        description: "Document linked to lesson",
      })
      await fetchDocuments()
      return result
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to link document",
        variant: "destructive",
      })
      throw err
    }
  }

  const unlinkDocument = async (documentId: string) => {
    if (!subchapterId) return

    try {
      await apiClient.unlinkDocumentFromSubchapter(subchapterId, documentId)
      toast({
        title: "Success",
        description: "Document unlinked from lesson",
      })
      await fetchDocuments()
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to unlink document",
        variant: "destructive",
      })
      throw err
    }
  }

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    linkDocument,
    unlinkDocument,
  }
}
