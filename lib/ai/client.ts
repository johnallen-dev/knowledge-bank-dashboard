import Anthropic from '@anthropic-ai/sdk'

let anthropic: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropic
}
