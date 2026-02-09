import type { Database } from './supabase'

export type Resume = Database['public']['Tables']['resumes']['Row']
export type ResumeInsert = Database['public']['Tables']['resumes']['Insert']
export type ResumeUpdate = Database['public']['Tables']['resumes']['Update']

export type Analysis = Database['public']['Tables']['analyses']['Row']
export type AnalysisInsert = Database['public']['Tables']['analyses']['Insert']
export type AnalysisUpdate = Database['public']['Tables']['analyses']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export interface User {
  id: string
  email: string
  created_at: string
}

export interface UploadedFile {
  name: string
  size: number
  type: string
  path: string
}

export interface ResumeAnalysisResult {
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywords: string[]
}
