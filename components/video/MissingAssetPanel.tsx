"use client"

import { AlertTriangle, Lightbulb, Sparkles, Upload, SkipForward } from "lucide-react"
import type { AssetDiagnosisResult, StoryboardShot } from "@/lib/types/video"

interface MissingAssetPanelProps {
  diagnosis: AssetDiagnosisResult | null
  isDiagnosing?: boolean
}

export function MissingAssetPanel({ diagnosis, isDiagnosing }: MissingAssetPanelProps) {
  if (isDiagnosing) {
    return (
      <div className="animate-pulse rounded-xl bg-zinc-800/50 border border-zinc-800 p-4 space-y-2">
        <div className="h-4 bg-zinc-700 rounded w-1/3" />
        <div className="h-3 bg-zinc-700 rounded w-2/3" />
        <div className="h-3 bg-zinc-700 rounded w-1/2" />
      </div>
    )
  }

  if (!diagnosis) return null

  const { matchedStoryboard, missingShots, suggestions } = diagnosis
  const matchedCount = matchedStoryboard.filter((s) => !s.isMissing).length || matchedStoryboard.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-orange-400" />
        <h3 className="text-sm font-medium text-zinc-200">素材诊断</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-3 text-center">
          <p className="text-lg font-bold text-green-400">{matchedCount}</p>
          <p className="text-xs text-green-500/70">已匹配</p>
        </div>
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 text-center">
          <p className="text-lg font-bold text-amber-400">{missingShots.length}</p>
          <p className="text-xs text-amber-500/70">缺失</p>
        </div>
      </div>

      {/* Missing Shots */}
      {missingShots.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400 flex items-center gap-1">
            <AlertTriangle size={12} />
            缺失素材镜头
          </h4>
          {missingShots.map((shot, index) => (
            <div
              key={shot.id || index}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-zinc-300">
                  镜头 {shot.order}: {shot.sceneTitle}
                </span>
                <span className="text-xs text-amber-400 ml-auto">{shot.requiredAssetType}</span>
              </div>
              <p className="text-xs text-zinc-500 mb-2">{shot.visualDescription}</p>

              {/* Action suggestions */}
              <div className="flex gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 text-xs">
                  <Upload size={10} />
                  上传
                </span>
                {shot.generationPrompt && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs">
                      <Sparkles size={10} />
                      AI生成
                    </span>
                  </>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 text-xs">
                  <SkipForward size={10} />
                  跳过
                </span>
              </div>

              {shot.generationPrompt && (
                <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-zinc-800/50">
                  <p className="text-xs text-zinc-500">
                    <Lightbulb size={10} className="inline mr-1" />
                    {shot.generationPrompt}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-zinc-400 flex items-center gap-1">
            <Lightbulb size={12} />
            优化建议
          </h4>
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="px-2.5 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800 text-xs text-zinc-400 leading-relaxed"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {missingShots.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-green-400">所有镜头素材已就绪！</p>
        </div>
      )}
    </div>
  )
}
