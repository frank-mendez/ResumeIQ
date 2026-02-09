import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '~/lib/supabase.client'
import { uploadResume, extractResumeText, analyzeResume } from '~/utils/resume.server'
import { LoadingSpinner } from '~/components/LoadingSpinner'

export const Route = createFileRoute('/_authenticated/dashboard/upload' as any)({
  component: UploadResume,
})

function UploadResume() {
  const user = { id: 'user-id', email: 'user@example.com' } // Placeholder
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (
        !selectedFile.type.includes('pdf') &&
        !selectedFile.type.includes('docx') &&
        !selectedFile.type.includes('document')
      ) {
        setError('Please upload a PDF or DOCX file')
        return
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setUploading(true)
    setError('')

    try {
      const supabase = getSupabaseBrowserClient()

      // Upload file to Supabase Storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save resume metadata to database
      const resume = await uploadResume({
        data: {
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          filePath,
        },
      })

      setUploading(false)
      setAnalyzing(true)

      // Extract text from resume
      await extractResumeText({ data: { resumeId: resume.id } })

      // Run AI analysis
      await analyzeResume({ data: { resumeId: resume.id } })

      setSuccess(true)
      setAnalyzing(false)
      
      // Redirect to resume detail after 2 seconds
      setTimeout(() => {
        window.location.href = `/dashboard/resumes/${resume.id}`
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume')
      setUploading(false)
      setAnalyzing(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Upload Resume</h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select your resume file (PDF or DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            disabled={uploading || analyzing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>

        {file && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>File:</strong> {file.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-sm text-gray-700">
              <strong>Type:</strong> {file.type}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Resume uploaded and analyzed successfully! Redirecting...
            </p>
          </div>
        )}

        {analyzing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-3">
              <LoadingSpinner />
              <p className="text-sm text-blue-800">
                Analyzing your resume with AI... This may take a few moments.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading || analyzing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? 'Uploading...'
            : analyzing
            ? 'Analyzing...'
            : 'Upload and Analyze'}
        </button>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your resume will be securely stored and
            analyzed using AI. The analysis typically takes 10-30 seconds.
          </p>
        </div>
      </div>
    </div>
  )
}
