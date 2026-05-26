export type VideoPlatform = "douyin" | "kuaishou" | "xiaohongshu" | "shipinhao"
export type VideoDuration = 15 | 30 | 60
export type VideoStyle =
  | "promotion"
  | "origin_story"
  | "premium_gift"
  | "festival"
  | "farmer_realistic"

export type AssetType =
  | "product_closeup"
  | "fruit_cut"
  | "orchard"
  | "harvest"
  | "packing"
  | "logistics"
  | "customer_feedback"
  | "brand_logo"
  | "qr_code"
  | "unknown"

export interface ProductVideoBrief {
  fruitName: string
  origin?: string
  specification?: string
  price?: string
  sellingPoints: string[]
  logistics?: string
  afterSales?: string
  targetPlatform: VideoPlatform
  duration: VideoDuration
  style: VideoStyle
}

export interface UploadedAsset {
  id: string
  fileName: string
  fileUrl: string
  mimeType: string
  assetType: AssetType
  duration?: number
  width?: number
  height?: number
  createdAt: string
}

export interface StoryboardShot {
  id: string
  order: number
  startTime: number
  endTime: number
  sceneTitle: string
  visualDescription: string
  narration: string
  subtitle: string
  requiredAssetType: AssetType
  matchedAssetIds: string[]
  isMissing: boolean
  generationPrompt?: string
}

export interface VideoScriptResult {
  title: string
  hook: string
  fullScript: string
  sellingLogic: string[]
  cta: string
}

export interface AssetDiagnosisResult {
  matchedStoryboard: StoryboardShot[]
  missingShots: StoryboardShot[]
  suggestions: string[]
}

export interface VideoProject {
  id: string
  title: string
  brief: ProductVideoBrief
  assets: UploadedAsset[]
  storyboard: StoryboardShot[]
  status: "draft" | "script_ready" | "assets_checked" | "generating" | "completed" | "failed"
  outputVideoUrl?: string
  coverUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ComposeInput {
  storyboard: StoryboardShot[]
  assets: UploadedAsset[]
  generatedClips: UploadedAsset[]
  subtitles: string[]
  title: string
}

export interface ComposeResult {
  videoUrl: string
  coverUrl?: string
}
