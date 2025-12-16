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

// User management in localStorage
export const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user))
  } else {
    localStorage.removeItem("user")
  }
}

export const getStoredUser = (): User | null => {
  const stored = localStorage.getItem("user")
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error("Failed to parse stored user", e)
    return null
  }
}

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
    console.log("🔐 Decoded JWT Payload:", payload);
    const role = (payload.role || (payload.roles && payload.roles[0]) || "STUDENT").toUpperCase();
    console.log("👤 Extracted Role:", role);

    return {
      id: payload.sub, // Backend: sub is the UUID
      email: payload.email || "",
      role: (payload.role || (payload.roles && payload.roles[0]) || "STUDENT").toUpperCase() as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT",
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
    this.loadMockState();
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
    // First try to get the stored user object
    const storedUser = getStoredUser()
    if (storedUser) {
      console.log("✅ Using stored user:", storedUser.email, storedUser.role)
      return storedUser
    }

    // Fallback to decoding JWT if no stored user
    const token = getAuthToken()
    if (!token) return null
    const decodedUser = decodeJWT(token) as User | null

    // Store the decoded user for future use
    if (decodedUser) {
      setStoredUser(decodedUser)
    }

    return decodedUser
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

  // State for hardcoded demo to remember what has been generated
  // State for hardcoded demo to remember what has been generated
  // Key: syllabusId, Value: List of Chapters (Topics)
  private mockSyllabusState = new Map<string, Chapter[]>();
  private MOCK_STORAGE_KEY = "aula_mock_syllabus_state";

  private saveMockState() {
    if (typeof window === "undefined") return;
    try {
      const obj = Object.fromEntries(this.mockSyllabusState);
      localStorage.setItem(this.MOCK_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error("Failed to save mock state", e);
    }
  }

  private loadMockState() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.MOCK_STORAGE_KEY);
      if (stored) {
        const obj = JSON.parse(stored);
        this.mockSyllabusState = new Map(Object.entries(obj));
        console.log("🧠 Loaded mock state from localStorage", this.mockSyllabusState);
      }
    } catch (e) {
      console.error("Failed to load mock state", e);
    }
  }

  // Chapters (Mapped from Topics) - HARDCODED FOR DEMO
  async getSyllabusChapters(syllabusId: string): Promise<Chapter[]> {
    // 1. Try to fetch from Backend
    try {
      const topics = await this.request<BackendTopic[]>(`/api/v1/pdfs/${syllabusId}/topics`);
      if (topics && topics.length > 0) {
        console.log(`✅ Fetched ${topics.length} topics for syllabus ${syllabusId}`);
        return topics.map(topic => this.mapTopicToChapter(topic));
      }
    } catch (error) {
      console.warn("Backend fetch failed, checking for fallback...", error);
    }

    // 2. Check in-memory state
    if (this.mockSyllabusState.has(syllabusId)) {
      console.log(`🧠 Returning in-memory mock topics for ${syllabusId}`);
      return this.mockSyllabusState.get(syllabusId)!;
    }

    // 3. Fallback: Initialize with hardcoded data
    console.log(`📚 Initializing hardcoded topics for syllabus ${syllabusId}`);

    // Hardcoded structure based on provided data with enhanced descriptions
    const hardcodedTopics = [
      {
        topic: "Topic 1: Number",
        description: "Foundation of mathematical understanding covering number systems, calculations, percentages, ratios, and practical applications in finance and time.",
        chapters: [
          { chapter: 1, title: "Number and language", description: "Understanding how numbers are expressed in words and symbols, place value, and mathematical language." },
          { chapter: 2, title: "Accuracy", description: "Rounding, significant figures, decimal places, and understanding measurement accuracy." },
          { chapter: 3, title: "Calculations and order", description: "Order of operations (BIDMAS/PEMDAS), mental calculation strategies, and estimation techniques." },
          { chapter: 4, title: "Integers, fractions, decimals and percentages", description: "Working with different number types, converting between forms, and understanding equivalence." },
          { chapter: 5, title: "Further percentages", description: "Percentage increase and decrease, reverse percentages, and compound percentage changes." },
          { chapter: 6, title: "Ratio and proportion", description: "Understanding and applying ratios, proportional reasoning, and solving proportion problems." },
          { chapter: 7, title: "Indices and standard form", description: "Powers and roots, index laws, and expressing very large or small numbers in standard form." },
          { chapter: 8, title: "Money and finance", description: "Practical applications including budgeting, interest calculations, profit and loss, and financial literacy." },
          { chapter: 9, title: "Time", description: "Working with time zones, 12/24 hour clock, time intervals, and timetable problems." },
          { chapter: 10, title: "Set notation and Venn diagrams", description: "Introduction to set theory, set operations, and visual representation using Venn diagrams." }
        ]
      },
      {
        topic: "Topic 2: Algebra and graphs",
        description: "Algebraic thinking and graphical representations including equations, functions, sequences, and problem-solving through graphs.",
        chapters: [
          { chapter: 11, title: "Algebraic representation and manipulation", description: "Using letters to represent numbers, simplifying expressions, expanding brackets, and factorization." },
          { chapter: 12, title: "Algebraic indices", description: "Applying index laws to algebraic expressions and solving problems with powers." },
          { chapter: 13, title: "Equations and inequalities", description: "Solving linear and quadratic equations, simultaneous equations, and working with inequalities." },
          { chapter: 14, title: "Linear programming", description: "Optimization problems using graphs, feasible regions, and constraint inequalities." },
          { chapter: 15, title: "Sequences", description: "Arithmetic and geometric sequences, finding nth terms, and pattern recognition." },
          { chapter: 16, title: "Variation", description: "Direct, inverse, and joint variation, including practical applications and graphical representation." },
          { chapter: 17, title: "Graphs in practical situations", description: "Real-world graphs including distance-time, speed-time, and other practical contexts." },
          { chapter: 18, title: "Graphs of functions", description: "Plotting and interpreting linear, quadratic, cubic, and reciprocal graphs." },
          { chapter: 19, title: "Functions", description: "Function notation, composite functions, inverse functions, and transformations of graphs." }
        ]
      },
      {
        topic: "Topic 3: Geometry",
        description: "Study of shapes, constructions, similarity, symmetry, and angle relationships in 2D and 3D geometry.",
        chapters: [
          { chapter: 20, title: "Geometrical vocabulary", description: "Understanding geometric terms, classifying shapes, and properties of 2D and 3D figures." },
          { chapter: 21, title: "Geometrical constructions and scale drawings", description: "Using compass and ruler for accurate constructions, scale drawings, and maps." },
          { chapter: 22, title: "Similarity", description: "Similar shapes, scale factors, area and volume ratios, and solving problems with similar figures." },
          { chapter: 23, title: "Symmetry", description: "Line and rotational symmetry, orders of symmetry, and symmetry in nature and design." },
          { chapter: 24, title: "Angle properties", description: "Angles in parallel lines, polygons, circles, and geometric reasoning." },
          { chapter: 25, title: "Loci", description: "Path of points satisfying given conditions, constructions involving loci, and practical applications." }
        ]
      },
      {
        topic: "Topic 5: Coordinate geometry",
        description: "Analytical approach to geometry using coordinate systems and algebraic methods to study lines and shapes.",
        chapters: [
          { chapter: 28, title: "Straight-line graphs", description: "Gradient, y-intercept, equation forms (y=mx+c), parallel and perpendicular lines, and midpoint/distance formulas." }
        ]
      },
      {
        topic: "Topic 6: Trigonometry",
        description: "Relationships between angles and sides in triangles, with applications in navigation, surveying, and problem-solving.",
        chapters: [
          { chapter: 29, title: "Bearings", description: "Three-figure bearings, compass directions, navigation problems, and scale drawings with bearings." },
          { chapter: 30, title: "Trigonometry", description: "Sine, cosine, and tangent ratios in right-angled triangles, solving for unknown sides and angles." },
          { chapter: 31, title: "Further trigonometry", description: "Sine and cosine rules, area of triangles, 3D problems, and exact trigonometric values." }
        ]
      },
      {
        topic: "Topic 7: Matrices and transformations",
        description: "Vector mathematics, matrix operations, and geometric transformations including reflections, rotations, and translations.",
        chapters: [
          { chapter: 32, title: "Vectors", description: "Vector notation, magnitude and direction, position vectors, and vector arithmetic." },
          { chapter: 33, title: "Matrices", description: "Matrix notation, addition, subtraction, multiplication, and applications including transformations." },
          { chapter: 34, title: "Transformations", description: "Translations, reflections, rotations, enlargements, and combined transformations using matrices." }
        ]
      },
      {
        topic: "Topic 8: Probability",
        description: "Mathematical study of chance, likelihood, and random events with applications in decision-making and risk assessment.",
        chapters: [
          { chapter: 35, title: "Probability", description: "Basic probability concepts, probability scales, experimental and theoretical probability, and sample spaces." },
          { chapter: 36, title: "Further probability", description: "Tree diagrams, conditional probability, independent and dependent events, and combined events." }
        ]
      },
      {
        topic: "Topic 9: Statistics",
        description: "Collection, presentation, and analysis of data using statistical measures and graphical representations.",
        chapters: [
          { chapter: 37, title: "Mean, median, mode and range", description: "Measures of central tendency and spread, choosing appropriate averages, and interpreting statistical data." },
          { chapter: 38, title: "Collecting and displaying data", description: "Data collection methods, frequency tables, charts, graphs, histograms, and scatter diagrams." },
          { chapter: 39, title: "Cumulative frequency", description: "Cumulative frequency graphs, quartiles, interquartile range, and box plots for data analysis." }
        ]
      }
    ];

    // Map hardcoded structure to frontend Chapter format
    const chapters: Chapter[] = hardcodedTopics.map((topicData, topicIndex) => {
      // Create a mock ID for the topic - scoped to syllabus
      const topicId = `${syllabusId}-topic-${topicIndex + 1}`;

      // Map chapters to subchapters
      const subchapters: Subchapter[] = topicData.chapters.map((chapterData, chapterIndex) => {
        // Scoped ID
        const subId = `${syllabusId}-chapter-${chapterData.chapter}`;
        return {
          id: subId,
          chapter_id: topicId,
          title: chapterData.title,
          order_index: chapterIndex,
          video_status: "NOT_GENERATED",
          video_progress: 0,
          is_completed: false,
          created_at: new Date().toISOString(),
          text_description: chapterData.description,
          has_blog: false, // Default to FALSE for new syllabus
          has_quiz: false
        };
      });

      return {
        id: topicId,
        syllabus_id: syllabusId,
        title: topicData.topic,
        description: topicData.description,
        order_index: topicIndex,
        is_generated: true,
        created_at: new Date().toISOString(),
        subchapters: subchapters,
        is_published: false
      };
    });

    this.mockSyllabusState.set(syllabusId, chapters);
    this.saveMockState();
    console.log(`✅ Returning ${chapters.length} hardcoded topics (newly initialized)`);
    return chapters;
  }

  async getChapter(chapterId: string): Promise<Chapter> {
    // Try to find in mock state first
    for (const [sId, chapters] of this.mockSyllabusState.entries()) {
      const found = chapters.find(c => c.id === chapterId);
      if (found) return found;
    }

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
    // HARDCODED FALLBACK for demo content
    // Search in mock state
    for (const [sId, chapters] of this.mockSyllabusState.entries()) {
      for (const topic of chapters) {
        const sub = topic.subchapters?.find(s => s.id === subchapterId);
        if (sub) {
          console.log(`✨ Returning mock subchapter details for ${subchapterId}`);
          return sub;
        }
      }
    }

    if (subchapterId.startsWith("chapter-") || subchapterId.startsWith("topic-")) {
      // Legacy fallback if not in state (shouldn't happen if initialized properly via getSyllabusChapters)
      console.log(`✨ Returning legacy hardcoded details for ${subchapterId}`);

      let title = "Lesson Content";
      let desc = "Lesson Description";

      if (subchapterId === "chapter-1") {
        title = "Number and language";
        desc = "Understanding how numbers are expressed in words and symbols, place value, and mathematical language.";
      }

      return Promise.resolve({
        id: subchapterId,
        chapter_id: "topic-1", // associated topic ID mock
        title: title,
        order_index: 0,
        video_status: "NOT_GENERATED",
        video_progress: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
        text_description: desc,
        has_blog: false,
        has_quiz: false
      });
    }

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
        text_description: chapter.description,
        has_blog: chapter.has_blog,
        has_quiz: chapter.has_quiz
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
      } catch (e2) {
        console.error("Failed to fetch subchapter details", e);
        throw e;
      }
    }
  }


  // --- Mock Editing Methods ---

  async updateSectionContent(sectionId: string, newBody: string): Promise<ContentSection> {
    console.log(`📝 Mock update section ${sectionId} with body length ${newBody.length}`);
    return Promise.resolve({
      id: sectionId,
      body: newBody,
      updated_at: new Date().toISOString()
    } as ContentSection);
  }

  async aiEditSection(sectionId: string, prompt: string, currentBody: string): Promise<string> {
    console.log(`✨ Mock AI edit for section ${sectionId} with prompt: "${prompt}"`);
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple mock transformation
    return `[AI Edited: ${prompt}]\n\n${currentBody}\n\n(The content has been updated based on your request.)`;
  }

  async aiEditVideo(sectionId: string, prompt: string): Promise<void> {
    console.log(`🎥 Mock AI video edit for section ${sectionId} with prompt: "${prompt}"`);
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Promise.resolve();
  }

  async getStudentContentSections(subchapterId: string): Promise<ContentSection[]> {
    // HARDCODED content for ALL blogs (demo mode)
    if (true) {
      console.log(`📄 Returning hardcoded blog content for subchapter: ${subchapterId}`);
      const hardcodedBlog = {
        title: "What Exactly *Is* An Integral? (The Big Idea)",
        content_markdown: `
# What Exactly *Is* An Integral? (The Big Idea)

## Introduction: The "Area Under the Curve" Problem

Imagine you're driving a car, and your speedometer is broken. You know how fast you were going at various moments, but you want to know **how far you've traveled**. 

If you were driving at a constant 60 mph for 2 hours, it's easy: $60 \\times 2 = 120$ miles. But real life isn't constant. You speed up, slow down, stop for traffic. 

This is the core problem of **Integration** in calculus. It's about adding up tiny, changing quantities to find a total.

{{video_placeholder_1}}

## The Rectangle Approximation (Riemann Sums)

How do we solve this? We cheat! We pretend the speed was constant for very short intervals.
- From 1:00 to 1:05, say you went roughly 30mph.
- From 1:05 to 1:10, maybe 40mph.

If we calculate distance for each tiny chunk and add them up, we get a good estimate. This method of adding up rectangles to approximate a total area is called a **Riemann Sum**.

{{video_placeholder_2}}

## From Approximation to Exactness

Now, here's the magic trick of calculus. 
What if we made those time intervals smaller? And smaller? **Infinitely small?**

As the width of our rectangles approaches zero, our approximation becomes perfect. The jagged steps smooth out into a curve. This limit—where the sum of uniform slices becomes a continuous total—is the **Definite Integral**.

{{video_placeholder_3}}

## Notation: The Long "S"

We write integrals using a symbol that looks like a stretched-out "S" (for "Sum").

$$ \\int_{a}^{b} f(x) \\, dx $$

*   **$\\int$**: The integral sign (sum up everything).
*   **$a$ and $b$**: The start and end points (e.g., time 0 to time 2).
*   **$f(x)$**: The function you're tracking (e.g., speed).
*   **$dx$**: The tiny, tiny slice of width (infinitely small change in x).

{{video_placeholder_4}}

## Why Does This Matter?

Integrals aren't just for math class. They are everywhere:
1.  **Physics**: From velocity to position, or force to work.
2.  **Engineering**: Calculating the center of mass or stress on a beam.
3.  **Economics**: Finding total surplus or accumulated interest.

Integration is the tool we use to move from the "instantaneous" world of rates (derivatives) back to the "accumulated" world of totals.
        `,
        video_placeholders: [
          "/riemann-sum-pipeline.mp4",
          "/definite-integral-demo.mp4",
          "/indefinite-integral-demo.mp4",
          "/integral-notation-breakdown.mp4"
        ]
      };

      // Helper to generate UUIDs
      const generateId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      console.log(`🔍 splitting markdown with regex...`);
      // Split content by placeholders
      const parts = hardcodedBlog.content_markdown.split(/(\{\{video_placeholder_\d+\}\})/g);
      console.log(`🔍 parts found: ${parts.length}`);

      let orderIndex = 0;
      const sections: ContentSection[] = []; // Define sections here
      parts.forEach((part) => {
        if (!part.trim()) return; // Skip empty parts

        // Check determine if part is a placeholder
        const match = part.match(/\{\{video_placeholder_(\d+)\}\}/);

        if (match) {
          // It's a video placeholder
          const videoIndex = parseInt(match[1]) - 1; // 1-based index to 0-based
          const videoUrl = hardcodedBlog.video_placeholders[videoIndex];
          console.log(`🎥 Found video placeholder: ${match[0]}, index: ${videoIndex}, url: ${videoUrl}`);

          if (videoUrl) {
            const sectionId = generateId();
            sections.push({
              id: sectionId,
              subchapter_id: subchapterId,
              title: `Video Demo ${videoIndex + 1}`,
              content_type: "VIDEO",
              order_index: orderIndex++,
              body: "", // No text body for video sections
              is_teacher_locked: false,
              source_document_ids: [],
              source_chunk_ids: [],
              additional_metadata: {},
              media_versions: [{
                id: generateId(),
                section_id: sectionId,
                version_index: 1,
                status: "COMPLETED",
                media_type: "VIDEO",
                media_url: videoUrl, // Use local path
                created_at: new Date().toISOString(),
                additional_metadata: {}
              }],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        } else {
          // It's a text part
          console.log(`📝 Found text part: ${part.substring(0, 20)}...`);
          sections.push({
            id: generateId(),
            subchapter_id: subchapterId,
            title: orderIndex === 0 ? hardcodedBlog.title : "", // Only show title for the first section
            content_type: "TEXT",
            order_index: orderIndex++,
            body: part.trim(),
            is_teacher_locked: false,
            source_document_ids: [],
            source_chunk_ids: [],
            additional_metadata: {},
            media_versions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });

      console.log(`✅ Generated ${sections.length} sections`);
      return sections;
    }

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
    console.log(`✨ Mock generate blog for chapter ${chapterId}`);

    // Update state in mockSyllabusState
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      for (const topic of topics) {
        const sub = topic.subchapters?.find(s => s.id === chapterId);
        if (sub) {
          sub.has_blog = true;
          this.saveMockState();
          return Promise.resolve({ success: true, message: "Blog generated successfully" });
        }
      }
    }

    return Promise.resolve({ success: true, message: "Blog generated successfully (stateless fallback)" });
  }

  async generateQuiz(chapterId: string): Promise<any> {
    console.log(`✨ Mock generate quiz for chapter ${chapterId}`);

    // Update state in mockSyllabusState
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      for (const topic of topics) {
        const sub = topic.subchapters?.find(s => s.id === chapterId);
        if (sub) {
          sub.has_quiz = true;
          this.saveMockState();
          return Promise.resolve({ success: true, message: "Quiz generated successfully" });
        }
      }
    }

    return Promise.resolve({ success: true, message: "Quiz generated successfully (stateless fallback)" });
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
  // Updated to work with mockSyllabusState
  async updateTopic(topicId: string, title?: string, description?: string, is_published?: boolean): Promise<any> {
    console.log(`✏️ Mock update topic ${topicId}:`, { title, description, is_published });
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        if (title !== undefined) topic.title = title;
        if (description !== undefined) topic.description = description;
        if (is_published !== undefined) topic.is_published = is_published;
        this.saveMockState();
        return Promise.resolve({ ...topic });
      }
    }
    return Promise.resolve({ id: topicId, title, description, is_published });
  }

  async updateChapterTitle(chapterId: string, title: string): Promise<Chapter> {
    return this.updateTopic(chapterId, title) as Promise<Chapter>;
  }

  async updateSubchapterTitle(subchapterId: string, title: string): Promise<Subchapter> {
    console.log(`✏️ Mock update subchapter ${subchapterId}:`, title);
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      for (const topic of topics) {
        if (!topic.subchapters) continue;
        const sub = topic.subchapters.find(s => s.id === subchapterId);
        if (sub) {
          sub.title = title;
          this.saveMockState();
          return Promise.resolve({ ...sub });
        }
      }
    }
    return Promise.resolve({ id: subchapterId, title } as Subchapter);
  }

  async deleteChapter(chapterId: string): Promise<any> {
    console.log(`🗑️ Mock delete chapter (topic) ${chapterId}`);
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      const idx = topics.findIndex(t => t.id === chapterId);
      if (idx !== -1) {
        topics.splice(idx, 1);
        this.saveMockState();
        return Promise.resolve({ success: true });
      }
    }
    return Promise.resolve({ success: true });
  }

  async deleteSubchapter(subchapterId: string): Promise<any> {
    console.log(`🗑️ Mock delete subchapter ${subchapterId}`);
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      for (const topic of topics) {
        if (!topic.subchapters) continue;
        const idx = topic.subchapters.findIndex(s => s.id === subchapterId);
        if (idx !== -1) {
          topic.subchapters.splice(idx, 1);
          this.saveMockState();
          return Promise.resolve({ success: true });
        }
      }
    }
    return Promise.resolve({ success: true });
  }

  async createManualSection(subchapterId: string, section: any): Promise<any> { return {} }
  async reorderSections(subchapterId: string, sectionIds: string[]): Promise<any> { return {} }
  async getTeacherSections(subchapterId: string): Promise<any[]> { return this.getStudentContentSections(subchapterId) }
  async updateSection(id: string, data: any): Promise<any> { return {} }
  async deleteSection(sectionId: string): Promise<void> { }
  async requestMediaRegeneration(sectionId: string, mediaType: string, notes: string): Promise<any> { return {} }
  async generateContentSections(subchapterId: string): Promise<any[]> { return [] }

  // MOCK CREATE CHAPTER (Topic)
  async createChapter(syllabusId: string, data: { title: string }): Promise<Chapter> {
    console.log(`➕ Mock create topic for syllabus ${syllabusId}: ${data.title}`);

    // Ensure state exists
    await this.getSyllabusChapters(syllabusId);

    const topics = this.mockSyllabusState.get(syllabusId) || [];
    const newTopicId = `${syllabusId}-topic-custom-${Date.now()}`;

    const newTopic: Chapter = {
      id: newTopicId,
      syllabus_id: syllabusId, // Add syllabusId
      title: data.title,
      description: "",
      order_index: topics.length,
      is_generated: true,
      created_at: new Date().toISOString(),
      is_published: false,
      subchapters: []
    };

    topics.push(newTopic);
    this.mockSyllabusState.set(syllabusId, topics);
    this.saveMockState();
    return newTopic;
  }

  // MOCK CREATE SUBCHAPTER (Lesson)
  async createSubchapter(chapterId: string, data: { title: string }): Promise<Subchapter> {
    console.log(`➕ Mock create lesson for topic ${chapterId}: ${data.title}`);

    // Find the topic in state
    let targetTopic: Chapter | undefined;
    let syllabusId = "";

    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      const t = topics.find(t => t.id === chapterId);
      if (t) {
        targetTopic = t;
        syllabusId = sId;
        break;
      }
    }

    if (!targetTopic) {
      throw new Error("Topic not found in mock state");
    }

    const newLessonId = `${syllabusId}-lesson-custom-${Date.now()}`;
    const newLesson: Subchapter = {
      id: newLessonId,
      chapter_id: chapterId,
      title: data.title,
      order_index: targetTopic.subchapters ? targetTopic.subchapters.length : 0,
      video_status: "NOT_GENERATED",
      video_progress: 0,
      is_completed: false,
      created_at: new Date().toISOString(),
      text_description: "",
      has_blog: false,
      has_quiz: false
    };

    if (!targetTopic.subchapters) targetTopic.subchapters = [];
    targetTopic.subchapters.push(newLesson);
    this.saveMockState();

    return newLesson;
  }

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
