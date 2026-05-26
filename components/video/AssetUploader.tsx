"use client"

import { useState, useRef, type DragEvent } from "react"
import { Upload, File, X } from "lucide-react"
import type { UploadedAsset } from "@/lib/types/video"

interface AssetUploaderProps {
  onUploaded: (asset: UploadedAsset) => void
}

export function AssetUploader({ onUploaded }: AssetUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    // Validate file size
    if (file.size > 50 * 1024 * 1024) {
      setError(`文件过大 (${(file.size / 1024 / 1024).toFixed(1)}MB)，最大支持50MB`)
      setIsUploading(false)
      return
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"]
    if (!allowedTypes.includes(file.type)) {
      setError(`不支持的文件格式: ${file.type}`)
      setIsUploading(false)
      return
    }

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/video/assets/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      setUploadProgress(100)
      const asset: UploadedAsset = await response.json()
      onUploaded(asset)
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败")
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await uploadFile(files[0])
    }
    // Reset so the same file can be selected again
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-orange-500 bg-orange-500/5"
            : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-zinc-400">
              <File size={20} />
              <span className="text-sm">上传中...</span>
            </div>
            <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-zinc-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                <Upload size={18} className="text-zinc-400" />
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              <span className="text-orange-400 font-medium">点击上传</span> 或拖放文件到此处
            </p>
            <p className="text-xs text-zinc-500">支持图片 (JPG, PNG, WebP) 和视频 (MP4, WebM) 格式，最大50MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <X size={14} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
