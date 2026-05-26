'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Copy, Check, Package, Truck, Shield, ChevronLeft, Sparkles } from 'lucide-react'
import { getSalesPage } from '@/lib/services/sales-page-service'
import type { SalesPage } from '@/lib/services/sales-page-service'

export default function SalesPageView() {
  const params = useParams()
  const id = params.id as string
  const [page, setPage] = useState<SalesPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (id) {
      const found = getSalesPage(id)
      setPage(found || null)
      setLoading(false)
    }
  }, [id])

  const handleCopy = async () => {
    if (!page) return
    try {
      await navigator.clipboard.writeText(page.purchaseScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = page.purchaseScript
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0B] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-sm">加载中...</div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0B] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Package size={32} className="text-zinc-400" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">页面未找到</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          该营销页面不存在或已删除
        </p>
        <a
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <ChevronLeft size={16} />
          返回首页
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0B] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <ChevronLeft size={18} />
          </a>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
            灵
          </div>
          <span className="font-semibold text-sm">营销页面</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Product Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {/* Product Image Placeholder */}
          <div className="h-48 bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <Package size={40} className="text-orange-500" />
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Product Name & Price */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{page.productName}</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{page.origin}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-orange-500">¥{page.price}</span>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">产品特点</h3>
              <ul className="space-y-1.5">
                {page.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center">
            <Truck size={20} className="text-orange-500 mx-auto mb-1" />
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">物流说明</p>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">{page.logistics}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center">
            <Shield size={20} className="text-orange-500 mx-auto mb-1" />
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">售后保障</p>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">{page.afterSalesPromise}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center">
            <Sparkles size={20} className="text-orange-500 mx-auto mb-1" />
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">品质承诺</p>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">产地直发</p>
          </div>
        </div>

        {/* Purchase Script */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Sparkles size={16} className="text-orange-500" />
              购买话术
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '已复制' : '一键复制'}
            </button>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {page.purchaseScript}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        {page.contactInfo && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">联系方式</p>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{page.contactInfo}</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-zinc-400 pb-4">
          由 灵语 · 果潮联盟 AI 营销助手 生成
        </p>
      </main>
    </div>
  )
}
