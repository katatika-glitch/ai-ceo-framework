import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

function getAnthropic() { return new Anthropic() }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // プランチェック：proは無制限、freeは2件まで
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', session.user.id)
    .single()

  if (user?.plan !== 'pro') {
    const { count } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('status', 'deployed')

    if ((count ?? 0) >= 2) {
      return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
    }
  }

  const { proposal, yesNoLog } = await req.json()

  // T-08: 1ファイルHTML生成
  const htmlMsg = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: `あなたはWebフロントエンドエンジニアです。以下の仕様に従って、インタラクティブな1ファイルHTMLを生成してください。

ルール:
- HTML/CSS/JSを1つのファイルに統合する
- スマホファースト（モバイルレスポンシブ）
- ダークモードのシンプルなデザイン（背景#0a0a0a、テキスト白）
- ボタン・画面遷移・フォームなどの動的UIを含める
- バックエンドなしで動く（データはJSのメモリ内で管理）
- コードのみ返す（説明文不要）`,
    messages: [{
      role: 'user',
      content: `プロダクト: ${JSON.stringify(proposal)}\nYES/NO決定事項: ${JSON.stringify(yesNoLog)}\n\n上記の仕様でインタラクティブな1ファイルHTMLを生成してください。`
    }]
  })

  const htmlText = (htmlMsg.content[0] as { type: string; text: string }).text
  const htmlContent = htmlText.match(/```html\n?([\s\S]*?)```/)?.[1] ?? htmlText

  // Supabaseにプロジェクト保存
  const { data: project, error: insertError } = await supabaseAdmin
    .from('projects')
    .insert({
      user_id: session.user.id,
      title: proposal.title,
      description: proposal.description,
      yes_no_log: yesNoLog,
      html_content: htmlContent,
      status: 'draft',
    })
    .select()
    .single()

  if (insertError || !project) {
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 })
  }

  // T-09: Netlify自動デプロイ
  const netlifyUrl = await deployToNetlify(htmlContent, project.id)

  if (netlifyUrl) {
    await supabaseAdmin
      .from('projects')
      .update({ netlify_url: netlifyUrl, status: 'deployed' })
      .eq('id', project.id)
  }

  return NextResponse.json({
    projectId: project.id,
    netlifyUrl: netlifyUrl ?? null,
    htmlContent,
  })
}

async function deployToNetlify(html: string, projectId: string): Promise<string | null> {
  try {
    const token = process.env.NETLIFY_ACCESS_TOKEN
    const siteId = process.env.NETLIFY_SITE_ID

    if (!token || !siteId) return null

    // ZIPなしで直接ファイルダイジェストを使うDeploy API
    const sha1 = await computeSha1(html)
    const filename = 'index.html'

    // Step 1: デプロイ作成
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: { [`/${filename}`]: sha1 },
        async: false,
        title: `sayes-${projectId.slice(0, 8)}`,
      }),
    })

    const deploy = await deployRes.json()
    if (!deploy.id) return null

    // Step 2: ファイルアップロード
    await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/files/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: html,
    })

    return deploy.ssl_url ?? deploy.url ?? null
  } catch {
    return null
  }
}

async function computeSha1(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
