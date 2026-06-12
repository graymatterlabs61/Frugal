import { notFound } from "next/navigation";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";
import { BLOG_POSTS } from "@/lib/blog/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({ slug }));
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) notFound();
  const { meta, Content } = post;
  return (
    <BlogPostLayout meta={meta}>
      <Content />
    </BlogPostLayout>
  );
}
