import type { VideoProject } from "@/lib/types/video"

const STORAGE_KEY = "lingyu-video-projects"

function getAll(): Record<string, VideoProject> {
  if (typeof window === "undefined") return {}
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function persist(projects: Record<string, VideoProject>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    /* quota exceeded */
  }
}

export function listProjects(): VideoProject[] {
  const all = getAll()
  return Object.values(all).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getProject(id: string): VideoProject | null {
  const all = getAll()
  return all[id] ?? null
}

export function saveProject(project: VideoProject): void {
  const all = getAll()
  all[project.id] = project
  persist(all)
}

export function deleteProject(id: string): void {
  const all = getAll()
  delete all[id]
  persist(all)
}
