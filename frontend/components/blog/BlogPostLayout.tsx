import Image from "next/image";
import Link from "next/link";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { ReadingProgressProvider } from "@/contexts/ReadingProgressContext";
import { ReadingProgressBar } from "./ReadingProgressBar";

export interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
  authorName: string;
  authorInitials: string;
  image?: string;
}

interface BlogPostLayoutProps {
  meta: BlogPostMeta;
  children: React.ReactNode;
}

export function BlogPostLayout({ meta, children }: BlogPostLayoutProps) {
  return (
    <ReadingProgressProvider>
      <div className="bg-background text-foreground relative z-0 min-h-screen flex flex-col">
        {/* Ambient mesh — subtle for reading context */}
        <div className="mesh-bg">
          <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.14 }} />
          <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.08 }} />
        </div>

        {/* Reading progress bar at very top */}
        <ReadingProgressBar />

        <MarketingNav />

        <main className="flex-1 relative pt-24 pb-32">
          {/* Article header */}
          <div className="max-w-4xl mx-auto px-6 md:px-8 pt-12 pb-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60 mb-8 animate-fade-in-up">
              <Link href="/blog" className="hover:text-primary transition-colors">
                Journal
              </Link>
              <span>/</span>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {meta.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.08] tracking-tight text-foreground mb-8 animate-fade-in-up stagger-1">
              {meta.title}
            </h1>

            {/* Byline */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-10 border-b border-white/[0.06] animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary shadow-[0_0_12px_#FF500B1A]">
                  {meta.authorInitials}
                </div>
                <span className="font-medium text-foreground">{meta.authorName}</span>
              </div>
              <span className="text-white/20">·</span>
              <time dateTime={meta.date} className="font-mono text-[11px] uppercase tracking-wider">
                {new Date(meta.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span className="text-white/20">·</span>
              <span className="text-muted-foreground">{meta.readTime}</span>
            </div>
          </div>

          {/* Hero image */}
          {meta.image && (
            <div className="max-w-5xl mx-auto px-4 md:px-8 mb-16 animate-fade-in-scale stagger-2">
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/[0.07] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
                <Image
                  src={meta.image}
                  alt={meta.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
              </div>
            </div>
          )}

          {/* Article body inside glass panel */}
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-[0_8px_48px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.06] animate-fade-in-scale stagger-3">
              <div className="prose prose-sm md:prose-base prose-invert mx-auto max-w-none prose-headings:font-serif prose-headings:font-medium prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-l-primary prose-blockquote:bg-primary/[0.04] prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-code:text-primary prose-code:bg-primary/[0.07] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-hr:border-white/10">
                {children}
              </div>
            </div>

            {/* CTA card */}
            <div className="mt-14 glass-panel cta-gradient rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-primary/25 shadow-[0_0_40px_rgba(255,80,11,0.07)] animate-fade-in-up">
              <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Stop flying blind on AI costs</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Frugal tracks every dollar across OpenAI, Anthropic, and more — with budget alerts before costs spiral.
                </p>
                <Link href="/signup" className="inline-block mt-2.5 text-sm font-semibold text-primary hover:underline underline-offset-2">
                  Start free →
                </Link>
              </div>
            </div>

            {/* Back link */}
            <div className="mt-10 flex items-center justify-between text-sm text-muted-foreground">
              <Link
                href="/blog"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
              >
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Journal
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ReadingProgressProvider>
  );
}
