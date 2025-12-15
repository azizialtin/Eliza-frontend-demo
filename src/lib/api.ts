// API Configuration - Monolith URL
const MANAGER_URL = import.meta.env.VITE_MANAGER_URL || "http://localhost:8000"

// Backwards compatibility - everything points to MANAGER_URL
const CONTENT_URL = MANAGER_URL
const VIDEO_URL = MANAGER_URL
const RAG_URL = MANAGER_URL
const QUIZ_URL = MANAGER_URL

// Export service URLs for direct use
export { MANAGER_URL, CONTENT_URL, VIDEO_URL, RAG_URL, QUIZ_URL }

// Import content section types
import type { ContentSection, PersonalizedSectionRequest } from "@/types/content-sections"

// Auth token management
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("access_token", token)
  } else {
    localStorage.removeItem("access_token")
  }
}

export const getAuthToken = () => localStorage.getItem("access_token")

// Helper to decode JWT and extract user info
const decodeJWT = (token: string): Partial<User> | null => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    const payload = JSON.parse(jsonPayload)

    return {
      id: payload.sub, // Backend: sub is the UUID
      email: payload.email || "",
      role: (payload.role || "STUDENT").toUpperCase() as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT",
      first_name: payload.name || "User",
      last_name: "",
      school_id: "",
      preferred_language: "en",
      is_active: true,
    }
  } catch (error) {
    console.error("Failed to decode JWT:", error)
    return null
  }
}

// --- Frontend Data Models (Mapped to Backend) ---

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT"
  school_id: string
  preferred_language: string
  is_active: boolean
  created_at?: string
}

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  user?: User
}

export interface Syllabus {
  id: string
  name: string
  description?: string
  school_id: string
  teacher_id: string
  language: string
  status: "CREATED" | "GENERATING_STRUCTURE" | "READY" | "FAILED"
  is_public: boolean
  is_template: boolean
  created_at: string
  updated_at: string
  chapter_count?: number
  document_count?: number
  student_count?: number
  chapters?: Chapter[]
  is_published?: boolean
  current_step?: number
}

export interface Chapter {
  id: string
  syllabus_id: string
  title: string
  description?: string
  order_index: number
  is_generated: boolean
  completion_percentage?: number
  created_at: string
  subchapters?: Subchapter[]
  is_published?: boolean
}

export interface Subchapter {
  id: string
  chapter_id: string
  title: string
  order_index: number
  video_status: "NOT_GENERATED" | "QUEUED" | "GENERATING_SCRIPT" | "RENDERING_VIDEO" | "COMPLETED" | "FAILED"
  video_progress: number
  video_message?: string
  video_file_path?: string
  audio_file_path?: string
  text_description?: string
  rag_content?: string
  subtitles?: string
  is_completed: boolean
  created_at: string
  questions?: Question[]
  has_blog?: boolean
  has_quiz?: boolean
}

export interface Question {
  id: string
  subchapter_id: string
  question_text: string
  question_type: string
  order_index: number
}

// --- Internal Backend Models (for Mapping) ---
interface BackendPdf {
  id: string
  owner_id: string
  filename: string
  gcs_path: string
  processing_status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED"
  uploaded_at: string
  current_step?: number
  is_published?: boolean
}

export interface BackendTopic {
  id: string
  pdf_id: string
  title: string
  excerpt: string
  start_page: number
  end_page: number
  created_at: string
  is_published?: boolean
}

export interface BackendChapter {
  id: string
  topic_id: string
  title: string
  description: string
  order: number
  created_at: string
  has_blog?: boolean
  has_quiz?: boolean
}

interface BackendBlog {
  id: string
  chapter_id: string
  title: string
  content_markdown: string
  video_placeholders: any[]
  created_at: string
}

export type DocumentStatus = "processing" | "completed" | "failed"

export interface Document {
  id: string
  syllabus_id: string
  filename: string
  status: DocumentStatus
  uploaded_at: string
  gcs_path?: string
  processing_status?: string
  processing_error?: string
  signed_url?: string
}

export interface DocumentUploadResponse {
  document_id: string
  filename: string
  status: string
  message: string
}

export interface DocumentSignedUrl {
  signed_url: string
}

export interface SubchapterDocument {
  id: string
  document_id: string
  subchapter_id: string
  filename: string
  type: string
}

export interface VideoConfig {
  available_models: string[]
  available_voices: string[]
}

export interface ContactMessage {
  id?: string
  name: string
  email: string
  message: string
  created_at?: string
}

