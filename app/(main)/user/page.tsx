import { QuestionInput } from '@/components/ask/QuestionInput'
import { Users, Key } from 'lucide-react'

export default function UserPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center border border-green-200 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
            <Users className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl font-bold text-green-900">Staff Knowledge Base</h1>
              <Key className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Internal Q&amp;A — ask about procedures, operations, and policies
            </p>
          </div>
        </div>
      </div>

      <QuestionInput section="user" />
    </div>
  )
}
