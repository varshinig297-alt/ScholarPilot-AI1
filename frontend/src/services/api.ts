
import axios from 'axios'

// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE_URL = 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically attach the access token to API requests.
api.interceptors.request.use((config) => {
  const authorization = api.defaults.headers.common.Authorization

  if (typeof authorization === 'string') {
    config.headers.Authorization = authorization
  }

  return config
})

// ==========================================
// AUTHENTICATION TYPES
// ==========================================

export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  is_verified: boolean
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

// ==========================================
// AUTHENTICATION API
// ==========================================

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/api/v1/auth/login',
    { email, password },
  )

  return response.data
}

export async function registerUser(
  data: RegisterRequest,
): Promise<AuthUser> {
  const response = await api.post<AuthUser>(
    '/api/v1/auth/register',
    data,
  )

  return response.data
}

export async function refreshAuthToken(
  refreshToken: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/api/v1/auth/refresh',
    { refresh_token: refreshToken },
  )

  return response.data
}

// ==========================================
// BACKEND HEALTH
// ==========================================

export interface HealthResponse {
  success: boolean
  status: string
  service: string
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/api/v1/health')
  return response.data
}

// ==========================================
// DOCUMENT UPLOAD API
// ==========================================

export interface DocumentMetadata {
  document_id: string
  filename: string
  file_extension: string
  file_size_bytes: number
  uploaded_at: string
  page_count: number | null
  extracted_character_count: number
  processing_status: string
}

export interface DocumentChunk {
  chunk_id: number
  text: string
  character_count: number
  page_number: number | null
}

export interface ProcessedDocument {
  metadata: DocumentMetadata
  extracted_text: string
  chunks: DocumentChunk[]
  character_count: number
  word_count: number
  chunk_count: number
  page_count: number | null
}

export interface DocumentUploadResponse {
  success: boolean
  message: string
  document: ProcessedDocument
}

export async function uploadDocument(
  file: File,
): Promise<DocumentUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<DocumentUploadResponse>(
    '/api/v1/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    },
  )

  return response.data
}

// ==========================================
// AI TUTOR API
// ==========================================

export interface TutorSource {
  source_id: string
  document_id: string
  filename: string
  chunk_id: number
  page_number: number | null
  relevance_score: number
  text: string
}

export interface TutorQuestionResponse {
  success: boolean
  message: string
  answer: string
  sources: TutorSource[]
  grounded: boolean
  citation_validation: {
    valid: boolean
    has_citations: boolean
    cited_sources: string[]
    invalid_citations: string[]
    available_sources: string[]
  }
  semantic_verification: {
    verified: boolean
    status: string
    claims: unknown[]
    summary: string
    verification_method: string
  }
}

export async function askTutor(
  question: string,
  top_k: number = 4,
): Promise<TutorQuestionResponse> {
  const response = await api.post<TutorQuestionResponse>(
    '/api/v1/tutor/ask',
    {
      question,
      top_k,
    },
  )

  return response.data
}

// ==========================================
// AI QUIZ GENERATOR API
// ==========================================

export interface QuizQuestion {
  question: string
  options: string[]
  source_ids: string[]
}

export interface QuizSource {
  source_id: string
  document_id: string
  filename: string
  chunk_id: number
  page_number: number | null
  relevance_score: number
  text: string
}

export interface QuizGenerateResponse {
  success: boolean
  quiz_id: string
  topic: string
  total_questions: number
  questions: QuizQuestion[]
  sources: QuizSource[]
}

export interface QuizResult {
  question: string
  selected_answer: string | null
  correct_answer: string
  is_correct: boolean
  explanation: string
  source_ids: string[]
}

export interface QuizSubmitResponse {
  success: boolean
  message: string
  score: number
  total_questions: number
  percentage: number
  results: QuizResult[]
}

export async function generateQuiz(
  topic: string,
  numQuestions: number = 5,
): Promise<QuizGenerateResponse> {
  const response = await api.post<QuizGenerateResponse>(
    '/api/v1/quiz/generate',
    {
      topic,
      num_questions: numQuestions,
    },
  )

  return response.data
}

export async function submitQuiz(
  quizId: string,
  answers: Record<number, string>,
): Promise<QuizSubmitResponse> {
  const response = await api.post<QuizSubmitResponse>(
    '/api/v1/quiz/submit',
    {
      quiz_id: quizId,
      answers,
    },
  )

  return response.data
}

// ==========================================
// QUIZ HISTORY AND LEARNING ANALYTICS API
// ==========================================

export interface QuizAttempt {
  id: number
  quiz_id: string
  topic: string
  score: number
  total_questions: number
  percentage: number
  created_at: string
  results: QuizResult[]
}

export interface QuizHistoryResponse {
  success: boolean
  total: number
  attempts: QuizAttempt[]
}

export interface QuizAnalytics {
  total_attempts: number
  total_correct: number
  total_questions: number
  average_percentage: number
}

export interface QuizAnalyticsResponse {
  success: boolean
  analytics: QuizAnalytics
}

// Fetch previously completed quiz attempts.
export async function getQuizHistory(
  limit: number = 50,
): Promise<QuizHistoryResponse> {
  const response = await api.get<QuizHistoryResponse>(
    '/api/v1/quiz/history',
    {
      params: { limit },
    },
  )

  return response.data
}

// Fetch overall learning performance.
export async function getQuizAnalytics(): Promise<QuizAnalyticsResponse> {
  const response = await api.get<QuizAnalyticsResponse>(
    '/api/v1/quiz/analytics',
  )

  return response.data
}
