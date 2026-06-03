import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cookie Policy | Frugal",
  description: "How Frugal uses cookies and similar technologies.",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="ml-5 list-disc space-y-1.5">{children}</ul>
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/40 bg-card/20 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Frugal
          </Link>
          <span className="font-heading text-sm font-medium text-foreground">
            Cookie Policy
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8">
        <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight text-foreground">
          Cookie Policy
        </h1>
        <p className="mb-12 text-sm text-muted-foreground">
          Last updated: June 3, 2025 · Gray Matter Labs, Inc. (Delaware, USA)
        </p>

        <div className="space-y-10">
          <Section title="1. What Are Cookies">
            <p>
              Cookies are small text files stored on your device when you visit
              a website. They help the website remember information about your
              visit, which can make the site easier to use and improve our
              ability to serve you better.
            </p>
          </Section>

          <Section title="2. How We Use Cookies">
            <p>
              Frugal uses a minimal set of cookies focused entirely on
              functionality. We do not use cookies for advertising, third-party
              tracking, or cross-site analytics.
            </p>
          </Section>

          <Section title="3. Types of Cookies We Use">
            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-card/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">
                      Cookie Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">
                      Purpose
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "sb-auth-token",
                      type: "Strictly Necessary",
                      purpose: "Supabase authentication session token. Keeps you logged in.",
                      duration: "7 days",
                    },
                    {
                      name: "sb-refresh-token",
                      type: "Strictly Necessary",
                      purpose: "Used to refresh your authentication session without re-login.",
                      duration: "60 days",
                    },
                    {
                      name: "__vercel_live_token",
                      type: "Functional",
                      purpose: "Vercel deployment preview authentication (dev only, not in production).",
                      duration: "Session",
                    },
                  ].map((c, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-primary">
                        {c.name}
                      </td>
                      <td className="px-4 py-3">{c.type}</td>
                      <td className="px-4 py-3">{c.purpose}</td>
                      <td className="px-4 py-3">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <UL>
              <li>
                <strong className="text-foreground">
                  Strictly Necessary Cookies
                </strong>{" "}
                — Required for the Service to function. Authentication and
                session management cookies fall in this category. These cannot
                be disabled without breaking core functionality.
              </li>
              <li>
                <strong className="text-foreground">Functional Cookies</strong>{" "}
                — Used to remember user preferences such as theme settings.
                Not required but improve your experience.
              </li>
            </UL>
          </Section>

          <Section title="4. What We Do NOT Use">
            <UL>
              <li>No advertising or retargeting cookies</li>
              <li>No third-party analytics cookies (e.g., Google Analytics)</li>
              <li>No social media tracking pixels</li>
              <li>No fingerprinting or cross-site tracking</li>
            </UL>
          </Section>

          <Section title="5. Local Storage">
            <p>
              In addition to cookies, we use browser{" "}
              <strong className="text-foreground">localStorage</strong> to
              store user preferences (such as UI theme). This data stays on
              your device and is not transmitted to our servers.
            </p>
          </Section>

          <Section title="6. Managing Cookies">
            <p>
              You can control and delete cookies through your browser settings.
              Disabling strictly necessary cookies will prevent you from
              logging into the Service. Most browsers allow you to:
            </p>
            <UL>
              <li>View cookies stored by any website</li>
              <li>Delete all cookies or cookies from specific sites</li>
              <li>Block cookies from specific sites or all sites</li>
              <li>
                Block third-party cookies (this will not affect Frugal, which
                does not set third-party cookies)
              </li>
            </UL>
            <p>
              For instructions, visit your browser&apos;s help documentation:
              Chrome, Firefox, Safari, Edge.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time. We will
              notify you of material changes by updating the &ldquo;Last
              updated&rdquo; date. Continued use of the Service after changes
              become effective constitutes your acceptance.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              Questions about our use of cookies? Contact us at{" "}
              <a
                href="mailto:privacy@frugal.so"
                className="text-primary hover:underline"
              >
                privacy@frugal.so
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}