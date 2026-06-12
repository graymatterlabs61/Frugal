"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { Search, Loader2, Copy, Check, TrendingUp, Zap, Target } from "lucide-react";

interface KeywordCluster {
  intent: string;
  intentType: "informational" | "commercial" | "navigational" | "transactional";
  aeoScore: number;
  keywords: { term: string; volume: string; difficulty: "low" | "medium" | "high" }[];
}

const DEMO_RESULTS: Record<string, KeywordCluster[]> = {
  default: [
    {
      intent: "Cost Management",
      intentType: "commercial",
      aeoScore: 92,
      keywords: [
        { term: "how to reduce openai api costs", volume: "2.4K", difficulty: "low" },
        { term: "openai api cost optimization", volume: "1.8K", difficulty: "medium" },
        { term: "anthropic claude api pricing", volume: "3.1K", difficulty: "medium" },
        { term: "llm api cost calculator", volume: "890", difficulty: "low" },
      ],
    },
    {
      intent: "Budget Alerts",
      intentType: "transactional",
      aeoScore: 87,
      keywords: [
        { term: "set budget limit openai api", volume: "1.2K", difficulty: "low" },
        { term: "openai spending alerts", volume: "760", difficulty: "low" },
        { term: "ai api budget monitoring tool", volume: "540", difficulty: "low" },
        { term: "prevent openai overspend", volume: "430", difficulty: "low" },
      ],
    },
    {
      intent: "Provider Comparison",
      intentType: "informational",
      aeoScore: 81,
      keywords: [
        { term: "openai vs anthropic cost comparison", volume: "5.2K", difficulty: "high" },
        { term: "replicate vs fal ai pricing", volume: "980", difficulty: "medium" },
        { term: "cheapest llm api 2026", volume: "3.7K", difficulty: "medium" },
        { term: "gpt 4o vs claude 3.5 cost", volume: "2.1K", difficulty: "high" },
      ],
    },
    {
      intent: "Token Optimization",
      intentType: "informational",
      aeoScore: 78,
      keywords: [
        { term: "reduce llm token usage", volume: "1.4K", difficulty: "low" },
        { term: "anthropic prompt caching tutorial", volume: "890", difficulty: "low" },
        { term: "openai token optimization tips", volume: "1.1K", difficulty: "medium" },
        { term: "max tokens best practices", volume: "670", difficulty: "low" },
      ],
    },
  ],
};

const INTENT_COLORS: Record<string, string> = {
  informational: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  commercial: "text-primary bg-primary/10 border-primary/20",
  transactional: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  navigational: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

export default function KeywordResearchPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordCluster[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setResults(null);
    await new Promise((r) => setTimeout(r, 1800));
    setResults(DEMO_RESULTS.default);
    setLoading(false);
  }

  function copyKeyword(term: string) {
    navigator.clipboard.writeText(term);
    setCopied(term);
    setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    if (!results) return;
    const all = results.flatMap((c) => c.keywords.map((k) => k.term)).join("\n");
    navigator.clipboard.writeText(all);
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="bg-background text-foreground relative z-0 min-h-screen flex flex-col">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.20 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.12 }} />
        <div className="mesh-orb mesh-orb-3" style={{ opacity: 0.08 }} />
      </div>

      <MarketingNav />

      <main className="flex-1 relative px-6 md:px-12 pt-32 pb-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_-5%,rgba(255,80,11,0.09),transparent)]" />

        <div className="max-w-4xl mx-auto relative">
          {/* Header */}
          <div className="mb-12 text-center animate-fade-in-up">
            <p className="text-[11px] font-bold tracking-[0.28em] text-primary uppercase mb-5 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Free Tool
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] text-foreground mb-6">
              AI &amp;{" "}
              <span className="font-serif italic font-normal gradient-text-warm">AEO</span>{" "}
              Keyword Research
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Discover high-intent keywords for AI-powered products — optimized for answer engines
              like Perplexity, ChatGPT Search, and Google SGE, not just traditional SEO.
            </p>
          </div>

          {/* What is AEO callout */}
          <div className="glass-panel rounded-2xl p-5 mb-8 flex gap-4 items-start border-primary/15 animate-fade-in-up stagger-1">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">What is AEO?</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Answer Engine Optimization (AEO) targets AI-powered search engines that answer
                queries directly — Perplexity, ChatGPT Search, Claude.ai, and Google&apos;s AI
                Overviews. AEO keywords are structured as questions and direct answers, not just
                search phrases.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 mb-8 animate-fade-in-up stagger-2">
            <label className="block text-sm font-medium text-foreground mb-3">
              Describe your AI product or content topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 'AI API cost management SaaS for developers' or 'serverless LLM inference optimization'"
              rows={3}
              className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.10] py-3.5 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all duration-200 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground/60">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.10] font-mono text-[10px]">
                  ⌘ Enter
                </kbd>{" "}
                to generate
              </p>
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,80,11,0.35)] hover:bg-primary/90 hover:shadow-[0_0_32px_rgba(255,80,11,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Research Keywords
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-4 animate-fade-in-scale">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-foreground">
                    Keyword Clusters
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {results.reduce((acc, c) => acc + c.keywords.length, 0)} keywords across{" "}
                    {results.length} intent clusters
                  </p>
                </div>
                <button
                  onClick={copyAll}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/[0.10] px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.10] transition-all duration-200"
                >
                  {copied === "all" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copy all
                </button>
              </div>

              {results.map((cluster) => (
                <div
                  key={cluster.intent}
                  className="glass-panel card-hover-tint rounded-2xl p-6"
                >
                  {/* Cluster header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">{cluster.intent}</span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${INTENT_COLORS[cluster.intentType]}`}
                      >
                        {cluster.intentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-primary/70" />
                      <span className="text-xs font-mono text-primary font-semibold">
                        AEO {cluster.aeoScore}
                      </span>
                    </div>
                  </div>

                  {/* AEO score bar */}
                  <div className="h-1 rounded-full bg-white/[0.06] mb-5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-700"
                      style={{ width: `${cluster.aeoScore}%` }}
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    {cluster.keywords.map((kw) => (
                      <div
                        key={kw.term}
                        className="group flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 hover:bg-white/[0.06] hover:border-white/[0.10] transition-all duration-200"
                      >
                        <span className="text-sm text-foreground font-mono">{kw.term}</span>
                        <div className="flex items-center gap-4 shrink-0 ml-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />
                            {kw.volume}/mo
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${DIFFICULTY_COLORS[kw.difficulty]}`}
                          >
                            {kw.difficulty}
                          </span>
                          <button
                            onClick={() => copyKeyword(kw.term)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          >
                            {copied === kw.term ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* CTA */}
              <div className="glass-panel cta-gradient rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-primary/25 shadow-[0_0_40px_rgba(255,80,11,0.07)] mt-8">
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    Track AI API costs as you build with these keywords
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Frugal monitors your OpenAI, Anthropic, and Replicate spend in real time — with
                    budget alerts before costs spiral.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,80,11,0.35)] hover:bg-primary/90 transition-all duration-200"
                >
                  Start free →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
