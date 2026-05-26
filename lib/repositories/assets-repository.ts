import type { UploadedAsset, AssetType } from "@/lib/types/video"

const STORAGE_KEY = "lingyu-video-assets"

function getAll(): UploadedAsset[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function persist(assets: UploadedAsset[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  } catch {
    /* quota exceeded */
  }
}

export function listAssets(): UploadedAsset[] {
  return getAll()
}

export function addAsset(asset: UploadedAsset): void {
  const assets = getAll()
  assets.push(asset)
  persist(assets)
}

export function removeAsset(id: string): void {
  const assets = getAll().filter((a) => a.id !== id)
  persist(assets)
}

export function updateAssetType(id: string, assetType: AssetType): void {
  const assets = getAll()
  const idx = assets.findIndex((a) => a.id === id)
  if (idx !== -1) {
    assets[idx] = { ...assets[idx], assetType }
    persist(assets)
  }
}
