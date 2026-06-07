export async function validateDeepSeekKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.deepseek.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
