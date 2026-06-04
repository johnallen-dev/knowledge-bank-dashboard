import { QuestionInput } from '@/components/ask/QuestionInput'
import { Users } from 'lucide-react'

export default function UserPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Staff Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">
              Internal Q&A — ask about procedures, operations, and policies
            </p>
          </div>
        </div>
      </div>

      <QuestionInput section="user" />
    </div>
  )
}
