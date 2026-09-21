'use client'
import { useState } from 'react'
import { Newspaper as NewspaperIcon, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewspaperView } from '@/components/process-newspaper/NewspaperView'
import { ProcessContentsList } from '@/components/process-newspaper/ProcessContentsList'
import { PasswordGate } from '@/components/process-newspaper/PasswordGate'

type Section = 'newspaper' | 'contents'

const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: 'newspaper', label: 'Newspaper', icon: NewspaperIcon },
  { key: 'contents', label: 'Contents', icon: FolderOpen },
]

export default function ProcessNewspaperPage() {
  const [section, setSection] = useState<Section>('newspaper')

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <nav className="flex sm:flex-col gap-1 sm:w-44 shrink-0">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
              section === s.key
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <s.icon className="h-4 w-4 shrink-0" />
            {s.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-w-0">
        {section === 'newspaper' ? (
          <NewspaperView />
        ) : (
          <PasswordGate>
            <ProcessContentsList />
          </PasswordGate>
        )}
      </div>
    </div>
  )
}
