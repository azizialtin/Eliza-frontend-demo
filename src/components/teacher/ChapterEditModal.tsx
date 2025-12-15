"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ChapterEditModalProps {
  type: "chapter" | "subchapter"
  mode: "create" | "edit"
  currentTitle?: string
  currentDescription?: string
  onClose: () => void
  onSave: (data: { title: string; description?: string }) => Promise<void>
}

export function ChapterEditModal({
  type,
  mode,
  currentTitle = "",
  currentDescription = "",
  onClose,
  onSave,
}: ChapterEditModalProps) {
  const [title, setTitle] = useState(currentTitle)
  const [description, setDescription] = useState(currentDescription)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({ title, description: description || undefined })
      onClose()
    } catch (error) {
      console.error(`Failed to ${mode} ${type}:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 font-['Space_Grotesk']">
            {mode === "create" ? "Add" : "Edit"} {type === "chapter" ? "Chapter" : "Subchapter"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="title" className="text-base font-semibold mb-2 block">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${type} title...`}
              className="text-base"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSubmit()
              }}
            />
          </div>

          {type === "subchapter" && (
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this lesson..."
                className="text-base min-h-[80px]"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="bg-[hsl(230,69%,50.6%)] hover:bg-[hsl(230,69%,45%)] text-white"
          >
            {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
