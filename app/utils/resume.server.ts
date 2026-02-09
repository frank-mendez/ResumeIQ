import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { createSupabaseServerClient } from '~/lib/supabase.server'
import type { ResumeAnalysisResult } from '~/types'

// Schema for resume upload
const uploadResumeSchema = z.object({
  filename: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  filePath: z.string(),
})

// Server function to upload resume
export const uploadResume = createServerFn({ method: 'POST' })
  .validator(uploadResumeSchema)
  .handler(async ({ data, context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Insert resume record
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        filename: data.filename,
        file_path: data.filePath,
        file_type: data.fileType,
        file_size: data.fileSize,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save resume: ${error.message}`)
    }

    return resume
  })

// Server function to extract text from resume
export const extractResumeText = createServerFn({ method: 'POST' })
  .validator(z.object({ resumeId: z.string() }))
  .handler(async ({ data, context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', data.resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      throw new Error('Resume not found')
    }

    // TODO: Implement actual text extraction from file
    // For now, this is stubbed
    const extractedText = `[STUBBED] Extracted text from ${resume.filename}
    
This is a placeholder for the actual text extraction functionality.
In production, this would:
1. Download the file from Supabase Storage
2. Extract text using pdf-parse (for PDFs) or mammoth (for DOCX)
3. Return the extracted text for AI analysis

Sample resume content would appear here...`

    // Update resume with extracted text
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ extracted_text: extractedText })
      .eq('id', data.resumeId)

    if (updateError) {
      throw new Error('Failed to update resume with extracted text')
    }

    return { text: extractedText }
  })

// Server function to analyze resume with AI
export const analyzeResume = createServerFn({ method: 'POST' })
  .validator(z.object({ resumeId: z.string() }))
  .handler(async ({ data, context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get resume with extracted text
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', data.resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      throw new Error('Resume not found')
    }

    if (!resume.extracted_text) {
      throw new Error('Resume text not extracted yet')
    }

    // TODO: Implement actual AI analysis using OpenAI or similar
    // For now, this is stubbed with realistic mock data
    const analysisResult: ResumeAnalysisResult = {
      ats_score: 75,
      strengths: [
        'Clear work experience with quantifiable achievements',
        'Relevant technical skills listed',
        'Professional formatting and structure',
        'Good use of action verbs',
      ],
      weaknesses: [
        'Missing keywords for target industry',
        'Limited description of leadership experience',
        'No mention of certifications or training',
      ],
      suggestions: [
        'Add more industry-specific keywords to improve ATS compatibility',
        'Include metrics and numbers to quantify achievements',
        'Highlight relevant certifications and professional development',
        'Optimize formatting for better ATS parsing',
        'Add a professional summary at the top',
      ],
      keywords: [
        'project management',
        'team leadership',
        'agile',
        'software development',
        'stakeholder communication',
      ],
    }

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        resume_id: resume.id,
        user_id: user.id,
        ats_score: analysisResult.ats_score,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        suggestions: analysisResult.suggestions,
        keywords: analysisResult.keywords,
        raw_analysis: analysisResult as any,
      })
      .select()
      .single()

    if (analysisError) {
      throw new Error('Failed to save analysis')
    }

    return analysis
  })

// Server function to get user's resumes
export const getUserResumes = createServerFn({ method: 'GET' }).handler(
  async ({ context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch resumes')
    }

    return resumes
  }
)

// Server function to get resume analyses
export const getResumeAnalyses = createServerFn({ method: 'POST' })
  .validator(z.object({ resumeId: z.string() }))
  .handler(async ({ data, context }) => {
    const headers = context.request.headers
    const supabase = createSupabaseServerClient(headers)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('resume_id', data.resumeId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch analyses')
    }

    return analyses
  })
