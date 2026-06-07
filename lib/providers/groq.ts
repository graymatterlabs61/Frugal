export async function validateGroqKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
