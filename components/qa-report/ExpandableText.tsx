'use client'
import { useState } from 'react'

interface ExpandableTextProps {
  text: string
  maxChars?: number
}

export function ExpandableText({ text, maxChars = 120 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return <>—</>
  if (text.length <= maxChars) return <>{text}</>

  return (
    <span>
      {expanded ? text : `${text.slice(0, maxChars).trimEnd()}…`}{' '}
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="text-primary hover:underline text-xs font-medium whitespace-nowrap"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </span>
  )
}
