// Content Section Types for ELIZA Learning Platform
// These types define the structure of blog-style lesson sections

export type ContentType =
  | "INTRO" // Introduction section
  | "CONCEPT" // Core concept explanation
  | "PRACTICE" // Practice exercises/questions
  | "SUMMARY" // Summary/recap section
  | "VIDEO" // Video content section
  | "IMAGE" // Image from PDF
  | "CTA" // Call-to-action (quiz, tutor, blackboard)
  | "TEXT" // General text content
  | "STUDENT_EXTRA" // Student-specific personalized content

export type MediaType = "VIDEO" | "VOICEOVER" | "SCRIPT"

export type MediaVersionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

/**
 * Media Version - Historical record of video/audio/script iterations
 * Teachers can request new versions with feedback
 */
export interface MediaVersion {
  id: string
  section_id: string
  version_index: number
  media_type: MediaType
  status: MediaVersionStatus
  media_url?: string
  teacher_feedback?: string
  created_at: string
  additional_metadata: Record<string, any>
}

/**
 * Document - Uploaded PDF/file reference
 */
export interface Document {
  id: string
  syllabus_id: string
  filename: string
  original_filename?: string // Added for human-readable display names
  file_path?: string
  file_url?: string
  file_size?: number
  mime_type?: string
  file_type?: string
  status?: string
  chunk_count?: number
  signed_url?: string
  num_pages?: number
  uploaded_at: string
  additional_metadata: Record<string, any>
}

/**
 * SubchapterDocument - Links a document to a subchapter with page range
 */
export interface SubchapterDocument {
  id: string
  subchapter_id: string
  document_id: string
  document_filename?: string
  document_name?: string
  file_name?: string
  signed_url?: string
  file_path?: string
  page_start?: number
  page_end?: number
  created_at: string
  created_by_id?: string

  // Populated document details
  document?: Document
}

/**
 * Content Section - A discrete block of learning content within a subchapter
 * Can be base (teacher-curated) or personalized (student-specific)
 */
export interface ContentSection {
  id: string
  subchapter_id: string
  order_index: number
  content_type: ContentType
  title: string
  body: string
  media_url?: string

  // Provenance - links back to source PDF documents and chunks
  source_document_ids: string[] // NEW: Array of document UUIDs
  source_document_signed_url?: string
  source_page_start?: number
  source_page_end?: number
  source_chunk_ids: string[]

  // Teacher controls
  is_teacher_locked: boolean

  // Personalization
  student_id?: string // Present for STUDENT_EXTRA sections
  personalization_signature?: string // Hash for caching
  base_section_id?: string // Links personalized to base section

  // Metadata
  additional_metadata: {
    ai_model?: string
    media_suggestions?: {
      needs_video: boolean
      video_focus?: string
    }
    cta_action?: "quiz" | "tutor" | "blackboard"
    source_chunk_ids?: string[]
    // Optional redundancy for document provenance (some responses may include these here)
    source_document_ids?: string[]
    source_document_id?: string
  }

  // Media versions history
  media_versions: MediaVersion[]

  created_at: string
  updated_at: string
}

/**
 * Request body for generating personalized sections
 */
export interface PersonalizedSectionRequest {
  question: string
  context_hint?: string
}

/**
 * Request body for regenerating sections
 */
export interface RegenerateSectionsRequest {
  max_sections?: number
}

/**
 * Request body for updating section
 */
export interface UpdateSectionRequest {
  title?: string
  body?: string
  order_index?: number
  is_teacher_locked?: boolean
  source_document_ids?: string[]
  source_page_start?: number
  source_page_end?: number
}

/**
 * Request body for requesting new media version
 */
export interface MediaVersionRequest {
  media_type: MediaType
  notes: string
}

/**
 * Request body for creating manual sections with provenance
 */
export interface ManualSectionCreateRequest {
  title: string
  body: string
  content_type: ContentType
  order_index: number
  source_document_ids?: string[]
  source_page_start?: number
  source_page_end?: number
  media_url?: string
}

/**
 * Request body for linking documents to subchapters
 */
export interface LinkDocumentRequest {
  document_id: string
  page_start?: number
  page_end?: number
}
