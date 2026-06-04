'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare, Database, PlusCircle, Tag,
  BarChart3, Settings, Home, Upload, FileText, ClipboardList, Key,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavSection = 'sections' | 'knowledge' | 'updates' | 'system'

const NAV: { href: string; label: string; icon: React.ElementType; section: NavSection; exact?: boolean }[] = [
  { href: '/guest',                  label: 'Guest Section',      icon: Home,          section: 'sections', exact: true },
  { href: '/user',                   label: 'User Section',       icon: MessageSquare, section: 'sections', exact: true },
  { href: '/knowledge-base',         label: 'Knowledge Base',     icon: Database,      section: 'knowledge' },
  { href: '/knowledge-base/new',     label: 'Add Knowledge',      icon: PlusCircle,    section: 'knowledge', exact: true },
  { href: '/knowledge-base/import',  label: 'Import from Notion', icon: Upload,        section: 'knowledge', exact: true },
  { href: '/categories',             label: 'Categories',         icon: Tag,           section: 'knowledge', exact: true },
  { href: '/updates',                label: 'Updates',            icon: FileText,      section: 'updates', exact: true },
  { href: '/updates/results',        label: 'Exam Results',       icon: ClipboardList, section: 'updates', exact: true },
  { href: '/analytics',              label: 'Analytics',          icon: BarChart3,     section: 'system', exact: true },
  { href: '/settings',               label: 'Settings',           icon: Settings,      section: 'system', exact: true },
]

const SECTION_LABELS: Record<NavSection, string> = {
  sections: 'Sections',
  knowledge: 'Knowledge',
  updates: 'Updates',
  system: 'System',
}

export function Sidebar() {
  const pathname = usePathname()
  const sections: NavSection[] = ['sections', 'knowledge', 'updates', 'system']

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #052e16 0%, #14532d 100%)' }}>

      {/* Greenkey Logo */}
      <div className="px-5 py-5 border-b border-green-800/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-green-400/25 shadow-lg"
            style={{ background: 'rgba(34,197,94,0.15)' }}>
            <Key className="h-4.5 w-4.5 text-green-400" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">
              Green<span className="text-green-400">key</span>
            </p>
            <p className="text-white/50 text-[9px] uppercase tracking-[0.25em] leading-none mt-0.5">Knowledge Hub</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {sections.map((section, si) => {
          const items = NAV.filter(n => n.section === section)
          return (
            <div key={section} className={si > 0 ? 'pt-1' : undefined}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                {SECTION_LABELS[section]}
              </p>
              <div className="space-y-0.5">
                {items.map(item => {
                  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                  return <NavItem key={item.href} item={item} active={active} />
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Section indicator — context-sensitive */}
      <div className="border-t border-green-800/60 px-4 py-4">
        {pathname.startsWith('/updates') ? (
          <div className="flex gap-1.5">
            <Link
              href="/updates"
              className={cn(
                'flex-1 text-center text-xs py-1.5 rounded-lg font-medium transition-all',
                pathname === '/updates'
                  ? 'bg-green-500/25 text-white border border-green-400/30'
                  : 'text-white/50 hover:bg-green-800/40 hover:text-white'
              )}
            >
              Updates
            </Link>
            <Link
              href="/updates/results"
              className={cn(
                'flex-1 text-center text-xs py-1.5 rounded-lg font-medium transition-all',
                pathname === '/updates/results'
                  ? 'bg-green-500/25 text-white border border-green-400/30'
                  : 'text-white/50 hover:bg-green-800/40 hover:text-white'
              )}
            >
              Results
            </Link>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <Link
              href="/guest"
              className={cn(
                'flex-1 text-center text-xs py-1.5 rounded-lg font-medium transition-all',
                pathname === '/guest'
                  ? 'bg-green-500/25 text-white border border-green-400/30'
                  : 'text-white/50 hover:bg-green-800/40 hover:text-white'
              )}
            >
              Guest
            </Link>
            <Link
              href="/user"
              className={cn(
                'flex-1 text-center text-xs py-1.5 rounded-lg font-medium transition-all',
                pathname === '/user'
                  ? 'bg-green-500/25 text-white border border-green-400/30'
                  : 'text-white/50 hover:bg-green-800/40 hover:text-white'
              )}
            >
              Staff
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

function NavItem({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ElementType }
  active: boolean
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
        active
          ? 'bg-green-500/20 text-white font-medium border border-green-400/20'
          : 'text-white/60 hover:bg-green-800/40 hover:text-white'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}
