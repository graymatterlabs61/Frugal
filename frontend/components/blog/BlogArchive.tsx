"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { useBlogSearch } from "@/contexts/BlogSearchContext";

export function BlogArchiveSearch() {
  const { query, setQuery } = useBlogSearch();
  return (
    <label className="relative w-full sm:max-w-sm group">
      <span className="sr-only">Search articles</span>
      <Search className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/50 w-4 h-4 transition-colors group-focus-within:text-primary" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles…"
        className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.10] py-3 pr-4 pl-12 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all duration-200 backdrop-blur-sm"
        type="search"
      />
    </label>
  );
}

export function BlogArchiveGrid() {
  const { filtered, query } = useBlogSearch();

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground text-sm">
          No articles match <span className="text-foreground font-medium">&ldquo;{query}&rdquo;</span>.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((post, i) => (
        <li
          key={post.slug}
          className="group glass-panel card-lift card-hover-tint relative flex flex-col rounded-3xl overflow-hidden p-0 animate-fade-in-up"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          {/* Image */}
          <div className="relative w-full aspect-[16/9] overflow-hidden border-b border-white/[0.06]">
            <Image
              alt={post.title}
              src={post.image}
              fill
              className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="flex flex-col p-6 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
              <time className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                {post.date}
              </time>
              <span className="rounded-full bg-primary/[0.08] border border-primary/20 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {post.category}
              </span>
            </div>

            <div className="relative flex-1">
              <h3 className="font-serif text-xl font-medium leading-[1.25] text-foreground group-hover:text-primary transition-colors duration-300">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground/80 leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary/70 group-hover:text-primary transition-colors duration-200">
              Read article
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
