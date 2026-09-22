import type { NewspaperProcess } from '@/lib/processNewspaper/types'

export interface LayoutProps {
  headline: NewspaperProcess
  supporting: NewspaperProcess[] // exactly 5
  onOpen: (process: NewspaperProcess) => void
}
