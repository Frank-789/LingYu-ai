import type { GenerateVideoInput, GenerateVideoTask, VideoProvider } from "./types"

export class SeedanceProvider implements VideoProvider {
  private baseUrl: string
  private apiKey: string
  private model: string

  constructor() {
    this.apiKey = process.env.ARK_API_KEY || ""
    this.model = process.env.SEEDANCE_MODEL || "seedance-v1"
    this.baseUrl = process.env.SEEDANCE_BASE_URL || "https://api.ark.com/v1"

    if (!this.apiKey) {
      throw new Error(
        "SeedanceProvider requires ARK_API_KEY environment variable. " +
          "Please set it in your .env.local file.",
      )
    }
  }

  async createTask(input: GenerateVideoInput): Promise<GenerateVideoTask> {
    // TODO: Implement actual Seedance API call
    // Expected API flow:
    // 1. POST ${baseUrl}/video/generate with:
    //    - Authorization: Bearer ${apiKey}
    //    - Content-Type: application/json
    //    - Body: {
    //        model: this.model,
    //        prompt: input.prompt,
    //        image_url: input.imageUrl,
    //        duration: input.duration,
    //        aspect_ratio: input.aspectRatio,
    //        resolution: input.resolution
    //      }
    // 2. Response: { task_id: string, status: "pending" }
    // 3. Return GenerateVideoTask with the task_id

    throw new Error("SeedanceProvider.createTask not implemented yet")
  }

  async getTask(taskId: string): Promise<GenerateVideoTask> {
    // TODO: Implement actual Seedance API polling
    // Expected API flow:
    // 1. GET ${baseUrl}/video/tasks/${taskId} with:
    //    - Authorization: Bearer ${apiKey}
    // 2. Response: { status: "running" | "succeeded" | "failed", video_url?: string, error_message?: string }
    // 3. Return GenerateVideoTask with updated status

    throw new Error("SeedanceProvider.getTask not implemented yet")
  }

  async downloadResult(taskId: string): Promise<{ videoUrl: string }> {
    // TODO: Implement actual download URL retrieval
    // Expected:
    // 1. GET ${baseUrl}/video/tasks/${taskId}/download
    // 2. Response: { download_url: string }
    // 3. Return { videoUrl: download_url }

    throw new Error("SeedanceProvider.downloadResult not implemented yet")
  }
}
