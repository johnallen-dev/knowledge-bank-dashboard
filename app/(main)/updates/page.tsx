'use client'
import { useState } from 'react'
import { FileUploader } from '@/components/updates/FileUploader'
import { ExtractedTextPreview } from '@/components/updates/ExtractedTextPreview'
import { ExamGenerator } from '@/components/updates/ExamGenerator'
import { ExamLink } from '@/components/updates/ExamLink'
import { FileText } from 'lucide-react'

type Step = 'upload' | 'preview' | 'generate' | 'done'

export default function UpdatesPage() {
  const [step, setStep] = useState<Step>('upload')
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
            Upload a document and generate an exam for your team
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

      <div className="border rounded-xl bg-card p-6 shadow-sm">
        {step === 'upload' && <FileUploader onUploaded={handleUploaded} />}
        {step === 'preview' && (
          <ExtractedTextPreview
            preview={preview.text}
            charCount={preview.charCount}
            onConfirm={() => setStep('generate')}
          />
        )}
        {step === 'generate' && (
          <ExamGenerator
            documentId={documentId}
            onGenerated={token => { setShareToken(token); setStep('done') }}
          />
        )}
        {step === 'done' && (
          <ExamLink shareToken={shareToken} onReset={reset} />
        )}
      </div>
    </div>
  )
}
