import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { apiClient, type Chapter, type Subchapter } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useContentManagement } from "@/hooks/useTeacherApi"
import { useDocuments } from "@/hooks/useApi"

export interface ChapterModalState {
    mode: "create" | "edit"
    type: "chapter" | "subchapter"
    id?: string
    chapterId?: string
    title?: string
    description?: string
}

export interface DraggedItem {
    type: "chapter" | "subchapter"
    id: string
    chapterId?: string
}

export function useSyllabusManagement(syllabusId: string | undefined) {
    const navigate = useNavigate()
    const location = useLocation()
    const { toast } = useToast()
    const { handleError } = useErrorHandler()
    const { createChapter, createSubchapter } = useContentManagement()
    const { documents, loading: documentsLoading, uploadDocument, refetch: refetchDocuments } = useDocuments(syllabusId!)

    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loadingChapters, setLoadingChapters] = useState(false)
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())

    const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
    const [editingSubchapterId, setEditingSubchapterId] = useState<string | null>(null)
    const [editingTitle, setEditingTitle] = useState("")
    const [showChapterModal, setShowChapterModal] = useState<ChapterModalState | null>(null)

    const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [originalChapters, setOriginalChapters] = useState<Chapter[]>([])
    const [managingSectionsFor, setManagingSectionsFor] = useState<string | null>(null)
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

    const [isGenerating, setIsGenerating] = useState(false)
    const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null)
    const [localFileUrl, setLocalFileUrl] = useState<string | null>(location.state?.localFileUrl || null)

    // Cleanup local URL on unmount
    useEffect(() => {
        return () => {
            if (localFileUrl) {
                URL.revokeObjectURL(localFileUrl)
            }
        }
    }, [localFileUrl])

    useEffect(() => {
        if (syllabusId) {
            fetchChapters()
        }
    }, [syllabusId])

    const fetchChapters = async () => {
        if (!syllabusId) return

        try {
            setLoadingChapters(true)
            const data = await apiClient.getSyllabusChapters(syllabusId)
            console.log("Fetched chapters:", data);
            setChapters(data)
            setOriginalChapters(JSON.parse(JSON.stringify(data)))
            setHasUnsavedChanges(false)
        } catch (error) {
            console.error("Failed to fetch chapters:", error)
        } finally {
            setLoadingChapters(false)
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const pdfFiles = files.filter((f) => f.type === "application/pdf")

        if (pdfFiles.length !== files.length) {
            handleError(new Error("Only PDF files are allowed"), { title: "Invalid files" })
        }

        if (pdfFiles.length > 0) {
            setUploadingFiles(pdfFiles)
            let lastUploadedDocId: string | null = null;

            for (const file of pdfFiles) {
                try {
                    // Create local preview immediately
                    const url = URL.createObjectURL(file)
                    setLocalFileUrl(url)

                    setUploadProgress((prev) => ({ ...prev, [file.name]: 50 }))
                    // Upload with autoProcess = false to allow confirmation step
                    const result = await uploadDocument(file, false)
                    lastUploadedDocId = result.document_id;
                    setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
                } catch (error) {
                    handleError(error, { title: "Upload error", showToast: false })
                }
            }

            setUploadingFiles([])
            setUploadProgress({})

            // Refetch documents to update UI
            await refetchDocuments()
        }
    }

    const handleProcessPdf = async () => {
        if (!syllabusId) return;
        try {
            await apiClient.processPdf(syllabusId);
            toast({ title: "Processing started", description: "Analyzing document and extracting topics..." });
            await refetchDocuments();
            // Trigger polling or other state updates if needed
        } catch (error) {
            handleError(error, { title: "Processing failed" })
        }
    }

    const handleGenerateChapters = async (refetchSyllabus: () => Promise<void>) => {
        if (chapters.length === 0) {
            toast({
                title: "No topics",
                description: "Please wait for topics to be extracted first",
                variant: "destructive",
            })
            return
        }

        setIsGenerating(true)

        try {
            // Generate lessons for all topics in parallel
            await Promise.all(chapters.map(chapter => apiClient.generateTopicChapters(chapter.id)))

            toast({
                title: "Content generated!",
                description: "Lessons have been created for all topics",
            })

            await fetchChapters()
            await refetchSyllabus()
        } catch (error: any) {
            handleError(error, { title: "Generation failed", description: "Failed to generate content" })
        } finally {
            setIsGenerating(false)
            setGeneratingTopicId(null)
        }
    }

    const generateLessonsForTopic = async (topicId: string, refetchSyllabus: () => Promise<void>) => {
        try {
            setGeneratingTopicId(topicId)
            await apiClient.generateTopicChapters(topicId)
            toast({
                title: "Lessons Generated",
                description: "Content for this topic has been created.",
            })
            await fetchChapters()
            await refetchSyllabus()
        } catch (error: any) {
            handleError(error, { title: "Generation failed", description: "Failed to generate lessons for topic" })
        } finally {
            setGeneratingTopicId(null)
        }
    }

    const startEditingChapter = (chapter: Chapter) => {
        setShowChapterModal({
            mode: "edit",
            type: "chapter",
            id: chapter.id,
            title: chapter.title,
        })
    }

    const startEditingSubchapter = (subchapter: Subchapter) => {
        setShowChapterModal({
            mode: "edit",
            type: "subchapter",
            id: subchapter.id,
            title: subchapter.title,
            description: subchapter.text_description,
        })
    }

    const handleSaveChapterOrSubchapter = async (data: { title: string; description?: string }) => {
        if (!showChapterModal) return

        try {
            if (showChapterModal.mode === "create") {
                if (showChapterModal.type === "chapter") {
                    await createChapter(syllabusId!, data.title)
                    await fetchChapters()
                    toast({ title: "Chapter created", description: "New chapter has been added" })
                } else {
                    await createSubchapter(showChapterModal.chapterId!, data.title, {
                        text_description: data.description,
                        auto_generate_sections: false,
                    })
                    await fetchChapters()
                    toast({ title: "Lesson created", description: "New lesson has been added" })
                }
            } else {
                // Edit mode
                if (showChapterModal.type === "chapter") {
                    await apiClient.updateChapterTitle(showChapterModal.id!, data.title)
                    setChapters((prev) => prev.map((ch) => (ch.id === showChapterModal.id ? { ...ch, title: data.title } : ch)))
                    setEditingChapterId(null)
                    toast({ title: "Chapter updated", description: "Chapter title has been saved" })
                } else {
                    await apiClient.updateSubchapterTitle(showChapterModal.id!, data.title)
                    setChapters((prev) =>
                        prev.map((ch) => ({
                            ...ch,
                            subchapters: ch.subchapters?.map((sub) =>
                                sub.id === showChapterModal.id
                                    ? { ...sub, title: data.title, text_description: data.description }
                                    : sub,
                            ),
                        })),
                    )
                    setEditingSubchapterId(null)
                    toast({ title: "Subchapter updated", description: "Subchapter has been saved" })
                }
            }
            setShowChapterModal(null)
        } catch (error: any) {
            handleError(error, { title: "Save failed" })
        }
    }

    const saveChapterTitle = async (chapterId: string) => {
        try {
            await apiClient.updateChapterTitle(chapterId, editingTitle)
            setChapters((prev) => prev.map((ch) => (ch.id === chapterId ? { ...ch, title: editingTitle } : ch)))
            setEditingChapterId(null)
            toast({ title: "Chapter updated", description: "Chapter title has been saved" })
        } catch (error: any) {
            handleError(error, { title: "Update failed" })
        }
    }

    const saveSubchapterTitle = async (subchapterId: string) => {
        try {
            await apiClient.updateSubchapterTitle(subchapterId, editingTitle)
            setChapters((prev) =>
                prev.map((ch) => ({
                    ...ch,
                    subchapters: ch.subchapters?.map((sub) =>
                        sub.id === subchapterId ? { ...sub, title: editingTitle } : sub
                    ),
                }))
            )
            setEditingSubchapterId(null)
            toast({ title: "Lesson updated", description: "Lesson title has been saved" })
        } catch (error: any) {
            handleError(error, { title: "Update failed" })
        }
    }

    const deleteChapter = async (chapterId: string) => {
        if (!confirm("Are you sure you want to delete this chapter and all its lessons?")) return

        try {
            await apiClient.deleteChapter(chapterId)
            setChapters((prev) => prev.filter((ch) => ch.id !== chapterId))
            toast({ title: "Chapter deleted", description: "Chapter has been removed" })
        } catch (error: any) {
            handleError(error, { title: "Delete failed" })
        }
    }

    const deleteSubchapter = async (subchapterId: string) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return

        try {
            await apiClient.deleteSubchapter(subchapterId)
            setChapters((prev) =>
                prev.map((ch) => ({
                    ...ch,
                    subchapters: ch.subchapters?.filter((sub) => sub.id !== subchapterId),
                })),
            )
            toast({ title: "Lesson deleted", description: "Lesson has been removed" })
        } catch (error: any) {
            handleError(error, { title: "Delete failed" })
        }
    }

    const handleDragStart = (e: React.DragEvent, type: "chapter" | "subchapter", id: string, chapterId?: string) => {
        setDraggedItem({ type, id, chapterId })
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDropChapter = (e: React.DragEvent, targetChapterId: string) => {
        e.preventDefault()
        if (!draggedItem || draggedItem.type !== "chapter" || draggedItem.id === targetChapterId) return

        const newChapters = [...chapters]
        const draggedIndex = newChapters.findIndex((ch) => ch.id === draggedItem.id)
        const targetIndex = newChapters.findIndex((ch) => ch.id === targetChapterId)

        const [removed] = newChapters.splice(draggedIndex, 1)
        newChapters.splice(targetIndex, 0, removed)

        setChapters(newChapters)
        setDraggedItem(null)
        setHasUnsavedChanges(true)
    }

    const handleDropSubchapter = (e: React.DragEvent, targetSubchapterId: string, targetChapterId: string) => {
        e.preventDefault()
        if (!draggedItem || draggedItem.type !== "subchapter" || draggedItem.id === targetSubchapterId) return
        if (draggedItem.chapterId !== targetChapterId) return // Only allow reordering within same chapter

        const newChapters = chapters.map((ch) => {
            if (ch.id !== targetChapterId) return ch

            const subs = [...(ch.subchapters || [])]
            const draggedIndex = subs.findIndex((sub) => sub.id === draggedItem.id)
            const targetIndex = subs.findIndex((sub) => sub.id === targetSubchapterId)

            const [removed] = subs.splice(draggedIndex, 1)
            subs.splice(targetIndex, 0, removed)

            return { ...ch, subchapters: subs }
        })

        setChapters(newChapters)
        setDraggedItem(null)
        setHasUnsavedChanges(true)
    }

    const saveReordering = async () => {
        try {
            // Reorder chapters
            const chapterIds = chapters.map((ch) => ch.id)
            await apiClient.reorderChapters(syllabusId!, chapterIds)

            // Reorder subchapters for each chapter
            for (const chapter of chapters) {
                if (chapter.subchapters && chapter.subchapters.length > 0) {
                    const subchapterIds = chapter.subchapters.map((sub) => sub.id)
                    await apiClient.reorderSubchapters(chapter.id, subchapterIds)
                }
            }

            setOriginalChapters(JSON.parse(JSON.stringify(chapters)))
            setHasUnsavedChanges(false)
            toast({ title: "Changes saved", description: "Course structure has been updated" })
        } catch (error: any) {
            handleError(error, { title: "Save failed" })
        }
    }

    const resetChanges = () => {
        setChapters(JSON.parse(JSON.stringify(originalChapters)))
        setHasUnsavedChanges(false)
    }

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(chapterId)) {
                newSet.delete(chapterId)
            } else {
                newSet.add(chapterId)
            }
            return newSet
        })
    }

    const updateTopicDetails = async (topicId: string, title: string, description?: string, is_published?: boolean) => {
        try {
            await apiClient.updateTopic(topicId, title, description, is_published)
            setChapters((prev) => prev.map((ch) => {
                if (ch.id === topicId) {
                    return {
                        ...ch,
                        title,
                        description,
                        is_published: is_published !== undefined ? is_published : ch.is_published
                    }
                }
                return ch
            }))
            toast({ title: "Topic updated", description: "Topic details have been saved" })
        } catch (error: any) {
            handleError(error, { title: "Update failed" })
        }
    }

    return {
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
        generateLessonsForTopic,
        generatingTopicId,
        localFileUrl,
        refetchChapters: fetchChapters,
        updateTopicDetails,
        handleProcessPdf,
    }
}

