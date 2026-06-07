export async function validateStabilityKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.stability.ai/v1/user/account", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
