"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTeacherSections } from "@/hooks/useTeacherSections"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, AlertCircle, Plus, GripVertical, Trash2, Save, X } from "lucide-react"
import { ManualSectionCreator } from "./ManualSectionCreator"
import { SubchapterDocumentList } from "./SubchapterDocumentList"
import { apiClient } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface SectionManagementProps {
  subchapterId: string
  syllabusId: string
}

export const SectionManagement: React.FC<SectionManagementProps> = ({ subchapterId, syllabusId }) => {
  console.log("[v0] SectionManagement received subchapterId:", subchapterId, "Type:", typeof subchapterId)

  const [showManualCreator, setShowManualCreator] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [localSections, setLocalSections] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: sections, isLoading, error, refetch } = useTeacherSections(subchapterId, false)

  useEffect(() => {
    if (sections) {
      setLocalSections(sections)
    }
  }, [sections])

  const handleCreateManualSection = async (sectionData: any) => {
    try {
      console.log("[v0] Creating section for subchapterId:", subchapterId, "Type:", typeof subchapterId)
      await apiClient.createManualSection(subchapterId, sectionData)
      await refetch()
      toast({ title: "Section created successfully!" })
      setShowManualCreator(false)
    } catch (error) {
      console.error("[v0] Failed to create section:", error)
      toast({ title: "Failed to create section", variant: "destructive" })
    }
  }

  const handleGenerateSections = async () => {
    setIsGenerating(true)
    try {
      await apiClient.generateContentSections(subchapterId)
      await refetch()
      toast({ title: "Sections generated successfully!" })
    } catch (error) {
      console.error("[v0] Failed to generate sections:", error)
      toast({ title: "Failed to generate sections", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newSections = [...localSections]
    const draggedSection = newSections[draggedIndex]
    newSections.splice(draggedIndex, 1)
    newSections.splice(index, 0, draggedSection)

    setLocalSections(newSections)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      const sectionIds = localSections.map((s) => s.id)
      await apiClient.reorderSections(subchapterId, sectionIds)
      await refetch()
      toast({ title: "Sections reordered!" })
    } catch (error) {
      console.error("[v0] Failed to reorder:", error)
      toast({ title: "Failed to reorder sections", variant: "destructive" })
      setLocalSections(sections || [])
    } finally {
      setDraggedIndex(null)
    }
  }

  const handleStartEdit = (section: any) => {
    setEditingId(section.id)
    setEditTitle(section.title)
    setEditBody(section.body || "")
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      await apiClient.updateSection(editingId, { title: editTitle, body: editBody })
      await refetch()
      setEditingId(null)
      toast({ title: "Section updated!" })
    } catch (error) {
      console.error("[v0] Failed to update:", error)
      toast({ title: "Failed to update section", variant: "destructive" })
    }
  }

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("Delete this section? This cannot be undone.")) return

    try {
      await apiClient.deleteSection(sectionId)
      await refetch()
      toast({ title: "Section deleted!" })
    } catch (error) {
      console.error("[v0] Failed to delete:", error)
      toast({ title: "Failed to delete section", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-eliza-purple" />
        <span className="ml-3 text-gray-600">Loading sections...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-4">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>Failed to load sections. Please refresh the page.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="pb-6 border-b border-gray-200">
        <SubchapterDocumentList subchapterId={subchapterId} syllabusId={syllabusId} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Content Sections</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowManualCreator(true)}
            size="sm"
            className="bg-eliza-blue hover:bg-eliza-blue/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </Button>
          <Button onClick={handleGenerateSections} disabled={isGenerating} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
      </div>

      {localSections && localSections.length > 0 ? (
        <div className="space-y-2">
          {localSections.map((section, index) => (
            <div
              key={section.id}
              draggable={editingId !== section.id}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group flex gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all ${
                draggedIndex === index ? "opacity-50" : ""
              } ${editingId === section.id ? "ring-2 ring-eliza-purple" : ""}`}
            >
              {/* Drag handle */}
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0 mt-1" />

              {/* Content - inline editable */}
              <div className="flex-1 min-w-0">
                {editingId === section.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Section title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eliza-purple"
                    />
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      placeholder="Section body (optional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eliza-purple resize-none"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(section)}
                    className="cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-gray-900">{section.title}</p>
                    {section.body && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{section.body}</p>}
                    <p className="text-xs text-gray-400 mt-1">{section.content_type}</p>
                  </div>
                )}
              </div>

              {/* Action buttons - always visible */}
              <div className="flex items-start gap-1 flex-shrink-0">
                {editingId === section.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Save changes"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No sections yet. Add manually or generate with AI.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => setShowManualCreator(true)} className="bg-eliza-blue hover:bg-eliza-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Section
            </Button>
            <Button onClick={handleGenerateSections} disabled={isGenerating} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              Generate with AI
            </Button>
          </div>
        </div>
      )}

      {/* Manual section creator modal */}
      {showManualCreator && (
        <ManualSectionCreator
          onClose={() => setShowManualCreator(false)}
          onSubmit={handleCreateManualSection}
          existingSectionCount={localSections.length}
        />
      )}
    </div>
  )
}
