'use client'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  score: number
  maxScore: number
  examineeName: string
  examDate: string
}

export function ScoreScreen({ score, maxScore, examineeName, examDate }: Props) {
  const pct = Math.round((score / maxScore) * 100)
  const passed = pct >= 70

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
            {passed
              ? <CheckCircle className="h-10 w-10 text-green-600" />
              : <XCircle className="h-10 w-10 text-orange-500" />
            }
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{score} / {maxScore}</h1>
          <p className="text-lg text-muted-foreground">{pct}%</p>
          <p className={`text-sm font-semibold ${passed ? 'text-green-600' : 'text-orange-500'}`}>
            {passed ? 'Passed' : 'Needs improvement'}
          </p>
        </div>

        <div className="border rounded-xl bg-card p-5 text-left space-y-2 shadow-sm">
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
        </div>

        <p className="text-sm text-muted-foreground">
          Your exam has been submitted and your signature recorded. Thank you!
        </p>
      </div>
    </div>
  )
}
