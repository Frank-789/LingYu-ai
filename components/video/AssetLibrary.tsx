"use client"

import { useState, useEffect, useCallback } from "react"
import { Package } from "lucide-react"
import type { UploadedAsset, AssetType } from "@/lib/types/video"
import { AssetUploader } from "./AssetUploader"
import { AssetCard } from "./AssetCard"
import { addAsset, removeAsset, updateAssetType } from "@/lib/repositories/assets-repository"

interface AssetLibraryProps {
  assets: UploadedAsset[]
  onAssetsChange: (assets: UploadedAsset[]) => void
}

export function AssetLibrary({ assets, onAssetsChange }: AssetLibraryProps) {
  const handleUploaded = useCallback(
    (asset: UploadedAsset) => {
      addAsset(asset)
      onAssetsChange([...assets, asset])
    },
    [assets, onAssetsChange],
  )

  const handleDelete = useCallback(
    (id: string) => {
      removeAsset(id)
      onAssetsChange(assets.filter((a) => a.id !== id))
    },
    [assets, onAssetsChange],
  )

  const handleTypeChange = useCallback(
    (id: string, assetType: AssetType) => {
      updateAssetType(id, assetType)
      onAssetsChange(
        assets.map((a) => (a.id === id ? { ...a, assetType } : a)),
      )
    },
    [assets, onAssetsChange],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Package size={16} className="text-orange-400" />
        <h3 className="text-sm font-medium text-zinc-200">素材库</h3>
        {assets.length > 0 && (
          <span className="text-xs text-zinc-500 ml-auto">{assets.length} 个素材</span>
        )}
      </div>

      <AssetUploader onUploaded={handleUploaded} />

      {assets.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDelete={handleDelete}
              onTypeChange={handleTypeChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-600">
          <p className="text-sm">暂无素材，请上传图片或视频</p>
        </div>
      )}
    </div>
  )
}
