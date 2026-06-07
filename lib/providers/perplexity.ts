// Perplexity has no cheap models-list endpoint — format validate only
export function validatePerplexityKey(apiKey: string): boolean {
  return apiKey.trim().startsWith("pplx-") && apiKey.trim().length >= 20;
}
