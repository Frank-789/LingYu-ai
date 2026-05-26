import { getVideoProvider } from "@/lib/video-providers"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return Response.json({ error: "Missing query parameter: taskId" }, { status: 400 })
    }

    const provider = getVideoProvider()
    const task = await provider.getTask(taskId)
    return Response.json(task)
  } catch (error) {
    console.error("Video status API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
