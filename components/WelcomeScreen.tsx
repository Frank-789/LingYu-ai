'use client'

const suggestions = [
  {
    icon: '📝',
    title: '写文案',
    desc: '帮我写一款水蜜桃的商品详情页文案',
  },
  {
    icon: '🎬',
    title: '直播脚本',
    desc: '写一段直播间卖荔枝的开场话术',
  },
  {
    icon: '📱',
    title: '社媒内容',
    desc: '写一条小红书水果推广种草笔记',
  },
  {
    icon: '💡',
    title: '营销策略',
    desc: '端午节快到了，有什么水果促销方案？',
  },
  {
    icon: '🤝',
    title: '客服话术',
    desc: '客户问水果甜不甜，怎么回复？',
  },
  {
    icon: '📊',
    title: '数据洞察',
    desc: '分析水果店怎么提高复购率',
  },
]

export function WelcomeScreen({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo + Brand */}
      <div className="mb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
          灵
        </div>
      </div>
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">灵语</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-10">果潮联盟 · AI 营销助手</p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {suggestions.map((item) => (
          <button
            key={item.title}
            onClick={() => onSelect(item.desc)}
            className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left group"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-orange-500 transition-colors">
              {item.title}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              {item.desc}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-600">
        所有能力集成于一个智能体，想做什么直接说
      </p>
    </div>
  )
}
