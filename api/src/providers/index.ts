import { openaiProvider } from './openai';
import { anthropicProvider } from './anthropic';
import { geminiProvider } from './gemini';
import { replicateProvider } from './replicate';
import { falaiProvider } from './falai';
import type { Provider } from './types';

export const providers: Record<string, Provider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  replicate: replicateProvider,
  falai: falaiProvider,
};

export type { Provider, DailyUsage } from './types';