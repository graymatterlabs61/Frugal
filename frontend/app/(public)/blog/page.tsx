import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { BlogSearchProvider } from "@/contexts/BlogSearchContext";
import { BlogArchiveSearch, BlogArchiveGrid } from "@/components/blog/BlogArchive";
import { fetchBlogPosts } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Journal — Frugal",
  description: "Long-form notes on AI API cost management, engineering, and startup operations.",
};

export default async function BlogIndex() {
  const { coverStory, posts } = await fetchBlogPosts();

  return (
    <div className="bg-background text-foreground relative z-0 min-h-screen flex flex-col">
      {/* Ambient mesh */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.22 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.14 }} />
        <div className="mesh-orb mesh-orb-3" style={{ opacity: 0.10 }} />
      </div>

      <MarketingNav />

      <main className="flex-1 relative overflow-hidden px-6 md:px-12 pt-32 pb-32">
        {/* Radial gradient header glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(255,80,11,0.10),transparent)]" />

        <div className="max-w-6xl mx-auto relative">
          {/* Page header */}
          <header className="mb-4 pb-12 border-b border-white/[0.06]">
            <p className="text-[11px] font-bold tracking-[0.28em] text-primary uppercase mb-6 flex items-center gap-2 animate-fade-in-up">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Editorial
            </p>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl animate-fade-in-up stagger-1">
                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-[0.95]">
                  The{" "}
                  <span className="font-serif italic font-normal gradient-text-warm">
                    Journal
                  </span>
                </h1>
                <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Long-form notes on AI API cost management, engineering, and startup operations.
                </p>
              </div>
            </div>
          </header>

          {/* Cover story */}
          <Link
            href={`/blog/${coverStory.slug}`}
            className="group/cover card-lift relative mb-16 block overflow-hidden rounded-[2rem] border border-white/[0.08] shadow-[0_16px_64px_rgba(0,0,0,0.5)] animate-fade-in-scale stagger-2"
          >
            <div className="md:aspect-[2.5/1] relative aspect-[21/9] min-h-[300px]">
              <Image
                alt={coverStory.title}
                src={coverStory.image}
                fill
                className="object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

              {/* Subtle color tint on hover */}
              <div className="absolute inset-0 bg-primary/0 group-hover/cover:bg-primary/5 transition-colors duration-700" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <span className="mb-4 inline-flex w-fit rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white backdrop-blur-md border border-white/20">
                  Cover story
                </span>
                <h2 className="max-w-3xl font-serif text-3xl leading-[1.15] font-medium text-white md:text-5xl group-hover/cover:text-white/95">
                  {coverStory.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm text-white/75 md:text-base leading-relaxed">
                  {coverStory.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary/50 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_12px_#FF500B33]">
                      {coverStory.authorInitials}
                    </div>
                    <span className="font-medium">{coverStory.authorName}</span>
                  </div>
                  <span className="text-white/30">·</span>
                  <time dateTime={coverStory.date} className="text-white/70 font-mono text-xs uppercase tracking-wider">
                    {new Date(coverStory.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </div>
          </Link>

          {/* Archive section — client-side search via BlogSearchContext */}
          <BlogSearchProvider posts={posts}>
            <section aria-labelledby="archive-heading" className="pt-4">
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2
                  id="archive-heading"
                  className="font-serif text-3xl font-medium text-foreground"
                >
                  Archive
                </h2>
                <BlogArchiveSearch />
              </div>

              <BlogArchiveGrid />
            </section>
          </BlogSearchProvider>
        </div>
      </main>

      <Footer />
    </div>
  );
}
