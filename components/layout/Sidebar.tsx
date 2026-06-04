'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, MessageSquare, Database, PlusCircle, Tag,
  BarChart3, Settings, Home, Upload, FileText, ClipboardList,
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
    <aside className="w-64 shrink-0 border-r bg-card flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Knowledge Bank</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {sections.map((section, si) => {
          const items = NAV.filter(n => n.section === section)
          return (
            <div key={section} className={si > 0 ? 'pt-1' : undefined}>
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
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

      {/* Section indicator */}
      <div className="border-t px-6 py-4">
        <div className="flex gap-2">
          <Link
            href="/guest"
            className={cn(
              'flex-1 text-center text-xs py-1.5 rounded-md font-medium transition-colors',
              pathname === '/guest'
                ? 'bg-blue-100 text-blue-700'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            Guest
          </Link>
          <Link
            href="/user"
            className={cn(
              'flex-1 text-center text-xs py-1.5 rounded-md font-medium transition-colors',
              pathname === '/user'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            Staff
          </Link>
          <Link
            href="/updates"
            className={cn(
              'flex-1 text-center text-xs py-1.5 rounded-md font-medium transition-colors',
              pathname.startsWith('/updates')
                ? 'bg-violet-100 text-violet-700'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            Updates
          </Link>
        </div>
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
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}
