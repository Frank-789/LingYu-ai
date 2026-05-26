import type { ProductVideoBrief, VideoScriptResult } from "@/lib/types/video"
import { extractJson } from "@/lib/extract-json"

const DEEPSEEK_BASE = "https://api.deepseek.com/v1"

export async function generateScript(brief: ProductVideoBrief): Promise<VideoScriptResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured")
  }

  const systemPrompt = `你是一位资深的水果电商短视频脚本撰写专家。
根据产品信息生成完整的短视频脚本，返回严格的 JSON 格式（不要包含 markdown 代码块标记）。

输出格式：
{
  "title": "短视频标题（吸引眼球，不超过15字）",
  "hook": "开场钩子（一句话吸引注意力，不超过20字）",
  "fullScript": "完整脚本正文（分段落，每段标注时间点和画面描述）",
  "sellingLogic": ["卖点1", "卖点2", "卖点3"],
  "cta": "结尾行动号召"
}

要求：
- 脚本时长需要匹配目标平台的常见时长
- 突出水果核心卖点（产地、口感、价格、物流等）
- 语言风格匹配目标平台（抖音: 快节奏; 快手: 接地气; 小红书: 精致种草; 视频号: 品质感）`

  const userMessage = `请为以下水果产品生成短视频脚本：
水果名称：${brief.fruitName}
${brief.origin ? `产地：${brief.origin}` : ""}
${brief.specification ? `规格：${brief.specification}` : ""}
${brief.price ? `价格：${brief.price}` : ""}
卖点：${brief.sellingPoints.join("、")}
${brief.logistics ? `物流：${brief.logistics}` : ""}
${brief.afterSales ? `售后：${brief.afterSales}` : ""}
目标平台：${brief.targetPlatform}
时长：${brief.duration}秒
风格：${brief.style}`

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
    console.error("DeepSeek API error (script):", response.status, error)
    throw new Error(`Failed to generate script: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("Empty response from DeepSeek")
  }

  // Parse JSON from AI response (handles markdown wrapping, leading text, etc.)
  const result = extractJson<VideoScriptResult>(content)

  if (!result) {
    console.error("Failed to parse script result. Raw content:", content.slice(0, 500))
    throw new Error("Failed to parse script result from AI response")
  }

  return result
}
