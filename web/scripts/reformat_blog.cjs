const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../app/blog/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Extract posts
const posts = [];
const liRegex = /<li className="group relative flex flex-col items-start justify-between[^>]*>([\s\S]*?)<\/li>/g;
let match;
while ((match = liRegex.exec(content)) !== null) {
  const liContent = match[1];
  
  const categoryMatch = liContent.match(/<span className="rounded-full[^>]*>(.*?)<\/span>/);
  const titleMatch = liContent.match(/<Link href="([^"]*)">\s*<span[^>]*\/>\s*(.*?)\s*<\/Link>/);
  const descMatch = liContent.match(/<p className="mt-3[^>]*>\s*(.*?)\s*<\/p>/);
  
  if (titleMatch && descMatch && categoryMatch) {
    posts.push({
      slug: titleMatch[1].replace('/blog/', ''),
      title: titleMatch[2],
      description: descMatch[1],
      date: 'Jun 12, 2026',
      category: categoryMatch[1]
    });
  }
}

// Generate the new content
const newContent = `import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowUpRight } from "lucide-react"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
  title: "Blog — Frugal",
  description: "Long-form notes on AI API cost management, engineering, and startup operations.",
}

const POSTS = ${JSON.stringify(posts, null, 2)};

export default function BlogIndex() {
  return (
    <div className="bg-background text-foreground relative z-0 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 relative overflow-hidden bg-background px-6 md:px-12 pt-32 pb-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,80,11,0.08),transparent)]" />
        
        <div className="max-w-6xl mx-auto relative">
          <header className="mb-16 md:mb-24 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-border/50 pb-12">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold tracking-[0.25em] text-primary uppercase mb-6 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Editorial
              </p>
              <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-[0.95]">
                The Journal
              </h1>
              <p className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Long-form notes on AI API cost management, engineering, and startup operations. Search the archive or start with this week's cover story.
              </p>
            </div>
          </header>

          <div className="mb-24 md:mb-32 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
            <div className="flex flex-col order-2 lg:order-1">
              <span className="mb-6 inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Cover story
              </span>
              <h2 className="font-serif text-4xl leading-[1.05] font-medium text-foreground md:text-5xl lg:text-6xl text-balance">
                <Link href="/blog/controlling-employee-ai-spend-and-governance" className="hover:text-primary transition-colors">
                  The Founder's Guide to Controlling Employee AI Spend
                </Link>
              </h2>
              <p className="mt-6 text-base text-muted-foreground md:text-lg leading-relaxed max-w-xl">
                Managing team AI access requires centralized API key management, real-time spend tracking, and automated budget alerts. Empower your team without risking surprise bills.
              </p>
              <div className="mt-10 flex items-center gap-4 text-sm font-medium text-foreground">
                <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground border border-border/50">
                  NK
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium tracking-wide">Nilesh Kumar</span>
                  <time dateTime="2024-10-24" className="text-muted-foreground text-[11px] uppercase tracking-widest">Oct 24, 2024</time>
                </div>
              </div>
            </div>
            <Link 
              href="/blog/controlling-employee-ai-spend-and-governance"
              className="group relative order-1 lg:order-2 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/40 bg-muted"
            >
              <Image
                alt="Controlling AI Spend"
                src="https://images.unsplash.com/photo-1719716136369-59ecf938a911?q=80&w=3540&auto=format&fit=crop"
                fill
                className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </Link>
          </div>

          <section aria-labelledby="archive-heading" className="pt-8">
            <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-foreground/10 pb-6">
              <h2
                id="archive-heading"
                className="font-serif text-3xl font-medium text-foreground"
              >
                Archive
              </h2>
              <label className="relative w-full sm:max-w-xs group">
                <span className="sr-only">Search articles</span>
                <Search className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                <input
                  placeholder="Search by title or topic…"
                  className="w-full rounded-none border-b border-border bg-transparent py-2.5 pr-4 pl-12 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-primary"
                  type="search"
                />
              </label>
            </div>

            <ul className="flex flex-col">
              {POSTS.map((post, i) => (
                <li key={i} className="group relative grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-16 py-10 md:py-14 border-b border-border/40 hover:bg-muted/30 transition-colors duration-500">
                  <div className="flex flex-row md:flex-col gap-4 md:gap-3 pt-2 text-sm text-muted-foreground items-center md:items-start">
                    <time dateTime="2026-06-12" className="font-mono text-[10px] md:text-xs uppercase tracking-[0.15em] text-foreground/60">{post.date}</time>
                    <div className="hidden md:block h-[1px] w-8 bg-border/80 my-1" />
                    <span className="text-foreground/80 font-medium text-xs md:text-sm tracking-wide">{post.category}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-2xl md:text-4xl font-medium leading-[1.1] text-foreground transition-colors duration-300">
                      <Link href={\`/blog/\${post.slug}\`} className="flex items-start gap-4">
                        <span className="absolute inset-0" />
                        {post.title}
                        <ArrowUpRight className="w-6 h-6 text-muted-foreground opacity-0 -translate-x-4 translate-y-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 hidden md:block shrink-0 mt-1" />
                      </Link>
                    </h3>
                    <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
`;

fs.writeFileSync(pagePath, newContent);
console.log('Successfully updated blog page!');
