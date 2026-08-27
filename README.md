# Human Fake Model

A local, human-in-the-loop OpenAI-compatible endpoint. Requests from GitHub Copilot appear in the browser and stay pending until you type the model response.

## Run

Requires Node.js 18 or newer.

```bash
npm start
```

Open <http://127.0.0.1:3000>. To use another port, run `PORT=4000 npm start`.

## Configure VS Code

Run **Chat: Manage Language Models**, choose **Add Models**, and select **Custom Endpoint**. You can also open the generated `chatLanguageModels.json` and add:

```json
[
  {
    "name": "Local Human Model",
    "vendor": "customendpoint",
    "apiKey": "local-not-used",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "human-fake-model",
        "name": "Human Fake Model",
        "url": "http://127.0.0.1:3000/v1/chat/completions",
        "toolCalling": false,
        "vision": false,
        "maxInputTokens": 32000,
        "maxOutputTokens": 4096
      }
    ]
  }
]
```

Select **Human Fake Model** from the Copilot Chat model picker. Each prompt then appears in the web UI. Type a response and choose **Send response**.

The server supports both regular and streamed Chat Completions requests, and exposes model discovery at `GET /v1/models`.