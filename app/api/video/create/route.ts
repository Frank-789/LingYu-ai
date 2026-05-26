import { getVideoProvider } from "@/lib/video-providers"
import type { GenerateVideoInput } from "@/lib/video-providers"

export async function POST(req: Request) {
  try {
    const body: GenerateVideoInput = await req.json()

    if (!body.prompt) {
      return Response.json({ error: "Missing required field: prompt" }, { status: 400 })
    }

    const provider = getVideoProvider()
    const task = await provider.createTask(body)
    return Response.json(task)
  } catch (error) {
    console.error("Video create API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
