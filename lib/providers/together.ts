export async function validateTogetherKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.together.xyz/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
