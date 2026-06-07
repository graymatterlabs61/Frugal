// All prices in USD per 1,000,000 tokens unless unit = "image" or "second"
// Prices sourced from official provider pages — June 2026
// Models marked [LEGACY] are deprecated but kept for historical usage records
// Models marked [ESTIMATE] lack official public pricing — verify before billing disputes

export type PricingUnit = "tokens" | "image" | "second";

export type PricingEntry = {
  input: number;   // cost per 1M tokens (or per image/second if unit != "tokens")
  output: number;  // cost per 1M tokens (0 for image/embedding/image-gen models)
  unit: PricingUnit;
};

// ─────────────────────────────────────────────────────────────────────────────
// ANTHROPIC  (api.anthropic.com)
// ─────────────────────────────────────────────────────────────────────────────
const ANTHROPIC: Record<string, PricingEntry> = {
  // Claude 4.x
  "claude-opus-4-8":             { input:  5.00, output: 25.00,  unit: "tokens" },
  "claude-opus-4-7":             { input:  5.00, output: 25.00,  unit: "tokens" },
  "claude-opus-4":               { input:  5.00, output: 25.00,  unit: "tokens" },
  "claude-sonnet-4-6":           { input:  3.00, output: 15.00,  unit: "tokens" },
  "claude-sonnet-4":             { input:  3.00, output: 15.00,  unit: "tokens" },
  "claude-haiku-4-5-20251001":   { input:  1.00, output:  5.00,  unit: "tokens" },
  "claude-haiku-4-5":            { input:  1.00, output:  5.00,  unit: "tokens" },
  "claude-haiku-4":              { input:  1.00, output:  5.00,  unit: "tokens" },
  // Claude 3.7
  "claude-3-7-sonnet-20250219":  { input:  3.00, output: 15.00,  unit: "tokens" },
  "claude-3-7-sonnet-latest":    { input:  3.00, output: 15.00,  unit: "tokens" },
  // Claude 3.5
  "claude-3-5-sonnet-20241022":  { input:  3.00, output: 15.00,  unit: "tokens" },
  "claude-3-5-sonnet-20240620":  { input:  3.00, output: 15.00,  unit: "tokens" },
  "claude-3-5-sonnet-latest":    { input:  3.00, output: 15.00,  unit: "tokens" },
  "claude-3-5-haiku-20241022":   { input:  0.80, output:  4.00,  unit: "tokens" },
  "claude-3-5-haiku-latest":     { input:  0.80, output:  4.00,  unit: "tokens" },
  // Claude 3
  "claude-3-opus-20240229":      { input: 15.00, output: 75.00,  unit: "tokens" },
  "claude-3-sonnet-20240229":    { input:  3.00, output: 15.00,  unit: "tokens" },
  "claude-3-haiku-20240307":     { input:  0.25, output:  1.25,  unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// OPENAI  (api.openai.com)
// ─────────────────────────────────────────────────────────────────────────────
const OPENAI: Record<string, PricingEntry> = {
  // GPT-5 family (2026) — reasoning tokens billed at output rate
  "gpt-5.5":                     { input:  5.00, output: 30.00,  unit: "tokens" },
  "gpt-5.5-pro":                 { input: 30.00, output:180.00,  unit: "tokens" },
  "gpt-5.4":                     { input:  2.50, output: 15.00,  unit: "tokens" },
  "gpt-5":                       { input:  1.25, output:  5.00,  unit: "tokens" },
  // GPT-4.1 family
  "gpt-4.1":                     { input:  2.00, output:  8.00,  unit: "tokens" },
  "gpt-4.1-mini":                { input:  0.40, output:  1.60,  unit: "tokens" },
  "gpt-4.1-nano":                { input:  0.10, output:  0.40,  unit: "tokens" },
  // GPT-4o family
  "gpt-4o":                      { input:  2.50, output: 10.00,  unit: "tokens" },
  "gpt-4o-2024-11-20":           { input:  2.50, output: 10.00,  unit: "tokens" },
  "gpt-4o-2024-08-06":           { input:  2.50, output: 10.00,  unit: "tokens" },
  "gpt-4o-2024-05-13":           { input:  5.00, output: 15.00,  unit: "tokens" },
  "gpt-4o-mini":                 { input:  0.15, output:  0.60,  unit: "tokens" },
  "gpt-4o-mini-2024-07-18":      { input:  0.15, output:  0.60,  unit: "tokens" },
  // o-series reasoning (note: internal reasoning tokens billed at output rate — can 3-10x stated cost)
  "o1":                          { input: 15.00, output: 60.00,  unit: "tokens" },
  "o1-mini":                     { input:  3.00, output: 12.00,  unit: "tokens" },
  "o3":                          { input:  2.00, output:  8.00,  unit: "tokens" },
  "o3-mini":                     { input:  1.10, output:  4.40,  unit: "tokens" },
  "o4-mini":                     { input:  1.10, output:  4.40,  unit: "tokens" },
  // Legacy
  "gpt-4-turbo":                 { input: 10.00, output: 30.00,  unit: "tokens" },
  "gpt-4-turbo-2024-04-09":      { input: 10.00, output: 30.00,  unit: "tokens" },
  "gpt-4":                       { input: 30.00, output: 60.00,  unit: "tokens" },
  "gpt-3.5-turbo":               { input:  0.50, output:  1.50,  unit: "tokens" },
  "gpt-3.5-turbo-0125":          { input:  0.50, output:  1.50,  unit: "tokens" },
  // Embeddings (output = 0)
  "text-embedding-3-small":      { input:  0.02, output:  0,     unit: "tokens" },
  "text-embedding-3-large":      { input:  0.13, output:  0,     unit: "tokens" },
  "text-embedding-ada-002":      { input:  0.10, output:  0,     unit: "tokens" },
  // DALL-E image generation (input = per image, output = 0)
  "dall-e-3-standard-1024":      { input:  0.04, output:  0,     unit: "image"  },
  "dall-e-3-hd-1024":            { input:  0.08, output:  0,     unit: "image"  },
  "dall-e-2-1024":               { input:  0.02, output:  0,     unit: "image"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE GEMINI  (generativelanguage.googleapis.com / ai.google.dev)
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI: Record<string, PricingEntry> = {
  // Gemini 3.x (2026)
  "gemini-3.5-flash":            { input:  1.50, output:  9.00,  unit: "tokens" },
  "gemini-3.1-pro":              { input:  2.00, output: 12.00,  unit: "tokens" },
  "gemini-3.0-flash-preview":    { input:  0.50, output:  3.00,  unit: "tokens" },
  // Gemini 2.5
  "gemini-2.5-pro":              { input:  1.25, output: 10.00,  unit: "tokens" }, // doubles over 200k ctx
  "gemini-2.5-pro-preview":      { input:  1.25, output: 10.00,  unit: "tokens" },
  "gemini-2.5-flash":            { input:  0.30, output:  2.50,  unit: "tokens" },
  "gemini-2.5-flash-preview":    { input:  0.30, output:  2.50,  unit: "tokens" },
  "gemini-2.5-flash-lite":       { input:  0.10, output:  0.40,  unit: "tokens" },
  // Gemini 2.0
  "gemini-2.0-flash":            { input:  0.10, output:  0.40,  unit: "tokens" },
  "gemini-2.0-flash-001":        { input:  0.10, output:  0.40,  unit: "tokens" },
  "gemini-2.0-flash-lite":       { input:  0.075,output:  0.30,  unit: "tokens" }, // [LEGACY] deprecated June 1 2026
  "gemini-2.0-pro-exp":          { input:  0,    output:  0,     unit: "tokens" }, // experimental / free tier
  // Gemini 1.5
  "gemini-1.5-pro":              { input:  3.50, output: 10.50,  unit: "tokens" }, // 2x over 128k
  "gemini-1.5-pro-latest":       { input:  3.50, output: 10.50,  unit: "tokens" },
  "gemini-1.5-flash":            { input:  0.075,output:  0.30,  unit: "tokens" },
  "gemini-1.5-flash-latest":     { input:  0.075,output:  0.30,  unit: "tokens" },
  "gemini-1.5-flash-8b":         { input:  0.0375,output: 0.15,  unit: "tokens" },
  // Embeddings
  "text-embedding-004":          { input:  0.025,output:  0,     unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// XAI / GROK  (api.x.ai)
// ─────────────────────────────────────────────────────────────────────────────
const XAI: Record<string, PricingEntry> = {
  // Grok 4.x (2026)
  "grok-4":                      { input:  3.00, output: 15.00,  unit: "tokens" },
  "grok-4.3":                    { input:  1.25, output:  2.50,  unit: "tokens" },
  "grok-4.20":                   { input:  2.00, output:  6.00,  unit: "tokens" },
  "grok-4.1-fast":               { input:  0.20, output:  0.50,  unit: "tokens" },
  // Grok 3.x
  "grok-3":                      { input:  3.00, output: 15.00,  unit: "tokens" },
  "grok-3-mini":                 { input:  0.30, output:  0.50,  unit: "tokens" },
  "grok-3-fast":                 { input:  5.00, output: 25.00,  unit: "tokens" },
  "grok-3-mini-fast":            { input:  0.60, output:  4.00,  unit: "tokens" },
  // Grok 2.x
  "grok-2-1212":                 { input:  2.00, output: 10.00,  unit: "tokens" },
  "grok-2-vision-1212":          { input:  2.00, output: 10.00,  unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// DEEPSEEK  (api.deepseek.com)
// Note: deepseek-chat + deepseek-reasoner aliases deprecated 2026-07-24
// ─────────────────────────────────────────────────────────────────────────────
const DEEPSEEK: Record<string, PricingEntry> = {
  // Current V4 models
  "deepseek-v4-flash":           { input:  0.14, output:  0.28,  unit: "tokens" },
  "deepseek-v4-pro":             { input:  1.74, output:  3.48,  unit: "tokens" }, // promo 75% off available
  "deepseek-v3.2":               { input:  0.28, output:  0.42,  unit: "tokens" },
  // Legacy aliases — still active until 2026-07-24
  "deepseek-chat":               { input:  0.27, output:  1.10,  unit: "tokens" }, // [LEGACY]
  "deepseek-reasoner":           { input:  0.55, output:  2.19,  unit: "tokens" }, // [LEGACY] routes to v4-flash thinking mode after July 2026
  // V3 snapshot
  "deepseek-v3":                 { input:  0.27, output:  1.10,  unit: "tokens" },
  "deepseek-r1":                 { input:  0.55, output:  2.19,  unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// GROQ  (api.groq.com)
// ─────────────────────────────────────────────────────────────────────────────
const GROQ: Record<string, PricingEntry> = {
  "llama-3.3-70b-versatile":          { input:  0.59, output:  0.79, unit: "tokens" },
  "llama-3.1-70b-versatile":          { input:  0.59, output:  0.79, unit: "tokens" },
  "llama-3.1-8b-instant":             { input:  0.05, output:  0.08, unit: "tokens" },
  "llama-3.2-90b-vision-preview":     { input:  0.90, output:  0.90, unit: "tokens" },
  "llama-3.2-11b-vision-preview":     { input:  0.18, output:  0.18, unit: "tokens" },
  "llama-3.2-3b-preview":             { input:  0.06, output:  0.06, unit: "tokens" },
  "llama-3.2-1b-preview":             { input:  0.04, output:  0.04, unit: "tokens" },
  "gemma2-9b-it":                     { input:  0.20, output:  0.20, unit: "tokens" },
  "mixtral-8x7b-32768":               { input:  0.24, output:  0.24, unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MISTRAL AI  (api.mistral.ai)
// ─────────────────────────────────────────────────────────────────────────────
const MISTRAL: Record<string, PricingEntry> = {
  // Frontier
  "mistral-large-2":             { input:  2.00, output:  6.00,  unit: "tokens" },
  "mistral-large-latest":        { input:  2.00, output:  6.00,  unit: "tokens" },
  "mistral-large-3":             { input:  0.50, output:  1.50,  unit: "tokens" }, // 4x cheaper than Large 2
  // Reasoning (Magistral)
  "magistral-medium-latest":     { input:  2.00, output:  5.00,  unit: "tokens" },
  "magistral-small-latest":      { input:  0.50, output:  1.50,  unit: "tokens" },
  // Small / code
  "mistral-small-3":             { input:  0.10, output:  0.30,  unit: "tokens" },
  "mistral-small-latest":        { input:  0.10, output:  0.30,  unit: "tokens" },
  "codestral-latest":            { input:  0.30, output:  0.90,  unit: "tokens" },
  // Edge models
  "ministral-8b-latest":         { input:  0.10, output:  0.10,  unit: "tokens" },
  "ministral-3b-latest":         { input:  0.04, output:  0.04,  unit: "tokens" },
  "open-mistral-nemo":           { input:  0.15, output:  0.15,  unit: "tokens" },
  // Open weights
  "open-mixtral-8x22b":          { input:  2.00, output:  6.00,  unit: "tokens" },
  "open-mixtral-8x7b":           { input:  0.70, output:  0.70,  unit: "tokens" },
  "open-mistral-7b":             { input:  0.25, output:  0.25,  unit: "tokens" },
  // Vision
  "pixtral-large-latest":        { input:  2.00, output:  6.00,  unit: "tokens" },
  "pixtral-12b-2409":            { input:  0.15, output:  0.15,  unit: "tokens" },
  // Embeddings
  "mistral-embed":               { input:  0.10, output:  0,     unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// COHERE  (api.cohere.com)
// ─────────────────────────────────────────────────────────────────────────────
const COHERE: Record<string, PricingEntry> = {
  "command-r-plus":              { input:  2.50, output: 10.00,  unit: "tokens" },
  "command-r-plus-08-2024":      { input:  2.50, output: 10.00,  unit: "tokens" },
  "command-r":                   { input:  0.15, output:  0.60,  unit: "tokens" },
  "command-r-08-2024":           { input:  0.15, output:  0.60,  unit: "tokens" },
  "command-r7b":                 { input:  0.0375,output: 0.15,  unit: "tokens" },
  "command":                     { input:  1.00, output:  2.00,  unit: "tokens" },
  "command-light":               { input:  0.30, output:  0.60,  unit: "tokens" },
  // Embeddings
  "embed-english-v3.0":          { input:  0.10, output:  0,     unit: "tokens" },
  "embed-multilingual-v3.0":     { input:  0.10, output:  0,     unit: "tokens" },
  // Rerank (priced per query, not per token — input = per 1M search tokens)
  "rerank-english-v3.0":         { input:  2.00, output:  0,     unit: "tokens" },
  "rerank-multilingual-v3.0":    { input:  2.00, output:  0,     unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// PERPLEXITY  (api.perplexity.ai) — online search-augmented models
// Note: search/citation fees are per-request on top of token costs
// ─────────────────────────────────────────────────────────────────────────────
const PERPLEXITY: Record<string, PricingEntry> = {
  "sonar":                       { input:  1.00, output:  1.00,  unit: "tokens" },
  "sonar-pro":                   { input:  3.00, output: 15.00,  unit: "tokens" },
  "sonar-reasoning":             { input:  1.00, output:  5.00,  unit: "tokens" },
  "sonar-reasoning-pro":         { input:  2.00, output:  8.00,  unit: "tokens" },
  "sonar-deep-research":         { input:  2.00, output:  8.00,  unit: "tokens" },
  // Legacy names still returned in API responses
  "llama-3.1-sonar-small-128k-online": { input: 0.20, output: 0.20, unit: "tokens" },
  "llama-3.1-sonar-large-128k-online": { input: 1.00, output: 1.00, unit: "tokens" },
  "llama-3.1-sonar-huge-128k-online":  { input: 5.00, output: 5.00, unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// STABILITY AI  (api.stability.ai) — image generation, priced per image
// ─────────────────────────────────────────────────────────────────────────────
const STABILITY: Record<string, PricingEntry> = {
  "stable-image-ultra":            { input: 0.14,  output: 0, unit: "image" },
  "stable-image-core":             { input: 0.03,  output: 0, unit: "image" },
  "stable-diffusion-3-large":      { input: 0.065, output: 0, unit: "image" },
  "stable-diffusion-3-medium":     { input: 0.035, output: 0, unit: "image" },
  "stable-diffusion-3-large-turbo":{ input: 0.04,  output: 0, unit: "image" },
  "stable-diffusion-xl-1024-v1-0": { input: 0.008, output: 0, unit: "image" },
};

// ─────────────────────────────────────────────────────────────────────────────
// FAL.AI  (fal.run) — image and video generation
// image: input = cost per image, output = 0
// second: input = cost per second of video, output = 0
// ─────────────────────────────────────────────────────────────────────────────
const FALAI: Record<string, PricingEntry> = {
  // FLUX image models
  "fal-ai/flux/schnell":                   { input: 0.025, output: 0, unit: "image"  },
  "fal-ai/flux/dev":                       { input: 0.025, output: 0, unit: "image"  },
  "fal-ai/flux-pro":                       { input: 0.05,  output: 0, unit: "image"  },
  "fal-ai/flux-pro/v1.1":                  { input: 0.04,  output: 0, unit: "image"  },
  "fal-ai/flux-pro/v1.1-ultra":            { input: 0.06,  output: 0, unit: "image"  },
  "fal-ai/flux-realism":                   { input: 0.025, output: 0, unit: "image"  },
  // Stable Diffusion on fal
  "fal-ai/stable-diffusion-v3-medium":     { input: 0.04,  output: 0, unit: "image"  },
  "fal-ai/aura-flow":                      { input: 0.035, output: 0, unit: "image"  },
  // Video models — priced per second of output video
  "fal-ai/sora-2":                         { input: 0.10,  output: 0, unit: "second" }, // $0.50 per 5s clip
  "fal-ai/kling-video/v2.0/pro":           { input: 0.08,  output: 0, unit: "second" }, // $0.40 per 5s clip
  "fal-ai/kling-video/v1.6/pro/image-to-video": { input: 0.056, output: 0, unit: "second" },
  "fal-ai/stable-video-diffusion":         { input: 0.05,  output: 0, unit: "second" }, // $0.20 per 4s clip
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGETHER AI  (api.together.xyz)
// Model IDs use provider/ModelName format
// ─────────────────────────────────────────────────────────────────────────────
const TOGETHER: Record<string, PricingEntry> = {
  // Meta Llama
  "meta-llama/Llama-3.3-70B-Instruct-Turbo":       { input: 0.88, output: 0.88, unit: "tokens" },
  "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo":  { input: 3.50, output: 3.50, unit: "tokens" },
  "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo":   { input: 0.88, output: 0.88, unit: "tokens" },
  "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo":    { input: 0.18, output: 0.18, unit: "tokens" },
  "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo": { input: 1.20, output: 1.20, unit: "tokens" },
  "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo": { input: 0.18, output: 0.18, unit: "tokens" },
  // Mistral / Mixtral
  "mistralai/Mixtral-8x7B-Instruct-v0.1":  { input: 0.60, output: 0.60, unit: "tokens" },
  "mistralai/Mixtral-8x22B-Instruct-v0.1": { input: 1.20, output: 1.20, unit: "tokens" },
  "mistralai/Mistral-7B-Instruct-v0.3":    { input: 0.20, output: 0.20, unit: "tokens" },
  // Qwen
  "Qwen/Qwen2.5-72B-Instruct-Turbo":       { input: 1.20, output: 1.20, unit: "tokens" },
  "Qwen/Qwen2.5-7B-Instruct-Turbo":        { input: 0.30, output: 0.30, unit: "tokens" },
  "Qwen/Qwen3.6-Plus":                     { input: 0.50, output: 3.00, unit: "tokens" },
  // DeepSeek via Together (different price from native deepseek.com)
  "deepseek-ai/DeepSeek-V4-Pro":           { input: 2.10, output: 4.40, unit: "tokens" },
  "deepseek-ai/DeepSeek-V3.1":             { input: 0.60, output: 1.70, unit: "tokens" },
  "deepseek-ai/DeepSeek-V3":               { input: 1.25, output: 1.25, unit: "tokens" },
  "deepseek-ai/DeepSeek-R1":               { input: 3.00, output: 7.00, unit: "tokens" },
  // Google / other
  "google/gemma-2-27b-it":                 { input: 0.80, output: 0.80, unit: "tokens" },
  "google/gemma-2-9b-it":                  { input: 0.30, output: 0.30, unit: "tokens" },
  // Kimi / MiniMax (2026 additions)
  "moonshot-ai/Kimi-K2.6":                 { input: 1.20, output: 4.50, unit: "tokens" },
  "minimax/MiniMax-M2.7":                  { input: 0.30, output: 1.20, unit: "tokens" },
  // Budget
  "gpt-oss-20b":                           { input: 0.05, output: 0.20, unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIREWORKS AI  (api.fireworks.ai)
// ─────────────────────────────────────────────────────────────────────────────
const FIREWORKS: Record<string, PricingEntry> = {
  "accounts/fireworks/models/llama-v3p3-70b-instruct":   { input: 0.90, output: 0.90, unit: "tokens" },
  "accounts/fireworks/models/llama-v3p1-405b-instruct":  { input: 3.00, output: 3.00, unit: "tokens" },
  "accounts/fireworks/models/llama-v3p1-70b-instruct":   { input: 0.90, output: 0.90, unit: "tokens" },
  "accounts/fireworks/models/llama-v3p1-8b-instruct":    { input: 0.20, output: 0.20, unit: "tokens" },
  "accounts/fireworks/models/mixtral-8x7b-instruct":     { input: 0.50, output: 0.50, unit: "tokens" },
  "accounts/fireworks/models/mixtral-8x22b-instruct":    { input: 1.20, output: 1.20, unit: "tokens" },
  "accounts/fireworks/models/qwen2p5-72b-instruct":      { input: 0.90, output: 0.90, unit: "tokens" },
  "accounts/fireworks/models/deepseek-v3":               { input: 0.90, output: 0.90, unit: "tokens" },
  "accounts/fireworks/models/deepseek-r1":               { input: 3.00, output: 8.00, unit: "tokens" },
  "accounts/fireworks/models/phi-3-vision-128k-instruct":{ input: 0.20, output: 0.20, unit: "tokens" },
  // Fast short model aliases
  "fireworks/llama-v3p3-70b-instruct":   { input: 0.90, output: 0.90, unit: "tokens" },
  "fireworks/deepseek-v3":               { input: 0.90, output: 0.90, unit: "tokens" },
  "fireworks/deepseek-r1":               { input: 3.00, output: 8.00, unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// AMAZON BEDROCK  (bedrock.amazonaws.com)
// Prices are us-east-1 on-demand; cross-region inference adds 10%
// ─────────────────────────────────────────────────────────────────────────────
const BEDROCK: Record<string, PricingEntry> = {
  // Anthropic Claude via Bedrock (same as native)
  "anthropic.claude-opus-4-8-20260528-v1:0":  { input:  5.00, output: 25.00, unit: "tokens" },
  "anthropic.claude-sonnet-4-6-20251101-v1:0":{ input:  3.00, output: 15.00, unit: "tokens" },
  "anthropic.claude-haiku-4-5-20251001-v1:0": { input:  1.00, output:  5.00, unit: "tokens" },
  "anthropic.claude-3-5-sonnet-20241022-v2:0":{ input:  3.00, output: 15.00, unit: "tokens" },
  "anthropic.claude-3-5-haiku-20241022-v1:0": { input:  0.80, output:  4.00, unit: "tokens" },
  "anthropic.claude-3-opus-20240229-v1:0":    { input: 15.00, output: 75.00, unit: "tokens" },
  "anthropic.claude-3-haiku-20240307-v1:0":   { input:  0.25, output:  1.25, unit: "tokens" },
  // Amazon Nova models (native AWS)
  "amazon.nova-pro-v1:0":   { input:  0.80, output:  3.20, unit: "tokens" },
  "amazon.nova-lite-v1:0":  { input:  0.06, output:  0.24, unit: "tokens" },
  "amazon.nova-micro-v1:0": { input:  0.035,output:  0.14, unit: "tokens" },
  // Meta Llama via Bedrock
  "meta.llama3-3-70b-instruct-v1:0": { input: 0.72, output: 0.72, unit: "tokens" },
  "meta.llama3-1-70b-instruct-v1:0": { input: 0.72, output: 0.72, unit: "tokens" },
  "meta.llama3-1-8b-instruct-v1:0":  { input: 0.22, output: 0.22, unit: "tokens" },
  // Mistral via Bedrock
  "mistral.mistral-large-2402-v1:0": { input: 4.00, output: 12.00, unit: "tokens" },
  "mistral.mistral-7b-instruct-v0:2":{ input: 0.15, output:  0.20, unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// OPENROUTER  (openrouter.ai)
// 300+ models — prices match provider rates (no markup per OpenRouter policy)
// Model IDs use provider/model-name format
// ─────────────────────────────────────────────────────────────────────────────
const OPENROUTER: Record<string, PricingEntry> = {
  // Anthropic via OpenRouter
  "anthropic/claude-opus-4-8":            { input:  5.00, output: 25.00, unit: "tokens" },
  "anthropic/claude-opus-4":              { input:  5.00, output: 25.00, unit: "tokens" },
  "anthropic/claude-sonnet-4-6":          { input:  3.00, output: 15.00, unit: "tokens" },
  "anthropic/claude-sonnet-4":            { input:  3.00, output: 15.00, unit: "tokens" },
  "anthropic/claude-haiku-4-5":           { input:  1.00, output:  5.00, unit: "tokens" },
  "anthropic/claude-3-7-sonnet":          { input:  3.00, output: 15.00, unit: "tokens" },
  "anthropic/claude-3-5-sonnet":          { input:  3.00, output: 15.00, unit: "tokens" },
  "anthropic/claude-3-5-sonnet-20241022": { input:  3.00, output: 15.00, unit: "tokens" },
  "anthropic/claude-3-5-haiku":           { input:  0.80, output:  4.00, unit: "tokens" },
  "anthropic/claude-3-opus":              { input: 15.00, output: 75.00, unit: "tokens" },
  "anthropic/claude-3-haiku":             { input:  0.25, output:  1.25, unit: "tokens" },
  // OpenAI via OpenRouter
  "openai/gpt-5.5":                       { input:  5.00, output: 30.00, unit: "tokens" },
  "openai/gpt-5.4":                       { input:  2.50, output: 15.00, unit: "tokens" },
  "openai/gpt-5":                         { input:  1.25, output:  5.00, unit: "tokens" },
  "openai/gpt-4.1":                       { input:  2.00, output:  8.00, unit: "tokens" },
  "openai/gpt-4.1-mini":                  { input:  0.40, output:  1.60, unit: "tokens" },
  "openai/gpt-4.1-nano":                  { input:  0.10, output:  0.40, unit: "tokens" },
  "openai/gpt-4o":                        { input:  2.50, output: 10.00, unit: "tokens" },
  "openai/gpt-4o-mini":                   { input:  0.15, output:  0.60, unit: "tokens" },
  "openai/o1":                            { input: 15.00, output: 60.00, unit: "tokens" },
  "openai/o3":                            { input:  2.00, output:  8.00, unit: "tokens" },
  "openai/o3-mini":                       { input:  1.10, output:  4.40, unit: "tokens" },
  "openai/o4-mini":                       { input:  1.10, output:  4.40, unit: "tokens" },
  // Google via OpenRouter
  "google/gemini-3.5-flash":              { input:  1.50, output:  9.00, unit: "tokens" },
  "google/gemini-3.1-pro":               { input:  2.00, output: 12.00, unit: "tokens" },
  "google/gemini-2.5-pro":               { input:  1.25, output: 10.00, unit: "tokens" },
  "google/gemini-2.5-pro-preview":       { input:  1.25, output: 10.00, unit: "tokens" },
  "google/gemini-2.5-flash":             { input:  0.30, output:  2.50, unit: "tokens" },
  "google/gemini-2.0-flash-001":         { input:  0.10, output:  0.40, unit: "tokens" },
  "google/gemini-flash-1.5":             { input:  0.075,output:  0.30, unit: "tokens" },
  "google/gemini-pro-1.5":               { input:  3.50, output: 10.50, unit: "tokens" },
  // xAI via OpenRouter
  "x-ai/grok-4":                          { input:  3.00, output: 15.00, unit: "tokens" },
  "x-ai/grok-4.3":                        { input:  1.25, output:  2.50, unit: "tokens" },
  "x-ai/grok-3":                          { input:  3.00, output: 15.00, unit: "tokens" },
  "x-ai/grok-3-mini":                     { input:  0.30, output:  0.50, unit: "tokens" },
  // Meta Llama via OpenRouter
  "meta-llama/llama-3.3-70b-instruct":    { input:  0.12, output:  0.30, unit: "tokens" },
  "meta-llama/llama-3.1-405b-instruct":   { input:  2.70, output:  2.70, unit: "tokens" },
  "meta-llama/llama-3.1-70b-instruct":    { input:  0.35, output:  0.40, unit: "tokens" },
  "meta-llama/llama-3.1-8b-instruct":     { input:  0.055,output:  0.055,unit: "tokens" },
  // DeepSeek via OpenRouter
  "deepseek/deepseek-v4-flash":           { input:  0.14, output:  0.28, unit: "tokens" },
  "deepseek/deepseek-v4-pro":             { input:  1.74, output:  3.48, unit: "tokens" },
  "deepseek/deepseek-chat":               { input:  0.27, output:  1.10, unit: "tokens" },
  "deepseek/deepseek-r1":                 { input:  0.55, output:  2.19, unit: "tokens" },
  "deepseek/deepseek-r1-distill-llama-70b":{ input: 0.23, output:  0.69, unit: "tokens" },
  // Mistral via OpenRouter
  "mistralai/mistral-large-3":            { input:  0.50, output:  1.50, unit: "tokens" },
  "mistralai/mistral-large-2":            { input:  2.00, output:  6.00, unit: "tokens" },
  "mistralai/mistral-large":              { input:  2.00, output:  6.00, unit: "tokens" },
  "mistralai/mistral-small":              { input:  0.10, output:  0.30, unit: "tokens" },
  "mistralai/magistral-medium":           { input:  2.00, output:  5.00, unit: "tokens" },
  "mistralai/codestral-mamba":            { input:  0.25, output:  0.25, unit: "tokens" },
  "mistralai/mixtral-8x22b-instruct":     { input:  0.90, output:  0.90, unit: "tokens" },
  "mistralai/mixtral-8x7b-instruct":      { input:  0.24, output:  0.24, unit: "tokens" },
  // Qwen via OpenRouter
  "qwen/qwen-2.5-72b-instruct":           { input:  0.35, output:  0.40, unit: "tokens" },
  "qwen/qwen-2.5-coder-32b-instruct":     { input:  0.07, output:  0.16, unit: "tokens" },
  "qwen/qwq-32b":                         { input:  0.12, output:  0.18, unit: "tokens" },
  "qwen/qwen3.6-plus":                    { input:  0.50, output:  3.00, unit: "tokens" },
  // Cohere via OpenRouter
  "cohere/command-r-plus":                { input:  2.50, output: 10.00, unit: "tokens" },
  "cohere/command-r":                     { input:  0.15, output:  0.60, unit: "tokens" },
  // Moonshot / MiniMax
  "moonshot/kimi-k2.6":                   { input:  1.20, output:  4.50, unit: "tokens" },
  // Free tier (pricing = 0 — rate limited)
  "deepseek/deepseek-r1:free":            { input:  0,    output:  0,    unit: "tokens" },
  "meta-llama/llama-3.3-70b-instruct:free":{ input: 0,   output:  0,    unit: "tokens" },
  "google/gemma-3-27b-it:free":           { input:  0,    output:  0,    unit: "tokens" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Merged flat lookup
// ─────────────────────────────────────────────────────────────────────────────

export const BY_PLATFORM: Record<string, Record<string, PricingEntry>> = {
  anthropic:  ANTHROPIC,
  openai:     OPENAI,
  gemini:     GEMINI,
  google:     GEMINI,
  xai:        XAI,
  grok:       XAI,
  deepseek:   DEEPSEEK,
  groq:       GROQ,
  mistral:    MISTRAL,
  cohere:     COHERE,
  perplexity: PERPLEXITY,
  stability:  STABILITY,
  "fal.ai":   FALAI,
  falai:      FALAI,
  together:   TOGETHER,
  fireworks:  FIREWORKS,
  bedrock:    BEDROCK,
  openrouter: OPENROUTER,
};

// Flat merged — last write wins for duplicate model IDs (native prices take precedence via ordering)
const FLAT: Record<string, PricingEntry> = Object.assign(
  {},
  OPENROUTER,  // lowest precedence — overridden by native below
  TOGETHER, FIREWORKS, BEDROCK,
  PERPLEXITY, COHERE, MISTRAL, GROQ,
  DEEPSEEK, XAI, GEMINI, OPENAI, ANTHROPIC,  // highest precedence
  STABILITY, FALAI,
);

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Look up pricing given a known platform and model ID.
 * Best for SDK use: platform is auto-detected from wrapped client's base URL.
 * E.g. getPricingByPlatform("openrouter", "anthropic/claude-sonnet-4-6")
 */
export function getPricingByPlatform(
  platform: string,
  model: string
): PricingEntry | null {
  const table = BY_PLATFORM[platform.toLowerCase()];
  if (table) {
    if (table[model]) return table[model];
    // Try stripping version suffix after colon (OpenRouter :free / :nitro variants)
    const base = model.split(":")[0];
    if (base !== model && table[base]) return table[base];
  }
  return FLAT[model] ?? null;
}

/**
 * Look up pricing by model ID alone (platform unknown).
 * Falls back to stripping provider prefix if exact match not found.
 */
export function getPricing(model: string): PricingEntry | null {
  if (FLAT[model]) return FLAT[model];
  const slashIdx = model.indexOf("/");
  if (slashIdx > -1) {
    const bare = model.slice(slashIdx + 1);
    if (FLAT[bare]) return FLAT[bare];
  }
  return null;
}

/**
 * Estimate cost for a token-based call.
 */
export function estimateCost(
  model: string,
  tokensIn: number,
  tokensOut: number,
  platform?: string
): number {
  const entry = platform
    ? getPricingByPlatform(platform, model)
    : getPricing(model);
  if (!entry || entry.unit !== "tokens") return 0;
  return (tokensIn / 1_000_000) * entry.input + (tokensOut / 1_000_000) * entry.output;
}

/**
 * Estimate cost for an image generation call.
 */
export function estimateImageCost(
  model: string,
  count: number,
  platform?: string
): number {
  const entry = platform
    ? getPricingByPlatform(platform, model)
    : getPricing(model);
  if (!entry || entry.unit !== "image") return 0;
  return count * entry.input;
}

/**
 * Estimate cost for a video generation call.
 * durationSeconds = total seconds of output video generated.
 */
export function estimateVideoCost(
  model: string,
  durationSeconds: number,
  platform?: string
): number {
  const entry = platform
    ? getPricingByPlatform(platform, model)
    : getPricing(model);
  if (!entry || entry.unit !== "second") return 0;
  return durationSeconds * entry.input;
}

/**
 * Returns the full pricing table for a platform.
 * SDK bundles ship only the table(s) the user has configured.
 */
export function getPlatformPricingTable(
  platform: string
): Record<string, PricingEntry> | null {
  return BY_PLATFORM[platform.toLowerCase()] ?? null;
}
