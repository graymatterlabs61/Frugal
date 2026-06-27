const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://frugal-66tx.onrender.com";

export interface PersonalPlan {
  id: string;
  name: string;
  badge: string;
  badgeClass: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyTotal: number;
  yearlySaving: number;
  featured: boolean;
  ctaLabel: string;
  ctaHref: string;
  cancelText: string;
  features: string[];
  teaserFeatures: string[];
}

export interface CorporatePlan {
  id: string;
  name: string;
  badge: string;
  badgeClass: string;
  tagline: string;
  price: string;
  priceSub: string;
  yearlyNote: string;
  seats: string;
  featured: boolean;
  ctaLabel: string;
  features: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
}

export interface CoverStory {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  authorName: string;
  authorInitials: string;
}

export interface PlansResponse {
  personal: PersonalPlan[];
  corporate: CorporatePlan[];
  faqs: Faq[];
}

export interface BlogResponse {
  coverStory: CoverStory;
  posts: BlogPost[];
}

export async function fetchPlans(): Promise<PlansResponse> {
  const { staticPlans } = await import("@/lib/data/plans");
  return staticPlans;
}

export async function fetchBlogPosts(): Promise<BlogResponse> {
  const { BLOG_POSTS } = await import("@/lib/blog/posts");
  const entries = Object.entries(BLOG_POSTS)
    .map(([slug, { meta }]) => ({ slug, ...meta }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [cover, ...rest] = entries;
  const coverStory: CoverStory = {
    slug: cover.slug,
    title: cover.title,
    description: cover.description,
    date: cover.date,
    category: cover.category,
    image: cover.image || "/images/blog/default.png",
    authorName: cover.authorName,
    authorInitials: cover.authorInitials,
  };
  const posts: BlogPost[] = rest.map(({ slug, title, description, date, category, image }) => ({
    slug, title, description, date, category, image: image || "/images/blog/default.png",
  }));
  return { coverStory, posts };
}
