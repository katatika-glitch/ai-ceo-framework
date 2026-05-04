'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    key: 'work_style',
    label: 'あなたの働き方は？',
    options: ['会社員', 'フリーランス', '学生', 'その他'],
  },
  {
    key: 'industry',
    label: 'どんな業種ですか？',
    options: ['IT', '医療', '教育', '小売', 'サービス業', 'その他'],
  },
  {
    key: 'side_job_goal',
    label: '副業の目的は？',
    options: ['収益化', '業務効率化', '趣味', 'スキルアップ'],
  },
  {
    key: 'tech_level',
    label: '技術レベルは？',
    options: ['ほぼゼロ', '少しある', 'ある程度できる'],
  },
  {
    key: 'weekly_hours',
    label: '週に使える時間は？',
    options: ['週1h以下', '週1〜5h', '週5h以上'],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // 既に登録済みならセッションへリダイレクト
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile) router.replace('/session')
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [router])

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  async function handleSelect(value: string) {
    const updated = { ...answers, [current.key]: value }
    setAnswers(updated)

    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      router.push('/session')
    } catch {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col px-6 py-12">
      <div className="w-full max-w-sm mx-auto space-y-10">

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>プロフィール設定</span>
            <span>{step + 1} / {STEPS.length}</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-1 bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white leading-snug">
          {current.label}
        </h2>

        <div className="space-y-3">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={loading}
              className="w-full text-left bg-zinc-900 border border-zinc-800 text-white py-5 px-5 rounded-2xl text-base active:scale-95 transition-all hover:border-zinc-600 disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>

      </div>
    </main>
  )
}
