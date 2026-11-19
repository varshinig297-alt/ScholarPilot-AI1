
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  UploadCloud,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  X,
  Layers,
  BookOpen,
  HardDrive,
  Clock3,
  ChevronDown,
} from 'lucide-react'
import axios from 'axios'

import {
  uploadDocument,
  type DocumentUploadResponse,
} from '../../services/api'

const MAX_FILE_SIZE = 20 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString()
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') return detail

    return error.message || 'Unable to upload the document.'
  }

  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

export default function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DocumentUploadResponse | null>(null)
  const [showExtractedText, setShowExtractedText] = useState(true)
  const [showChunks, setShowChunks] = useState(false)

  function validateFile(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!['pdf', 'txt'].includes(extension || '')) {
      setError('Unsupported file type. Please select a PDF or TXT file.')
      return false
    }

    if (file.size === 0) {
      setError('This file is empty. Please select another file.')
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 20 MB limit.')
      return false
    }

    setError('')
    setResult(null)
    setSelectedFile(file)
    return true
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (file) validateFile(file)

    event.target.value = ''
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (file) validateFile(file)
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) return

    setIsUploading(true)
    setError('')
    setResult(null)

    try {
      const response = await uploadDocument(selectedFile)
      setResult(response)
      setSelectedFile(null)
    } catch (uploadError) {
      setError(getErrorMessage(uploadError))
    } finally {
      setIsUploading(false)
    }
  }

  function clearSelection() {
    setSelectedFile(null)
    setError('')
    setResult(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const document = result?.document
  const metadata = document?.metadata

  return (
    <section className="w-full space-y-7">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          Document intelligence
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white">
          Your academic library
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
          Upload your academic materials and transform them into
          structured, searchable knowledge for intelligent learning.
        </p>
      </div>

      <motion.div
        layout
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false)
          }
        }}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_35px_rgba(59,130,246,0.12)]'
            : 'border-slate-700 bg-slate-900/60 hover:border-blue-500/60 hover:bg-slate-900'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

        <motion.div
          animate={{ y: isDragging ? -6 : 0, scale: isDragging ? 1.05 : 1 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400"
        >
          <UploadCloud size={32} />
        </motion.div>

        <h3 className="text-xl font-semibold text-white">
          {isDragging ? 'Drop your document here' : 'Upload your documents'}
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
          Drag and drop your academic PDF or TXT files here,
          or browse your computer to select a document.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadCloud size={17} />
          Browse files
        </button>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FileText size={14} />
            PDF
          </span>
          <span className="flex items-center gap-1.5">
            <File size={14} />
            TXT
          </span>
          <span>Maximum size: 20 MB</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FileText size={23} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatFileSize(selectedFile.size)} · Ready to process
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                disabled={isUploading}
                className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Remove selected file"
              >
                <X size={18} />
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud size={17} />
                    Process document
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isUploading && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <div className="flex items-center gap-3 text-sm font-medium text-blue-300">
            <LoaderCircle size={18} className="animate-spin" />
            Your document is being processed by ScholarPilot AI...
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Extracting text and generating document chunks. Please wait.
          </p>
        </div>
      )}

      <AnimatePresence>
        {result && document && metadata && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 size={17} />
                  Document processed successfully
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Processing results
                </h3>
              </div>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase text-emerald-400">
                {metadata.processing_status}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {metadata.filename}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {metadata.file_extension.toUpperCase()} document
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  icon={<BookOpen size={17} />}
                  label="Words"
                  value={document.word_count.toLocaleString()}
                />
                <StatCard
                  icon={<Layers size={17} />}
                  label="Chunks"
                  value={document.chunk_count.toLocaleString()}
                />
                <StatCard
                  icon={<FileText size={17} />}
                  label="Pages"
                  value={document.page_count?.toLocaleString() ?? 'N/A'}
                />
                <StatCard
                  icon={<HardDrive size={17} />}
                  label="Characters"
                  value={document.character_count.toLocaleString()}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <HardDrive size={14} />
                  {formatFileSize(metadata.file_size_bytes)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 size={14} />
                  {formatDate(metadata.uploaded_at)}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
              <button
                type="button"
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <div>
                  <h4 className="font-semibold text-white">
                    Extracted document text
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Actual text extracted from your uploaded file
                  </p>
                </div>
                <ChevronDown
                  size={19}
                  className={`shrink-0 text-slate-400 transition ${
                    showExtractedText ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showExtractedText && (
                <div className="max-h-80 overflow-auto border-t border-slate-800 p-5">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-300">
                    {document.extracted_text}
                  </pre>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
              <button
                type="button"
                onClick={() => setShowChunks(!showChunks)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <div>
                  <h4 className="font-semibold text-white">
                    Document chunks
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    {document.chunk_count} processed text sections
                  </p>
                </div>
                <ChevronDown
                  size={19}
                  className={`shrink-0 text-slate-400 transition ${
                    showChunks ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showChunks && (
                <div className="space-y-3 border-t border-slate-800 p-5">
                  {document.chunks.map((chunk) => (
                    <div
                      key={chunk.chunk_id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-blue-400">
                          Chunk #{chunk.chunk_id}
                        </span>
                        <span className="text-xs text-slate-500">
                          {chunk.character_count} characters
                          {chunk.page_number !== null &&
                            ` · Page ${chunk.page_number}`}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {chunk.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-500/50 hover:bg-slate-800 hover:text-white"
            >
              Upload another document
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 text-blue-400">{icon}</div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}
