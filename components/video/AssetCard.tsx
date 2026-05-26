"use client"

import { useState } from "react"
import { Trash2, Film, Image } from "lucide-react"
import type { UploadedAsset, AssetType } from "@/lib/types/video"

interface AssetCardProps {
  asset: UploadedAsset
  onDelete: (id: string) => void
  onTypeChange: (id: string, assetType: AssetType) => void
}

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: "product_closeup", label: "产品特写" },
  { value: "fruit_cut", label: "切果展示" },
  { value: "orchard", label: "果园场景" },
  { value: "harvest", label: "采摘场景" },
  { value: "packing", label: "包装场景" },
  { value: "logistics", label: "物流场景" },
  { value: "customer_feedback", label: "客户反馈" },
  { value: "brand_logo", label: "品牌Logo" },
  { value: "qr_code", label: "二维码" },
  { value: "unknown", label: "未分类" },
]

export function AssetCard({ asset, onDelete, onTypeChange }: AssetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const isVideo = asset.mimeType.startsWith("video/")
  const isImage = asset.mimeType.startsWith("image/")

  const handleDelete = () => {
    setIsDeleting(true)
    onDelete(asset.id)
  }

  return (
    <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-all">
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-zinc-800 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={asset.fileUrl}
            alt={asset.fileName}
            className="w-full h-full object-cover"
          />
        ) : isVideo ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              src={asset.fileUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Film size={24} className="text-white/80" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-500">
            <Image size={24} />
            <span className="text-xs">未知格式</span>
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-zinc-400 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-2">
        <p className="text-xs text-zinc-400 truncate" title={asset.fileName}>
          {asset.fileName}
        </p>

        <select
          value={asset.assetType}
          onChange={(e) => onTypeChange(asset.id, e.target.value as AssetType)}
          className="w-full text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-colors"
        >
          {assetTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
