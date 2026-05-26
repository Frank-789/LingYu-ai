"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ArrowLeft, Sparkles, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import type { ProductVideoBrief, StoryboardShot, UploadedAsset, VideoScriptResult, AssetDiagnosisResult, ComposeResult } from "@/lib/types/video"
import type { GenerateVideoTask } from "@/lib/video-providers"
import { ProductBriefForm } from "@/components/video/ProductBriefForm"
import { AssetLibrary } from "@/components/video/AssetLibrary"
import { StoryboardView } from "@/components/video/StoryboardView"
import { MissingAssetPanel } from "@/components/video/MissingAssetPanel"
import { VideoTaskProgress } from "@/components/video/VideoTaskProgress"
import { VideoPreview } from "@/components/video/VideoPreview"

type WorkflowStep = "form" | "script" | "storyboard" | "assets" | "diagnosis" | "generating" | "preview"

export default function VideoStudioPage() {
  // Form state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("form")
  const [brief, setBrief] = useState<ProductVideoBrief | null>(null)

  // Script state
  const [scriptResult, setScriptResult] = useState<VideoScriptResult | null>(null)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)

  // Storyboard state
  const [storyboard, setStoryboard] = useState<StoryboardShot[]>([])
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false)
  const [storyboardError, setStoryboardError] = useState<string | null>(null)

  // Assets state
  const [assets, setAssets] = useState<UploadedAsset[]>([])

  // Diagnosis state
  const [diagnosis, setDiagnosis] = useState<AssetDiagnosisResult | null>(null)
  const [isDiagnosing, setIsDiagnosing] = useState(false)

  // Video generation state
  const [videoTask, setVideoTask] = useState<GenerateVideoTask | null>(null)
  const [videoStatus, setVideoStatus] = useState<"idle" | "pending" | "running" | "succeeded" | "failed">("idle")
  const [videoError, setVideoError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Compose result
  const [composeResult, setComposeResult] = useState<ComposeResult | null>(null)
  const [isComposing, setIsComposing] = useState(false)

  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  // Step 1: Generate Script
  const handleGenerateScript = useCallback(async (productBrief: ProductVideoBrief) => {
    setIsGeneratingScript(true)
    setScriptError(null)
    setBrief(productBrief)
    setCurrentStep("script")

    try {
      const response = await fetch("/api/video/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productBrief),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate script")
      }

      const result: VideoScriptResult = await response.json()
      setScriptResult(result)
      setCurrentStep("storyboard")
      // Auto-generate storyboard after script is ready
      await handleGenerateStoryboard(productBrief, result.fullScript)
    } catch (err) {
      setScriptError(err instanceof Error ? err.message : "生成脚本失败")
      setCurrentStep("form")
    } finally {
      setIsGeneratingScript(false)
    }
  }, [])

  // Step 2: Generate Storyboard
  const handleGenerateStoryboard = useCallback(async (productBrief: ProductVideoBrief, fullScript: string) => {
    setIsGeneratingStoryboard(true)
    setStoryboardError(null)

    try {
      const response = await fetch("/api/video/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: productBrief, fullScript }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate storyboard")
      }

      const shots: StoryboardShot[] = await response.json()
      setStoryboard(shots)
      setCurrentStep("assets")
    } catch (err) {
      setStoryboardError(err instanceof Error ? err.message : "生成分镜失败")
    } finally {
      setIsGeneratingStoryboard(false)
    }
  }, [])

  // Step 3: Assets changed
  const handleAssetsChange = useCallback((updatedAssets: UploadedAsset[]) => {
    setAssets(updatedAssets)
  }, [])

  // Step 4: Diagnose Assets
  const handleDiagnose = useCallback(async () => {
    if (storyboard.length === 0) return

    setIsDiagnosing(true)
    setCurrentStep("diagnosis")

    try {
      const response = await fetch("/api/video/diagnose-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyboard, assets }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to diagnose assets")
      }

      const result: AssetDiagnosisResult = await response.json()
      setDiagnosis(result)
    } catch (err) {
      console.error("Diagnosis error:", err)
    } finally {
      setIsDiagnosing(false)
    }
  }, [storyboard, assets])

  // Step 5: Generate Video
  const startVideoGeneration = useCallback(async () => {
    if (!scriptResult) return

    setVideoStatus("pending")
    setVideoError(null)
    setCurrentStep("generating")

    try {
      // Create video task via provider
      const createResponse = await fetch("/api/video/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${scriptResult.title}\n\n${scriptResult.fullScript}`,
          aspectRatio: "9:16",
          duration: brief?.duration ?? 30,
        }),
      })

      if (!createResponse.ok) {
        const data = await createResponse.json()
        throw new Error(data.error || "Failed to create video task")
      }

      const task: GenerateVideoTask = await createResponse.json()
      setVideoTask(task)
      setVideoStatus("running")

      // Start polling
      let count = 0
      pollRef.current = setInterval(async () => {
        count++
        setPollCount(count)

        try {
          const statusResponse = await fetch(`/api/video/status?taskId=${task.taskId}`)
          if (!statusResponse.ok) throw new Error("Failed to check status")

          const statusTask: GenerateVideoTask = await statusResponse.json()
          setVideoTask(statusTask)
          setVideoStatus(statusTask.status)

          if (statusTask.status === "succeeded") {
            if (pollRef.current) clearInterval(pollRef.current)
            setCurrentStep("preview")
            // After video generation succeeds, also try compose
            await handleCompose()
          } else if (statusTask.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current)
            setVideoError(statusTask.errorMessage || "Video generation failed")
          }
        } catch (err) {
          console.error("Poll error:", err)
        }
      }, 1500)
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "视频生成失败")
      setVideoStatus("failed")
    }
  }, [scriptResult, brief])

  // Step 6: Compose Video
  const handleCompose = useCallback(async () => {
    if (!scriptResult || storyboard.length === 0) return

    setIsComposing(true)

    try {
      const response = await fetch("/api/video/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyboard,
          assets,
          generatedClips: [],
          subtitles: storyboard.map((s) => s.subtitle),
          title: scriptResult.title,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to compose video")
      }

      const result: ComposeResult = await response.json()
      setComposeResult(result)
    } catch (err) {
      console.error("Compose error:", err)
    } finally {
      setIsComposing(false)
    }
  }, [storyboard, assets, scriptResult])

  // Step indicators
  const steps: { key: WorkflowStep; label: string; complete: boolean }[] = [
    { key: "form", label: "填写信息", complete: brief !== null },
    { key: "script", label: "生成脚本", complete: scriptResult !== null },
    { key: "storyboard", label: "生成分镜", complete: storyboard.length > 0 },
    { key: "assets", label: "上传素材", complete: assets.length > 0 },
    { key: "diagnosis", label: "素材诊断", complete: diagnosis !== null },
    { key: "generating", label: "生成视频", complete: videoStatus === "succeeded" },
    { key: "preview", label: "预览下载", complete: composeResult !== null },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="h-full flex flex-col bg-[#0A0A0B] text-zinc-100">
      {/* Navigation Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-zinc-800 shrink-0 bg-[#0A0A0B]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">返回</span>
          </Link>
          <div className="w-px h-5 bg-zinc-800" />
          <Link href="/" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Home size={14} />
            <span className="text-xs">首页</span>
          </Link>
          <ChevronRight size={12} className="text-zinc-600" />
          <span className="text-sm text-orange-400 font-medium">AI 视频工厂</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-orange-400" />
          <span className="text-xs text-zinc-500">Module 2 · AI Video Marketing Factory</span>
        </div>
      </header>

      {/* Progress Steps Bar */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-zinc-800/50 overflow-x-auto">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-1 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors ${
                i <= currentStepIndex
                  ? step.complete
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-zinc-800/50 text-zinc-600 border border-zinc-800"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i <= currentStepIndex
                    ? step.complete
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white"
                    : "bg-zinc-700 text-zinc-500"
                }`}
              >
                {i + 1}
              </span>
              <span>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-4 h-px ${
                  i < currentStepIndex ? "bg-green-500/40" : "bg-zinc-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Left Column: Product Info Form */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-orange-500" />
                产品信息
              </h2>
              <ProductBriefForm onGenerate={handleGenerateScript} isGenerating={isGeneratingScript} />

              {/* Script Result */}
              {scriptResult && (
                <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
                  <h3 className="text-sm font-medium text-zinc-300">生成结果</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-zinc-500">标题</p>
                      <p className="text-sm text-zinc-200">{scriptResult.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">钩子</p>
                      <p className="text-sm text-orange-400">{scriptResult.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">卖点逻辑</p>
                      <ul className="list-disc list-inside text-sm text-zinc-300">
                        {scriptResult.sellingLogic.map((point, i) => (
                          <li key={i} className="text-xs text-zinc-400">{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">CTA</p>
                      <p className="text-sm text-zinc-200">{scriptResult.cta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">完整脚本</p>
                      <div className="rounded-lg bg-zinc-800/50 p-3 max-h-48 overflow-y-auto">
                        <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                          {scriptResult.fullScript}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scriptError && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {scriptError}
                </div>
              )}

              {storyboardError && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {storyboardError}
                </div>
              )}
            </div>
          </div>

          {/* Center Column: Assets + Storyboard */}
          <div className="lg:col-span-4 space-y-4">
            {/* Asset Library */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <AssetLibrary assets={assets} onAssetsChange={handleAssetsChange} />
            </div>

            {/* Diagnose Button */}
            {assets.length > 0 && storyboard.length > 0 && !diagnosis && (
              <button
                onClick={handleDiagnose}
                disabled={isDiagnosing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all"
              >
                <Sparkles size={16} />
                {isDiagnosing ? "诊断中..." : "诊断素材匹配"}
              </button>
            )}

            {/* Storyboard */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <StoryboardView shots={storyboard} isLoading={isGeneratingStoryboard} />
            </div>
          </div>

          {/* Right Column: Diagnosis + Video Gen + Preview */}
          <div className="lg:col-span-4 space-y-4">
            {/* Missing Asset Panel */}
            {diagnosis && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <MissingAssetPanel diagnosis={diagnosis} isDiagnosing={isDiagnosing} />
              </div>
            )}

            {/* Generate Video Button */}
            {diagnosis && videoStatus === "idle" && (
              <button
                onClick={startVideoGeneration}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <Sparkles size={18} />
                生成视频
              </button>
            )}

            {/* Video Generation Progress */}
            {videoStatus !== "idle" && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <VideoTaskProgress
                  status={videoStatus}
                  errorMessage={videoError || undefined}
                  pollCount={pollCount}
                />
              </div>
            )}

            {/* Video Preview */}
            <VideoPreview result={composeResult} isLoading={isComposing} />

            {/* Re-generate */}
            {(videoStatus === "succeeded" || videoStatus === "failed") && (
              <button
                onClick={() => {
                  // Reset to form step
                  setCurrentStep("form")
                  setBrief(null)
                  setScriptResult(null)
                  setStoryboard([])
                  setAssets([])
                  setDiagnosis(null)
                  setVideoTask(null)
                  setVideoStatus("idle")
                  setVideoError(null)
                  setComposeResult(null)
                  if (pollRef.current) clearInterval(pollRef.current)
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-all"
              >
                重新开始
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
