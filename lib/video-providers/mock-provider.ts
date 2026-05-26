import type { GenerateVideoInput, GenerateVideoTask, VideoProvider } from "./types"

const MOCK_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4"
const SIMULATION_DURATION_MS = 5000
const RUNNING_THRESHOLD_MS = 3000

export class MockProvider implements VideoProvider {
  private tasks = new Map<
    string,
    {
      task: GenerateVideoTask
      createdAt: number
    }
  >()

  async createTask(input: GenerateVideoInput): Promise<GenerateVideoTask> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const taskId = crypto.randomUUID()
    const now = new Date().toISOString()

    const task: GenerateVideoTask = {
      taskId,
      provider: "mock",
      status: "running",
      createdAt: now,
      updatedAt: now,
    }

    this.tasks.set(taskId, { task, createdAt: Date.now() })
    console.log(`[MockProvider] Created task ${taskId} with prompt: "${input.prompt.slice(0, 60)}..."`)

    return task
  }

  async getTask(taskId: string): Promise<GenerateVideoTask> {
    const entry = this.tasks.get(taskId)
    if (!entry) {
      throw new Error(`Task ${taskId} not found`)
    }

    const elapsed = Date.now() - entry.createdAt

    if (elapsed >= SIMULATION_DURATION_MS) {
      // Task completed
      const updated: GenerateVideoTask = {
        ...entry.task,
        status: "succeeded",
        videoUrl: MOCK_VIDEO_URL,
        updatedAt: new Date().toISOString(),
      }
      this.tasks.set(taskId, { ...entry, task: updated })
      return updated
    }

    if (elapsed >= RUNNING_THRESHOLD_MS) {
      // Still rendering but close to done
      return {
        ...entry.task,
        status: "running",
        updatedAt: new Date().toISOString(),
      }
    }

    // Still pending/running
    return entry.task
  }
}
