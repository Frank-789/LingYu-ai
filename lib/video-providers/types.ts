export interface GenerateVideoInput {
  prompt: string
  imageUrl?: string
  duration?: number
  aspectRatio?: "9:16" | "16:9" | "1:1"
  resolution?: "720p" | "1080p"
}

export interface GenerateVideoTask {
  taskId: string
  provider: string
  status: "pending" | "running" | "succeeded" | "failed"
  videoUrl?: string
  errorMessage?: string
  createdAt?: string
  updatedAt?: string
}

export interface VideoProvider {
  createTask(input: GenerateVideoInput): Promise<GenerateVideoTask>
  getTask(taskId: string): Promise<GenerateVideoTask>
  downloadResult?(taskId: string): Promise<{ videoUrl: string }>
}
