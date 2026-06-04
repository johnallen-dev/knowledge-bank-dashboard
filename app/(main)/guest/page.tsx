import { QuestionInput } from '@/components/ask/QuestionInput'
import { Hotel } from 'lucide-react'

const PROPERTY_NAME = process.env.NEXT_PUBLIC_PROPERTY_NAME || 'Knowledge Bank'

export default function GuestPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pb-2">
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Hotel className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold">Guest Assistance</h1>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          Welcome to {PROPERTY_NAME}. Ask us anything about your stay — we&apos;re here to help.
        </p>
      </div>

      <QuestionInput section="guest" />
    </div>
  )
}
