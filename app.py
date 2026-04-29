import os
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
import anthropic

app = App(token=os.environ["SLACK_BOT_TOKEN"])
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

@app.event("app_mention")
def handle_mention(event, say):
    user_message = event["text"]
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        system="あなたはKATAkitのAIエージェントです。CEOのAkitoをサポートします。",
        messages=[{"role": "user", "content": user_message}]
    )
    say(response.content[0].text)

@app.event("message")
def handle_dm(event, say):
    if event.get("channel_type") == "im":
        user_message = event["text"]
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1000,
            system="あなたはKATAkitのAIエージェントです。CEOのAkitoをサポートします。",
            messages=[{"role": "user", "content": user_message}]
        )
        say(response.content[0].text)

if __name__ == "__main__":
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    handler.start()
