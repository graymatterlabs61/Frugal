"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { FileText, Loader2, Copy, Check, Zap, Info } from "lucide-react";

interface MetaVariant {
  type: "Traditional SEO" | "AEO Optimized" | "Conversational";
  badge: string;
  badgeClass: string;
  description: string;
  charCount: number;
  tip: string;
}

function generateVariants(pageTitle: string, contentPoints: string): MetaVariant[] {
  const truncTitle = pageTitle.slice(0, 40);
  return [
    {
      type: "Traditional SEO",
      badge: "SEO",
      badgeClass: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      description: `${truncTitle} — ${contentPoints.slice(0, 80).trim()}. Free tool with no sign-up required.`,
      charCount: 0,
      tip: "Optimized for Google's traditional blue-link results. Front-loads the page title and primary keyword.",
    },
    {
      type: "AEO Optimized",
      badge: "AEO",
      badgeClass: "text-primary bg-primary/10 border-primary/20",
      description: `${truncTitle} answers: ${contentPoints.slice(0, 60).trim()}? Get a direct answer with step-by-step guidance and examples.`,
      charCount: 0,
      tip: "Structured as a question + direct answer. Signals to Perplexity and ChatGPT Search that this page directly resolves a query.",
    },
    {
      type: "Conversational",
      badge: "Conversational",
      badgeClass: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      description: `Learn how ${contentPoints.slice(0, 70).trim()} using ${truncTitle}. Practical examples for developers and founders.`,
      charCount: 0,
      tip: "Mirrors how users phrase questions to AI chatbots. Works best for how-to content and tutorials.",
    },
  ].map((v) => ({ ...v, charCount: v.description.length })) as MetaVariant[];
}

const charCountColor = (n: number) =>
  n > 160 ? "text-red-400" : n > 145 ? "text-yellow-400" : "text-emerald-400";

export default function MetaDescriptionGeneratorPage() {
  const [pageTitle, setPageTitle] = useState("");
  const [contentPoints, setContentPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<MetaVariant[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    if (!pageTitle.trim() || !contentPoints.trim()) return;
    setLoading(true);
    setVariants(null);
    await new Promise((r) => setTimeout(r, 1400));
    setVariants(generateVariants(pageTitle, contentPoints));
    setLoading(false);
  }

  function copyVariant(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  const canGenerate = pageTitle.trim().length > 0 && contentPoints.trim().length > 0;

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

        <div className="max-w-3xl mx-auto relative">
          {/* Header */}
          <div className="mb-12 text-center animate-fade-in-up">
            <p className="text-[11px] font-bold tracking-[0.28em] text-primary uppercase mb-5 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Free Tool
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight leading-[1.05] text-foreground mb-6">
              <span className="font-serif italic font-normal gradient-text-warm">AEO</span>{" "}
              Meta Description
              <br />
              Generator
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Generate three variants of your meta description — optimized for traditional search,
              answer engines (Perplexity, ChatGPT), and conversational AI queries.
            </p>
          </div>

          {/* AEO callout */}
          <div className="glass-panel rounded-2xl p-5 mb-8 flex gap-4 items-start border-primary/15 animate-fade-in-up stagger-1">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">AEO meta descriptions</strong> are structured as
              direct answers rather than teaser copy. Answer engines parse them to decide whether
              your page directly resolves a query — making structure more important than length.
            </div>
          </div>

          {/* Input form */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 mb-8 space-y-5 animate-fade-in-up stagger-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Page title or product name
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="e.g. Frugal — AI API Cost Management"
                className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.10] h-12 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Key content points{" "}
                <span className="text-muted-foreground font-normal">(what does this page do?)</span>
              </label>
              <textarea
                value={contentPoints}
                onChange={(e) => setContentPoints(e.target.value)}
                placeholder="e.g. monitors OpenAI and Anthropic API spend in real time, sets budget limits, fires alerts before costs spiral, tracks usage across multiple providers"
                rows={3}
                className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.10] py-3.5 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all duration-200 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground/60">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.10] font-mono text-[10px]">
                  ⌘ Enter
                </kbd>{" "}
                to generate
              </p>
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,80,11,0.35)] hover:bg-primary/90 hover:shadow-[0_0_32px_rgba(255,80,11,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Variants
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {variants && (
            <div className="space-y-4 animate-fade-in-scale">
              <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
                3 Meta Description Variants
              </h2>

              {variants.map((v) => (
                <div
                  key={v.type}
                  className="glass-panel card-hover-tint rounded-2xl p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-foreground text-sm">{v.type}</span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${v.badgeClass}`}
                      >
                        {v.badge}
                      </span>
                    </div>
                    <span className={`font-mono text-xs font-semibold ${charCountColor(v.charCount)}`}>
                      {v.charCount} / 160
                    </span>
                  </div>

                  {/* Description text */}
                  <div className="relative group">
                    <p className="rounded-xl bg-white/[0.03] border border-white/[0.07] px-4 py-3.5 text-sm text-foreground leading-relaxed pr-12">
                      {v.description}
                    </p>
                    <button
                      onClick={() => copyVariant(v.description, v.type)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10] opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-white/[0.12]"
                    >
                      {copied === v.type ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Char count bar */}
                  <div className="h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        v.charCount > 160
                          ? "bg-red-500"
                          : v.charCount > 145
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min((v.charCount / 160) * 100, 100)}%` }}
                    />
                  </div>

                  {/* Tip */}
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">{v.tip}</p>
                </div>
              ))}

              {/* CTA */}
              <div className="glass-panel cta-gradient rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-primary/25 shadow-[0_0_40px_rgba(255,80,11,0.07)] mt-8">
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    Publishing content about AI API costs?
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Frugal monitors your OpenAI, Anthropic, and Replicate spend in real time — so
                    the data behind your content is always accurate.
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
