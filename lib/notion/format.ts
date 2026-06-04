export function blocksToText(blocks: Array<{ type: string; [key: string]: unknown }>): string {
  const lines: string[] = []
  for (const block of blocks) {
    const line = blockToLine(block)
    if (line) lines.push(line)
  }
  return lines.join('\n').slice(0, 2000)
}

function blockToLine(block: { type: string; [key: string]: unknown }): string {
  const getRT = (key: string): string => {
    const prop = block[key] as { rich_text?: Array<{ plain_text: string }> } | undefined
    return prop?.rich_text?.map((t) => t.plain_text).join('') ?? ''
  }
  switch (block.type) {
    case 'paragraph': return getRT('paragraph')
    case 'heading_1': return '# ' + getRT('heading_1')
    case 'heading_2': return '## ' + getRT('heading_2')
    case 'heading_3': return '### ' + getRT('heading_3')
    case 'bulleted_list_item': return '• ' + getRT('bulleted_list_item')
    case 'numbered_list_item': return '1. ' + getRT('numbered_list_item')
    case 'code': return '`' + getRT('code') + '`'
    case 'quote': return '> ' + getRT('quote')
    default: return ''
  }
}
