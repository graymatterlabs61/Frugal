export async function validateReplicateKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.replicate.com/v1/account", {
      headers: { Authorization: `Token ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
