'use client'
import { useState } from 'react'
import { FileUploader } from '@/components/updates/FileUploader'
import { UrlFetcher } from '@/components/updates/UrlFetcher'
import { ExtractedTextPreview } from '@/components/updates/ExtractedTextPreview'
import { ExamGenerator } from '@/components/updates/ExamGenerator'
import { ExamLink } from '@/components/updates/ExamLink'
import { FileText, Upload, Link } from 'lucide-react'

type Step = 'upload' | 'preview' | 'generate' | 'done'
type InputMode = 'file' | 'url'

export default function UpdatesPage() {
  const [step, setStep] = useState<Step>('upload')
  const [mode, setMode] = useState<InputMode>('file')
  const [documentId, setDocumentId] = useState<number>(0)
  const [preview, setPreview] = useState({ charCount: 0, text: '' })
  const [shareToken, setShareToken] = useState('')

  function handleUploaded(data: { documentId: number; charCount: number; preview: string }) {
    setDocumentId(data.documentId)
    setPreview({ charCount: data.charCount, text: data.preview })
    setStep('preview')
  }

  function reset() {
    setStep('upload')
    setDocumentId(0)
    setPreview({ charCount: 0, text: '' })
    setShareToken('')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Updates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload a document or paste a link to generate an exam for your team
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['upload', 'preview', 'generate', 'done'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? 'bg-primary text-primary-foreground'
                : (['upload', 'preview', 'generate', 'done'].indexOf(step) > i)
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {i + 1}
            </div>
            {i < 3 && <div className="h-px w-8 bg-muted" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground capitalize">{step === 'done' ? 'Complete' : step}</span>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        {step === 'upload' && (
          <>
            {/* Mode toggle */}
            <div className="flex border-b">
              <button
                onClick={() => setMode('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  mode === 'file'
                    ? 'bg-primary/5 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
              <button
                onClick={() => setMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  mode === 'url'
                    ? 'bg-primary/5 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Link className="h-4 w-4" />
                From URL
              </button>
            </div>
            <div className="p-6">
              {mode === 'file'
                ? <FileUploader onUploaded={handleUploaded} />
                : <UrlFetcher onFetched={handleUploaded} />
              }
            </div>
          </>
        )}

        {step === 'preview' && (
          <div className="p-6">
            <ExtractedTextPreview
              preview={preview.text}
              charCount={preview.charCount}
              onConfirm={() => setStep('generate')}
            />
          </div>
        )}
        {step === 'generate' && (
          <div className="p-6">
            <ExamGenerator
              documentId={documentId}
              onGenerated={token => { setShareToken(token); setStep('done') }}
            />
          </div>
        )}
        {step === 'done' && (
          <div className="p-6">
            <ExamLink shareToken={shareToken} onReset={reset} />
          </div>
        )}
      </div>
    </div>
  )
}
