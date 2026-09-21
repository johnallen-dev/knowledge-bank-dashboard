'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  function toggleLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const buttons = [
    { icon: Bold, label: 'Bold', active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
    { icon: Italic, label: 'Italic', active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
    { icon: List, label: 'Bullet list', active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, label: 'Numbered list', active: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: LinkIcon, label: 'Link', active: editor.isActive('link'), onClick: toggleLink },
  ]

  return (
    <div className="border border-input rounded-md bg-background">
      <div className="flex items-center gap-1 border-b border-input px-2 py-1.5">
        {buttons.map(b => (
          <button
            key={b.label}
            type="button"
            title={b.label}
            onClick={b.onClick}
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors',
              b.active && 'bg-accent text-accent-foreground'
            )}
          >
            <b.icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
