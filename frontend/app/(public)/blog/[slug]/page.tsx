import { notFound } from "next/navigation";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";
import { BreadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
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
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "https://getfrugal.dev" },
          { name: "Journal", href: "https://getfrugal.dev/blog" },
          { name: meta.title },
        ]}
      />
      <BlogPostLayout meta={meta}>
        <Content />
      </BlogPostLayout>
    </>
  );
}
