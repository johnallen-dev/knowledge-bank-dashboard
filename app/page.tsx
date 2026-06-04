import Link from 'next/link'
import { BookOpen, FileText, Headphones, Monitor, Phone, Users, Leaf, BookMarked, Database } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #052e16 100%)' }}>

      {/* Dot grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />

      {/* ── Decorative icons — library & call-center atmosphere ── */}

      {/* Top-left: books */}
      <div className="absolute top-10 left-10 text-green-400/10 hidden lg:block">
        <BookOpen style={{ width: 90, height: 90 }} />
      </div>
      <div className="absolute top-36 left-36 text-green-300/6 hidden lg:block">
        <BookMarked style={{ width: 55, height: 55 }} />
      </div>

      {/* Top-right: call-center */}
      <div className="absolute top-10 right-16 text-green-400/10 hidden lg:block">
        <Headphones style={{ width: 85, height: 85 }} />
      </div>
      <div className="absolute top-40 right-44 text-green-300/6 hidden lg:block">
        <Phone style={{ width: 50, height: 50 }} />
      </div>

      {/* Mid-left: computer */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 text-green-400/8 hidden xl:block">
        <Monitor style={{ width: 110, height: 110 }} />
      </div>

      {/* Mid-right: team */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 text-green-400/8 hidden xl:block">
        <Users style={{ width: 110, height: 110 }} />
      </div>

      {/* Bottom-left */}
      <div className="absolute bottom-16 left-20 text-green-400/10 hidden lg:block">
        <Database style={{ width: 65, height: 65 }} />
      </div>

      {/* Bottom-right */}
      <div className="absolute bottom-14 right-24 text-green-400/10 hidden lg:block">
        <Monitor style={{ width: 70, height: 70 }} />
      </div>

      {/* ── Bookshelf strip at bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-900 via-green-500/40 to-green-900" />

      {/* ── Main content ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">

        {/* Greenkey logo & wordmark */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-5">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl flex items-center justify-center border border-green-400/25 shadow-2xl shadow-green-900"
                style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.08) 100%)', backdropFilter: 'blur(12px)' }}>
                <Leaf className="h-12 w-12 text-green-400" />
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl blur-md opacity-40" style={{ background: 'rgba(34,197,94,0.3)' }} />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
            Green<span className="text-green-400">key</span>
          </h1>

          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-14 bg-gradient-to-r from-transparent to-green-500/50" />
            <p className="text-green-300/70 text-xs font-semibold uppercase tracking-[0.35em]">Knowledge Hub</p>
            <div className="h-px w-14 bg-gradient-to-l from-transparent to-green-500/50" />
          </div>

          <p className="text-green-200/50 text-sm mt-4 max-w-xs mx-auto">
            Your intelligent workspace for guest support and team training
          </p>
        </div>

        {/* Navigation cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md">

          {/* Knowledge Bank */}
          <Link
            href="/guest"
            className="flex-1 flex flex-col items-center gap-4 rounded-2xl p-8 border transition-all duration-300 group"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)',
              borderColor: 'rgba(255,255,255,0.10)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.4)'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            <div className="h-14 w-14 rounded-xl flex items-center justify-center border border-green-400/20 transition-colors group-hover:border-green-400/50"
              style={{ background: 'rgba(34,197,94,0.15)' }}>
              <BookOpen className="h-7 w-7 text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-white">Knowledge Bank</p>
              <p className="text-xs text-green-200/55 mt-1.5 leading-relaxed">Ask questions about your stay</p>
            </div>
          </Link>

          {/* Updates */}
          <Link
            href="/updates"
            className="flex-1 flex flex-col items-center gap-4 rounded-2xl p-8 border transition-all duration-300 group"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)',
              borderColor: 'rgba(255,255,255,0.10)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(52,211,153,0.4)'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            <div className="h-14 w-14 rounded-xl flex items-center justify-center border border-emerald-400/20 transition-colors group-hover:border-emerald-400/50"
              style={{ background: 'rgba(52,211,153,0.15)' }}>
              <FileText className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-white">Updates</p>
              <p className="text-xs text-green-200/55 mt-1.5 leading-relaxed">Documents &amp; team exams</p>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-14 text-green-500/30 text-xs tracking-wide">
          © {new Date().getFullYear()} Greenkey · Knowledge Management System
        </p>
      </div>
    </div>
  )
}
