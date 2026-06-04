'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Download, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SafeQuestion } from './QuestionRenderer'

function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

interface BreakdownItem { questionId: string; correct: boolean; given: string; expected: string }

interface Props {
  score: number
  maxScore: number
  examineeName: string
  examDate: string
  durationSeconds: number
  questions: SafeQuestion[]
  breakdown: BreakdownItem[]
}

export function ScoreScreen({ score, maxScore, examineeName, examDate, durationSeconds, questions, breakdown }: Props) {
  const [showReview, setShowReview] = useState(false)
  const pct = Math.round((score / maxScore) * 100)
  const passed = pct >= 70

  function downloadReview() {
    const lines: string[] = [
      'EXAM REVIEW',
      '='.repeat(50),
      `Examinee: ${examineeName}`,
      `Date: ${examDate}`,
      `Score: ${score} / ${maxScore} (${pct}%)`,
      `Result: ${passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}`,
      `Time taken: ${formatDuration(durationSeconds)}`,
      '',
      '='.repeat(50),
      'QUESTIONS & ANSWERS',
      '='.repeat(50),
      '',
    ]

    questions.forEach((q, i) => {
      const b = breakdown.find(x => x.questionId === q.id)
      const isCorrect = b?.correct ?? false
      const given = b?.given ?? '(no answer)'
      const expected = b?.expected ?? ''

      lines.push(`Q${i + 1}. [${q.type.replace('_', ' ').toUpperCase()}] ${q.question}`)
      if (q.options) {
        q.options.forEach(opt => lines.push(`     ${opt}`))
      }
      lines.push(`Your answer : ${given}`)
      lines.push(`Correct answer: ${expected}`)
      lines.push(`Result: ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}`)
      lines.push('')
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${examineeName.replace(/\s+/g, '_')}_exam_review_${examDate}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 pb-16">
      <div className="w-full max-w-xl space-y-6 mt-8">

        {/* Score card */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
              {passed
                ? <CheckCircle className="h-10 w-10 text-green-600" />
                : <XCircle className="h-10 w-10 text-orange-500" />
              }
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{score} / {maxScore}</h1>
            <p className="text-lg text-muted-foreground">{pct}%</p>
            <p className={`text-sm font-semibold ${passed ? 'text-green-600' : 'text-orange-500'}`}>
              {passed ? 'Passed' : 'Needs improvement'}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="border rounded-xl bg-card p-5 space-y-2 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Examinee</span>
            <span className="font-medium">{examineeName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date of Examination</span>
            <span className="font-medium">{examDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Correct answers</span>
            <span className="font-medium">{score} out of {maxScore}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2 mt-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Time taken
            </span>
            <span className="font-semibold text-primary">{formatDuration(durationSeconds)}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Your exam has been submitted and your signature recorded. Thank you!
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowReview(v => !v)}
          >
            <BookOpen className="h-4 w-4" />
            {showReview ? 'Hide' : 'Review'} Answers
            {showReview ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </Button>
          <Button variant="outline" className="flex-1" onClick={downloadReview}>
            <Download className="h-4 w-4" />
            Download Review
          </Button>
        </div>

        {/* Review panel */}
        {showReview && (
          <div className="space-y-4">
            <h2 className="font-semibold text-base">Answer Review</h2>
            {questions.map((q, i) => {
              const b = breakdown.find(x => x.questionId === q.id)
              const isCorrect = b?.correct ?? false
              const given = b?.given ?? '(no answer)'
              const expected = b?.expected ?? ''

              return (
                <div key={q.id} className={`border rounded-xl p-4 space-y-3 ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                  {/* Question */}
                  <div className="flex gap-2">
                    <span className={`shrink-0 h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium leading-relaxed">{q.question.replace(/_{2,}/g, '___')}</p>
                  </div>

                  {/* Options for MC/TF */}
                  {q.options && (
                    <div className="pl-8 space-y-1">
                      {q.options.map(opt => (
                        <div key={opt} className={`text-xs px-3 py-1.5 rounded-lg ${
                          opt === expected ? 'bg-green-100 text-green-800 font-semibold' :
                          opt === given && !isCorrect ? 'bg-red-100 text-red-700' :
                          'text-muted-foreground'
                        }`}>
                          {opt}
                          {opt === expected && ' ✓'}
                          {opt === given && !isCorrect && ' ✗'}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fill blank answers */}
                  {q.type === 'fill_blank' || q.type.includes('fill') ? (
                    <div className="pl-8 space-y-1 text-xs">
                      <div className={`px-3 py-1.5 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                        Your answer: <strong>{given || '(blank)'}</strong>
                        {isCorrect ? ' ✓' : ' ✗'}
                      </div>
                      {!isCorrect && (
                        <div className="px-3 py-1.5 rounded-lg bg-green-100 text-green-800">
                          Correct answer: <strong>{expected}</strong> ✓
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Result badge */}
                  <div className="pl-8">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
