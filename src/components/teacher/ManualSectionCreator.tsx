"use client"

import { useState } from "react"
import { X, FileText, Video, Dumbbell, ImageIcon, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ManualSectionCreatorProps {
  onClose: () => void
  onSubmit: (sectionData: {
    content_type: string
    title: string
    body: string
    media_url?: string
    order_index?: number
  }) => Promise<void>
  existingSectionCount: number
}

const SECTION_TYPES = [
  { value: "TEXT", label: "Text Content", icon: FileText, color: "bg-blue-500" },
  { value: "VIDEO", label: "Video", icon: Video, color: "bg-red-500" },
  { value: "PRACTICE", label: "Practice Exercise", icon: Dumbbell, color: "bg-green-500" },
  { value: "IMAGE", label: "Image", icon: ImageIcon, color: "bg-purple-500" },
  { value: "CTA", label: "Call to Action", icon: Megaphone, color: "bg-yellow-500" },
]

export function ManualSectionCreator({ onClose, onSubmit, existingSectionCount }: ManualSectionCreatorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [orderIndex, setOrderIndex] = useState(existingSectionCount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedType || !title || !body) return

    setIsSubmitting(true)
    try {
      const payload = {
        content_type: selectedType,
        title,
        body,
        media_url: mediaUrl || undefined,
        order_index: orderIndex,
      }
      console.log("[v0] Creating manual section with payload:", payload)

      await onSubmit(payload)
      onClose()
    } catch (error) {
      console.error("[v0] Failed to create section:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Add Manual Section</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Section Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SECTION_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.value
                        ? "border-eliza-purple bg-eliza-purple/10 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <Label htmlFor="title" className="text-base font-semibold mb-2 block">
              Section Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter section title..."
              className="text-base"
            />
          </div>

          {/* Body Input */}
          <div>
            <Label htmlFor="body" className="text-base font-semibold mb-2 block">
              Content
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter section content..."
              rows={6}
              className="text-base resize-none"
            />
          </div>

          {/* Media URL (optional for VIDEO and IMAGE types) */}
          {(selectedType === "VIDEO" || selectedType === "IMAGE") && (
            <div>
              <Label htmlFor="mediaUrl" className="text-base font-semibold mb-2 block">
                {selectedType === "VIDEO" ? "Video URL" : "Image URL"} (Optional)
              </Label>
              <Input
                id="mediaUrl"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={`Enter ${selectedType.toLowerCase()} URL...`}
                className="text-base"
              />
            </div>
          )}

          {/* Order Index */}
          <div>
            <Label htmlFor="orderIndex" className="text-base font-semibold mb-2 block">
              Position
            </Label>
            <Input
              id="orderIndex"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number.parseInt(e.target.value))}
              min={0}
              max={existingSectionCount}
              className="text-base"
            />
            <p className="text-sm text-gray-500 mt-1">
              Insert at position {orderIndex} (0 = first, {existingSectionCount} = last)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedType || !title || !body || isSubmitting}
            className="bg-eliza-purple hover:bg-eliza-purple/90"
          >
            {isSubmitting ? "Creating..." : "Create Section"}
          </Button>
        </div>
      </div>
    </div>
  )
}
