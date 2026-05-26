import type { VideoProvider } from "./types"
import { MockProvider } from "./mock-provider"
import { SeedanceProvider } from "./seedance"

let providerInstance: VideoProvider | null = null

export function getVideoProvider(): VideoProvider {
  if (providerInstance) return providerInstance

  if (process.env.VIDEO_PROVIDER === "seedance" && process.env.ARK_API_KEY) {
    providerInstance = new SeedanceProvider()
  } else {
    providerInstance = new MockProvider()
  }

  return providerInstance
}

export type { GenerateVideoInput, GenerateVideoTask, VideoProvider } from "./types"
