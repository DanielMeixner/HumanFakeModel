# GitHub Copilot Chat Workshop: Understanding Requests and Token Consumption

## Learning Objectives

By the end of this exercise, you will:

1. **Understand how GitHub Copilot Chat processes requests** — See the metadata, prompts, and raw payloads that Copilot sends when you interact with it.
2. **Observe the relationship between tool configuration and token consumption** — Discover how enabling or disabling tools directly impacts the number of tokens Copilot uses.
3. **Inspect what data Copilot actually sends** — Examine raw request data to understand the complexity and content of AI-powered chat interactions.

---

## Setup

Follow the instructions in the [README.md](README.md) to install and start the local fake model server. You should have the website running at `http://localhost:3000` and be ready to interact with GitHub Copilot Chat.

---

## Part 0: Baseline Understanding – Your First Request

In this section, you'll send your first prompt through Copilot Chat and explore how your request appears on the server.

### Steps

1. **Start a new GitHub Copilot Chat session** in VS Code using Agent Mode.
2. **Select "Human Fake Model"** from the model picker.
3. **Send a prompt** to the model. You can send any prompt you like—the repository doesn't need to change, though you're welcome to work in any repo you prefer.
4. **Check the website** at `http://localhost:3000`. You should see your request displayed on the page.
5. **Provide a response** (if desired). You can type a reply, which will appear back in VS Code's chat window.

### Guided Inspection

Now that you've sent your first request, let's explore what happened:

#### Upper Section – Token & Character Counts

- Look at the **upper section** of your request on the website.
- You'll see two key metrics:
  - **Character count** — the total number of characters in your prompt
  - **Token count** — the number of tokens Copilot used (you can also select different tokenizer models from the dropdown)

**Table Discussion:**
- *Why is there a dropdown picker to choose which model to use for computing tokens?* What differences might you expect between tokenizers?
- *Take a look at the character count and token count.* How do they compare? Are you surprised by the ratio?

#### Lower Section – Raw Data

- Scroll down to the **lower section** of the website.
- Here you'll find all the raw data from the request, including:
  - Full prompt content
  - Request headers and metadata
  - System information Copilot sent along with your message

**Table Discussion:**
- *Where is this information coming from?* Which parts of this data did you consciously provide?

---

## Part 1: Tools Impact Experiment – Comparing Tool Configuration

In this section, you'll run a second experiment to see how tool selection affects token consumption.

### Steps

1. **Start a new GitHub Copilot Chat session** (fresh conversation).
2. **Select "Human Fake Model"** again.
3. **Configure your tool usage:**
   - Click the **tool icon** in the chat input box.
   - You'll see a list of available tools.
   - **Recommended:** Disable all tools for this experiment (uncheck all options). This gives us a clear baseline to compare against your first request, which likely included tools.
   - *Alternative:* Feel free to experiment with different tool configurations if you prefer.
4. **Send a new prompt** — ideally similar to your first one, so the comparison is meaningful.
5. **Check the website** and note the new request in the list.
6. **Compare the two requests side-by-side:**
   - Use the **checkbox** in front of each request to select them.
   - The interface will show both requests on screen so you can investigate them together.

### Guided Inspection & Comparison

**Metrics to Compare:**
- How did the **character count** change between requests?
- How did the **token count** change?
- If tools were disabled in the second request, why might the token count differ?

**Table Discussion:**
- *Did the token count change between your first and second request?* If so, by how much?
- *What likely accounts for this difference?*



**Enjoy your exploration!** This tool is designed to make the "black box" of AI chat interactions transparent and understandable.
