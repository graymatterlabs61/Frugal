export async function validateCohereKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.cohere.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
