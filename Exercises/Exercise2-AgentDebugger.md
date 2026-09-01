# GitHub Copilot Agent Debug Logs Workshop

## Learning Objectives

By the end of this workshop, you will be able to:

1. **Enable and access Agent Debug Logs** to inspect detailed traces of agent execution.
2. **Explore agent decision-making with View Logs** to understand how an agent processes a request, gathers context, and selects actions.
3. **Visualize an agent workflow with the Agent Flow Chart** to follow a request from start to finish.
4. **Investigate data reuse with Cache Explorer** to observe how changes to a session, model, or tool set affect cache performance.

---

## Setup: Enable Agent Debug Logs

Before you begin, enable Agent Debug Logs in VS Code settings. (github.copilot.chat.agentDebugLog.fileLogging.enabled). The simplest way to do this is  by clicking the github.copilot.chat.agentDebugLog.fileLogging.enabled-Link in [Agent Debug Logs documentation](https://code.visualstudio.com/docs/agents/agent-troubleshooting/chat-debug-view#_agent-debug-log-panel).

---

## Part 2: View Logs - Inspecting Agent Execution

In this section, you will use View Logs to understand how an agent processes a single request.

### Steps

1. **Start a new GitHub Copilot session.**

2. **Send a request.**
   - Enter a prompt such as `/plan add auth`.
   - If GitHub Copilot asks follow-up questions, select the first option when you are unsure. Your choices do not need to be identical to those of other attendees.

3. **Open View Logs.**
   - Open the Agent Debug Logs panel.
   - Select your session from the list.
   - Select the request you submitted.
   - Select **View Logs** to open the detailed request and response log.

4. **Examine the logs.**
   - Scroll through the complete log output.
   - Identify the major stages of request processing.
   - Note any instructions, context, and tools available to the agent.

### Guided Inspection

- **Find instructions:** Where does GitHub Copilot look for instructions in the file system? Which instruction files does it find?
- **Find context:** What workspace or session context is included with the request?
- **Find tool calls:** Does the agent use any tools? If so, how many tool calls does it make, and which tools does it use?
- **Follow the result:** Can you connect the information gathered by the agent to its final response?

### Table Discussion

- What surprised you most about the request flow?
- Was the flow simpler or more complex than you expected? Why?
- Which parts of the log would be most useful when troubleshooting an unexpected response?

