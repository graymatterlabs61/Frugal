import type { Provider, DailyUsage } from './types';
import { AppError } from '@/utils/errors';

export const geminiProvider: Provider = {
  name: 'gemini',

  async validateKey(apiKey: string): Promise<void> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=1`,
    );
    if (res.status === 400 || res.status === 403) {
      throw new AppError('INVALID_API_KEY', 'Invalid Gemini API key', 400);
    }
    if (!res.ok) throw new AppError('PROVIDER_ERROR', 'Failed to validate Gemini key', 502);
  },

  async fetchUsage(_apiKey: string, since: Date): Promise<DailyUsage[]> {
    // Gemini usage API requires Google Cloud billing; return empty for now
    // Real implementation would use Cloud Billing API
    void since;
    return [];
  },
};