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
import {
  QuizQuestion,
  QuizAttempt,
  QuizAttemptResponse,
  QuizSummary,
  AnswerResponse,
  RemedialQuestionResponse,
  SubmitRemedialAnswerResponse,
  Difficulty,
  PracticeSession,
  PracticeAnswerResponse
} from "../types/quiz"

import albanianVideo from "../riemann-sum-albanian-FINAL.mp4"
import { calculateLeaderboard, getDailyActivityStats, MOCK_STUDENTS, GamifiedStudent, StudentStats } from './mock-gamification';


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
  has_final_quiz?: boolean
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
    this.loadMockStudents();
    this.loadMockContent();
    this.loadMockQuiz();
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

  // Mock Students State
  private mockStudentState = new Map<string, User[]>();
  private MOCK_STUDENTS_KEY = "aula_mock_students_state";

  // Mock Content State (Blogs/Videos)
  // Key: subchapterId, Value: List of ContentSection
  private mockContentState = new Map<string, ContentSection[]>();
  private MOCK_CONTENT_KEY = "aula_mock_content_state";

  // Mock Quiz State
  // Key: attemptId, Value: QuizHistory
  private mockQuizState = new Map<string, any>();
  private MOCK_QUIZ_KEY = "aula_mock_quiz_state";

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

  private saveMockStudents() {
    if (typeof window === "undefined") return;
    try {
      const obj = Object.fromEntries(this.mockStudentState);
      localStorage.setItem(this.MOCK_STUDENTS_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error("Failed to save mock students", e);
    }
  }

  private loadMockStudents() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.MOCK_STUDENTS_KEY);
      if (stored) {
        const obj = JSON.parse(stored);
        this.mockStudentState = new Map(Object.entries(obj));
        console.log("🧠 Loaded mock students from localStorage", this.mockStudentState);
      }
    } catch (e) {
      console.error("Failed to load mock students", e);
    }
  }

  private saveMockContent() {
    if (typeof window === "undefined") return;
    try {
      const obj = Object.fromEntries(this.mockContentState);
      localStorage.setItem(this.MOCK_CONTENT_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error("Failed to save mock content", e);
    }
  }

  private loadMockContent() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.MOCK_CONTENT_KEY);
      if (stored) {
        const obj = JSON.parse(stored);
        this.mockContentState = new Map(Object.entries(obj));
        console.log("🧠 Loaded mock content from localStorage", this.mockContentState);
      }
    } catch (e) {
      console.error("Failed to load mock content", e);
    }
  }

  private saveMockQuiz() {
    if (typeof window === "undefined") return;
    try {
      const obj = Object.fromEntries(this.mockQuizState);
      localStorage.setItem(this.MOCK_QUIZ_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error("Failed to save mock quiz", e);
    }
  }

  private loadMockQuiz() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.MOCK_QUIZ_KEY);
      if (stored) {
        const obj = JSON.parse(stored);
        this.mockQuizState = new Map(Object.entries(obj));
        console.log("🧠 Loaded mock quiz state", this.mockQuizState);
      }
    } catch (e) {
      console.error("Failed to load mock quiz", e);
    }
  }

  // Chapters (Mapped from Topics) - HARDCODED FOR DEMO
  async getSyllabusChapters(syllabusId: string): Promise<Chapter[]> {
    // 1. Check in-memory state (Priority: Frontend Mock > Backend)
    if (this.mockSyllabusState.has(syllabusId)) {
      console.log(`🧠 Returning in-memory mock topics for ${syllabusId} (Cached)`);
      return this.mockSyllabusState.get(syllabusId)!;
    }

    // 2. Try to fetch from Backend
    try {
      const topics = await this.request<BackendTopic[]>(`/api/v1/pdfs/${syllabusId}/topics`);
      if (topics && topics.length > 0) {
        console.log(`✅ Fetched ${topics.length} topics for syllabus ${syllabusId}`);
        const chapters = topics.map(topic => this.mapTopicToChapter(topic));

        // CACHE BACKEND STATE TO MOCK STATE
        // This ensures that if we later edit (createChapter), we are editing this list, not an empty one.
        this.mockSyllabusState.set(syllabusId, chapters);
        this.saveMockState();

        return chapters;
      }
    } catch (error) {
      console.warn("Backend fetch failed, checking for fallback...", error);
    }

    // 3. Fallback: Initialize with hardcoded data

    // 3. Fallback: Initialize with hardcoded data
    console.log(`📚 Initializing hardcoded topics for syllabus ${syllabusId}`);

    // Artificial delay to simulate topic extraction (10 seconds)
    console.log("⏳ Simulating extraction delay...");
    await new Promise(resolve => setTimeout(resolve, 10000));

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
        is_published: false // Default to unpublished
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

    // Find section in mockContentState
    for (const [subId, sections] of this.mockContentState.entries()) {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        section.body = newBody;
        section.updated_at = new Date().toISOString();
        this.saveMockContent(); // Save persistence
        return Promise.resolve({ ...section });
      }
    }

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

    const newContent = `### Hyrje: Problemi i “Sipërfaqes nën Grafikun”

Imagjino sikur po ngisni një makinë dhe shpejtësimatësi juaj është i prishur. Ju e dini sa shpejt po lëviznit në momente të ndryshme, por doni të dini sa larg keni udhëtuar.

Nëse do të vozisnit me një shpejtësi konstante prej 60 milje në orë për 2 orë, është e thjeshtë:  
60 × 2 = 120 milje. Por jeta reale nuk është konstante. Ju përshpejtoni, ngadalësoni, ndaloni për trafik.

Ky është problemi thelbësor i Integrimit në kalkulus. Ai ka të bëjë me mbledhjen e sasive shumë të vogla dhe të ndryshueshme për të gjetur një total.`;

    // Update State
    for (const [subId, sections] of this.mockContentState.entries()) {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        section.body = newContent;
        section.updated_at = new Date().toISOString();
        this.saveMockContent();
        break;
      }
    }

    return newContent;
  }

  async aiEditVideo(sectionId: string, prompt: string): Promise<string> {
    console.log(`🎥 Mock AI video edit for section ${sectionId} with prompt: "${prompt}"`);
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Promise.resolve(albanianVideo);
  }

  async getStudentContentSections(subchapterId: string): Promise<ContentSection[]> {
    // 0. Check Persistence
    if (this.mockContentState.has(subchapterId)) {
      console.log(`🧠 Returning PERSISTED content for subchapter: ${subchapterId}`);
      return this.mockContentState.get(subchapterId)!;
    }

    // HARDCODED content for ALL blogs (demo mode)
    // ... (rest of generation logic) ...
    // At the end, insert into map and save.

    if (true) {
      console.log(`📄 Returning hardcoded blog content for subchapter: ${subchapterId}`);

      // 1. Determine if this is the 2nd chapter (logic to find index)
      let isSecondChapter = false;
      for (const [sId, topics] of this.mockSyllabusState.entries()) {
        for (const topic of topics) {
          if (topic.subchapters) {
            const index = topic.subchapters.findIndex(s => s.id === subchapterId);
            if (index === 1) { // 2nd chapter (0-indexed)
              isSecondChapter = true;
            }
            if (index !== -1) break;
          }
        }
        if (isSecondChapter) break;
      }

      let hardcodedBlog: any;

      if (isSecondChapter) {
        console.log("📄 Using NEW hardcoded blog for second chapter");
        hardcodedBlog = {
          title: "Turning Intuition into Calculation: Unlocking the Power of Integration",
          content_markdown: `Ever looked at a curve and wondered about the area tucked underneath it? Or perhaps you've considered how a rate of change can be 'undone' to reveal the original quantity? If so, you've already had a glimpse into the intuitive world of integration. In this chapter, we're going to bridge that intuition with the powerful, practical methods that allow us to calculate integrals with precision. It's less about scary equations and more about turning your 'what if' into a 'here's how.'

## The Great Reversal: Antiderivatives

Think back to differentiation. You started with a function and found its rate of change. Now, imagine doing the opposite: you have the rate of change, and you want to find the original function. This 'undoing' is the core idea behind **antidifferentiation**, and the result is called an **antiderivative**.

It's like having a map of a journey's speed at every point and wanting to know the path taken. We're reversing the process!

## Basic Integration Rules: Your Toolkit for Calculation

Just like differentiation had its rules, so does integration. These aren't meant to complicate things, but to give you a systematic way to find antiderivatives. Let's dive into some fundamental ones:

### 1. The Power Rule: Undoing the Power

Remember the power rule for differentiation? You multiplied by the exponent and subtracted one. For integration, we do the opposite: **add one to the exponent and then divide by the new exponent.**

If you have \`x^n\`, its integral is \`(x^(n+1))/(n+1)\` (as long as \`n\` isn't -1).

### 2. Constants: The Invisible Shifters

When you differentiate a constant, it disappears. This means that when you integrate, there could have been *any* constant there originally. That's why we always add a "+ C" to our antiderivatives. This **constant of integration** accounts for all possible original functions.

For example, the antiderivative of \`2x\` is \`x^2 + C\`, because the derivative of \`x^2 + 5\` is \`2x\`, and so is \`x^2 - 3\`, or \`x^2 + any number\`.

{{video_placeholder_1}}

### 3. Linearity: Keeping it Tidy

Integration plays nicely with addition, subtraction, and constant multiples. This is known as **linearity**. It means:

* The integral of a sum is the sum of the integrals.
* The integral of a constant times a function is the constant times the integral of the function.

This allows us to break down complex integrals into simpler, manageable pieces.

## Definite Integrals: Pinpointing the Area

So far, we've talked about indefinite integrals, which give us a family of functions (thanks to the "+ C"). But what if we want to find the *exact* area under a curve between two specific points? That's where **definite integrals** come in.

Instead of a "+ C", we'll evaluate the antiderivative at the upper limit and subtract its value at the lower limit. This process gives us a single, numerical answer – often representing an area, volume, or total change.

{{video_placeholder_2}}

## The Fundamental Theorem of Calculus: The Big Reveal

This might sound intimidating, but trust us, it's one of the most elegant and powerful ideas in mathematics. The **Fundamental Theorem of Calculus (FTC)** simply states the incredible connection between differentiation and integration.

It essentially tells us that finding the net change of a quantity (through a definite integral) can be done by simply evaluating the antiderivative of its rate of change at the start and end points. It confirms that integration and differentiation are inverse operations – two sides of the same coin!

No complicated limits or infinite sums needed for definite integrals (once you have an antiderivative!). Just pure, elegant calculation.

## From Intuition to Calculation

By understanding antiderivatives and these basic rules, you're no longer just guessing at areas or reversing rates in your head. You now have the fundamental tools to *calculate* them. The journey from observing a curve to precisely quantifying the space it encloses is a truly empowering one, and you've just taken your first big step.

Ready to put these rules into practice? Let's go!`,
          video_placeholders: [
            {
              url: "/src/power-rule-integration.mp4",
              description: "Explaining the Power Rule in integration with examples.",
              expected_length: "3 min"
            },
            {
              url: "/src/fundamental-theorem-calculus.mp4",
              description: "Visualizing definite integrals and the Fundamental Theorem of Calculus.",
              expected_length: "7 min"
            }
          ]
        };
      } else {
        hardcodedBlog = {
          title: "What Exactly *Is* An Integral? (The Big Idea)",
          content_markdown: `## Introduction: The "Area Under the Curve" Problem

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
      }

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
          const videoItem = hardcodedBlog.video_placeholders[videoIndex];

          let videoUrl = "";
          let videoDescription = "";

          if (typeof videoItem === 'string') {
            videoUrl = videoItem;
          } else if (videoItem && typeof videoItem === 'object') {
            videoUrl = videoItem.url;
            videoDescription = videoItem.description || "";
          }

          console.log(`🎥 Found video placeholder: ${match[0]}, index: ${videoIndex}, url: ${videoUrl}`);

          if (videoUrl) {
            const sectionId = generateId();
            sections.push({
              id: sectionId,
              subchapter_id: subchapterId,
              title: videoDescription ? "Video Explanation" : `Video Demo ${videoIndex + 1}`,
              content_type: "VIDEO",
              order_index: orderIndex++,
              body: videoDescription, // Use description if available
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

      // PERSIST FOR FUTURE
      this.mockContentState.set(subchapterId, sections);
      this.saveMockContent();

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
    // 1. Check in-memory state (Priority: Mock > Backend)
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        console.log(`🧠 Returning in-memory mock lessons for topic ${topicId} (Cached)`);
        // We need to map the frontend "Subchapter" structure back to "BackendChapter" structure if needed
        // Or just return the subchapters as is, assuming they are compatible enough for the caller in LearningPath
        // LearningPath expects keys: id, topic_id (mapped from chapter_id), title, order, created_at, description, has_blog, has_quiz

        return (topic.subchapters || []).map(sub => ({
          id: sub.id,
          topic_id: topic.id,
          title: sub.title,
          description: sub.text_description || "",
          order: sub.order_index,
          created_at: sub.created_at,
          has_blog: sub.has_blog,
          has_quiz: sub.has_quiz
        }));
      }
    }

    return this.request<BackendChapter[]>(`/api/v1/topics/${topicId}/chapters`)
  }

  async generateChapterBlog(chapterId: string): Promise<any> {
    console.log(`✨ Mock generate blog for chapter ${chapterId}`);

    // Artificial delay (10 seconds)
    console.log("⏳ Simulating blog generation delay...");
    await new Promise(resolve => setTimeout(resolve, 10000));

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

  async generateTopicQuiz(topicId: string): Promise<any> {
    console.log(`✨ Mock generate TOPIC quiz for topic ${topicId}`);

    // Update state in mockSyllabusState
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        // Add a mock property to topic if not present in type (we will just cast or assume it works for mock)
        // Ideally types should be updated, but for mock we can be flexible or assume UI handles it
        (topic as any).has_final_quiz = true;
        this.saveMockState();
        return Promise.resolve({ success: true, message: "Topic Quiz generated successfully" });
      }
    }
    return Promise.resolve({ success: true, message: "Topic Quiz generated successfully (stateless fallback)" });
  }

  // Practice Session Methods
  async startPracticeSession(chapterId: string, difficulty: Difficulty): Promise<PracticeSession> {
    console.log(`🎯 Starting practice session for ${chapterId} with difficulty ${difficulty}`);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Use the same question banks as quizzes (defined below in startQuiz method)
    // For demo, we'll use quiz1Questions and filter/select based on difficulty
    const allQuestions = this.getAllQuizQuestions();

    // Filter by difficulty and take 5 initial questions
    const filteredQuestions = allQuestions
      .filter(q => q.difficulty === difficulty)
      .slice(0, 5)
      .map(q => ({
        ...q,
        id: `prac-${q.id}-${Date.now()}`, // Make unique for practice
        options: q.options?.map(opt => ({
          ...opt,
          question_id: `prac-${q.id}-${Date.now()}`
        }))
      }));

    const sessionId = `prac-session-${Date.now()}`;
    const sessionState = {
      id: sessionId,
      chapter_id: chapterId,
      difficulty: difficulty,
      questions: filteredQuestions,
      answers: {},
      correct_count: 0,
      allQuestionPool: allQuestions // Store for generating more
    };

    // Store session state
    if (!this.mockQuizState.has("practice_sessions")) {
      this.mockQuizState.set("practice_sessions", new Map());
    }
    const sessions = this.mockQuizState.get("practice_sessions") as Map<string, any>;
    sessions.set(sessionId, sessionState);
    this.saveMockQuiz();

    console.log(`📚 Practice session started with ${filteredQuestions.length} ${difficulty} questions`);

    return {
      session_id: sessionId,
      questions: filteredQuestions,
      quiz_context_used: false // Could be true if we analyze past quiz mistakes
    };
  }

  async answerPracticeQuestion(sessionId: string, questionId: string, answer: string): Promise<PracticeAnswerResponse> {
    console.log(`📝 Answering practice question ${questionId}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const sessions = this.mockQuizState.get("practice_sessions") as Map<string, any>;
    const session = sessions?.get(sessionId);

    if (!session) throw new Error("Session not found");

    const question = session.questions.find((q: QuizQuestion) => q.id === questionId);
    if (!question) throw new Error("Question not found");

    const isCorrect = question.options?.find((o: any) => o.id === answer)?.is_correct || false;
    const correctOption = question.options?.find((o: any) => o.is_correct);

    session.answers[questionId] = { answer, isCorrect };
    if (isCorrect) session.correct_count++;

    this.saveMockQuiz();

    console.log(`${isCorrect ? '✅' : '❌'} Answer ${isCorrect ? 'correct' : 'incorrect'}. Session stats: ${session.correct_count}/${Object.keys(session.answers).length}`);

    return {
      is_correct: isCorrect,
      explanation: question.answer_explanation || (isCorrect ? "Correct! Well done." : "Incorrect. Try to review the concept."),
      correct_answer: correctOption?.text,
      questions_completed: Object.keys(session.answers).length,
      total_correct: session.correct_count
    };
  }

  async generateMorePracticeQuestion(sessionId: string): Promise<{ question: QuizQuestion }> {
    console.log(`➕ Generating more practice question for session ${sessionId}`);
    await new Promise(resolve => setTimeout(resolve, 600));

    const sessions = this.mockQuizState.get("practice_sessions") as Map<string, any>;
    const session = sessions?.get(sessionId);

    if (!session) throw new Error("Session not found");

    // Get a question from the pool that hasn't been used yet
    const usedQuestionIds = session.questions.map((q: QuizQuestion) => q.id.replace(/^prac-/, '').replace(/-\d+$/, ''));
    const availableQuestions = session.allQuestionPool.filter(
      (q: QuizQuestion) => !usedQuestionIds.includes(q.id) && q.difficulty === session.difficulty
    );

    let newQuestion: QuizQuestion;

    if (availableQuestions.length > 0) {
      // Pick a random unused question
      const sourceQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      newQuestion = {
        ...sourceQ,
        id: `prac-${sourceQ.id}-${Date.now()}`,
        options: sourceQ.options?.map(opt => ({
          ...opt,
          question_id: `prac-${sourceQ.id}-${Date.now()}`
        }))
      };
    } else {
      // All questions used, recycle one
      const sourceQ = session.allQuestionPool.find((q: QuizQuestion) => q.difficulty === session.difficulty);
      newQuestion = {
        ...sourceQ,
        id: `prac-${sourceQ.id}-${Date.now()}`,
        options: sourceQ.options?.map(opt => ({
          ...opt,
          question_id: `prac-${sourceQ.id}-${Date.now()}`
        }))
      };
    }

    session.questions.push(newQuestion);
    this.saveMockQuiz();

    console.log(`✨ Generated new ${session.difficulty} question`);

    return { question: newQuestion };
  }

  // Helper method to get all quiz questions for practice
  private getAllQuizQuestions(): QuizQuestion[] {
    // Return combined quiz questions from both sets
    return [...this.getQuiz1Questions(), ...this.getQuiz2Questions()];
  }

  private getQuiz1Questions(): QuizQuestion[] {
    return [
      // Easy questions about integration basics
      {
        id: "q1_1",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "What real-world analogy is used to explain integration?",
        answer_explanation: "The chapter uses driving a car with a broken speedometer as an analogy.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt1_1_1", label: "A", text: "Flying a plane", is_correct: false, question_id: "q1_1" },
          { id: "opt1_1_2", label: "B", text: "Driving a car with a broken speedometer", is_correct: true, question_id: "q1_1" },
          { id: "opt1_1_3", label: "C", text: "Counting money", is_correct: false, question_id: "q1_1" },
          { id: "opt1_1_4", label: "D", text: "Building a house", is_correct: false, question_id: "q1_1" }
        ]
      },
      {
        id: "q1_2",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "What is a Riemann Sum used for?",
        answer_explanation: "Riemann Sums approximate the area under a curve by dividing it into rectangles.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt1_2_1", label: "A", text: "Calculating derivatives", is_correct: false, question_id: "q1_2" },
          { id: "opt1_2_2", label: "B", text: "Approximating area under a curve", is_correct: true, question_id: "q1_2" },
          { id: "opt1_2_3", label: "C", text: "Solving linear equations", is_correct: false, question_id: "q1_2" },
          { id: "opt1_2_4", label: "D", text: "Finding maximum values", is_correct: false, question_id: "q1_2" }
        ]
      },
      // Standard difficulty
      {
        id: "q1_3",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "What does the integral symbol ∫ represent?",
        answer_explanation: "The integral symbol ∫ represents the sum of infinitely many infinitesimally small pieces.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt1_3_1", label: "A", text: "Multiplication", is_correct: false, question_id: "q1_3" },
          { id: "opt1_3_2", label: "B", text: "Sum of infinitely small pieces", is_correct: true, question_id: "q1_3" },
          { id: "opt1_3_3", label: "C", text: "Division", is_correct: false, question_id: "q1_3" },
          { id: "opt1_3_4", label: "D", text: "Subtraction", is_correct: false, question_id: "q1_3" }
        ]
      },
      // Hard questions
      {
        id: "q1_4",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "Why is the Fundamental Theorem of Calculus important?",
        answer_explanation: "The FTC connects differentiation and integration, showing they are inverse operations.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt1_4_1", label: "A", text: "It proves calculus exists", is_correct: false, question_id: "q1_4" },
          { id: "opt1_4_2", label: "B", text: "It connects differentiation and integration", is_correct: true, question_id: "q1_4" },
          { id: "opt1_4_3", label: "C", text: "It simplifies addition", is_correct: false, question_id: "q1_4" },
          { id: "opt1_4_4", label: "D", text: "It defines limits", is_correct: false, question_id: "q1_4" }
        ]
      }
    ];
  }

  private getQuiz2Questions(): QuizQuestion[] {
    return [
      // Easy
      {
        id: "q2_1",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "What is an antiderivative?",
        answer_explanation: "An antiderivative is a function whose derivative gives you the original function.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt2_1_1", label: "A", text: "The opposite of a derivative", is_correct: true, question_id: "q2_1" },
          { id: "opt2_1_2", label: "B", text: "A type of medicine", is_correct: false, question_id: "q2_1" },
          { id: "opt2_1_3", label: "C", text: "A geometric shape", is_correct: false, question_id: "q2_1" },
          { id: "opt2_1_4", label: "D", text: "A calculus symbol", is_correct: false, question_id: "q2_1" }
        ]
      },
      // Standard
      {
        id: "q2_2",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "What is the Power Rule for integration?",
        answer_explanation: "The Power Rule states that ∫x^n dx = x^(n+1)/(n+1) + C.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt2_2_1", label: "A", text: "∫x^n dx = nx^(n-1)", is_correct: false, question_id: "q2_2" },
          { id: "opt2_2_2", label: "B", text: "∫x^n dx = x^(n+1)/(n+1) + C", is_correct: true, question_id: "q2_2" },
          { id: "opt2_2_3", label: "C", text: "∫x^n dx = x^n", is_correct: false, question_id: "q2_2" },
          { id: "opt2_2_4", label: "D", text: "∫x^n dx = e^x", is_correct: false, question_id: "q2_2" }
        ]
      },
      // Hard
      {
        id: "q2_3",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "Why do we add a constant C when integrating?",
        answer_explanation: "We add C because derivatives of constants are zero, so we can't determine the original constant from the derivative alone.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt2_3_1", label: "A", text: "It makes the math easier", is_correct: false, question_id: "q2_3" },
          { id: "opt2_3_2", label: "B", text: "Derivatives of constants are zero", is_correct: true, question_id: "q2_3" },
          { id: "opt2_3_3", label: "C", text: "It's a mathematical tradition", is_correct: false, question_id: "q2_3" },
          { id: "opt2_3_4", label: "D", text: "C represents cost", is_correct: false, question_id: "q2_3" }
        ]
      }
    ];
  }

  // --- Mock Quiz Service ---

  async startQuiz(quizId: string): Promise<any> {
    console.log(`🚀 Starting quiz ${quizId}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Determine which quiz set to use based on quizId
    let questions: QuizQuestion[] = [];

    // QUIZ SET 1: "What Exactly *Is* An Integral? (The Big Idea)"
    const quiz1Questions: QuizQuestion[] = [
      {
        id: "q1_1",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "What real-world analogy is used to explain integration in this chapter?",
        answer_explanation: "The chapter uses driving a car with a broken speedometer as an analogy, where you know your speed at different moments but want to find the total distance traveled.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt1_1", question_id: "q1_1", label: "A", text: "Flying a plane", is_correct: false },
          { id: "opt1_2", question_id: "q1_1", label: "B", text: "Driving a car with a broken speedometer", is_correct: true },
          { id: "opt1_3", question_id: "q1_1", label: "C", text: "Swimming in a pool", is_correct: false },
          { id: "opt1_4", question_id: "q1_1", label: "D", text: "Climbing a mountain", is_correct: false }
        ]
      },
      {
        id: "q1_2",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "What is the main purpose of a Riemann Sum?",
        answer_explanation: "A Riemann Sum approximates the total by adding up the areas of rectangles, pretending the rate was constant for very short intervals.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt2_1", question_id: "q1_2", label: "A", text: "To find exact derivatives", is_correct: false },
          { id: "opt2_2", question_id: "q1_2", label: "B", text: "To approximate area under a curve using rectangles", is_correct: true },
          { id: "opt2_3", question_id: "q1_2", label: "C", text: "To calculate the slope of a tangent line", is_correct: false },
          { id: "opt2_4", question_id: "q1_2", label: "D", text: "To measure the perimeter of shapes", is_correct: false }
        ]
      },
      {
        id: "q1_3",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "What happens as the width of rectangles in a Riemann Sum approaches zero?",
        answer_explanation: "As the width approaches zero (infinitely small), the approximation becomes perfect and transforms into a definite integral - the jagged steps smooth out into a curve.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt3_1", question_id: "q1_3", label: "A", text: "The approximation becomes less accurate", is_correct: false },
          { id: "opt3_2", question_id: "q1_3", label: "B", text: "Nothing changes", is_correct: false },
          { id: "opt3_3", question_id: "q1_3", label: "C", text: "The approximation becomes perfect, forming a definite integral", is_correct: true },
          { id: "opt3_4", question_id: "q1_3", label: "D", text: "The calculation becomes impossible", is_correct: false }
        ]
      },
      {
        id: "q1_4",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "In integral notation ∫ₐᵇ f(x) dx, what does the 'dx' represent?",
        answer_explanation: "The 'dx' represents the tiny, infinitely small slice of width - an infinitesimal change in x.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt4_1", question_id: "q1_4", label: "A", text: "The derivative of x", is_correct: false },
          { id: "opt4_2", question_id: "q1_4", label: "B", text: "A tiny, infinitely small slice of width", is_correct: true },
          { id: "opt4_3", question_id: "q1_4", label: "C", text: "The double derivative", is_correct: false },
          { id: "opt4_4", question_id: "q1_4", label: "D", text: "The starting point", is_correct: false }
        ]
      },
      {
        id: "q1_5",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "What does the integral symbol ∫ represent?",
        answer_explanation: "The integral symbol ∫ looks like a stretched-out 'S' and stands for 'Sum' - it means to sum up everything.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt5_1", question_id: "q1_5", label: "A", text: "The slope of a line", is_correct: false },
          { id: "opt5_2", question_id: "q1_5", label: "B", text: "Sum (it's a stretched S)", is_correct: true },
          { id: "opt5_3", question_id: "q1_5", label: "C", text: "The starting point", is_correct: false },
          { id: "opt5_4", question_id: "q1_5", label: "D", text: "Integration constant", is_correct: false }
        ]
      },
      {
        id: "q1_6",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "In the notation ∫ₐᵇ f(x) dx, what do 'a' and 'b' represent?",
        answer_explanation: "'a' and 'b' are the limits of integration - the start and end points of the interval we're integrating over.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt6_1", question_id: "q1_6", label: "A", text: "The constants of integration", is_correct: false },
          { id: "opt6_2", question_id: "q1_6", label: "B", text: "The start and end points (limits)", is_correct: true },
          { id: "opt6_3", question_id: "q1_6", label: "C", text: "Two different functions", is_correct: false },
          { id: "opt6_4", question_id: "q1_6", label: "D", text: "Variables to be differentiated", is_correct: false }
        ]
      },
      {
        id: "q1_7",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "Which of the following is NOT mentioned as a real-world application of integrals?",
        answer_explanation: "The chapter mentions Physics (velocity to position), Engineering (center of mass), and Economics (total surplus), but not weather prediction.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt7_1", question_id: "q1_7", label: "A", text: "Physics - from velocity to position", is_correct: false },
          { id: "opt7_2", question_id: "q1_7", label: "B", text: "Weather prediction", is_correct: true },
          { id: "opt7_3", question_id: "q1_7", label: "C", text: "Engineering - calculating center of mass", is_correct: false },
          { id: "opt7_4", question_id: "q1_7", label: "D", text: "Economics - finding total surplus", is_correct: false }
        ]
      },
      {
        id: "q1_8",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "Integration is the tool we use to move from which world to which world?",
        answer_explanation: "Integration moves us from the 'instantaneous' world of rates (derivatives) back to the 'accumulated' world of totals.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt8_1", question_id: "q1_8", label: "A", text: "From totals to rates", is_correct: false },
          { id: "opt8_2", question_id: "q1_8", label: "B", text: "From rates (instantaneous) to totals (accumulated)", is_correct: true },
          { id: "opt8_3", question_id: "q1_8", label: "C", text: "From algebra to geometry", is_correct: false },
          { id: "opt8_4", question_id: "q1_8", label: "D", text: "From continuous to discrete", is_correct: false }
        ]
      },
      {
        id: "q1_9",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "If you were driving at a constant 60 mph for 2 hours, what distance would you travel?",
        answer_explanation: "At constant speed, distance = speed × time. So 60 mph × 2 hours = 120 miles. This is the simple case before we need integration.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt9_1", question_id: "q1_9", label: "A", text: "60 miles", is_correct: false },
          { id: "opt9_2", question_id: "q1_9", label: "B", text: "120 miles", is_correct: true },
          { id: "opt9_3", question_id: "q1_9", label: "C", text: "30 miles", is_correct: false },
          { id: "opt9_4", question_id: "q1_9", label: "D", text: "240 miles", is_correct: false }
        ]
      },
      {
        id: "q1_10",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "Why do we need integration for real-life situations like driving, instead of simple multiplication?",
        answer_explanation: "Real life isn't constant - you speed up, slow down, stop for traffic. Integration handles these changing rates by adding up tiny amounts over time.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt10_1", question_id: "q1_10", label: "A", text: "Because multiplication is too simple", is_correct: false },
          { id: "opt10_2", question_id: "q1_10", label: "B", text: "Because rates change (speed up, slow down, stop)", is_correct: true },
          { id: "opt10_3", question_id: "q1_10", label: "C", text: "Because we need more precision", is_correct: false },
          { id: "opt10_4", question_id: "q1_10", label: "D", text: "Because computers can't multiply", is_correct: false }
        ]
      }
    ];

    // QUIZ SET 2: "Turning Intuition into Calculation: Unlocking the Power of Integration"
    const quiz2Questions: QuizQuestion[] = [
      {
        id: "q2_1",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "What is an antiderivative?",
        answer_explanation: "An antiderivative is the result of 'undoing' differentiation - when you have the rate of change and want to find the original function.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt1_1", question_id: "q2_1", label: "A", text: "The derivative of a derivative", is_correct: false },
          { id: "opt1_2", question_id: "q2_1", label: "B", text: "The result of undoing differentiation", is_correct: true },
          { id: "opt1_3", question_id: "q2_1", label: "C", text: "The slope of a tangent line", is_correct: false },
          { id: "opt1_4", question_id: "q2_1", label: "D", text: "A negative derivative", is_correct: false }
        ]
      },
      {
        id: "q2_2",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "According to the Power Rule for integration, what is the integral of x^n (where n ≠ -1)?",
        answer_explanation: "For integration, we add one to the exponent and divide by the new exponent: (x^(n+1))/(n+1) + C",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt2_1", question_id: "q2_2", label: "A", text: "n * x^(n-1)", is_correct: false },
          { id: "opt2_2", question_id: "q2_2", label: "B", text: "(x^(n+1))/(n+1) + C", is_correct: true },
          { id: "opt2_3", question_id: "q2_2", label: "C", text: "x^(n-1)/(n-1)", is_correct: false },
          { id: "opt2_4", question_id: "q2_2", label: "D", text: "n * x^n", is_correct: false }
        ]
      },
      {
        id: "q2_3",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "Why do we always add '+C' when finding an antiderivative?",
        answer_explanation: "When you differentiate a constant, it disappears (becomes zero). So when integrating, there could have been any constant originally. The '+C' accounts for all possible original functions.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt3_1", question_id: "q2_3", label: "A", text: "Because C is required by mathematical law", is_correct: false },
          { id: "opt3_2", question_id: "q2_3", label: "B", text: "Because constants disappear during differentiation", is_correct: true },
          { id: "opt3_3", question_id: "q2_3", label: "C", text: "To make the answer look more complicated", is_correct: false },
          { id: "opt3_4", question_id: "q2_3", label: "D", text: "Only for definite integrals", is_correct: false }
        ]
      },
      {
        id: "q2_4",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "What is linearity in integration?",
        answer_explanation: "Linearity means the integral of a sum is the sum of integrals, and the integral of a constant times a function is the constant times the integral.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt4_1", question_id: "q2_4", label: "A", text: "Integration only works on straight lines", is_correct: false },
          { id: "opt4_2", question_id: "q2_4", label: "B", text: "Integrals play nicely with addition and constant multiples", is_correct: true },
          { id: "opt4_3", question_id: "q2_4", label: "C", text: "The result is always a linear function", is_correct: false },
          { id: "opt4_4", question_id: "q2_4", label: "D", text: "You can only integrate polynomials", is_correct: false }
        ]
      },
      {
        id: "q2_5",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "What is the difference between indefinite and definite integrals?",
        answer_explanation: "Indefinite integrals give a family of functions (with +C), while definite integrals give a single numerical answer representing exact area between two points.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt5_1", question_id: "q2_5", label: "A", text: "There is no difference", is_correct: false },
          { id: "opt5_2", question_id: "q2_5", label: "B", text: "Indefinite has +C and a family of functions; definite gives one number", is_correct: true },
          { id: "opt5_3", question_id: "q2_5", label: "C", text: "Indefinite is easier to calculate", is_correct: false },
          { id: "opt5_4", question_id: "q2_5", label: "D", text: "Definite integrals cannot be calculated", is_correct: false }
        ]
      },
      {
        id: "q2_6",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "How do you evaluate a definite integral using an antiderivative?",
        answer_explanation: "Evaluate the antiderivative at the upper limit and subtract its value at the lower limit. This gives a single numerical answer.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt6_1", question_id: "q2_6", label: "A", text: "Add the values at both limits", is_correct: false },
          { id: "opt6_2", question_id: "q2_6", label: "B", text: "Evaluate at upper limit minus value at lower limit", is_correct: true },
          { id: "opt6_3", question_id: "q2_6", label: "C", text: "Multiply the limits together", is_correct: false },
          { id: "opt6_4", question_id: "q2_6", label: "D", text: "Take the derivative twice", is_correct: false }
        ]
      },
      {
        id: "q2_7",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "easy",
        status: "published",
        body: "What does the Fundamental Theorem of Calculus connect?",
        answer_explanation: "The FTC connects differentiation and integration, showing they are inverse operations - two sides of the same coin.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt7_1", question_id: "q2_7", label: "A", text: "Algebra and geometry", is_correct: false },
          { id: "opt7_2", question_id: "q2_7", label: "B", text: "Differentiation and integration", is_correct: true },
          { id: "opt7_3", question_id: "q2_7", label: "C", text: "Addition and subtraction", is_correct: false },
          { id: "opt7_4", question_id: "q2_7", label: "D", text: "Limits and continuity", is_correct: false }
        ]
      },
      {
        id: "q2_8",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "According to the chapter, what does the FTC allow us to do?",
        answer_explanation: "The FTC lets us find net change (definite integral) by simply evaluating the antiderivative at start and end points - no complicated limits or infinite sums needed!",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt8_1", question_id: "q2_8", label: "A", text: "Calculate definite integrals using antiderivatives (no limits needed)", is_correct: true },
          { id: "opt8_2", question_id: "q2_8", label: "B", text: "Avoid learning integration completely", is_correct: false },
          { id: "opt8_3", question_id: "q2_8", label: "C", text: "Find derivatives faster", is_correct: false },
          { id: "opt8_4", question_id: "q2_8", label: "D", text: "Prove all mathematical theorems", is_correct: false }
        ]
      },
      {
        id: "q2_9",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "standard",
        status: "published",
        body: "The antiderivative of 2x is x² + C. Why is this correct?",
        answer_explanation: "Because the derivative of x² is 2x. We can verify an antiderivative by differentiating it - we should get back the original function.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt9_1", question_id: "q2_9", label: "A", text: "Because it looks similar", is_correct: false },
          { id: "opt9_2", question_id: "q2_9", label: "B", text: "Because the derivative of x² is 2x", is_correct: true },
          { id: "opt9_3", question_id: "q2_9", label: "C", text: "Because we multiply by 2", is_correct: false },
          { id: "opt9_4", question_id: "q2_9", label: "D", text: "It's not correct", is_correct: false }
        ]
      },
      {
        id: "q2_10",
        subchapter_id: "demo",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: "hard",
        status: "published",
        body: "What is the main message of 'From Intuition to Calculation'?",
        answer_explanation: "The chapter emphasizes that with antiderivatives and basic rules, we now have tools to calculate (not just guess) areas and reversals of rates - moving from observation to precise quantification.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_chunk_ids: [],
        additional_metadata: {},
        options: [
          { id: "opt10_1", question_id: "q2_10", label: "A", text: "Integration is too difficult to understand", is_correct: false },
          { id: "opt10_2", question_id: "q2_10", label: "B", text: "We now have tools to calculate (not guess) areas and reversals", is_correct: true },
          { id: "opt10_3", question_id: "q2_10", label: "C", text: "Intuition is more important than calculation", is_correct: false },
          { id: "opt10_4", question_id: "q2_10", label: "D", text: "Calculus should only be theoretical", is_correct: false }
        ]
      }
    ];

    // Select questions based on quizId (using modulo logic or chapter index)
    // For demo, let's map quiz IDs to question sets
    // If quizId contains "chapter-1" or is the first, use quiz1
    // If quizId contains "chapter-2" or second chapter, use quiz2
    // Default to quiz1 for backward compatibility

    if (quizId.includes("chapter-2") || quizId.includes("topic-") && quizId.split("-")[1] === "2") {
      questions = quiz2Questions;
      console.log("📚 Using Quiz Set 2: Turning Intuition into Calculation");
    } else {
      questions = quiz1Questions;
      console.log("📚 Using Quiz Set 1: What Exactly Is An Integral?");
    }

    const attemptId = `attempt-${Date.now()}`;
    const attemptState = {
      id: attemptId,
      quiz_id: quizId,
      questions: questions,
      answers: {}, // map questionId -> optionId
      current_index: 0,
      score: 0,
      status: "IN_PROGRESS",
      started_at: new Date().toISOString()
    };

    this.mockQuizState.set(attemptId, attemptState);
    this.saveMockQuiz();

    return {
      attempt_id: attemptId,
      total_questions: questions.length,
      current_index: 0,
      question: questions[0]
    };
  }

  async getCurrentQuestion(attemptId: string): Promise<any> {
    const state = this.mockQuizState.get(attemptId);
    if (!state) throw new Error("Attempt not found");

    if (state.current_index >= state.questions.length) {
      return { question: null, question_index: state.current_index, total_questions: state.questions.length };
    }

    return {
      question: state.questions[state.current_index],
      question_index: state.current_index,
      total_questions: state.questions.length
    };
  }

  async answerQuestion(attemptId: string, questionId: string, answer: string): Promise<any> {
    console.log(`📝 Answering question ${questionId} for attempt ${attemptId}`);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const state = this.mockQuizState.get(attemptId);
    if (!state) throw new Error("Attempt not found");

    const question = state.questions.find((q: QuizQuestion) => q.id === questionId);
    if (!question) throw new Error("Question not found");

    const selectedOption = question.options?.find((o: any) => o.id === answer);
    const isCorrect = selectedOption?.is_correct || false;

    // Record answer
    state.answers[questionId] = {
      answer_id: answer,
      is_correct: isCorrect
    };

    // Move to next
    state.current_index += 1;
    if (state.current_index >= state.questions.length) {
      state.status = "COMPLETED";
    }

    this.saveMockQuiz();

    // Prepare response
    const nextQ = state.current_index < state.questions.length ? state.questions[state.current_index] : null;

    return {
      is_correct: isCorrect,
      explanation: isCorrect ? "Correct! " + question.answer_explanation : "Incorrect. " + question.answer_explanation,
      correct_answer: question.options?.find((o: any) => o.is_correct)?.id,
      next_question: nextQ,
      all_questions_answered: state.current_index >= state.questions.length
    };
  }

  async getQuizSummary(attemptId: string): Promise<QuizSummary> {
    const state = this.mockQuizState.get(attemptId);
    if (!state) throw new Error("Attempt not found");

    let correctCount = 0;
    const wrongQuestions: any[] = [];

    state.questions.forEach((q: QuizQuestion) => {
      const ans = state.answers[q.id];
      if (ans && ans.is_correct) {
        correctCount++;
      } else {
        wrongQuestions.push({
          question_id: q.id,
          question_text: q.body,
          your_answer: q.options?.find((o: any) => o.id === ans?.answer_id)?.text || "No Answer",
          correct_answer: q.options?.find((o: any) => o.is_correct)?.text || "Unknown",
          explanation: q.answer_explanation,
          recommended_difficulty: "standard"
        });
      }
    });

    const percentage = Math.round((correctCount / state.questions.length) * 100);

    return {
      attempt_id: attemptId,
      score: correctCount,
      total: state.questions.length,
      percentage: percentage,
      wrong_questions: wrongQuestions,
      remediation_required: wrongQuestions.length > 0
    };
  }

  async chooseRemedialDifficulty(attemptId: string, questionId: string, difficulty: Difficulty): Promise<any> {
    // Generate a mock remedial question
    await new Promise(resolve => setTimeout(resolve, 600));

    const remedialId = `rem-${Date.now()}`;

    // Initialize remediation tracking state
    if (!this.mockQuizState.has("remediation_tracking")) {
      this.mockQuizState.set("remediation_tracking", new Map());
    }
    const tracking = this.mockQuizState.get("remediation_tracking") as Map<string, any>;

    tracking.set(remedialId, {
      attemptId,
      questionId,
      difficulty,
      correctCount: 0,
      required: 2,
      currentQuestionNum: 1
    });

    this.saveMockQuiz();

    // Generate first remedial question
    const question = this.generateRemedialQuestion(1, difficulty, questionId);

    return {
      remedial_id: remedialId,
      difficulty: difficulty,
      progress: { completed: 0, required: 2 },
      question: question
    };
  }

  // Helper to generate remedial questions specific to each main question
  private generateRemedialQuestion(questionNum: number, difficulty: Difficulty, originalQuestionId: string): QuizQuestion {
    const difficultyLabel = difficulty === "easy" ? "EASY" : difficulty === "standard" ? "MEDIUM" : "HARD";
    const questionId = `rem-q-${Date.now()}-${questionNum}`;

    // Remedial question banks for each original question
    // Each question has 6 remedial variations (2 for each difficulty level)
    const remedialBanks: Record<string, any> = {
      // QUIZ 1 REMEDIAL QUESTIONS
      "q1_1": { // Original: "What real-world analogy is used to explain integration?"
        easy: [
          {
            body: `[${difficultyLabel}] What was the problem with the speedometer in the car analogy?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "It was too fast", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "It was broken", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "It was too slow", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "It was missing", is_correct: false }
            ],
            explanation: "The analogy uses a broken speedometer - you know your speed at different times but want to find total distance traveled."
          },
          {
            body: `[${difficultyLabel}] In the car analogy, what are you trying to find?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "The speed at one moment", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "The total distance traveled", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "The time elapsed", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "The fuel consumption", is_correct: false }
            ],
            explanation: "You know speeds at various moments and want to find how far you've traveled total - this is what integration does."
          }
        ],
        standard: [
          {
            body: `[${difficultyLabel}] Why is the car analogy helpful for understanding integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "Cars use calculus in their engines", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "It shows how rates (speed) accumulate into totals (distance)", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "Everyone drives cars", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "It simplifies the math", is_correct: false }
            ],
            explanation: "The analogy demonstrates integration's core purpose: converting changing rates into accumulated totals."
          },
          {
            body: `[${difficultyLabel}] What does 'speed at various moments' represent in integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "The constant C", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "The function being integrated (the rate)", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "The limits of integration", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "The antiderivative", is_correct: false }
            ],
            explanation: "Speed at different times is like the function f(x) - the rate we're integrating to find the total."
          }
        ],
        hard: [
          {
            body: `[${difficultyLabel}] How does varying speed in the car analogy relate to integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "It shows why simple multiplication doesn't work for changing rates", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "It demonstrates that integration handles non-constant functions by summing infinitesimals", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "It proves cars need speedometers", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "It shows integration is impossible", is_correct: false }
            ],
            explanation: "Varying speed (non-constant rate) requires integration - adding up infinitely many tiny distance=speed×time calculations."
          },
          {
            body: `[${difficultyLabel}] If speed is constant at 50 mph for 3 hours, do you need integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "Yes, always", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "No, simple multiplication works (50×3=150 miles), but integration gives the same answer", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "No, integration only works for non-constant rates", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "Yes, multiplication is never sufficient", is_correct: false }
            ],
            explanation: "For constant rates, multiplication and integration give the same result. Integration's power shows with varying rates."
          }
        ]
      },

      // Generic fallback - used for all questions for simplicity in demo
      "generic": {
        easy: [
          {
            body: `[${difficultyLabel}] What is the basic idea behind integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "Finding the slope", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "Adding up tiny pieces to find a total", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "Multiplying variables", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "Dividing functions", is_correct: false }
            ],
            explanation: "Integration is about summing up infinitely many tiny pieces to find totals like area or accumulated change."
          },
          {
            body: `[${difficultyLabel}] Which symbol represents integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "d/dx", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "∫ (integral sign)", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "Σ (sigma)", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "lim", is_correct: false }
            ],
            explanation: "The integral sign ∫ represents integration - it looks like a stretched 'S' for 'Sum'."
          }
        ],
        standard: [
          {
            body: `[${difficultyLabel}] What is the relationship between differentiation and integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "They are unrelated", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "They are inverse operations", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "They are the same operation", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "Integration is faster", is_correct: false }
            ],
            explanation: "Integration and differentiation are inverse operations - integration undoes differentiation and vice versa."
          },
          {
            body: `[${difficultyLabel}] How does the Power Rule work for integration?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "Subtract 1 from exponent, multiply", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "Add 1 to exponent, divide by new exponent", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "Square the exponent", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "Keep exponent the same", is_correct: false }
            ],
            explanation: "For the Power Rule in integration, we add 1 to the exponent and divide by that new exponent."
          }
        ],
        hard: [
          {
            body: `[${difficultyLabel}] Why do we add '+C' to indefinite integrals?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "It's tradition", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "Constants vanish when differentiating, so any constant could have been there", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "To make it harder", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "Only for polynomials", is_correct: false }
            ],
            explanation: "When differentiating, constants become zero and disappear. So when integrating, we add '+C' to represent any possible constant that could have been in the original function."
          },
          {
            body: `[${difficultyLabel}] What does a definite integral calculate?`,
            options: [
              { id: `rem${questionNum}_1`, question_id: questionId, label: "A", text: "A family of functions", is_correct: false },
              { id: `rem${questionNum}_2`, question_id: questionId, label: "B", text: "A specific numerical value (like area between two points)", is_correct: true },
              { id: `rem${questionNum}_3`, question_id: questionId, label: "C", text: "The derivative", is_correct: false },
              { id: `rem${questionNum}_4`, question_id: questionId, label: "D", text: "An approximation only", is_correct: false }
            ],
            explanation: "A definite integral gives us one specific number - often representing the exact area under a curve between two limits."
          }
        ]
      }
    };

    // Select the appropriate remedial bank (use specific bank if exists, otherwise generic)
    const bank = remedialBanks[originalQuestionId] || remedialBanks["generic"];
    const questionPool = bank[difficulty] || bank["standard"];
    const selected = questionPool[(questionNum - 1) % questionPool.length];

    return {
      id: questionId,
      subchapter_id: "remedial",
      source_type: "ai_generated",
      question_type: "multiple_choice",
      difficulty: difficulty,
      status: "published",
      body: selected.body,
      answer_explanation: selected.explanation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_chunk_ids: [],
      additional_metadata: {},
      options: selected.options
    };
  }

  async submitRemedialAnswer(remedialId: string, answer: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const tracking = this.mockQuizState.get("remediation_tracking") as Map<string, any>;
    const remedialState = tracking?.get(remedialId);

    if (!remedialState) {
      throw new Error("Remediation session not found");
    }

    // Check if answer is correct
    const isCorrect = answer.includes("_2"); // Our correct answers are always option 2

    // Update progress
    if (isCorrect) {
      remedialState.correctCount++;
    }

    const completed = remedialState.correctCount;
    const required = remedialState.required;
    const remediationComplete = completed >= required;

    // Generate next question if needed
    let nextQuestion = null;
    if (!remediationComplete) {
      remedialState.currentQuestionNum++;
      nextQuestion = this.generateRemedialQuestion(
        remedialState.currentQuestionNum,
        remedialState.difficulty,
        remedialState.questionId
      );
    }

    this.saveMockQuiz();

    return {
      is_correct: isCorrect,
      explanation: isCorrect ?
        "Excellent! You got it right." :
        "Not quite. Let's try another question to reinforce this concept.",
      progress: {
        completed: completed,
        required: required
      },
      remedial_completed: remediationComplete,
      next_question: nextQuestion
    };
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
    console.log(`✨ Mock generate video for subchapter ${subchapterId}`);

    // Artificial delay (15 seconds)
    console.log("⏳ Simulating video generation delay...");
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Update mock state
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      for (const topic of topics) {
        const sub = topic.subchapters?.find(s => s.id === subchapterId);
        if (sub) {
          sub.video_status = "COMPLETED";
          sub.video_progress = 100;
          this.saveMockState();
          return Promise.resolve({ success: true, message: "Video generated successfully (mock)" });
        }
      }
    }

    // Fallback if not found in mock state (or just return success for stateless)
    return Promise.resolve({ success: true, message: "Video generated successfully (fallback)" });
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
  async getEnrolledSyllabi(): Promise<any[]> {
    const user = this.getCurrentUser();

    // If student, return only "enrolled" mock syllabi
    if (user?.role === "STUDENT") {
      const studentEmail = user.email.trim().toLowerCase();
      console.log(`🎓 [getEnrolledSyllabi] Fetching for student: '${studentEmail}'`);
      console.log(`🧠 [getEnrolledSyllabi] Current mockStudentState keys:`, Array.from(this.mockStudentState.keys()));

      const enrolledSyllabusIds = new Set<string>();

      // Check mock state for enrollments by EMAIL
      // We iterate through the map of [syllabusId, Student[]]
      for (const [syllabusId, students] of this.mockStudentState.entries()) {
        // Case-insensitive email check
        const isEnrolled = students.some(s => {
          const match = s.email.trim().toLowerCase() === studentEmail;
          // if (match) console.log(`✅ Match found in syllabus ${syllabusId} for ${s.email}`);
          return match;
        });

        if (isEnrolled) {
          enrolledSyllabusIds.add(syllabusId);
        }
      }

      console.log("📚 [getEnrolledSyllabi] Found enrolled IDs:", Array.from(enrolledSyllabusIds));

      if (enrolledSyllabusIds.size === 0) {
        // console.warn("⚠️ No enrollments found for this student.");
        return [];
      }

      // Fetch each syllabus individually by ID
      // This is necessary because getSyllabi() likely only returns *owned* files
      const syllabiPromises = Array.from(enrolledSyllabusIds).map(async (id) => {
        try {
          // Try to fetch real details
          console.log(`🔄 [getEnrolledSyllabi] Fetching details for ${id}`);
          return await this.getSyllabus(id);
        } catch (e) {
          console.warn(`⚠️ Failed to fetch syllabus ${id} details (might be restricted or deleted):`, e);
          // Fallback: If we can't fetch it, we can't show it properly.
          // OR we could return a placeholder if we really wanted to persist the "enrollment"
          // For now, let's omit it or return a mock.
          return null;
        }
      });

      const results = await Promise.all(syllabiPromises);
      const filtered = results.filter(s => s !== null);

      console.log(`📚 Returning ${filtered.length} enrolled syllabi (fetched individually)`);
      return filtered;
    }

    return this.getSyllabi();
  }
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
    // MOCK ADD STUDENT
    const emailToAdd = studentEmail.trim();
    console.log(`➕ Adding student '${emailToAdd}' to syllabus ${syllabusId}`);

    const students = this.mockStudentState.get(syllabusId) || [];

    // Check if already exists
    if (students.find(s => s.email.toLowerCase() === emailToAdd.toLowerCase())) {
      console.log("⚠️ Student already invited");
      return { success: true, message: "Student already invited" };
    }

    const newStudent: User = {
      id: `student-${Date.now()}`,
      email: emailToAdd,
      first_name: emailToAdd.split("@")[0],
      last_name: "",
      role: "STUDENT",
      school_id: "default",
      preferred_language: "en",
      is_active: false, // Invited but not active
      created_at: new Date().toISOString()
    };

    students.push(newStudent);
    this.mockStudentState.set(syllabusId, students);
    this.saveMockStudents();
    console.log(`✅ Saved mock students for syllabus ${syllabusId}. Count: ${students.length}`);

    return { success: true, message: "Student invited successfully" };
  }

  async getSyllabusStudents(syllabusId: string): Promise<User[]> {
    if (this.mockStudentState.has(syllabusId)) {
      return this.mockStudentState.get(syllabusId)!;
    }
    // Return empty if not found
    return [];
  }

  async removeStudentFromSyllabus(syllabusId: string, studentId: string): Promise<any> {
    const students = this.mockStudentState.get(syllabusId) || [];
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      students.splice(index, 1);
      this.saveMockStudents();
    }
    return { success: true };
  }


  async getSyllabusStats(syllabusId: string): Promise<any> {
    return this.request(`/ api / v1 / pdfs / ${syllabusId}/stats`);
  }

  // --- Gamification & Analytics (Mocked) ---

  async getLeaderboard(syllabusId: string): Promise<(StudentStats & { student: GamifiedStudent })[]> {
    console.log(`🏆 Fetching leaderboard for ${syllabusId}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const stats = calculateLeaderboard();

    // Join with student details
    return stats.map(stat => {
      const student = MOCK_STUDENTS.find(s => s.id === stat.student_id);
      return {
        ...stat,
        student: student!
      };
    });
  }

  async getClassAnalytics(syllabusId: string): Promise<any> {
    console.log(`📊 Fetching analytics for ${syllabusId}`);
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      dailyActivity: getDailyActivityStats(),
      masteryByTopic: [
        { topic: 'Number', avgScore: 85, difficulty: 'Medium' },
        { topic: 'Algebra', avgScore: 62, difficulty: 'Hard' },
        { topic: 'Geometry', avgScore: 78, difficulty: 'Medium' },
        { topic: 'Probability', avgScore: 92, difficulty: 'Easy' },
        { topic: 'Calculus', avgScore: 45, difficulty: 'Extra Hard' },
      ]
    };
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

  async getSubchapterBadges(subchapterId: string): Promise<BadgeDefinition[]> { return [] }
  async createBadge(subchapterId: string, badge: any): Promise<BadgeDefinition> { throw new Error("Not implemented") }
  async updateBadge(badgeId: string, badge: any): Promise<BadgeDefinition> { throw new Error("Not implemented") }
  async deleteBadge(badgeId: string): Promise<void> { }
  async awardBadgeToStudent(badgeId: string, studentId: string): Promise<StudentBadge> { throw new Error("Not implemented") }

  async requestPersonalizedSection(subchapterId: string, request: any): Promise<ContentSection> { throw new Error("Not implemented") }
  async trackSectionView(subchapterId: string, sectionId: string): Promise<void> { }

  // --- Quiz Service Methods ---

  async startQuiz(quizId: string): Promise<any> {
    console.log(`🚀 Starting quiz ${quizId}`);
    await new Promise(resolve => setTimeout(resolve, 800));

    // ✅ DETECT QUIZ TYPE: Is this a topic quiz or a lesson quiz?
    let isTopicQuiz = false;

    // Check if quizId matches a topic ID
    for (const [sId, topics] of this.mockSyllabusState.entries()) {
      if (topics.find(t => t.id === quizId)) {
        isTopicQuiz = true;
        console.log(`🎯 Detected TOPIC quiz for: ${quizId}`);
        break;
      }
    }

    if (!isTopicQuiz) {
      console.log(`📝 Detected LESSON quiz for: ${quizId}`);
    }

    // ✅ GENERATE APPROPRIATE QUESTIONS based on quiz type
    const questions = isTopicQuiz
      ? this.getTopicQuizQuestions(quizId)      // Topic-level comprehensive questions
      : this.getIntegralsQuizQuestions(quizId); // Lesson-specific questions

    const attemptId = `attempt-${Date.now()}`;
    const attemptState = {
      id: attemptId,
      quiz_id: quizId,
      quiz_type: isTopicQuiz ? 'TOPIC' : 'LESSON',  // Track type for reference
      questions: questions,
      answers: {},
      current_index: 0,
      score: 0,
      status: "IN_PROGRESS",
      started_at: new Date().toISOString()
    };

    this.mockQuizState.set(attemptId, attemptState);
    this.saveMockQuiz();

    console.log(`✅ Started ${isTopicQuiz ? 'TOPIC' : 'LESSON'} quiz with ${questions.length} questions`);

    return {
      attempt_id: attemptId,
      total_questions: questions.length,
      current_index: 0,
      question: questions[0]
    };
  }

  async getCurrentQuestion(attemptId: string): Promise<any> {
    const state = this.mockQuizState.get(attemptId);
    if (!state) throw new Error("Attempt not found");

    if (state.current_index >= state.questions.length) {
      return { question: null, question_index: state.current_index, total_questions: state.questions.length };
    }

    return {
      question: state.questions[state.current_index],
      question_index: state.current_index,
      total_questions: state.questions.length
    };
  }

  async answerQuestion(attemptId: string, questionId: string, answer: string): Promise<any> {
    console.log(`📝 Answering question ${questionId} for attempt ${attemptId}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const state = this.mockQuizState.get(attemptId);
    if (!state) throw new Error("Attempt not found");

    const question = state.questions.find((q: QuizQuestion) => q.id === questionId);
    if (!question) throw new Error("Question not found");

    const selectedOption = question.options?.find((o: any) => o.id === answer);
    const isCorrect = selectedOption?.is_correct || false;

    state.answers[questionId] = {
      answer_id: answer,
      is_correct: isCorrect
    };

    state.current_index += 1;
    if (state.current_index >= state.questions.length) {
      state.status = "COMPLETED";
    }

    this.saveMockQuiz();

    const nextQ = state.current_index < state.questions.length ? state.questions[state.current_index] : null;

    return {
      is_correct: isCorrect,
      explanation: question.answer_explanation,
      correct_answer: question.options?.find((o: any) => o.is_correct)?.id,
      next_question: nextQ,
      all_questions_answered: state.current_index >= state.questions.length
    };
  }

  async getQuizSummary(attemptId: string): Promise<QuizSummary> {
    const state = this.mockQuizState.get(attemptId);
    if (!state) throw new Error("Attempt not found");

    let correctCount = 0;
    const wrongQuestions: any[] = [];

    state.questions.forEach((q: QuizQuestion) => {
      const ans = state.answers[q.id];
      if (ans && ans.is_correct) {
        correctCount++;
      } else {
        wrongQuestions.push({
          question_id: q.id,
          question_text: q.body,
          your_answer: q.options?.find((o: any) => o.id === ans?.answer_id)?.text || "No Answer",
          correct_answer: q.options?.find((o: any) => o.is_correct)?.text || "Unknown",
          explanation: q.answer_explanation,
          recommended_difficulty: "standard"
        });
      }
    });

    const percentage = Math.round((correctCount / state.questions.length) * 100);

    return {
      attempt_id: attemptId,
      score: correctCount,
      total: state.questions.length,
      percentage: percentage,
      wrong_questions: wrongQuestions,
      remediation_required: wrongQuestions.length > 0
    };
  }

  async chooseRemedialDifficulty(attemptId: string, questionId: string, difficulty: Difficulty): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      remedial_id: `rem-${Date.now()}`,
      difficulty: difficulty,
      progress: { completed: 0, required: 2 },
      question: {
        id: `rem-q-${Date.now()}`,
        subchapter_id: "remedial",
        source_type: "ai_generated",
        question_type: "multiple_choice",
        difficulty: difficulty,
        status: "published",
        body: `[Remedial ${difficulty}] Let's practice: What is the integral of 2x?`,
        answer_explanation: "Using the power rule: ∫2x dx = 2(x²/2) + C = x² + C",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        options: [
          { id: "r1", label: "A", text: "2", is_correct: false },
          { id: "r2", label: "B", text: "x² + C", is_correct: true },
          { id: "r3", label: "C", text: "2x²", is_correct: false },
          { id: "r4", label: "D", text: "x + C", is_correct: false }
        ]
      }
    };
  }

  async submitRemedialAnswer(remedialId: string, answer: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const isCorrect = answer === "r2";

    return {
      is_correct: isCorrect,
      explanation: isCorrect ? "Perfect! You've mastered this concept." : "Not quite. Remember the power rule: add 1 to exponent, divide by new exponent.",
      progress: {
        completed: isCorrect ? 1 : 0,
        required: 2
      },
      remedial_completed: isCorrect,
      next_question: null
    };
  }

  async startPracticeSession(chapterId: string, difficulty: Difficulty): Promise<PracticeSession> {
    console.log(`🎯 Starting practice session for ${chapterId} with difficulty ${difficulty}`);
    await new Promise(resolve => setTimeout(resolve, 800));

    const questions: QuizQuestion[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `prac-q-${Date.now()}-${i}`,
      subchapter_id: chapterId,
      source_type: "ai_generated",
      question_type: "multiple_choice",
      difficulty: difficulty,
      status: "published",
      body: `[Practice ${difficulty}] Question ${i + 1}: Find ∫x${i+1} dx`,
      answer_explanation: `Using the power rule: ∫x${i+1} dx = x${i+2}/${i+2} + C`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_chunk_ids: [],
      additional_metadata: {},
      options: [
        { id: "p1", label: "A", text: `x${i+2}/${i+2} + C`, is_correct: true, question_id: `prac-q-${Date.now()}-${i}` },
        { id: "p2", label: "B", text: `${i+1}x${i}`, is_correct: false, question_id: `prac-q-${Date.now()}-${i}` },
        { id: "p3", label: "C", text: `x${i+2} + C`, is_correct: false, question_id: `prac-q-${Date.now()}-${i}` },
        { id: "p4", label: "D", text: `x${i+1}`, is_correct: false, question_id: `prac-q-${Date.now()}-${i}` }
      ]
    }));

    const sessionId = `prac-session-${Date.now()}`;
    const sessionState = {
      id: sessionId,
      chapter_id: chapterId,
      questions: questions,
      answers: {},
      correct_count: 0
    };

    if (!this.mockQuizState.has("practice_sessions")) {
      this.mockQuizState.set("practice_sessions", new Map());
    }
    const sessions = this.mockQuizState.get("practice_sessions") as Map<string, any>;
    sessions.set(sessionId, sessionState);
    this.saveMockQuiz();

    return {
      session_id: sessionId,
      questions: questions,
      quiz_context_used: false
    };
  }

  async submitPracticeAnswer(sessionId: string, questionId: string, answer: string): Promise<PracticeAnswerResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const sessions = this.mockQuizState.get("practice_sessions") as Map<string, any>;
    const session = sessions?.get(sessionId);

    if (!session) throw new Error("Session not found");

    const question = session.questions.find((q: QuizQuestion) => q.id === questionId);
    const isCorrect = question.options?.find((o: any) => o.id === answer)?.is_correct || false;

    session.answers[questionId] = { answer, isCorrect };
    if (isCorrect) session.correct_count++;

    this.saveMockQuiz();

    return {
      is_correct: isCorrect,
      explanation: isCorrect ? "Correct! Well done." : "Incorrect. Try to review the power rule concept.",
      correct_answer: question.options?.find((o: any) => o.is_correct)?.id,
      questions_completed: Object.keys(session.answers).length,
      total_correct: session.correct_count,
      next_question: Object.keys(session.answers).length < session.questions.length ? session.questions[Object.keys(session.answers).length] : undefined
    };
  }
}

export const apiClient = new ApiClient(MANAGER_URL)
