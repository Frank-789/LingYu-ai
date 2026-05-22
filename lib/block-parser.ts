import type { MessageBlock, BlockType } from '@/types'

const BLOCK_REGEX = /<{2,3}BLOCK:(\w+)>{2,3}\s*([\s\S]*?)\s*<{2,3}\/BLOCK>{2,3}/g

export function parseBlocks(content: string): {
  cleanedContent: string
  blocks: MessageBlock[]
} {
  const blocks: MessageBlock[] = []

  const cleanedContent = content.replace(BLOCK_REGEX, (_match, type, jsonStr) => {
    try {
      const data = JSON.parse(jsonStr.trim())
      blocks.push({ type: type as BlockType, data })
      return ''
    } catch {
      // If JSON is malformed, keep the original marker text visible as fallback
      return _match
    }
  })

  return { cleanedContent: cleanedContent.trim(), blocks }
}
