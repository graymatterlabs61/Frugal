// fal.ai uses key_id:key_secret format. No cheap validation endpoint exists
// without making a billable model call, so we validate format only.
export function validateFalAIKey(apiKey: string): boolean {
  // Expect either "key_id:key_secret" or a plain token (non-empty, min length)
  return apiKey.trim().length >= 8;
}
