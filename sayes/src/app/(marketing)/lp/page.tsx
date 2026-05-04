import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* ナビ */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-sm mx-auto">
        <span className="font-bold text-lg tracking-tight">SAYES</span>
        <Link
          href="/login"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ログイン
        </Link>
      </nav>

      {/* ヒーロー */}
      <section className="px-6 pt-12 pb-16 max-w-sm mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          スマホだけで完結
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          作りたいものが<br />
          なくていい。
        </h1>

        <p className="text-zinc-400 text-base leading-relaxed">
          AIが「こんなの作ってみない？」と提案。<br />
          YES / NO だけで答えれば、<br />
          あなたのプロダクトが自動でできあがる。
        </p>

        <Link
          href="/login"
          className="block w-full py-5 rounded-2xl bg-white text-zinc-900 text-base font-bold active:scale-95 transition-transform"
        >
          無料で始める
        </Link>

        <p className="text-zinc-600 text-xs">
          Googleアカウントで1タップ登録 · クレジットカード不要
        </p>
      </section>

      {/* 既存ツールとの違い */}
      <section className="px-6 py-12 max-w-sm mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">
          既存ツールとの違い
        </h2>
        <div className="space-y-3">
          {[
            { label: '作りたいものがない人でも使える', sub: '既存ツールは「作りたいものがある人」向け' },
            { label: 'AIが先に提案してくれる', sub: '自分で設計・入力する必要なし' },
            { label: 'YES / NO だけで完成する', sub: 'コード・専門知識は一切不要' },
            { label: 'スマホで全部完結', sub: 'PCを開かなくていい' },
          ].map((item) => (
            <div key={item.label} className="flex gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              <div>
                <p className="text-white font-medium text-sm">{item.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* フロー */}
      <section className="px-6 py-12 max-w-sm mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">使い方</h2>
        <div className="space-y-4">
          {[
            { step: '01', title: 'プロフィールを登録', desc: '職業・目的・使える時間を選ぶだけ。1分で完了。' },
            { step: '02', title: 'AIが提案してくれる', desc: '「こんなの作ってみない？」とAIが先に動く。' },
            { step: '03', title: 'YES / NO で答える', desc: '質問に答えるだけ。考えなくていい。' },
            { step: '04', title: 'プロダクト完成', desc: 'URLが発行される。そのまま使える・シェアできる。' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <span className="text-zinc-700 font-bold text-sm shrink-0 pt-0.5">{item.step}</span>
              <div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 料金 */}
      <section className="px-6 py-12 max-w-sm mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">料金</h2>
        <div className="space-y-3">
          {/* 無料プラン */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-zinc-400 text-xs font-medium">無料プラン</p>
              <p className="text-3xl font-bold mt-1">¥0</p>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              {['プロジェクト2個まで', '実装ガイド付き', 'URLで即公開'].map(f => (
                <li key={f} className="flex gap-2"><span className="text-zinc-600">•</span>{f}</li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full py-3.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm text-center active:scale-95 transition-transform"
            >
              無料で始める
            </Link>
          </div>

          {/* 有料プラン */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-zinc-500 text-xs font-medium">有料プラン</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-bold text-zinc-900">¥490</p>
                <p className="text-zinc-500 text-sm">/ 月</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-700">
              {['プロジェクト無制限', 'コードエクスポート', '再生成・編集', '実装ガイド付き'].map(f => (
                <li key={f} className="flex gap-2"><span className="text-green-600">✓</span>{f}</li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full py-3.5 rounded-xl bg-zinc-900 text-white text-sm text-center font-medium active:scale-95 transition-transform"
            >
              無料で試してから始める
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 max-w-sm mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: 'プログラミングの知識は必要ですか？',
              a: '不要です。YES / NO で答えるだけでプロダクトが完成します。',
            },
            {
              q: '生成されたプロダクトはどんなものですか？',
              a: 'スマホで動くWebアプリのモックが生成されます。URLをシェアしてすぐに使えます。',
            },
            {
              q: 'どんな副業に使えますか？',
              a: '顧客管理ツール・LP・予約フォーム・ポートフォリオなど、あなたの属性に合ったものをAIが提案します。',
            },
            {
              q: '無料プランでどこまでできますか？',
              a: 'プロジェクト2個まで無料で作れます。実装ガイドも付いています。',
            },
          ].map(({ q, a }) => (
            <div key={q} className="space-y-1">
              <p className="text-white font-medium text-sm">{q}</p>
              <p className="text-zinc-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 max-w-sm mx-auto text-center space-y-5">
        <h2 className="text-2xl font-bold">まずは無料で試してみる</h2>
        <p className="text-zinc-400 text-sm">クレジットカード不要 · 1分で始められる</p>
        <Link
          href="/login"
          className="block w-full py-5 rounded-2xl bg-white text-zinc-900 text-base font-bold active:scale-95 transition-transform"
        >
          Googleで始める
        </Link>
      </section>

      {/* フッター */}
      <footer className="border-t border-zinc-800 px-6 py-8 max-w-sm mx-auto text-center">
        <p className="text-zinc-600 text-xs">© 2026 SAYES · KATAkit</p>
      </footer>

    </main>
  )
}
