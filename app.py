import os
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
import anthropic

app = App(token=os.environ["SLACK_BOT_TOKEN"])
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def read_company_file(path):
    try:
        with open(f"/app/.company/{path}", "r", encoding="utf-8") as f:
            return f.read()
    except:
        return ""

def get_company_context():
    vision = read_company_file("VISION.md")
    state = read_company_file("STATE.md")
    permissions = read_company_file("steering/permissions.md")
    return f"# 会社情報\n\n{vision}\n\n# 現在の状態\n\n{state}\n\n# 権限ルール\n\n{permissions}"

AGENTS = {
    "pm": "あなたはKATAkitのPMエージェントです。要件定義・仕様書作成・プロジェクト管理を担当します。",
    "cto": "あなたはKATAkitのCTOエージェントです。技術的な意思決定・実装計画・コードレビューを担当します。",
    "cmo": "あなたはKATAkitのCMOエージェントです。SNS戦略・コンテンツ企画・マーケティングを担当します。",
    "cfo": "あなたはKATAkitのCFOエージェントです。収支管理・コスト最適化・財務レポートを担当します。",
    "cso": "あなたはKATAkitのCSOエージェントです。営業戦略・提案書作成・クライアント獲得を担当します。",
    "legal": "あなたはKATAkitのLegalエージェントです。契約レビュー・コンプライアンス確認・法務相談を担当します。",
    "cs": "あなたはKATAkitのCSエージェントです。顧客対応・クレーム処理・オンボーディングを担当します。",
    "hr": "あなたはKATAkitのHRエージェントです。エージェントのスキル管理・評価・改善を担当します。",
    "publisher": "あなたはKATAkitのPublisherエージェントです。コンテンツ企画・執筆・マルチチャネル発信を担当します。",
    "content": "あなたはKATAkitのContentエージェントです。SEO記事・LP・広告コピー・SNS投稿文を作成します。",
    "growth": "あなたはKATAkitのGrowthエージェントです。ファネル最適化・A/Bテスト・グロース戦略を担当します。",
    "consulting": "あなたはKATAkitのConsultingエージェントです。AI自動化コンサル・診断・提案書作成を担当します。",
    "bizdev": "あなたはKATAkitのBizDevエージェントです。パートナーシップ・新規事業開発・アップセルを担当します。",
    "tax": "あなたはKATAkitのTaxエージェントです。仕訳・確定申告・節税・税務カレンダー管理を担当します。",
    "morning": "あなたはKATAkitのMorning Digestエージェントです。毎朝全部門の状態を集約してAkitoに報告します。",    
    "orchestrator": """あなたはKATAkitのオーケストレーターです。CEOのAkitoからメッセージを受け取り、適切なエージェントに振り分けます。

以下のルールで振り分けてください：
- 要件定義・仕様・プロジェクト管理 → pm
- 技術・実装・コード → cto
- SNS・マーケティング・コンテンツ企画 → cmo
- お金・収支・コスト → cfo
- 営業・提案書・クライアント → cso
- 契約・法務・コンプライアンス → legal
- 顧客対応・クレーム → cs
- エージェント管理・評価 → hr
- 記事・出版・コンテンツ制作 → publisher
- SEO・広告コピー・投稿文 → content
- グロース・A/Bテスト・ファネル → growth
- コンサル・AI自動化提案 → consulting
- パートナー・新規事業 → bizdev
- 税務・確定申告・節税 → tax
- 朝の報告・状況確認 → morning

必ず以下の形式で返答してください：
AGENT: [pm/cto/cmo/cfo/cso/legal/cs/hr/publisher/content/growth/consulting/bizdev/tax/morning]
REASON: [振り分けた理由を一言で]"""
}

def route_to_agent(message):
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=100,
        messages=[{"role": "user", "content": f"以下のメッセージを適切なエージェントに振り分けてください。\n\nメッセージ: {message}"}],
        system=AGENTS["orchestrator"]
    )
    text = response.content[0].text
    agent = "pm"
    for line in text.split("\n"):
        if line.startswith("AGENT:"):
            agent = line.replace("AGENT:", "").strip().lower()
    return agent

def call_agent(agent_name, message):
    company_context = get_company_context()
    system = f"{AGENTS.get(agent_name, AGENTS['pm'])}\n\n{company_context}"
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": message}],
        system=system
    )
    return response.content[0].text

@app.event("app_mention")
def handle_mention(event, say):
    user_message = event["text"]
    agent = route_to_agent(user_message)
    reply = call_agent(agent, user_message)
    say(f"[{agent.upper()}エージェント]\n\n{reply}")

@app.event("message")
def handle_dm(event, say):
    if event.get("channel_type") == "im":
        user_message = event["text"]
        agent = route_to_agent(user_message)
        reply = call_agent(agent, user_message)
        say(f"[{agent.upper()}エージェント]\n\n{reply}")

if __name__ == "__main__":
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    handler.start()
