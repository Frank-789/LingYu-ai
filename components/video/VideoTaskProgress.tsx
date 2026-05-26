"use client"

import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

interface VideoTaskProgressProps {
  status: "idle" | "pending" | "running" | "succeeded" | "failed"
  errorMessage?: string
  pollCount?: number
}

export function VideoTaskProgress({ status, errorMessage, pollCount }: VideoTaskProgressProps) {
  if (status === "idle") return null

  const statusConfig = {
    idle: { icon: Clock, text: "等待开始", color: "text-zinc-400", animate: false },
    pending: { icon: Loader2, text: "任务排队中", color: "text-yellow-400", animate: true },
    running: { icon: Loader2, text: "视频生成中", color: "text-orange-400", animate: true },
    succeeded: { icon: CheckCircle, text: "生成完成", color: "text-green-400", animate: false },
    failed: { icon: XCircle, text: "生成失败", color: "text-red-400", animate: false },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      {/* Status Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 ${config.animate ? "animate-pulse" : ""}`}
        >
          <Icon size={20} className={`${config.color} ${status === "running" || status === "pending" ? "animate-spin" : ""}`} />
        </div>
        <div>
          <p className={`text-sm font-medium ${config.color}`}>{config.text}</p>
          {pollCount !== undefined && (status === "running" || status === "pending") && (
            <p className="text-xs text-zinc-500 mt-0.5">轮询 {pollCount} 次...</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(status === "running" || status === "pending") && (
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse"
            style={{
              width: status === "pending" ? "20%" : "60%",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      )}

      {/* Success */}
      {status === "succeeded" && (
        <div className="flex items-center gap-1.5 text-xs text-green-400 mt-1">
          <CheckCircle size={12} />
          视频已生成，请查看预览
        </div>
      )}

      {/* Error */}
      {status === "failed" && errorMessage && (
        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}
