import type { Provider, DailyUsage } from './types';
import { AppError } from '@/utils/errors';

export const falaiProvider: Provider = {
  name: 'falai',

  async validateKey(apiKey: string): Promise<void> {
    const res = await fetch('https://queue.fal.run/fal-ai/fast-sdxl', {
      method: 'GET',
      headers: { Authorization: `Key ${apiKey}` },
    });
    // fal.ai returns 404 on GET to queue endpoint but 401/403 for bad keys
    if (res.status === 401 || res.status === 403) {
      throw new AppError('INVALID_API_KEY', 'Invalid fal.ai API key', 400);
    }
  },

  async fetchUsage(_apiKey: string, _since: Date): Promise<DailyUsage[]> {
    // fal.ai does not expose a usage API yet — polling not supported
    return [];
  },
};