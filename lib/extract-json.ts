/**
 * Robust JSON extraction from AI responses.
 * DeepSeek often wraps JSON in markdown code blocks or adds explanatory text.
 * This handles: direct JSON, ```json ... ```, ``` ... ```, leading/trailing text.
 */

export function extractJson<T>(text: string): T | null {
  if (!text) return null

  // Try direct parse first (clean JSON with no wrapping)
  try {
    return JSON.parse(text) as T
  } catch {
    // continue to fallbacks
  }

  // Try extracting from ```json ... ``` or ``` ... ``` blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    const inner = codeBlockMatch[1].trim()
    try {
      return JSON.parse(inner) as T
    } catch {
      // continue
    }
  }

  // Try finding first { ... } object (handles leading/trailing text)
  const objectMatch = text.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]) as T
    } catch {
      // continue
    }
  }

  // Try finding first [ ... ] array (handles leading/trailing text)
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]) as T
    } catch {
      // continue
    }
  }

  return null
}
