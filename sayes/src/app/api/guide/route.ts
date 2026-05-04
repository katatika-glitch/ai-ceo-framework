import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

function getAnthropic() { return new Anthropic() }

// アフィリエイトリンク（透明性のため明示）
const AFFILIATE_TOOLS = {
  supabase: { name: 'Supabase', url: 'https://supabase.com', desc: 'データベース・認証' },
  vercel: { name: 'Vercel', url: 'https://vercel.com', desc: 'ホスティング' },
  stripe: { name: 'Stripe', url: 'https://stripe.com/jp', desc: '決済' },
  glide: { name: 'Glide', url: 'https://www.glideapps.com', desc: 'ノーコードアプリ' },
  notion: { name: 'Notion', url: 'https://www.notion.so/ja-jp', desc: 'データベース・CMS' },
  bubble: { name: 'Bubble', url: 'https://bubble.io', desc: 'ノーコードWebアプリ' },
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await req.json()

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('title, description, yes_no_log')
    .eq('id', projectId)
    .eq('user_id', session.user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const msg = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `あなたはSAYESの実装ガイド作成AIです。
プログラミング初心者の副業志望社会人向けに、生成されたWebプロダクトを実際に動くものにするための実装ガイドを作成してください。

ガイドのルール：
- 専門用語は使わない、または使う場合は括弧内に説明を入れる
- 「〜してください」ではなく「〜しましょう」という語尾で親しみやすく
- 手順は具体的な番号付きステップで
- ノーコードで実現できる場合はノーコード手順を優先
- コードが必要な場合はそのままコピペできるコードを提示
- 各ステップの難易度を★で表示（★☆☆ = 簡単、★★☆ = 普通、★★★ = 難しい）
- 末尾に推薦ツールリストを含める（JSON形式）

出力形式：
マークダウン形式で実装ガイドを書き、最後に以下のJSONブロックを追加：
\`\`\`tools-json
{"tools": ["supabase", "vercel", "stripe", "glide", "notion", "bubble"] のうち関連するもの}
\`\`\``,
    messages: [{
      role: 'user',
      content: `プロダクト名：${project.title}
説明：${project.description}
決定事項（YES/NO）：${JSON.stringify(project.yes_no_log)}

このプロダクトの実装ガイドを作成してください。`,
    }]
  })

  const guideText = (msg.content[0] as { type: string; text: string }).text

  // ツールリストを抽出
  const toolsMatch = guideText.match(/```tools-json\n([\s\S]*?)```/)
  let recommendedTools: string[] = []
  if (toolsMatch) {
    try {
      const parsed = JSON.parse(toolsMatch[1])
      recommendedTools = parsed.tools ?? []
    } catch { /* ignore */ }
  }

  const cleanGuide = guideText.replace(/```tools-json[\s\S]*?```/, '').trim()

  const tools = recommendedTools
    .filter(k => k in AFFILIATE_TOOLS)
    .map(k => AFFILIATE_TOOLS[k as keyof typeof AFFILIATE_TOOLS])

  return NextResponse.json({ guide: cleanGuide, tools })
}
