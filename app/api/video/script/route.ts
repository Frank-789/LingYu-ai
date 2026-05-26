import { generateScript } from "@/lib/services/video-script-service"
import type { ProductVideoBrief } from "@/lib/types/video"

export async function POST(req: Request) {
  try {
    const body: ProductVideoBrief = await req.json()

    if (!body.fruitName || !body.sellingPoints || !body.targetPlatform || !body.duration || !body.style) {
      return Response.json({ error: "Missing required fields: fruitName, sellingPoints, targetPlatform, duration, style" }, { status: 400 })
    }

    const result = await generateScript(body)
    return Response.json(result)
  } catch (error) {
    console.error("Script API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
