import { QuestionInput } from '@/components/ask/QuestionInput'
import { Headphones, Key } from 'lucide-react'

const PROPERTY_NAME = process.env.NEXT_PUBLIC_PROPERTY_NAME || 'Knowledge Bank'

export default function GuestPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 pb-2">
        <div className="flex items-center justify-center mb-1">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center border border-green-200 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
            <Headphones className="h-7 w-7 text-green-700" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Key className="h-4 w-4 text-green-500" />
          <h1 className="text-2xl font-bold text-green-900">Guest Assistance</h1>
          <Key className="h-4 w-4 text-green-500" />
        </div>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Welcome to <strong className="text-green-700">{PROPERTY_NAME}</strong>. Ask us anything about your stay — we&apos;re here to help.
        </p>
      </div>

      <QuestionInput section="guest" />
    </div>
  )
}
