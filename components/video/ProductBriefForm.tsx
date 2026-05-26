"use client"

import { useState } from "react"
import type { ProductVideoBrief, VideoPlatform, VideoDuration, VideoStyle } from "@/lib/types/video"
import { Sparkles } from "lucide-react"

interface ProductBriefFormProps {
  onGenerate: (brief: ProductVideoBrief) => void
  isGenerating?: boolean
}

const platforms: { value: VideoPlatform; label: string }[] = [
  { value: "douyin", label: "抖音" },
  { value: "kuaishou", label: "快手" },
  { value: "xiaohongshu", label: "小红书" },
  { value: "shipinhao", label: "视频号" },
]

const durations: { value: VideoDuration; label: string }[] = [
  { value: 15, label: "15秒" },
  { value: 30, label: "30秒" },
  { value: 60, label: "60秒" },
]

const styles: { value: VideoStyle; label: string }[] = [
  { value: "promotion", label: "促销推广" },
  { value: "origin_story", label: "产地故事" },
  { value: "premium_gift", label: "高端礼品" },
  { value: "festival", label: "节日营销" },
  { value: "farmer_realistic", label: "果农纪实" },
]

export function ProductBriefForm({ onGenerate, isGenerating }: ProductBriefFormProps) {
  const [fruitName, setFruitName] = useState("")
  const [origin, setOrigin] = useState("")
  const [specification, setSpecification] = useState("")
  const [price, setPrice] = useState("")
  const [sellingPoint, setSellingPoint] = useState("")
  const [sellingPoints, setSellingPoints] = useState<string[]>([])
  const [logistics, setLogistics] = useState("")
  const [afterSales, setAfterSales] = useState("")
  const [targetPlatform, setTargetPlatform] = useState<VideoPlatform>("douyin")
  const [duration, setDuration] = useState<VideoDuration>(30)
  const [style, setStyle] = useState<VideoStyle>("promotion")

  const addSellingPoint = () => {
    const trimmed = sellingPoint.trim()
    if (trimmed && !sellingPoints.includes(trimmed)) {
      setSellingPoints([...sellingPoints, trimmed])
      setSellingPoint("")
    }
  }

  const removeSellingPoint = (point: string) => {
    setSellingPoints(sellingPoints.filter((p) => p !== point))
  }

  const handleSellingPointKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSellingPoint()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fruitName.trim() || sellingPoints.length === 0) return

    const brief: ProductVideoBrief = {
      fruitName: fruitName.trim(),
      origin: origin.trim() || undefined,
      specification: specification.trim() || undefined,
      price: price.trim() || undefined,
      sellingPoints,
      logistics: logistics.trim() || undefined,
      afterSales: afterSales.trim() || undefined,
      targetPlatform,
      duration,
      style,
    }

    onGenerate(brief)
  }

  const isValid = fruitName.trim() && sellingPoints.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Fruit Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          水果名称 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={fruitName}
          onChange={(e) => setFruitName(e.target.value)}
          placeholder="例如：阳光玫瑰葡萄、丹东草莓"
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Origin */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">产地</label>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="例如：云南、四川、山东"
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Specification & Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">规格</label>
          <input
            type="text"
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            placeholder="例如：2斤装"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">价格</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="例如：29.9元"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Selling Points */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          卖点 <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={sellingPoint}
            onChange={(e) => setSellingPoint(e.target.value)}
            onKeyDown={handleSellingPointKeyDown}
            placeholder="输入卖点后按回车添加"
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
          <button
            type="button"
            onClick={addSellingPoint}
            className="px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm transition-colors shrink-0"
          >
            添加
          </button>
        </div>
        {sellingPoints.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {sellingPoints.map((point) => (
              <span
                key={point}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs"
              >
                {point}
                <button
                  type="button"
                  onClick={() => removeSellingPoint(point)}
                  className="hover:text-red-400 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Logistics & After-sales */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">物流说明</label>
          <input
            type="text"
            value={logistics}
            onChange={(e) => setLogistics(e.target.value)}
            placeholder="例如：全国包邮、次日达"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">售后服务</label>
          <input
            type="text"
            value={afterSales}
            onChange={(e) => setAfterSales(e.target.value)}
            placeholder="例如：坏果包赔"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Platform */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">目标平台</label>
        <div className="grid grid-cols-2 gap-2">
          {platforms.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setTargetPlatform(p.value)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                targetPlatform === p.value
                  ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">视频时长</label>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                duration === d.value
                  ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">视频风格</label>
        <div className="grid grid-cols-2 gap-2">
          {styles.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                style === s.value
                  ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Sparkles size={16} />
        {isGenerating ? "生成中..." : "生成脚本"}
      </button>
    </form>
  )
}
