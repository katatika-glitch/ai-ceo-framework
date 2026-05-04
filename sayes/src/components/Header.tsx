'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch('/api/projects')
      .then(r => r.json())
      .then(({ count }) => setProjectCount(count ?? 0))
      .catch(() => {})
  }, [session, pathname])

  const remaining = projectCount !== null ? Math.max(0, 2 - projectCount) : null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/50">
      <div className="flex items-center justify-between px-5 h-14 max-w-sm mx-auto">
        <button
          onClick={() => router.push('/session')}
          className="text-white font-bold text-lg tracking-tight"
        >
          SAYES
        </button>

        <div className="flex items-center gap-3">
          {remaining !== null && (
            <span className="text-xs text-zinc-500">
              {remaining > 0 ? `残り ${remaining}` : '上限'}
            </span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-sm font-medium"
          >
            {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-4 top-16 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 min-w-[160px] shadow-xl">
            <button
              onClick={() => { router.push('/projects'); setMenuOpen(false) }}
              className="w-full text-left px-4 py-3 text-zinc-300 text-sm rounded-xl hover:bg-zinc-800 active:scale-95 transition-all"
            >
              マイプロジェクト
            </button>
            <button
              onClick={() => { router.push('/session'); setMenuOpen(false) }}
              className="w-full text-left px-4 py-3 text-zinc-300 text-sm rounded-xl hover:bg-zinc-800 active:scale-95 transition-all"
            >
              新しく作る
            </button>
            <div className="h-px bg-zinc-800 my-1" />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left px-4 py-3 text-zinc-500 text-sm rounded-xl hover:bg-zinc-800 active:scale-95 transition-all"
            >
              ログアウト
            </button>
          </div>
        </>
      )}
    </header>
  )
}
