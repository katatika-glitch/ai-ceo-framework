'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  title: string
  description: string
  netlify_url: string | null
  status: string
  created_at: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(({ projects: p, count: c }) => {
        setProjects(p ?? [])
        setCount(c ?? 0)
      })
      .finally(() => setLoading(false))
  }, [])

  const remaining = Math.max(0, 2 - count)

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-sm mx-auto space-y-8">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">マイプロジェクト</h1>
          <p className="text-zinc-500 text-sm">
            {remaining > 0
              ? `無料プラン：あと ${remaining} 個作れます`
              : '無料プランの上限に達しました'}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-zinc-500">まだプロジェクトがありません</p>
            <button
              onClick={() => router.push('/session')}
              className="px-6 py-3 rounded-2xl bg-white text-zinc-900 text-sm font-medium active:scale-95 transition-transform"
            >
              最初のプロダクトを作る
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {remaining > 0 && projects.length > 0 && (
          <button
            onClick={() => router.push('/session')}
            className="w-full py-4 rounded-2xl bg-white text-zinc-900 text-base font-semibold active:scale-95 transition-transform"
          >
            新しく作る（残り {remaining} 個）
          </button>
        )}

        {remaining === 0 && (
          <button className="w-full py-4 rounded-2xl bg-white text-zinc-900 text-base font-semibold active:scale-95 transition-transform">
            有料プランへアップグレード
          </button>
        )}

      </div>
    </main>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const date = new Date(project.created_at).toLocaleDateString('ja-JP', {
    month: 'short', day: 'numeric'
  })

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-semibold">{project.title}</p>
          <p className="text-zinc-400 text-sm mt-0.5">{project.description}</p>
        </div>
        <span className="text-zinc-600 text-xs shrink-0">{date}</span>
      </div>
      {project.netlify_url && (
        <a
          href={project.netlify_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 text-sm text-center active:scale-95 transition-transform"
        >
          開く →
        </a>
      )}
    </div>
  )
}
