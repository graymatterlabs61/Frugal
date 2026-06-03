"use client"

import {
  Anthropic,
  Cohere,
  ElevenLabs,
  Fal,
  Groq,
  Mistral,
  OpenAI,
  Perplexity,
  Replicate,
  Together,
  XAI,
} from "@lobehub/icons"

const providers = [
  { name: "OpenAI", Icon: OpenAI },
  { name: "Anthropic", Icon: Anthropic },
  { name: "Replicate", Icon: Replicate },
  { name: "fal.ai", Icon: Fal },
  { name: "Together AI", Icon: Together },
  { name: "Mistral", Icon: Mistral },
  { name: "Cohere", Icon: Cohere },
  { name: "Groq", Icon: XAI },
  { name: "Perplexity", Icon: Perplexity },
  { name: "ElevenLabs", Icon: ElevenLabs },
]

const doubled = [...providers, ...providers]

export function ProvidersBar() {
  return (
    <div className="glass-panel backdrop-blur-md mx-4 sm:mx-6 md:mx-auto max-w-6xl rounded-2xl py-5 overflow-hidden mb-12 mt-12 sm:-mt-12 relative z-10">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24"
          style={{
            background:
              "linear-gradient(to right, rgba(15, 6, 20, 0.8), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24"
          style={{
            background:
              "linear-gradient(to left, rgba(15, 6, 20, 0.8), transparent)",
          }}
        />

        <div className="flex animate-marquee items-center gap-0">
          {doubled.map(({ name, Icon }, i) => (
            <div key={i} className="flex shrink-0 items-center gap-8 px-5 ">
              <span className="flex items-center gap-2 font-heading text-sm font-medium text-muted-foreground whitespace-nowrap">
                <Icon size={16} className="opacity-70" />
                {name}
              </span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}