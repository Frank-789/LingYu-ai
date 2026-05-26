import type { ProductVideoBrief, StoryboardShot } from "@/lib/types/video"

const DEEPSEEK_BASE = "https://api.deepseek.com/v1"

export async function generateStoryboard(brief: ProductVideoBrief, fullScript: string): Promise<StoryboardShot[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured")
  }

  const systemPrompt = `你是一位专业的短视频分镜师。根据产品信息和完整脚本，生成详尽的分镜头列表。

每个分镜头包含：
- order: 镜头顺序（从1开始）
- startTime: 开始时间（秒）
- endTime: 结束时间（秒）
- sceneTitle: 镜头标题（简练）
- visualDescription: 画面视觉描述（详细）
- narration: 旁白/对白文本
- subtitle: 字幕文本
- requiredAssetType: 需要的素材类型（枚举值之一: product_closeup, fruit_cut, orchard, harvest, packing, logistics, customer_feedback, brand_logo, qr_code, unknown）
- matchedAssetIds: 空数组（后续匹配）
- isMissing: true
- generationPrompt: 如果缺少素材，AI生成画面的提示词

返回严格的 JSON 数组格式（不要包含 markdown 代码块标记）。`

  const userMessage = `请根据以下信息生成分镜头列表：

水果产品：${brief.fruitName}
目标平台：${brief.targetPlatform}
总时长：${brief.duration}秒
风格：${brief.style}

完整脚本：
${fullScript}

要求：
- 分镜总时长应匹配 ${brief.duration}秒
- 每个镜头2-5秒
- ${brief.duration <= 15 ? "生成3-5个镜头" : brief.duration <= 30 ? "生成5-8个镜头" : "生成8-12个镜头"}
- 镜头类型多样化（特写、中景、全景等）`

  const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("DeepSeek API error (storyboard):", response.status, error)
    throw new Error(`Failed to generate storyboard: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("Empty response from DeepSeek")
  }

  // Parse JSON from response
  const jsonStr = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()

  try {
    const shots: StoryboardShot[] = JSON.parse(jsonStr)
    return shots
  } catch {
    throw new Error("Failed to parse storyboard result from AI response")
  }
}
