export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    return res.status === 200;
  } catch {
    return false;
  }
}
