'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Stage =
  | 'loading'
  | 'context-questions'
  | 'proposing'
  | 'proposal'
  | 'refining'
  | 'generating'
  | 'done'
  | 'limit-reached'

type Proposal = {
  title: string
  description: string
  pitch: string
  features?: string[]
}

export default function SessionPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('loading')
  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  const [contextQuestions, setContextQuestions] = useState<string[]>([])
  const [contextAnswers, setContextAnswers] = useState<Record<string, boolean>>({})
  const [contextIndex, setContextIndex] = useState(0)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [refineQuestion, setRefineQuestion] = useState('')
  const [yesNoLog, setYesNoLog] = useState<Array<{ question: string; answer: boolean }>>([])
  const [roundsLeft, setRoundsLeft] = useState(4)
  const [netlifyUrl, setNetlifyUrl] = useState('')

  useEffect(() => {
    async function init() {
      const [profileRes, questionsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'questions', payload: {} }),
        }),
      ])
      const { profile: p } = await profileRes.json()
      const { questions } = await questionsRes.json()
      setProfile(p)
      setContextQuestions(questions ?? [])
      setStage('context-questions')
    }
    init()
  }, [])

  async function handleContextAnswer(answer: boolean) {
    const question = contextQuestions[contextIndex]
    const updated = { ...contextAnswers, [question]: answer }
    setContextAnswers(updated)

    if (contextIndex < contextQuestions.length - 1) {
      setContextIndex(contextIndex + 1)
      return
    }

    // 全コンテキスト質問完了 → AI提案
    setStage('proposing')
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'propose', payload: { profile, context: updated } }),
    })
    const data = await res.json()
    setProposal(data)
    setStage('proposal')
  }

  async function handleProposalAnswer(accept: boolean) {
    if (!accept) {
      // 提案を拒否 → 再提案
      setStage('proposing')
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'propose', payload: { profile, context: contextAnswers } }),
      })
      const data = await res.json()
      setProposal(data)
      setStage('proposal')
      return
    }

    // 承認 → 精緻化フェーズへ
    setStage('refining')
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'refine', payload: { proposal, yesNoLog: [], roundsLeft } }),
    })
    const data = await res.json()
    setRefineQuestion(data.nextQuestion)
    if (data.proposal) setProposal(data.proposal)
  }

  async function handleRefineAnswer(answer: boolean) {
    const newLog = [...yesNoLog, { question: refineQuestion, answer }]
    setYesNoLog(newLog)
    const newRoundsLeft = roundsLeft - 1

    if (newRoundsLeft <= 0) {
      await generate(newLog)
      return
    }

    setRoundsLeft(newRoundsLeft)
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'refine', payload: { proposal, yesNoLog: newLog, roundsLeft: newRoundsLeft } }),
    })
    const data = await res.json()
    if (data.done) {
      await generate(newLog)
    } else {
      setRefineQuestion(data.nextQuestion)
      if (data.proposal) setProposal(data.proposal)
    }
  }

  async function generate(log: Array<{ question: string; answer: boolean }>) {
    setStage('generating')
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposal, yesNoLog: log }),
    })

    if (res.status === 403) {
      setStage('limit-reached')
      return
    }

    const data = await res.json()
    setNetlifyUrl(data.netlifyUrl ?? '')
    setStage('done')
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col px-6 py-12">
      <div className="w-full max-w-sm mx-auto">

        {stage === 'loading' && <LoadingView />}

        {stage === 'context-questions' && contextQuestions.length > 0 && (
          <YesNoView
            label={contextQuestions[contextIndex]}
            badge={`${contextIndex + 1} / ${contextQuestions.length}`}
            onYes={() => handleContextAnswer(true)}
            onNo={() => handleContextAnswer(false)}
          />
        )}

        {stage === 'proposing' && <LoadingView message="AIが提案を考えています…" />}

        {stage === 'proposal' && proposal && (
          <ProposalView
            proposal={proposal}
            onYes={() => handleProposalAnswer(true)}
            onNo={() => handleProposalAnswer(false)}
          />
        )}

        {stage === 'refining' && proposal && (
          <RefineView
            proposal={proposal}
            question={refineQuestion}
            roundsLeft={roundsLeft}
            onYes={() => handleRefineAnswer(true)}
            onNo={() => handleRefineAnswer(false)}
            onGenerate={() => generate(yesNoLog)}
          />
        )}

        {stage === 'generating' && <LoadingView message="プロダクトを生成しています…" />}

        {stage === 'done' && (
          <DoneView
            proposal={proposal!}
            netlifyUrl={netlifyUrl}
            onNew={() => router.push('/session')}
            onProjects={() => router.push('/projects')}
          />
        )}

        {stage === 'limit-reached' && (
          <LimitView onProjects={() => router.push('/projects')} />
        )}

      </div>
    </main>
  )
}

