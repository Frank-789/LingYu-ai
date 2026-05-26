import { composeVideo } from "@/lib/services/video-compose-service"
import type { ComposeInput } from "@/lib/types/video"

export async function POST(req: Request) {
  try {
    const body: ComposeInput = await req.json()

    if (!body.storyboard || !body.assets || !body.title) {
      return Response.json({ error: "Missing required fields: storyboard, assets, title" }, { status: 400 })
    }

    const result = await composeVideo(body)
    return Response.json(result)
  } catch (error) {
    console.error("Compose API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
