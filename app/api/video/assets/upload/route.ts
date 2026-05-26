import { writeFile, mkdir } from "fs/promises"
import path from "path"
import type { UploadedAsset } from "@/lib/types/video"

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 50MB` },
        { status: 400 },
      )
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin"
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = path.join(uploadsDir, uniqueName)

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const asset: UploadedAsset = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileUrl: `/uploads/${uniqueName}`,
      mimeType: file.type,
      assetType: "unknown",
      createdAt: new Date().toISOString(),
    }

    return Response.json(asset)
  } catch (error) {
    console.error("Upload API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
