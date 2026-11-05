import { Sidebar } from '@/components/layout/Sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4fdf7' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-5xl px-6 pt-20 pb-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
