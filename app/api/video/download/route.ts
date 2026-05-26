import { getProject } from "@/lib/repositories/video-projects-repository"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return Response.json({ error: "Missing query parameter: projectId" }, { status: 400 })
    }

    const project = getProject(projectId)

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    if (!project.outputVideoUrl) {
      return Response.json({ error: "Video not ready yet" }, { status: 400 })
    }

    // For local files, redirect to the file URL
    // For remote URLs, redirect directly
    return Response.redirect(project.outputVideoUrl, 302)
  } catch (error) {
    console.error("Download API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
