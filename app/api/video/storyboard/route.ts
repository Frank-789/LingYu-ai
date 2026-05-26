import { generateStoryboard } from "@/lib/services/storyboard-service"
import type { ProductVideoBrief } from "@/lib/types/video"

export async function POST(req: Request) {
  try {
    const body: { brief: ProductVideoBrief; fullScript: string } = await req.json()

    if (!body.brief || !body.fullScript) {
      return Response.json({ error: "Missing required fields: brief, fullScript" }, { status: 400 })
    }

    const result = await generateStoryboard(body.brief, body.fullScript)
    return Response.json(result)
  } catch (error) {
    console.error("Storyboard API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
