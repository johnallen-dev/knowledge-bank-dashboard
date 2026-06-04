import Link from 'next/link'
import { BookOpen, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">Choose a section to continue</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
        <Link
          href="/guest"
          className="flex-1 flex flex-col items-center gap-4 border rounded-2xl p-8 bg-card shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <BookOpen className="h-7 w-7 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">Knowledge Bank</p>
            <p className="text-sm text-muted-foreground mt-1">Ask questions about your stay</p>
          </div>
        </Link>

        <Link
          href="/updates"
          className="flex-1 flex flex-col items-center gap-4 border rounded-2xl p-8 bg-card shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="h-14 w-14 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
            <FileText className="h-7 w-7 text-violet-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">Updates</p>
            <p className="text-sm text-muted-foreground mt-1">Upload documents and generate exams</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
