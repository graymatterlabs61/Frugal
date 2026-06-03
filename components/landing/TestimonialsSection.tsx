import React from "react";
import Marquee from "react-fast-marquee";

const testimonials = [
  {
    logo: "https://cdn.simpleicons.org/raycast/ff6363",
    logoAlt: "Somecast",
    quote:
      "Frugal caught a runaway script on our staging environment that would have cost us $800 overnight.",
    avatar: "https://i.pravatar.cc/150?img=44",
    name: "Nina Volkov",
    role: "Founder, Arc Studio",
  },
  {
    logo: "https://cdn.simpleicons.org/shopify/96bf48",
    logoAlt: "Shopify",
    quote:
      "We finally have visibility across all our AI provider spends in one dashboard. The budget alerts are a lifesaver.",
    avatar: "https://i.pravatar.cc/150?img=27",
    name: "Chris Meyer",
    role: "Growth, Harbor",
  },
  {
    logo: "https://cdn.simpleicons.org/github/181717",
    logoAlt: "GitHub",
    quote:
      "The AES-256 encryption for our API keys gave our security team the peace of mind they needed to adopt this.",
    avatar: "https://i.pravatar.cc/150?img=9",
    name: "Priya Nair",
    role: "Staff Engineer, Kernel",
  },
  {
    logo: "https://assets.aceternity.com/logos/openai.png",
    logoAlt: "Open AI",
    quote:
      "Setting per-team budgets means I don't have to manually chase down who spent what at the end of the month.",
    avatar: "https://i.pravatar.cc/150?img=68",
    name: "Daniel Frost",
    role: "COO, Relay",
    highlight: true,
  },
  {
    logo: "https://assets.aceternity.com/logos/twitch.webp",
    logoAlt: "Twitch",
    quote:
      "This is the tool we didn't know we needed until we got a $2k surprise bill. Now it's the first thing we set up.",
    avatar: "https://i.pravatar.cc/150?img=16",
    name: "Amelia Park",
    role: "Head of Brand, Lumen Co",
  },
  {
    logo: "https://assets.aceternity.com/logos/spotify.webp",
    logoAlt: "Spotify",
    quote:
      "The 5-minute polling is fast enough that we can trust it for production workloads. Alerts hit Slack instantly.",
    avatar: "https://i.pravatar.cc/150?img=52",
    name: "James Okonkwo",
    role: "Product Ops, Fieldline",
  },
  {
    logo: "https://assets.aceternity.com/logos/youtube.webp",
    logoAlt: "YouTube",
    quote:
      "I love that it works with Replicate and fal.ai, not just OpenAI. True multi-provider cost tracking.",
    avatar: "https://i.pravatar.cc/150?img=45",
    name: "Elena Ruiz",
    role: "CTO, Stackforge",
  },
  {
    logo: "https://assets.aceternity.com/logos/hulu.webp",
    logoAlt: "Hulu",
    quote:
      "Being able to include Frugal budget limits directly in our client SLAs has completely changed how we work.",
    avatar: "https://i.pravatar.cc/150?img=33",
    name: "Marcus Webb",
    role: "Design Lead, Orbit Labs",
    highlight: true,
  },
  {
    logo: "https://assets.aceternity.com/logos/raycast.webp",
    logoAlt: "Raycast",
    quote:
      "Set it and forget it. I finally sleep well knowing my indie project won't bankrupt me.",
    avatar: "https://i.pravatar.cc/150?img=12",
    name: "Sarah Chen",
    role: "VP Engineering, Northwind",
  },
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <article
      className={`glass-panel backdrop-blur-md flex h-full w-[min(88vw,380px)] shrink-0 flex-col border-r border-b p-6 text-left md:w-[420px] md:p-8 ${
        testimonial.highlight
          ? "border-neutral-300 bg-white/20 shadow-lg dark:border-neutral-500 dark:bg-white/5"
          : "border-neutral-200 bg-white/5 dark:border-neutral-600 dark:bg-black/5"
      }`}
    >
      <div className="mb-5 flex min-h-[28px] items-center">
        <img
          alt={testimonial.logoAlt}
          width="112"
          height="32"
          className="h-7 w-auto max-w-[140px] object-contain object-left dark:invert dark:filter"
          src={testimonial.logo}
        />
      </div>
      <blockquote className="flex min-h-0 flex-1 flex-col">
        <p className="relative text-sm leading-relaxed font-medium tracking-tight text-neutral-800 md:text-[15px] dark:text-neutral-100">
          {testimonial.quote}
        </p>
      </blockquote>
      <div className="mt-auto flex items-center gap-3 pt-6">
        <img
          alt=""
          width="44"
          height="44"
          className="size-11 shrink-0 rounded-md bg-white object-cover p-0.5 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700"
          src={testimonial.avatar}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
            {testimonial.name}
          </p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {testimonial.role}
          </p>
        </div>
      </div>
    </article>
  );
}

export function TestimonialsSection() {
  const reversedTestimonials = [...testimonials].reverse();

  return (
    <section className="relative w-full py-16 md:py-20 z-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-balance text-neutral-900 md:text-3xl dark:text-white">
            Trusted in production, not just in demos.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-neutral-600 md:text-base dark:text-neutral-400">
            Short notes from teams who ship with the same polish they show customers.
          </p>
        </header>
      </div>

      <div className="relative w-full border-t border-neutral-200 dark:border-neutral-700">
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          
          <Marquee speed={30} direction="right" pauseOnHover className="overflow-hidden">
            {testimonials.map((t, idx) => (
              <TestimonialCard key={idx} testimonial={t} />
            ))}
          </Marquee>

          <Marquee speed={40} direction="right" pauseOnHover className="overflow-hidden">
            {reversedTestimonials.map((t, idx) => (
              <TestimonialCard key={idx} testimonial={t} />
            ))}
          </Marquee>

        </div>
      </div>
    </section>
  );
}