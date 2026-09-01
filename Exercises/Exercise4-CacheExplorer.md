# Part 3: Cache Explorer - Understanding Data Reuse

In this section, you will compare cache performance while changing one request condition at a time.

## Steps

1. **Establish a baseline.**
   - Start a new GitHub Copilot session.
   - Submit the prompt: `What is this app doing?`
   - Open the request in Agent Debug Logs and select **Cache Explorer**.
   - Record the cache performance for this first request.

2. **Repeat the prompt with the same model.**
   - In the same session, submit `What is this app doing?` again.
   - Open Cache Explorer for the new request.
   - Record how the cache performance changed.

3. **Change the model.**
   - Stay in the same session and select a different model.
   - Submit the same prompt again.
   - Open Cache Explorer and record the cache performance.

4. **Repeat the prompt with the new model.**
   - Without changing the session or model, submit the same prompt again.
   - Open Cache Explorer and record how the cache performance changed.

5. **Change the available tool set.**
   - Stay in the same session and add or remove one of the tools available to GitHub Copilot.
   - Submit the same prompt again.
   - Open Cache Explorer and record how the cache performance changed.

## Guided Inspection

- Why might the first request in a new session have little or no reusable cached data?
- What changes when you repeat the same prompt with the same session and model?
- What happens to cache performance after you switch models?
- What happens after you change the tools available to the agent?
- Which parts of the request appear reusable, and which changes appear to invalidate cached data?

## Table Discussion

- Which condition produced the largest change in cache performance?
- Did everyone at the table observe the same values and trends? What might explain any differences?
- How could caching affect response latency and resource usage?

