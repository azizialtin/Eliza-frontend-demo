"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"
import type { Document } from "@/lib/api"

interface LinkDocumentModalProps {
  syllabusId: string
  subchapterId: string
  isOpen: boolean
  onClose: () => void
  onLinked: () => void
}

export function LinkDocumentModal({ syllabusId, subchapterId, isOpen, onClose, onLinked }: LinkDocumentModalProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("")
  const [pageStart, setPageStart] = useState<string>("")
  const [pageEnd, setPageEnd] = useState<string>("")
  const [label, setLabel] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [error, setError] = useState<string>("")

  // Load syllabus documents when modal opens
  useEffect(() => {
    if (isOpen && syllabusId) {
      loadDocuments()
    }
  }, [isOpen, syllabusId])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      console.log("[v0] LinkDocumentModal loading documents for syllabusId:", syllabusId) // Debug logging
      const docs = await apiClient.getSyllabusDocuments(syllabusId)
      console.log("[v0] LinkDocumentModal received documents:", docs) // Debug logging
      // Only show documents that finished processing
      const processedDocs = docs.filter((doc) => {
        const status = (doc.status || "").toString().toLowerCase()
        return status === "completed" || status === "processed"
      })
      console.log("[v0] LinkDocumentModal filtered processed documents:", processedDocs) // Debug logging
      setDocuments(processedDocs)
    } catch (err) {
      console.error("[v0] Failed to load documents:", err)
      setError("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedDocumentId) {
      setError("Please select a document")
      return
    }

    try {
      setLoading(true)
      await apiClient.linkDocumentToSubchapter(subchapterId, {
        document_id: selectedDocumentId,
        page_start: pageStart ? Number.parseInt(pageStart) : undefined,
        page_end: pageEnd ? Number.parseInt(pageEnd) : undefined,
        label: label || undefined,
        notes: notes || undefined,
      })

      onLinked()
      handleClose()
    } catch (err: any) {
      console.error("[v0] Failed to link document:", err)
      setError(err.message || "Failed to link document")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedDocumentId("")
    setPageStart("")
    setPageEnd("")
    setLabel("")
    setNotes("")
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Link PDF to Lesson</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Document Selection */}
          <div className="space-y-2">
            <Label htmlFor="document">Select PDF Document *</Label>
            {loading && documents.length === 0 ? (
              <p className="text-sm text-gray-500">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-gray-500">No processed documents available. Please upload a PDF first.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedDocumentId === doc.id
                        ? "border-eliza-purple bg-eliza-purple/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="document"
                      value={doc.id}
                      checked={selectedDocumentId === doc.id}
                      onChange={(e) => setSelectedDocumentId(e.target.value)}
                      className="w-4 h-4 text-eliza-purple"
                    />
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{doc.original_filename || doc.filename}</p>
                      <p className="text-xs text-gray-500">
                        {doc.chunk_count ? `${doc.chunk_count} chunks` : "Processed"}
                        {doc.file_size && ` • ${(doc.file_size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Page Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageStart">Start Page (Optional)</Label>
              <Input
                id="pageStart"
                type="number"
                min="1"
                placeholder="e.g., 1"
                value={pageStart}
                onChange={(e) => setPageStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageEnd">End Page (Optional)</Label>
              <Input
                id="pageEnd"
                type="number"
                min="1"
                placeholder="e.g., 10"
                value={pageEnd}
                onChange={(e) => setPageEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label (Optional)</Label>
            <Input
              id="label"
              placeholder="e.g., Chapter 2: Kinematics"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this link..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading || !selectedDocumentId}>
            {loading ? "Linking..." : "Link Document"}
          </Button>
        </div>
      </div>
    </div>
  )
}
