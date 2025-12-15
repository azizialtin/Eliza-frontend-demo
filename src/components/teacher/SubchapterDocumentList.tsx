"use client"

import { useState } from "react"
import { FileText, ExternalLink, Trash2, Loader2, Link, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSubchapterDocuments } from "@/hooks/useTeacherApi"
import { LinkDocumentModal } from "./LinkDocumentModal"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface SubchapterDocumentListProps {
  subchapterId: string
  syllabusId: string
}

export function SubchapterDocumentList({ subchapterId, syllabusId }: SubchapterDocumentListProps) {
  const { documents, loading, unlinkDocument, refetch } = useSubchapterDocuments(subchapterId)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const { toast } = useToast()

  const convertGsToHttps = (uri?: string | null) => {
    if (!uri || !uri.startsWith("gs://")) return undefined
    const withoutScheme = uri.replace("gs://", "")
    const [bucket, ...rest] = withoutScheme.split("/")
    if (!bucket || rest.length === 0) return undefined
    return `https://storage.googleapis.com/${bucket}/${rest.join("/")}`
  }

  const handleOpenDocument = async (docId: string, signedUrl?: string, filePath?: string) => {
    const usablePath =
      (filePath && filePath.startsWith("http") && filePath) || convertGsToHttps(filePath) || undefined
    const directUrl = signedUrl || usablePath

    if (directUrl) {
      window.open(directUrl, "_blank", "noopener")
      return
    }

    try {
      const fresh = await apiClient.getDocumentSignedUrl(docId)
      if (fresh.signed_url) {
        window.open(fresh.signed_url, "_blank", "noopener")
        return
      }
    } catch (error: any) {
      console.error("[v0] Failed to load signed URL for document", docId, error)
      toast({
        title: "Unable to open PDF",
        description: error?.message || "We couldn't fetch a link for this document.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "PDF not ready",
      description: "This document does not have a viewable link yet.",
      variant: "destructive",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[hsl(230,69%,50.6%)]" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-['Space_Grotesk'] font-semibold text-sm flex items-center gap-2">
          <Link className="h-4 w-4 text-[hsl(230,69%,50.6%)]" />
          Linked Documents ({documents?.length || 0})
        </h4>
        <Button
          onClick={() => setShowLinkModal(true)}
          size="sm"
          variant="outline"
          className="h-8 text-xs rounded-lg border-[hsl(230,69%,50.6%)] text-[hsl(230,69%,50.6%)] hover:bg-[hsl(230,69%,50.6%)]/5"
        >
          <Plus className="h-3 w-3 mr-1" />
          Link PDF
        </Button>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No documents linked to this lesson yet</p>
          <p className="text-xs text-gray-400 mt-1">Link PDFs to provide source material for this lesson</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <FileText className="h-5 w-5 text-[hsl(0,96.9%,62.4%)] flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {doc.document_name || doc.file_name || doc.document_filename || doc.label || "Linked PDF"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {doc.page_start && doc.page_end && (
                    <Badge variant="outline" className="text-xs">
                      Pages {doc.page_start}-{doc.page_end}
                    </Badge>
                  )}
                  {doc.label && (
                    <Badge variant="secondary" className="text-xs">
                      {doc.label}
                    </Badge>
                  )}
                </div>
                {doc.notes && <p className="text-xs text-gray-600 mt-1 italic">{doc.notes}</p>}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenDocument(doc.document_id, doc.signed_url, doc.file_path)}
                  className="h-7 w-7 p-0"
                  title="View PDF"
                >
                  <ExternalLink className="h-3 w-3 text-[hsl(230,69%,50.6%)]" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const name = doc.document_name || doc.file_name || doc.document_filename || "this document"
                    if (confirm(`Unlink "${name}" from this lesson?`)) {
                      unlinkDocument(doc.id)
                    }
                  }}
                  className="h-7 w-7 p-0"
                  title="Unlink document"
                >
                  <Trash2 className="h-3 w-3 text-[hsl(0,96.9%,62.4%)]" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showLinkModal && (
        <LinkDocumentModal
          syllabusId={syllabusId}
          subchapterId={subchapterId}
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          onLinked={() => {
            refetch()
            setShowLinkModal(false)
          }}
        />
      )}
    </div>
  )
}
