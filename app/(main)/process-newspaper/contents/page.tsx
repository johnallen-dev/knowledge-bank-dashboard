import { ProcessContentsList } from '@/components/process-newspaper/ProcessContentsList'
import { PasswordGate } from '@/components/process-newspaper/PasswordGate'

export default function ProcessNewspaperContentsPage() {
  return (
    <PasswordGate>
      <ProcessContentsList />
    </PasswordGate>
  )
}
