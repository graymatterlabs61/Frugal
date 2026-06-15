import Link from "next/link"

export interface BreadcrumbItem {
  name: string
  /** Absolute URL. Omit for the current page (last item). */
  href?: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: item.href } : {}),
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav aria-label="Breadcrumb" className="text-xs font-mono text-muted-foreground/60">
        <ol className="flex items-center gap-2">
          {items.map((item, i) => (
            <li key={item.name} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {item.href && i < items.length - 1 ? (
                <Link href={item.href.replace("https://getfrugal.dev", "") || "/"} className="hover:text-primary transition-colors">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground/80">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
