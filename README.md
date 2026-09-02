# Human Fake Model

A local, human-in-the-loop OpenAI-compatible endpoint. Requests from GitHub Copilot appear in the browser and stay pending until you type the model response.

## What it does

- Exposes OpenAI-compatible model discovery and Chat Completions endpoints.
- Displays incoming conversations, request metadata, headers, and raw payloads in a live browser UI.
- Supports regular and streamed responses.
- Estimates input and response tokens with several GPT and o-series tokenizers.
- Keeps a request history for the lifetime of the server and compares any two requests side by side.
- Provides collapsible, copyable sections and character counts for inspecting large prompts.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A recent version of [Visual Studio Code](https://code.visualstudio.com/)

VS Code supports custom endpoint models for chat without requiring a GitHub account or a Copilot plan. Organization policies can disable bring-your-own-key models for Copilot Business or Enterprise users.

## Run locally

Install dependencies and start the server:

```bash
npm install
npm start
```

The terminal should show:

```text
Fake model UI: http://127.0.0.1:3000
Chat endpoint: http://127.0.0.1:3000/v1/chat/completions
```

Keep the process running and open <http://127.0.0.1:3000> in a browser. This page is where prompts appear and where you provide each model response.

To confirm that the endpoint is available, run this in another terminal:

```bash
curl http://127.0.0.1:3000/v1/models
```

The response should contain a model with the ID `human-fake-model`.

To use another port, run `PORT=4000 npm start` and replace port `3000` in the VS Code configuration below.

## Configure VS Code

This follows the VS Code [Add a custom endpoint model](https://code.visualstudio.com/docs/agent-customization/language-models#_add-a-custom-endpoint-model) workflow.

1. Open the Command Palette with `Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux.
2. Run **Chat: Manage Language Models**.
3. Select **Add Models**, then **Custom Endpoint**.
4. Enter `Local Models` as the group name.
5. Enter `Human Fake Model` as the display name.
6. Enter `local-not-used` as the API key. The local server does not validate it, but VS Code requires a value.
7. Select **Chat Completions** as the API type.
8. VS Code opens `chatLanguageModels.json`. Configure it as follows and save the file:

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
        "toolCalling": true,
        "vision": false,
        "maxInputTokens": 32000,
        "maxOutputTokens": 4096
      }
    ]
  }
]
```

The explicit model URL must include `/v1/chat/completions`. The `toolCalling` and `vision` values match the capabilities implemented by this server.

## Test from VS Code

1. Open Chat in VS Code and start a new chat.
2. Use the model picker below the chat input to select **Human Fake Model**.
3. Use Chat/Ask mode, not Agent mode. This fake model does not support tool calling, so VS Code might hide it when an agent requires tools.
4. Send a prompt such as `Reply with exactly: local model works`.
5. In the browser at <http://127.0.0.1:3000>, open the pending request, type `local model works`, and select **Send response**.
6. Confirm that the response appears in VS Code.

The VS Code request remains pending until you send a response from the browser. The server supports both regular and streamed Chat Completions requests.

## Use the browser UI

- Select a request from **Incoming traffic** to inspect its conversation, request settings, raw payload, and headers.
- Expand or collapse sections by selecting their headings. Use the copy button on a heading to copy that section.
- Type a response and select **Send response**, or press `Cmd+Enter` on macOS and `Ctrl+Enter` on Windows/Linux.
- Select the checkboxes beside two requests to compare their inputs, responses, metadata, and token estimates side by side.
- Completed and cancelled requests remain visible until the server restarts.

## Token usage

Each request shows estimated input, response, and total token counts. GPT-5 is the default tokenizer; use the selector to recalculate with GPT-4.1, GPT-4o, o3, GPT-4, or GPT-3.5 Turbo. The selection is saved in the browser and the final counts are returned in the OpenAI-compatible `usage` object. Counts include the supplied conversation context and tool definitions, but remain estimates because provider-side prompt formatting can differ.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/models` | Lists the `human-fake-model` model. |
| `POST` | `/v1/chat/completions` | Accepts an OpenAI Chat Completions request and waits for a browser response. |
| `GET` | `/api/requests` | Returns requests held by the current server process. |
| `GET` | `/api/events` | Sends browser updates using server-sent events. |
| `POST` | `/api/token-count` | Estimates token usage for messages, tools, and a response. |

The model endpoints are also available without the `/v1` prefix. Request history is stored only in memory; restarting the server clears it.

## Troubleshooting

- **The model is missing from the picker:** restart VS Code after saving `chatLanguageModels.json`. Also ensure the workspace is trusted; Restricted Mode can limit the picker to **Auto**.
- **The model is missing in Agent mode:** this is expected because `toolCalling` is `false`. Select it in Chat/Ask mode.
- **Requests do not appear in the browser:** keep `npm start` running and verify `curl http://127.0.0.1:3000/v1/models` succeeds.
- **Connection refused:** confirm that the port in the model URL matches the port printed by the server.
- **A request never completes:** return to the browser UI and send a non-empty response. Closing or cancelling the VS Code request marks it as cancelled.

## Security

By default, the server binds to `127.0.0.1`, accepts any bearer token, and performs no authentication. It is intended for local testing and should not be exposed to an untrusted network. If you override `HOST`, ensure the surrounding network is trusted.
