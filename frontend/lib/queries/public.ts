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
  const res = await fetch(`${BACKEND_URL}/api/public/plans`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch plans: ${res.status}`);
  const json = (await res.json()) as { data: PlansResponse };
  return json.data;
}

export async function fetchBlogPosts(): Promise<BlogResponse> {
  const res = await fetch(`${BACKEND_URL}/api/public/blog`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch blog posts: ${res.status}`);
  const json = (await res.json()) as { data: BlogResponse };
  return json.data;
}