export interface StudentBadge {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

export interface StudentXP {
  student_id: string
  syllabus_id: string
  total_xp: number
  current_streak: number
  longest_streak: number
}

export interface LeaderboardEntry {
  student_id: string
  student_name: string
  xp: number
  rank: number
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  xp_value: number
  icon: string
}

export interface HealthStatus {
  status: string
  version: string
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    const token = getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
      console.log(`📡 [API] Attaching token to ${endpoint}: ${token.substring(0, 10)}...`)
    } else {
      console.warn(`⚠️ [API] No token found for ${endpoint}`)
    }

    const config = {
      ...options,
      headers,
    }

    const response = await fetch(url, config)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    if (response.status === 204) return {} as T
    return response.json()
  }

  // --- Auth Methods ---
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData()
    formData.append("username", email)
    formData.append("password", password)

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) throw new Error("Login failed")
    return response.json()
  }

  async register(userData: any): Promise<User> {
    return this.request<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    })
  }

  getCurrentUser(): User | null {
    const token = getAuthToken()
    if (!token) return null
    return decodeJWT(token) as User | null
  }

  // --- Syllabus CRUD ---
  async createSyllabus(name: string): Promise<Syllabus> {
    const formData = new FormData()
    formData.append("name", name)
    // auto_process defaults to True in backend, so we don't need to send it if we want default behavior

    // We must NOT set Content-Type header when sending FormData, let the browser set it with boundary
    const response = await fetch(`${this.baseUrl}/api/v1/pdfs/`, {
      method: "POST",
      headers: {
        ...(getAuthToken() ? { "Authorization": `Bearer ${getAuthToken()}` } : {})
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return this.mapPdfToSyllabus(data)
  }

  async updateSyllabus(syllabusId: string, data: { name?: string; current_step?: number, is_published?: boolean }): Promise<Syllabus> {
    const response = await this.request<BackendPdf>(`/api/v1/pdfs/${syllabusId}`, {
      method: "PATCH",
      body: JSON.stringify({
        filename: data.name,
        current_step: data.current_step,
        is_published: data.is_published
      }),
    })
    return this.mapPdfToSyllabus(response)
  }

  async deleteSyllabus(syllabusId: string): Promise<void> {
    await this.request(`/api/v1/pdfs/${syllabusId}`, {
      method: "DELETE",
    })
  }

  async processPdf(syllabusId: string): Promise<any> {
    return this.request(`/api/v1/pdfs/${syllabusId}/process`, { method: "POST" })
  }

  async getSyllabi(): Promise<Syllabus[]> {
    const pdfs = await this.request<BackendPdf[]>("/api/v1/pdfs/")
    return pdfs.map(pdf => this.mapPdfToSyllabus(pdf))
  }

  async getSyllabus(syllabusId: string): Promise<Syllabus> {
    const pdf = await this.request<BackendPdf>(`/api/v1/pdfs/${syllabusId}`)
    return this.mapPdfToSyllabus(pdf)
  }
  private mapPdfToSyllabus(pdf: BackendPdf): Syllabus {
    let status: Syllabus["status"] = "CREATED"
    if (pdf.processing_status === "IN_PROGRESS") status = "GENERATING_STRUCTURE"
    if (pdf.processing_status === "DONE") status = "READY"
    if (pdf.processing_status === "FAILED") status = "FAILED"

    return {
      id: pdf.id,
      name: pdf.filename,
      description: "Class Content",
      school_id: "default",
      teacher_id: pdf.owner_id,
      language: "en",
      status: status,
      is_public: false,
      is_template: false,
      created_at: pdf.uploaded_at,
      updated_at: pdf.uploaded_at,
      chapter_count: 0,
      document_count: pdf.gcs_path === 'placeholder' ? 0 : 1,
      current_step: pdf.current_step,
      is_published: pdf.is_published
    }
  }

  // Chapters (Mapped from Topics)
  async getSyllabusChapters(syllabusId: string): Promise<Chapter[]> {
    const topics = await this.request<BackendTopic[]>(`/api/v1/pdfs/${syllabusId}/topics`)
    console.log(`📚 Fetched ${topics?.length || 0} topics for syllabus ${syllabusId}`);

    // For each topic, fetch its generated chapters/lessons
    const chaptersWithLessons = await Promise.all(
      (topics || []).map(async (topic) => {
        try {
          // Fetch generated chapters (lessons) for this topic
          const backendChapters = await this.getTopicChapters(topic.id)
          console.log(`✅ Topic "${topic.title}" has ${backendChapters.length} generated lessons`);
          return this.mapTopicToChapterWithLessons(topic, backendChapters)
        } catch (error) {
          // If no chapters generated yet, return topic with itself as single subchapter
          console.log(`⚠️ Topic "${topic.title}" has no generated lessons yet`);
          return this.mapTopicToChapter(topic)
        }
      })
    )

    return chaptersWithLessons
  }

  async getChapter(chapterId: string): Promise<Chapter> {
    // Since we are mapping Topics -> Chapters -> [Topic as Subchapter], we just need the topic details
    const topic = await this.request<BackendTopic>(`/api/v1/topics/${chapterId}`).catch(() => ({
      id: chapterId,
      title: "Topic",
      pdf_id: "",
      excerpt: "",
      start_page: 0,
      end_page: 0,
      created_at: ""
    } as BackendTopic))

    // Use our new mapping which includes the topic itself as a subchapter
    return this.mapTopicToChapter(topic)
  }

  private mapTopicToChapterWithLessons(topic: BackendTopic, backendChapters: BackendChapter[]): Chapter {
    // Map backend chapters (lessons) to frontend subchapters
    const subchapters: Subchapter[] = backendChapters.map((chapter, index) => ({
      id: chapter.id,
      chapter_id: topic.id, // Parent is the topic
      title: chapter.title,
      order_index: chapter.order ?? index,
      video_status: "NOT_GENERATED",
      video_progress: 0,
      is_completed: false,
      created_at: chapter.created_at,
      text_description: chapter.description,
      has_blog: chapter.has_blog,
      has_quiz: chapter.has_quiz
    }))

    return {
      id: topic.id,
      syllabus_id: topic.pdf_id,
      title: topic.title,
      description: topic.excerpt,
      order_index: topic.start_page,
      is_generated: true,
      created_at: topic.created_at,
      subchapters: subchapters,
      is_published: topic.is_published
    }
  }

  private mapTopicToChapter(topic: BackendTopic): Chapter {
    // Fallback: Treat the Topic itself as a Subchapter when no lessons are generated yet
    return {
      id: topic.id,
      syllabus_id: topic.pdf_id,
      title: topic.title,
      description: topic.excerpt,
      order_index: topic.start_page,
      is_generated: true,
      created_at: topic.created_at,
      is_published: topic.is_published,
      subchapters: [{
        id: topic.id, // Re-use topic ID as subchapter ID
        chapter_id: topic.id,
        title: topic.title,
        order_index: 0,
        video_status: "NOT_GENERATED",
        video_progress: 0,
        is_completed: false,
        created_at: topic.created_at,
        text_description: topic.excerpt,
      }]
    }
  }

  // Subchapters (Mapped from Backend Chapters + Blogs)
  async getSubchapter(subchapterId: string): Promise<Subchapter> {
    try {
      // 1. Try to fetch as a Backend Chapter (Lesson)
      const chapter = await this.request<BackendChapter>(`/api/v1/chapters/${subchapterId}`)
      return {
        id: chapter.id,
        chapter_id: chapter.topic_id, // This links back to the Topic
        title: chapter.title,
        order_index: chapter.order,
        video_status: "NOT_GENERATED",
        video_progress: 0,
        is_completed: false,
        created_at: chapter.created_at,
        text_description: chapter.description
      }
    } catch (e) {
      // 2. Fallback: It might be a Topic (which acts as a stand-alone lesson in early syllabus version)
      try {
        const topic = await this.request<BackendTopic>(`/api/v1/topics/${subchapterId}`)
        // Map topic to subchapter
        return {
          id: topic.id,
          chapter_id: topic.pdf_id,
          title: topic.title,
          order_index: topic.start_page,
          video_status: "NOT_GENERATED",
          video_progress: 0,
          is_completed: false,
          created_at: topic.created_at,
          text_description: topic.excerpt
        }
      } catch (topicError) {
        console.error("Failed to fetch subchapter details", topicError)
        throw topicError
      }
    }
  }

  // Content Sections (from Blogs)
  async getStudentContentSections(subchapterId: string): Promise<ContentSection[]> {
    let blog: BackendBlog | null = null
    try {
      const blogs = await this.request<BackendBlog[]>(`/api/v1/chapters/${subchapterId}/blogs`)
      if (blogs && blogs.length > 0) blog = blogs[0]
    } catch (e) {
      return []
    }

    if (!blog) return []

    const sections: ContentSection[] = []

    // Text Section
    sections.push({
      id: `text-${blog.id}`,
      subchapter_id: subchapterId,
      order_index: 0,
      content_type: "TEXT",
      title: "Lesson Content",
      body: blog.content_markdown,
      is_teacher_locked: false,
      source_document_ids: [],
      source_chunk_ids: [],
      additional_metadata: {},
      media_versions: [],
      created_at: blog.created_at,
      updated_at: blog.created_at
    })

    // Video Sections
    if (blog.video_placeholders) {
      let videos: any[] = [];
      try {
        videos = await this.request<any[]>(`/api/v1/blogs/${blog.id}/videos`);
      } catch (e) {
        console.error("Failed to fetch blog videos", e);
      }

      blog.video_placeholders.forEach((ph, idx) => {
        const matchingVideo = videos.find((v: any) => v.placeholder_id === ph.id);
        const mediaVersions: any[] = [];

        if (matchingVideo && matchingVideo.render_status === "READY" && matchingVideo.gcs_path) {
          mediaVersions.push({
            id: matchingVideo.id,
            section_id: `video-${idx}`, // Placeholder matching
            version_index: 1,
            status: "READY",
            media_url: matchingVideo.gcs_path,
            media_type: "video/mp4",
            created_at: matchingVideo.created_at
          });
        } else if (matchingVideo && (matchingVideo.render_status === "QUEUED" || matchingVideo.render_status === "RENDERING")) {
          // Create a pending media version so the UI shows "Creating your video..." instead of "Video coming soon"
          mediaVersions.push({
            id: matchingVideo.id,
            section_id: `video-${idx}`,
            version_index: 0,
            status: matchingVideo.render_status === "RENDERING" ? "processing" : "pending",
            media_url: "",
            media_type: "video/mp4",
            created_at: matchingVideo.created_at
          });
        }

        sections.push({
          id: `video-${idx}`,
          subchapter_id: subchapterId,
          order_index: idx + 1,
          content_type: "VIDEO",
          title: "Video Explanation",
          body: ph.description,
          is_teacher_locked: false,
          source_document_ids: [],
          source_chunk_ids: [],
          additional_metadata: {
            media_suggestions: { needs_video: true }
          },
          media_versions: mediaVersions,
          created_at: blog!.created_at,
          updated_at: blog!.created_at
        })
      })
    }

    return sections
  }

  // Documents (only PDF management supported)
  async uploadDocument(syllabusId: string, file: File, autoProcess: boolean = true): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("name", file.name)
    // If auto_process is explicitly false, send it as false. Backend defaults to True.
    if (autoProcess === false) {
      formData.append("auto_process", "false")
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 1 minute timeout

    try {
      // Use PUT to upload file to the EXISTING syllabus/pdf record
      // This preserves the ID and metadata (like name)
      const response = await fetch(`${this.baseUrl}/api/v1/pdfs/${syllabusId}/file`, {
        method: "PUT",
        headers: {
          ...(getAuthToken() ? { "Authorization": `Bearer ${getAuthToken()}` } : {})
          // Do NOT set Content-Type for FormData, browser does it with boundary
        },
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) throw new Error("Upload failed")
      const result = await response.json()

      return {
        document_id: result.id,
        filename: file.name,
        status: "uploaded",
        message: "Upload successful"
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async getSyllabusDocuments(syllabusId: string): Promise<Document[]> {
    const syllabus = await this.getSyllabus(syllabusId)
    console.log("📋 getSyllabusDocuments - syllabus:", syllabus);

    // If no documents (e.g. placeholder PDF), return empty list
    if (!syllabus.document_count || syllabus.document_count === 0) {
      console.log("❌ No documents found - document_count is", syllabus.document_count);
      return []
    }

    let docStatus: DocumentStatus = "completed"
    if (syllabus.status === "GENERATING_STRUCTURE" || syllabus.status === "CREATED") docStatus = "processing"
    if (syllabus.status === "FAILED") docStatus = "failed"
    if (syllabus.status === "READY") docStatus = "completed"

    const docs = [{
      id: syllabus.id,
      syllabus_id: syllabus.id,
      filename: syllabus.name,
      status: docStatus,
      uploaded_at: syllabus.created_at
    }];
    console.log("✅ Returning documents:", docs);
    return docs;
  }

  // --- Stubs for Compatibility / Not Yet Implemented ---

  async generateChapters(syllabusId: string): Promise<any> {
    return this.request(`/api/v1/pdfs/${syllabusId}/process`, { method: "POST" })
  }

  async generateTopicChapters(topicId: string): Promise<BackendChapter[]> {
    return this.request<BackendChapter[]>(`/api/v1/topics/${topicId}/chapters/generate`, { method: "POST" })
  }

  async getTopicChapters(topicId: string): Promise<BackendChapter[]> {
    return this.request<BackendChapter[]>(`/api/v1/topics/${topicId}/chapters`)
  }

  async generateChapterBlog(chapterId: string): Promise<any> {
    return this.request(`/api/v1/blogs/chapters/${chapterId}/generate`, { method: "POST" })
  }

  async generateQuiz(chapterId: string): Promise<any> {
    return this.request(`/api/v1/quizzes/generate`, {
      method: "POST",
      body: JSON.stringify({ chapter_id: chapterId, question_count: 5 })
    })
  }

  async openChapter(chapterId: string, autoGenerateVideos = true): Promise<any> {
    console.warn("openChapter is deprecated. Use generateTopicChapters instead.")
    return {}
  }
  async markSubchapterComplete(subchapterId: string): Promise<void> { }
  async getSubtitles(subchapterId: string): Promise<{ subchapter_id: string; subtitles: string }> { return { subchapter_id: subchapterId, subtitles: "" } }

  async getVideoConfig(): Promise<VideoConfig> { return { available_models: [], available_voices: [] } }
  async getVideoStatus(subchapterId: string): Promise<Subchapter> { return this.getSubchapter(subchapterId) }
  getVideoUrl(subchapterId: string): string { return "" }
  getBlackboardVideoUrl(subchapterId: string): string { return "" }
  async fetchVideoBlob(subchapterId: string): Promise<Blob> { throw new Error("Not implemented") }
  async generateSubchapterVideo(subchapterId: string, options?: { initial_model?: string; voice_id?: string }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (options?.initial_model) queryParams.append('model', options.initial_model)
    if (options?.voice_id) queryParams.append('voice_id', options.voice_id)

    return this.request(`/api/v1/subchapters/${subchapterId}/generate_video?${queryParams.toString()}`, {
      method: 'POST'
    })
  }
  async generateChapterVideos(chapterId: string): Promise<any> { return {} }

  async deleteDocument(documentId: string): Promise<void> { }
  async getDocumentSignedUrl(documentId: string): Promise<DocumentSignedUrl> { return { signed_url: "" } }
  async getSubchapterDocuments(subchapterId: string): Promise<SubchapterDocument[]> { return [] }
  async getStudentSubchapterDocuments(subchapterId: string): Promise<SubchapterDocument[]> { return [] }
  async linkDocumentToSubchapter(subchapterId: string, data: any): Promise<SubchapterDocument> { throw new Error("Not implemented") }
  async unlinkDocumentFromSubchapter(subchapterId: string, linkId: string): Promise<void> { }

  async searchSyllabus(syllabusId: string, query: string, topK = 5): Promise<any> { return {} }
  async getHealth(): Promise<HealthStatus> { return this.request("/health") }
  async getRagContent(subchapterId: string): Promise<{ rag_content: string }> { return { rag_content: "" } }

  async getPublicSyllabi(skip = 0, limit = 100): Promise<Syllabus[]> { return [] }
  async enrollInSyllabus(syllabusId: string): Promise<any> { return {} }
  async getEnrolledSyllabi(): Promise<any[]> { return this.getSyllabi() }
  async getSyllabusProgress(syllabusId: string, studentId?: string): Promise<any> {
    // If we have a stats endpoint, we could use that, but "progress" is usually per-student.
    // For now, let's keep the mock or try to use the new stats endpoint if appropriate,
    // but stats are class-wide.
    // Let's leave this as is for now or implement a specific per-student progress endpoint later if needed.
    return {
      syllabus_id: syllabusId,
      completed_chapters: 0,
      total_chapters: 0,
      percentage: 0
    }
  }
  async addStudentToSyllabus(syllabusId: string, studentEmail: string): Promise<any> {
    const formData = new FormData();
    formData.append("email", studentEmail);
    return this.request(`/api/v1/pdfs/${syllabusId}/students`, {
      method: "POST",
      body: formData
    });
  }

  async getSyllabusStudents(syllabusId: string): Promise<User[]> {
    return this.request<User[]>(`/api/v1/pdfs/${syllabusId}/students`);
  }

  async removeStudentFromSyllabus(syllabusId: string, studentId: string): Promise<any> {
    return this.request(`/api/v1/pdfs/${syllabusId}/students/${studentId}`, {
      method: "DELETE"
    });
  }

  async getSyllabusStats(syllabusId: string): Promise<any> {
    return this.request(`/api/v1/pdfs/${syllabusId}/stats`);
  }

  async reorderChapters(syllabusId: string, chapterIds: string[]): Promise<any> { return {} }
  async reorderSubchapters(chapterId: string, subchapterIds: string[]): Promise<any> { return {} }
  // Updated to use the new topics endpoint
  async updateTopic(topicId: string, title?: string, description?: string, is_published?: boolean): Promise<any> {
    return this.request(`/api/v1/topics/${topicId}`, {
      method: "PUT",
      body: JSON.stringify({ title, excerpt: description, is_published })
    })
  }
  async updateChapterTitle(chapterId: string, title: string): Promise<Chapter> {
    // Backward compatibility mapping to updateTopic
    return this.updateTopic(chapterId, title);
  }
  async updateSubchapterTitle(subchapterId: string, title: string): Promise<Subchapter> {
    // We use the generic update endpoint or check if there is a specific one
    // Based on backend patterns, likely PUT /api/v1/chapters/{id} or /api/v1/subchapters/{id}
    // Looking at backend models, subchapters are likely "BackendChapter"
    try {
      await this.request(`/api/v1/chapters/${subchapterId}`, {
        method: "PUT",
        body: JSON.stringify({ title })
      });
      return this.getSubchapter(subchapterId);
    } catch (e) {
      console.error("Failed to update subchapter title", e);
      throw e;
    }
  }
  async deleteChapter(chapterId: string): Promise<any> {
    // Delete topic (which acts as chapter in current structure)
    return this.request(`/api/v1/topics/${chapterId}`, {
      method: "DELETE"
    })
  }

  async deleteSubchapter(subchapterId: string): Promise<any> {
    // subchapters in frontend are chapters in backend
    return this.request(`/api/v1/chapters/${subchapterId}`, {
      method: "DELETE"
    })
  }

  async createManualSection(subchapterId: string, section: any): Promise<any> { return {} }
  async reorderSections(subchapterId: string, sectionIds: string[]): Promise<any> { return {} }
  async getTeacherSections(subchapterId: string): Promise<any[]> { return this.getStudentContentSections(subchapterId) }
  async updateSection(id: string, data: any): Promise<any> { return {} }
  async deleteSection(sectionId: string): Promise<void> { }
  async requestMediaRegeneration(sectionId: string, mediaType: string, notes: string): Promise<any> { return {} }
  async generateContentSections(subchapterId: string): Promise<any[]> { return [] }

  async createChapter(syllabusId: string, data: { title: string }): Promise<Chapter> { throw new Error("Not supported") }
  async createSubchapter(chapterId: string, data: any): Promise<Subchapter> { throw new Error("Not supported") }

  async submitContact(data: ContactMessage): Promise<ContactMessage> { return data }
  async getContactMessages(): Promise<ContactMessage[]> { return [] }

  async getStudentAchievements(studentId?: string, syllabusId?: string): Promise<any> {
    return {
      total_xp: 0,
      level: 1,
      badges: [],
      streak: 0
    }
  }

  // Gamification Stubs
  async getStudentBadges(): Promise<StudentBadge[]> { return [] }
  async getStudentXP(syllabusId: string): Promise<StudentXP> { return { student_id: "me", syllabus_id: syllabusId, total_xp: 0, current_streak: 0, longest_streak: 0 } }
  async getLeaderboard(): Promise<LeaderboardEntry[]> { return [] }
  async getSubchapterBadges(subchapterId: string): Promise<BadgeDefinition[]> { return [] }
  async createBadge(subchapterId: string, badge: any): Promise<BadgeDefinition> { throw new Error("Not implemented") }
  async updateBadge(badgeId: string, badge: any): Promise<BadgeDefinition> { throw new Error("Not implemented") }
  async deleteBadge(badgeId: string): Promise<void> { }
  async awardBadgeToStudent(badgeId: string, studentId: string): Promise<StudentBadge> { throw new Error("Not implemented") }

  async requestPersonalizedSection(subchapterId: string, request: any): Promise<ContentSection> { throw new Error("Not implemented") }
  async trackSectionView(subchapterId: string, sectionId: string): Promise<void> { }
}

export const apiClient = new ApiClient(MANAGER_URL)
