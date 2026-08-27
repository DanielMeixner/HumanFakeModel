const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const gpt5Tokenizer = require("gpt-tokenizer/model/gpt-5");
const gpt41Tokenizer = require("gpt-tokenizer/model/gpt-4.1");
const gpt4oTokenizer = require("gpt-tokenizer/model/gpt-4o");
const o3Tokenizer = require("gpt-tokenizer/model/o3");
const gpt4Tokenizer = require("gpt-tokenizer/model/gpt-4");
const gpt35Tokenizer = require("gpt-tokenizer/model/gpt-3.5-turbo");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const publicDirectory = path.join(__dirname, "public");
const requests = new Map();
const listeners = new Set();
const tokenizers = {
  "gpt-5": gpt5Tokenizer,
  "gpt-4.1": gpt41Tokenizer,
  "gpt-4o": gpt4oTokenizer,
  o3: o3Tokenizer,
  "gpt-4": gpt4Tokenizer,
  "gpt-3.5-turbo": gpt35Tokenizer,
};

function textContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content == null ? "" : JSON.stringify(content);
  return content.map((part) => {
    if (typeof part === "string") return part;
    if (part?.type === "text" || part?.type === "input_text") return part.text || "";
    return JSON.stringify(part);
  }).join("\n");
}

function calculateUsage(messages, reply = "", tokenModel = "gpt-5", tools = []) {
  const model = tokenizers[tokenModel] ? tokenModel : "gpt-5";
  const tokenizer = tokenizers[model];
  const normalizedMessages = (Array.isArray(messages) ? messages : []).map((message) => ({
    role: message.role || "user",
    ...(message.name ? { name: message.name } : {}),
    content: textContent(message.content),
    ...(message.function_call ? { function_call: message.function_call } : {}),
  }));
  const toolTokens = Array.isArray(tools) && tools.length
    ? tokenizer.encode(JSON.stringify(tools)).length
    : 0;
  const promptTokens = tokenizer.encodeChat(normalizedMessages).length + toolTokens;
  const completionTokens = reply ? tokenizer.encode(reply).length : 0;
  return {
    token_model: model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  };
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function notifyBrowsers() {
  const event = `data: ${JSON.stringify({ type: "requests-changed" })}\n\n`;
  for (const response of listeners) response.write(event);
}

function visibleRequest(entry) {
  return {
    id: entry.id,
    receivedAt: entry.receivedAt,
    status: entry.status,
    method: entry.method,
    path: entry.path,
    headers: entry.headers,
    body: entry.body,
    reply: entry.reply,
    usage: entry.usage,
  };
}

function completeChatRequest(entry, reply, tokenModel) {
  const created = Math.floor(Date.now() / 1000);
  const completionId = `chatcmpl-${entry.id}`;
  const model = entry.body.model || "human-fake-model";
  entry.usage = calculateUsage(entry.body.messages, reply, tokenModel, entry.body.tools);
  const usage = {
    prompt_tokens: entry.usage.prompt_tokens,
    completion_tokens: entry.usage.completion_tokens,
    total_tokens: entry.usage.total_tokens,
  };

  if (entry.body.stream) {
    entry.response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    const chunk = {
      id: completionId,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta: { role: "assistant", content: reply }, finish_reason: null }],
    };
    entry.response.write(`data: ${JSON.stringify(chunk)}\n\n`);
    entry.response.write(`data: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage })}\n\n`);
    entry.response.end("data: [DONE]\n\n");
    return;
  }

  sendJson(entry.response, 200, {
    id: completionId,
    object: "chat.completion",
    created,
    model,
    choices: [{ index: 0, message: { role: "assistant", content: reply }, finish_reason: "stop" }],
    usage,
  });
}

async function handleChatCompletion(request, response, url) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    sendJson(response, 400, { error: { message: "Request body must be valid JSON." } });
    return;
  }

  const id = crypto.randomUUID();
  const entry = {
    id,
    receivedAt: new Date().toISOString(),
    status: "pending",
    method: request.method,
    path: url.pathname,
    headers: request.headers,
    body,
    response,
    reply: null,
    usage: null,
  };
  requests.set(id, entry);
  notifyBrowsers();

  response.on("close", () => {
    if (!response.writableEnded && entry.status === "pending") {
      entry.status = "cancelled";
      notifyBrowsers();
    }
  });
}

function serveFile(response, fileName, contentType) {
  fs.readFile(path.join(publicDirectory, fileName), (error, content) => {
    if (error) {
      sendJson(response, 404, { error: { message: "Not found" } });
      return;
    }
    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    response.end();
  } else if (request.method === "GET" && (url.pathname === "/v1/models" || url.pathname === "/models")) {
    sendJson(response, 200, {
      object: "list",
      data: [{ id: "human-fake-model", object: "model", created: 0, owned_by: "local" }],
    });
  } else if (request.method === "POST" && (url.pathname === "/v1/chat/completions" || url.pathname === "/chat/completions")) {
    await handleChatCompletion(request, response, url);
  } else if (request.method === "GET" && url.pathname === "/api/requests") {
    sendJson(response, 200, Array.from(requests.values()).reverse().map(visibleRequest));
  } else if (request.method === "POST" && url.pathname === "/api/token-count") {
    try {
      const body = await readJson(request);
      sendJson(response, 200, calculateUsage(body.messages, body.reply, body.tokenModel, body.tools));
    } catch {
      sendJson(response, 400, { error: { message: "Token count input must be valid JSON." } });
    }
  } else if (request.method === "GET" && url.pathname === "/api/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write("data: {\"type\":\"connected\"}\n\n");
    listeners.add(response);
    request.on("close", () => listeners.delete(response));
  } else if (request.method === "POST" && url.pathname.startsWith("/api/requests/") && url.pathname.endsWith("/reply")) {
    const id = url.pathname.split("/")[3];
    const entry = requests.get(id);
    if (!entry || entry.status !== "pending") {
      sendJson(response, 409, { error: { message: "Request is missing or no longer pending." } });
      return;
    }
    try {
      const body = await readJson(request);
      if (typeof body.reply !== "string" || !body.reply.trim()) throw new Error("Empty reply");
      entry.reply = body.reply;
      entry.status = "completed";
      completeChatRequest(entry, body.reply, body.tokenModel);
      sendJson(response, 200, visibleRequest(entry));
      notifyBrowsers();
    } catch {
      sendJson(response, 400, { error: { message: "Reply must be a non-empty string." } });
    }
  } else if (request.method === "GET" && url.pathname === "/") {
    serveFile(response, "index.html", "text/html; charset=utf-8");
  } else {
    sendJson(response, 404, { error: { message: "Not found" } });
  }
});

server.listen(port, host, () => {
  console.log(`Fake model UI: http://${host}:${port}`);
  console.log(`Chat endpoint: http://${host}:${port}/v1/chat/completions`);
});