import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

function getAnthropic() { return new Anthropic() }

// POST /api/session
// step: 'questions' | 'propose' | 'refine' | 'finalize'
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { step, payload } = await req.json()

  if (step === 'questions') return handleQuestions(session.user.id, payload)
  if (step === 'propose') return handlePropose(session.user.id, payload)
  if (step === 'refine') return handleRefine(payload)
  return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
}

async function handleQuestions(userId: string, _payload: unknown) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  const msg = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: 'あなたはSAYESのAIアシスタントです。ユーザーのプロフィールをもとに、今日のセッションのコンテキストを把握するための YES/NO質問を2〜3問生成してください。JSONのみ返してください。',
    messages: [{
      role: 'user',
      content: `プロフィール: ${JSON.stringify(profile)}\n\n以下のJSON形式で返してください:\n{"questions": ["質問1", "質問2", "質問3"]}`
    }]
  })

  const text = (msg.content[0] as { type: string; text: string }).text
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{"questions":[]}')
  return NextResponse.json(json)
}

async function handlePropose(userId: string, payload: { profile: Record<string, string>; context: Record<string, boolean> }) {
  const { profile, context } = payload

  // 過去の提案を取得して重複排除
  const { data: pastProjects } = await supabaseAdmin
    .from('projects')
    .select('title, description')
    .eq('user_id', userId)

  const pastTitles = pastProjects?.map(p => p.title).join(', ') || 'なし'

  const msg = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: 'あなたはSAYESのAIアシスタントです。ユーザーのプロフィールとセッションコンテキストをもとに、副業・個人事業に役立つWebプロダクトを1つ提案してください。JSONのみ返してください。',
    messages: [{
      role: 'user',
      content: `プロフィール: ${JSON.stringify(profile)}\nコンテキスト: ${JSON.stringify(context)}\n過去の提案（重複禁止）: ${pastTitles}\n\n以下の形式で返してください:\n{"title": "プロダクト名", "description": "一言説明（30字以内）", "pitch": "なぜあなたに合っているか（50字以内）"}`
    }]
  })

  const text = (msg.content[0] as { type: string; text: string }).text
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}')
  return NextResponse.json(json)
}

async function handleRefine(payload: { proposal: Record<string, string>; yesNoLog: Array<{ question: string; answer: boolean }>; roundsLeft: number }) {
  const { proposal, yesNoLog, roundsLeft } = payload

  if (roundsLeft <= 0) {
    return NextResponse.json({ done: true, proposal })
  }

  const msg = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: 'あなたはSAYESのAIアシスタントです。ユーザーのYES/NOの回答をもとに、プロダクト提案を精緻化してください。JSONのみ返してください。',
    messages: [{
      role: 'user',
      content: `現在の提案: ${JSON.stringify(proposal)}\nYES/NO履歴: ${JSON.stringify(yesNoLog)}\n残り質問数: ${roundsLeft}\n\n以下の形式で返してください:\n{"nextQuestion": "次のYES/NO質問", "proposal": {"title": "...", "description": "...", "pitch": "...", "features": ["機能1", "機能2", "機能3"]}}`
    }]
  })

  const text = (msg.content[0] as { type: string; text: string }).text
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}')
  return NextResponse.json(json)
}
