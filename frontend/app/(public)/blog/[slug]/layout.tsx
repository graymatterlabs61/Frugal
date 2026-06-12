import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog/posts";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) return {};
  const { meta } = post;
  const url = `https://getfrugal.dev/blog/${slug}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      url,
      publishedTime: meta.date,
      authors: [meta.authorName],
      tags: [meta.category],
      images: [{ url: meta.image ?? "/og.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      creator: "@neilkumaroff",
      images: [meta.image ?? "/twitter.png"],
    },
  };
}

export default function BlogPostSegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
