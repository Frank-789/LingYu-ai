import { diagnoseAssets } from "@/lib/services/asset-diagnosis-service"
import type { StoryboardShot, UploadedAsset } from "@/lib/types/video"

export async function POST(req: Request) {
  try {
    const body: { storyboard: StoryboardShot[]; assets: UploadedAsset[] } = await req.json()

    if (!body.storyboard || !body.assets) {
      return Response.json({ error: "Missing required fields: storyboard, assets" }, { status: 400 })
    }

    const result = diagnoseAssets(body.storyboard, body.assets)
    return Response.json(result)
  } catch (error) {
    console.error("Diagnose assets API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
