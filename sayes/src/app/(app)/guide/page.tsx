'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Tool = { name: string; url: string; desc: string }

function GuideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = searchParams.get('project')

  const [guide, setGuide] = useState('')
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) {
      router.replace('/projects')
      return
    }

    fetch('/api/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    })
      .then(r => r.json())
      .then(({ guide: g, tools: t }) => {
        setGuide(g ?? '')
        setTools(t ?? [])
      })
      .catch(() => setError('ガイドの読み込みに失敗しました。'))
      .finally(() => setLoading(false))
  }, [projectId, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">実装ガイドを作成しています…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-zinc-400">{error}</p>
        <button onClick={() => router.back()} className="text-white underline text-sm">
          戻る
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-zinc-500 text-xs">実装ガイド</p>
        <h1 className="text-2xl font-bold text-white">作り方</h1>
        <p className="text-zinc-500 text-xs">
          ※ 以下のリンクはアフィリエイトリンクを含む場合があります
        </p>
      </div>

      {/* ガイド本文 */}
      <div className="prose prose-invert prose-sm max-w-none">
        <GuideMarkdown content={guide} />
      </div>

      {/* 推薦ツール */}
      {tools.length > 0 && (
        <div className="space-y-3">
          <p className="text-zinc-400 text-sm font-medium">おすすめツール</p>
          <div className="space-y-2">
            {tools.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 active:scale-95 transition-transform"
              >
                <div>
                  <p className="text-white text-sm font-medium">{tool.name}</p>
                  <p className="text-zinc-500 text-xs">{tool.desc}</p>
                </div>
                <span className="text-zinc-600 text-sm">→</span>
              </a>
            ))}
          </div>
          <p className="text-zinc-600 text-xs">
            ※ 上記リンクはアフィリエイトリンクです
          </p>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="w-full py-4 rounded-2xl border border-zinc-700 text-zinc-400 text-sm active:scale-95 transition-transform"
      >
        戻る
      </button>
    </div>
  )
}

// シンプルなMarkdownレンダラー（外部ライブラリ不要）
function GuideMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-white font-bold text-base mt-6 mb-2">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="text-white font-semibold mt-4 mb-1">{line.slice(4)}</h3>
        if (line.startsWith('# ')) return <h1 key={i} className="text-white font-bold text-lg mt-6 mb-2">{line.slice(2)}</h1>
        if (line.match(/^\d+\./)) return <p key={i} className="pl-1">{line}</p>
        if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="pl-3 text-zinc-400">• {line.slice(2)}</p>
        if (line.startsWith('```') || line === '') return null
        if (line.startsWith('★')) return <p key={i} className="text-yellow-500 text-xs font-medium">{line}</p>
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8">
      <div className="w-full max-w-sm mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <GuideContent />
        </Suspense>
      </div>
    </main>
  )
}
