import type { StoryboardShot, UploadedAsset, AssetDiagnosisResult } from "@/lib/types/video"

export function diagnoseAssets(storyboard: StoryboardShot[], assets: UploadedAsset[]): AssetDiagnosisResult {
  const matched: StoryboardShot[] = []
  const missing: StoryboardShot[] = []
  const suggestions: string[] = []

  // Build a map of asset type -> assets
  const assetByType = new Map<string, UploadedAsset[]>()
  for (const asset of assets) {
    const existing = assetByType.get(asset.assetType) || []
    existing.push(asset)
    assetByType.set(asset.assetType, existing)
  }

  for (const shot of storyboard) {
    const matchingAssets = assetByType.get(shot.requiredAssetType) || []

    if (matchingAssets.length > 0) {
      matched.push({
        ...shot,
        isMissing: false,
        matchedAssetIds: matchingAssets.map((a) => a.id),
      })
    } else {
      const updatedShot: StoryboardShot = {
        ...shot,
        isMissing: true,
        matchedAssetIds: [],
      }

      // Try to find closest alternatives
      const alternativeTypes = findAlternativeTypes(shot.requiredAssetType)
      const alternatives = alternativeTypes.flatMap((altType) => assetByType.get(altType) || [])

      if (alternatives.length > 0) {
        suggestions.push(
          `镜头"${shot.sceneTitle}"缺少${shot.requiredAssetType}类型素材，但检测到${alternatives[0].assetType}类型素材可用。建议重新分配素材类型。`,
        )
      } else {
        const prompt = shot.generationPrompt || generateDefaultPrompt(shot)
        suggestions.push(
          `镜头"${shot.sceneTitle}"缺少${shot.requiredAssetType}类型素材。${prompt ? `AI生成提示：${prompt}` : "建议上传或AI生成相关素材。"}`,
        )
      }

      missing.push(updatedShot)
    }
  }

  return {
    matchedStoryboard: matched,
    missingShots: missing,
    suggestions,
  }
}

function findAlternativeTypes(assetType: string): string[] {
  const typeGroups: Record<string, string[]> = {
    product_closeup: ["fruit_cut", "unknown"],
    fruit_cut: ["product_closeup", "unknown"],
    orchard: ["harvest", "unknown"],
    harvest: ["orchard", "packing"],
    packing: ["logistics", "harvest"],
    logistics: ["packing"],
    customer_feedback: ["unknown"],
    brand_logo: ["unknown"],
    qr_code: ["unknown"],
    unknown: [],
  }

  return typeGroups[assetType] || []
}

function generateDefaultPrompt(shot: StoryboardShot): string {
  return `${shot.visualDescription}。风格：电商产品摄影，高清晰度，自然光。`
}
