"use client"

import { Download, Film } from "lucide-react"
import type { ComposeResult } from "@/lib/types/video"

interface VideoPreviewProps {
  result: ComposeResult | null
  isLoading?: boolean
}

export function VideoPreview({ result, isLoading }: VideoPreviewProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl bg-zinc-800/50 border border-zinc-800 p-4">
        <div className="aspect-video bg-zinc-700 rounded-lg mb-3" />
        <div className="h-4 bg-zinc-700 rounded w-1/3" />
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Video Player */}
      <div className="aspect-video bg-black flex items-center justify-center">
        <video
          key={result.videoUrl}
          className="w-full h-full"
          controls
          preload="metadata"
          poster={result.coverUrl}
        >
          <source src={result.videoUrl} type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film size={16} className="text-orange-400" />
          <span className="text-sm text-zinc-300">生成结果</span>
        </div>

        <a
          href={result.videoUrl}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs hover:bg-orange-500/20 transition-colors"
        >
          <Download size={14} />
          下载 MP4
        </a>
      </div>
    </div>
  )
}
