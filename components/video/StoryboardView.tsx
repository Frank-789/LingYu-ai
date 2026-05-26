"use client"

import { AlertTriangle, Clock, Film } from "lucide-react"
import type { StoryboardShot } from "@/lib/types/video"

interface StoryboardViewProps {
  shots: StoryboardShot[]
  isLoading?: boolean
}

export function StoryboardView({ shots, isLoading }: StoryboardViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Film size={16} className="text-orange-400" />
          <h3 className="text-sm font-medium text-zinc-200">分镜头列表</h3>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-zinc-800/50 border border-zinc-800 p-4 space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-1/3" />
            <div className="h-3 bg-zinc-700 rounded w-2/3" />
            <div className="h-3 bg-zinc-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (shots.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Film size={16} className="text-orange-400" />
        <h3 className="text-sm font-medium text-zinc-200">分镜头列表</h3>
        <span className="text-xs text-zinc-500 ml-auto">{shots.length} 个镜头</span>
      </div>

      <div className="space-y-2">
        {shots.map((shot, index) => (
          <div
            key={shot.id || index}
            className={`rounded-xl border p-3.5 transition-all ${
              shot.isMissing
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-zinc-800 bg-zinc-900/50"
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium shrink-0">
                {shot.order}
              </span>
              <span className="text-sm font-medium text-zinc-200">{shot.sceneTitle}</span>
              <span className="flex items-center gap-1 text-xs text-zinc-500 ml-auto">
                <Clock size={12} />
                {shot.startTime}s - {shot.endTime}s
              </span>
            </div>

            {/* Visual Description */}
            <p className="text-xs text-zinc-400 leading-relaxed mb-2">{shot.visualDescription}</p>

            {/* Narration */}
            <div className="rounded-lg bg-zinc-800/50 px-2.5 py-1.5 mb-2">
              <p className="text-xs text-zinc-300 italic">
                <span className="text-zinc-500 not-italic">旁白：</span>
                {shot.narration}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-xs text-zinc-500">
              <span className="text-zinc-600">字幕：</span>
              {shot.subtitle}
            </p>

            {/* Missing Warning */}
            {shot.isMissing && (
              <div className="mt-2 flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-amber-400">
                    缺少素材类型：{shot.requiredAssetType}
                  </p>
                  {shot.generationPrompt && (
                    <p className="text-xs text-amber-500/70 mt-0.5">
                      AI生成提示：{shot.generationPrompt}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
