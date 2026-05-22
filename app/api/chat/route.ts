import { SYSTEM_PROMPT } from '@/lib/prompts'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response('API key not configured', { status: 500 })
    }

    const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 4096,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('DeepSeek API error:', response.status, error)
      return new Response(`DeepSeek API error: ${response.status}`, { status: 502 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = response.body!.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true })
          const lines = text.split('\n').filter((line) => line.startsWith('data: '))

          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            if (data.trim() === '') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            } catch {
              // Skip malformed chunks
            }
          }
        },
      }),
    )

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
