"use client"

const providers = [
  "OpenAI",
  "Anthropic",
  "Replicate",
  "fal.ai",
  "Together AI",
  "Mistral",
  "Cohere",
  "Groq",
  "Perplexity",
  "ElevenLabs",
]

// Duplicate for seamless infinite loop
const doubled = [...providers, ...providers]

export function ProvidersBar() {
  return (
    <div className="glass-panel backdrop-blur-md mx-4 sm:mx-6 md:mx-auto max-w-6xl rounded-2xl py-5 overflow-hidden mb-12 mt-12 sm:-mt-12 relative z-10">
      {/* Fade edges */}
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

        {/* Scrolling track */}
        <div className="flex animate-marquee items-center gap-0">
          {doubled.map((name, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center gap-8 px-10"
            >
              <span className="font-heading text-sm font-medium text-muted-foreground whitespace-nowrap">
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