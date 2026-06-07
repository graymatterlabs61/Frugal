"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Users,
  SlidersHorizontal,
  Zap,
  CreditCard,
  Shield,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Account",      href: "/settings/account",         Icon: User             },
  { label: "Team",         href: "/settings/team-management", Icon: Users            },
  { label: "Preferences",  href: "/settings/preferences",     Icon: SlidersHorizontal },
  { label: "Integration",  href: "/settings/integration",     Icon: Zap              },
  { label: "Billing",      href: "/settings/billing",         Icon: CreditCard       },
  { label: "Security",     href: "/settings/security",        Icon: Shield           },
  { label: "Reports",      href: "/settings/reports",         Icon: BarChart3        },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
      <nav className="flex items-center gap-0.5 min-w-max">
        {NAV.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap select-none",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(145deg, oklch(1 0 0 / 0.08) 0%, oklch(1 0 0 / 0.03) 100%)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid oklch(1 0 0 / 0.10)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                  }}
                />
              )}
              <Icon className="w-3.5 h-3.5 shrink-0 relative z-10" />
              <span className="relative z-10">{label}</span>
              {active && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full z-10" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
