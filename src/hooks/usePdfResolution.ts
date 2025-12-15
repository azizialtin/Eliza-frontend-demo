import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, type Document } from "@/lib/api"
import type { ContentSection } from "@/types/content-sections"
import { useToast } from "@/hooks/use-toast"

export function usePdfResolution(
    subchapterId: string | undefined,
    syllabusId: string | undefined,
    contentSections: ContentSection[] | undefined
) {
    const [currentPdfPage, setCurrentPdfPage] = useState(1)
    const { toast } = useToast()

    const firstSectionSignedUrl = useMemo(() => {
        if (!contentSections || contentSections.length === 0) return null
        for (const section of contentSections) {
            const directUrl = (section as any).source_document_signed_url
            const metadataUrl = (section.additional_metadata as any)?.source_document_signed_url as string | undefined
            if (directUrl) return directUrl as string
            if (metadataUrl) return metadataUrl
        }
        return null
    }, [contentSections])

    const firstSectionDocId = useMemo(() => {
        if (!contentSections || contentSections.length === 0) return null

        const getIdsFromSection = (section: ContentSection): string[] => {
            if (section.source_document_ids?.length) return section.source_document_ids.map(String)
            const docObjects = (section as any).source_documents as { document_id?: string }[] | undefined
            if (docObjects?.length) {
                return docObjects.map((doc) => doc.document_id).filter(Boolean) as string[]
            }
            const metadataIds = section.additional_metadata?.source_document_ids as string[] | undefined
            if (metadataIds && metadataIds.length) return metadataIds
            const singleMetadataId = section.additional_metadata?.source_document_id as string | undefined
            if (singleMetadataId) return [singleMetadataId]
            const legacySingle = (section as any).source_document_id as string | undefined
            if (legacySingle) return [legacySingle]
            return []
        }

        for (const section of contentSections) {
            const ids = getIdsFromSection(section)
            if (ids.length > 0) return ids[0]
        }

        return null
    }, [contentSections])

    const {
        data: studentDocs,
        isLoading: docsLoading,
        error: docsError,
    } = useQuery({
        queryKey: ["student-documents", subchapterId],
        queryFn: () => apiClient.getStudentSubchapterDocuments(subchapterId!),
        enabled: !!subchapterId,
        staleTime: 5 * 60 * 1000,
    })

    const selectedDoc = useMemo(() => {
        if (!studentDocs || studentDocs.length === 0) return null
        return studentDocs.find((doc) => doc.signed_url) || studentDocs[0]
    }, [studentDocs])

    const {
        data: syllabusDocs,
        isLoading: syllabusDocsLoading,
    } = useQuery({
        queryKey: ["syllabus-documents-fallback", syllabusId],
        queryFn: () => apiClient.getSyllabusDocuments(syllabusId!),
        enabled: !!syllabusId,
        staleTime: 5 * 60 * 1000,
    })

    const fallbackSyllabusDoc = useMemo(() => {
        if (!syllabusDocs || syllabusDocs.length === 0) return null
        const normalized = (doc: Document) => (doc.status || "").toString().toLowerCase()
        return (
            syllabusDocs.find((doc) => {
                const status = normalized(doc)
                return status === "completed" || status === "processed"
            }) || syllabusDocs[0]
        )
    }, [syllabusDocs])

    const convertGsToHttps = (uri?: string | null) => {
        if (!uri || !uri.startsWith("gs://")) return undefined
        const withoutScheme = uri.replace("gs://", "")
        const [bucket, ...rest] = withoutScheme.split("/")
        if (!bucket || rest.length === 0) return undefined
        return `https://storage.googleapis.com/${bucket}/${rest.join("/")}`
    }

    const preferredDocId = firstSectionDocId || selectedDoc?.document_id || null

    const {
        data: signedUrlData,
        isLoading: fallbackSignedUrlLoading,
    } = useQuery({
        queryKey: ["document-signed-url-fallback", subchapterId, preferredDocId],
        queryFn: () => apiClient.getDocumentSignedUrl(preferredDocId!),
        enabled: !!preferredDocId,
        staleTime: 5 * 60 * 1000,
    })

    const usableFilePath =
        (selectedDoc?.file_path && selectedDoc.file_path.startsWith("http") && selectedDoc.file_path) ||
        convertGsToHttps(selectedDoc?.file_path) ||
        convertGsToHttps((signedUrlData as { signed_url: string })?.signed_url)

    const fallbackDocUrl =
        fallbackSyllabusDoc?.signed_url ||
        (fallbackSyllabusDoc?.file_path?.startsWith("http") ? fallbackSyllabusDoc.file_path : undefined) ||
        convertGsToHttps(fallbackSyllabusDoc?.file_path)

    const pdfUrl =
        firstSectionSignedUrl ||
        selectedDoc?.signed_url ||
        (signedUrlData as { signed_url: string })?.signed_url ||
        usableFilePath ||
        fallbackDocUrl ||
        ""

    const isPdfSourceLoading =
        docsLoading || fallbackSignedUrlLoading || contentSections === undefined || syllabusDocsLoading

    const initialPage = useMemo(() => {
        if (selectedDoc?.page_start) {
            return selectedDoc.page_start
        }
        if (contentSections && contentSections.length > 0) {
            const sectionWithPage = contentSections.find((s) => s.source_page_start)
            if (sectionWithPage?.source_page_start) {
                return sectionWithPage.source_page_start
            }
        }
        return 1
    }, [selectedDoc, contentSections])

    useEffect(() => {
        if (initialPage > 1) {
            setCurrentPdfPage(initialPage)
        }
    }, [initialPage])

    useEffect(() => {
        if (docsError) {
            toast({
                title: "Unable to load PDF",
                description: "We couldn't load the PDF link for this lesson. Please try again.",
                variant: "destructive",
            })
        }
    }, [docsError, toast])

    return {
        pdfUrl,
        isPdfSourceLoading,
        currentPdfPage,
        setCurrentPdfPage,
    }
}
