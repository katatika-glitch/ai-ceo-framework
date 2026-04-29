import os
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
import anthropic

app = App(token=os.environ["SLACK_BOT_TOKEN"])
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

AGENTS = {
    "pm": "あなたはKATAkitのPMエージェントです。要件定義・仕様書作成・プロジェクト管理を担当します。CEOのAkitoから依頼を受けたら、詳細な要件定義書を作成してください。",
    "cto": "あなたはKATAkitのCTOエージェントです。技術的な意思決定・実装計画・コードレビューを担当します。技術的な質問や実装に関する依頼に答えてください。",
    "cmo": "あなたはKATAkitのCMOエージェントです。Instagram戦略・コンテンツ企画・SNS運用を担当します。マーケティングや発信に関する依頼に答えてください。",
    "cfo": "あなたはKATAkitのCFOエージェントです。収支管理・コスト最適化・財務レポートを担当します。お金に関する質問や管理に答えてください。",
    "orchestrator": """あなたはKATAkitのオーケストレーターです。CEOのAkitoからメッセージを受け取り、適切なエージェントに振り分けます。

以下のルールで振り分けてください：
- 要件定義・仕様・プロジェクト管理 → pm
- 技術・実装・コード → cto  
- Instagram・SNS・マーケティング・コンテンツ → cmo
- お金・収支・コスト → cfo

必ず以下の形式で返答してください：
AGENT: [pm/cto/cmo/cfo]
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
    system = AGENTS.get(agent_name, AGENTS["pm"])
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
