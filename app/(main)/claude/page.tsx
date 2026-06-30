'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1 rounded">
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'bg-primary text-white' : 'bg-green-100 text-green-700 border border-green-200'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-foreground rounded-tl-sm shadow-sm'
        )}>
          {msg.content}
        </div>
        {!isUser && <CopyButton text={msg.content} />}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-700 border border-green-200">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ClaudePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const res = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get response')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function clearChat() {
    setMessages([])
    textareaRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
            <Bot className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Claude AI</h1>
            <p className="text-xs text-muted-foreground">Powered by Claude Sonnet · Direct AI chat</p>
          </div>
        </div>
        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            New Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
            <div className="h-16 w-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
              <Bot className="h-8 w-8 text-green-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">How can I help you?</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Ask me anything — I'm Claude, your AI assistant. This is a direct chat with no knowledge bank filters.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-sm">
              {[
                'How do I handle a difficult guest complaint?',
                'Write a professional email template',
                'What are best practices for hotel housekeeping?',
                'Explain our check-in process options',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus() }}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4 border-t mt-4">
        <div className="flex gap-2 items-end bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-green-400 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            placeholder="Message Claude… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent placeholder:text-muted-foreground max-h-40"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={!input.trim() || loading}
            className="h-8 w-8 rounded-xl shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Claude can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