function LoadingView({ message = '読み込み中…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-400 text-sm">{message}</p>
    </div>
  )
}

function YesNoView({ label, badge, onYes, onNo }: { label: string; badge: string; onYes: () => void; onNo: () => void }) {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <span className="text-xs text-zinc-500">{badge}</span>
        <h2 className="text-2xl font-bold text-white leading-snug">{label}</h2>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onNo}
          className="flex-1 py-5 rounded-2xl border border-zinc-700 text-zinc-300 text-lg font-medium active:scale-95 transition-transform"
        >
          NO
        </button>
        <button
          onClick={onYes}
          className="flex-1 py-5 rounded-2xl bg-white text-zinc-900 text-lg font-medium active:scale-95 transition-transform"
        >
          YES
        </button>
      </div>
    </div>
  )
}

function ProposalView({ proposal, onYes, onNo }: { proposal: Proposal; onYes: () => void; onNo: () => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-zinc-400 text-sm">AIからの提案</p>
        <h2 className="text-2xl font-bold text-white">{proposal.title}</h2>
        <p className="text-zinc-300 text-base">{proposal.description}</p>
      </div>
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
        <p className="text-zinc-400 text-sm leading-relaxed">{proposal.pitch}</p>
      </div>
      <p className="text-white text-lg font-semibold">これを作ってみますか？</p>
      <div className="flex gap-4">
        <button
          onClick={onNo}
          className="flex-1 py-5 rounded-2xl border border-zinc-700 text-zinc-300 text-lg font-medium active:scale-95 transition-transform"
        >
          別の提案
        </button>
        <button
          onClick={onYes}
          className="flex-1 py-5 rounded-2xl bg-white text-zinc-900 text-lg font-medium active:scale-95 transition-transform"
        >
          YES
        </button>
      </div>
    </div>
  )
}

function RefineView({ proposal, question, roundsLeft, onYes, onNo, onGenerate }: {
  proposal: Proposal; question: string; roundsLeft: number
  onYes: () => void; onNo: () => void; onGenerate: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-zinc-500 text-xs">作るもの</p>
        <p className="text-white font-semibold">{proposal.title}</p>
        {proposal.features && (
          <ul className="mt-2 space-y-1">
            {proposal.features.map((f) => (
              <li key={f} className="text-zinc-400 text-sm flex gap-2">
                <span className="text-zinc-600">•</span>{f}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="h-px bg-zinc-800" />
      <YesNoView
        label={question}
        badge={`詳細を決める・残り ${roundsLeft} 問`}
        onYes={onYes}
        onNo={onNo}
      />
      <button
        onClick={onGenerate}
        className="w-full py-4 rounded-2xl bg-zinc-800 text-zinc-300 text-base active:scale-95 transition-transform"
      >
        このまま生成する
      </button>
    </div>
  )
}

function DoneView({ proposal, netlifyUrl, onNew, onProjects }: {
  proposal: Proposal; netlifyUrl: string; onNew: () => void; onProjects: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-zinc-400 text-sm">完成しました</p>
        <h2 className="text-2xl font-bold text-white">{proposal.title}</h2>
      </div>
      {netlifyUrl && (
        <a
          href={netlifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-5 rounded-2xl bg-white text-zinc-900 text-center text-base font-semibold active:scale-95 transition-transform"
        >
          プロダクトを開く →
        </a>
      )}
      <div className="flex gap-3">
        <button
          onClick={onProjects}
          className="flex-1 py-4 rounded-2xl border border-zinc-700 text-zinc-300 text-sm active:scale-95 transition-transform"
        >
          マイプロジェクト
        </button>
        <button
          onClick={onNew}
          className="flex-1 py-4 rounded-2xl border border-zinc-700 text-zinc-300 text-sm active:scale-95 transition-transform"
        >
          新しく作る
        </button>
      </div>
    </div>
  )
}

function LimitView({ onProjects }: { onProjects: () => void }) {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-3">
        <p className="text-4xl">🎉</p>
        <h2 className="text-2xl font-bold text-white">2個のプロダクトを作りました</h2>
        <p className="text-zinc-400 text-sm">
          無料プランの上限に達しました。<br />有料プランで無制限に作れます。
        </p>
      </div>
      <button className="w-full py-5 rounded-2xl bg-white text-zinc-900 text-base font-semibold active:scale-95 transition-transform">
        有料プランへアップグレード
      </button>
      <button
        onClick={onProjects}
        className="w-full py-4 rounded-2xl border border-zinc-700 text-zinc-300 text-sm active:scale-95 transition-transform"
      >
        マイプロジェクトを見る
      </button>
    </div>
  )
}
