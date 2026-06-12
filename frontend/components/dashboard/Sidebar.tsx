"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  FolderSimpleIcon,
  BellIcon,
  GearSixIcon,
  SignOutIcon,
  PlugsConnectedIcon,
  UserIcon,
  InfoIcon,
  CrownIcon,
  ChartLineUpIcon,
  ClockCountdownIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
  FileTextIcon,
  CurrencyDollarIcon,
  LightningIcon,
} from "@phosphor-icons/react";

function LayoutSidebarIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 256 256"
      className={className}
    >
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,152H56a8,8,0,0,0,0-16H40V120H56a8,8,0,0,0,0-16H40V88H56a8,8,0,0,0,0-16H40V56H80V200H40Zm176,48H96V56H216V200Z" />
    </svg>
  );
}
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NavItemDef {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  soon?: boolean;
}

interface NavSection {
  label: string;
  items: NavItemDef[];
}

const navSections: NavSection[] = [
  {
    label: "Menu",
    items: [
      { href: "/dashboard", icon: HouseIcon, label: "Overview" },
      { href: "/connections", icon: PlugsConnectedIcon, label: "Connections" },
      { href: "/projects", icon: FolderSimpleIcon, label: "Projects" },
      { href: "/alerts", icon: BellIcon, label: "Alerts" },
    ],
  },
  {
    label: "Monitor",
    items: [
      { href: "/usage", icon: ChartLineUpIcon, label: "Usage Analytics", soon: true },
      { href: "/real-time", icon: LightningIcon, label: "Real-time Feed", soon: true },
      { href: "/history", icon: ClockCountdownIcon, label: "History", soon: true },
      { href: "/reports", icon: FileTextIcon, label: "Cost Reports", soon: true },
      { href: "/budgets", icon: CurrencyDollarIcon, label: "Budget Rules", soon: true },
      { href: "/limits", icon: ShieldCheckIcon, label: "Spend Limits", soon: true },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/team", icon: UsersThreeIcon, label: "Team", soon: true },
      { href: "/settings", icon: GearSixIcon, label: "Settings" },
      { href: "/contact", icon: InfoIcon, label: "Help & Support" },
    ],
  },
];

interface SidebarProps {
  userEmail: string;
  userName: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isSheet?: boolean;
}

export function Sidebar({
  userEmail,
  userName,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  isSheet = false,
}: SidebarProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Sign out failed");
    }
  };

  const initial = (userName || userEmail || "U")[0].toUpperCase();
  const displayName = userName || userEmail?.split("@")[0] || "User";
  const isCollapsed = collapsed && !isSheet;

  const NavItem = ({ item }: { item: NavItemDef }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const content = (
      <Link
        href={item.soon ? "#" : item.href}
        onClick={item.soon ? (e) => e.preventDefault() : onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
          isCollapsed
            ? "justify-center w-10 h-10 mx-auto"
            : "px-3 py-2.5 w-full",
          item.soon
            ? "text-muted-foreground/40 cursor-default"
            : active
              ? "bg-gradient-to-r from-primary/[0.14] to-primary/[0.03] text-primary ring-1 ring-primary/25 shadow-[0_0_20px_#FF500B22]"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
        )}
      >
        <Icon
          size={18}
          weight={active ? "fill" : "regular"}
          className="shrink-0"
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.soon && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground/60 rounded px-1.5 py-0.5">
                Soon
              </span>
            )}
            {!item.soon && item.badge !== undefined && item.badge > 0 && (
              <span className="text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5 leading-none">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {item.label}
              {item.soon && " (Coming soon)"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full glass-sidebar border-r border-white/[0.07] transition-all duration-200",
        isCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-white/[0.06] shrink-0 h-[60px]",
          isCollapsed ? "justify-center px-3" : "px-4 gap-2"
        )}
      >
        {isCollapsed && !isSheet ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleCollapse}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl group transition-colors hover:bg-accent"
                  aria-label="Expand sidebar"
                >
                  <img
                    src="/logo.svg"
                    alt="Frugal"
                    className="w-7 h-7 absolute transition-opacity duration-150 group-hover:opacity-0"
                  />
                  <LayoutSidebarIcon
                    size={20}
                    className="text-muted-foreground absolute transition-opacity duration-150 opacity-0 group-hover:opacity-100"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Expand sidebar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <Link
              href="/dashboard"
              onClick={onNavigate}
              className="inline-flex items-center gap-2.5 group flex-1 min-w-0"
            >
              <img
                src="/logo.svg"
                alt="Frugal"
                className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-bold text-lg tracking-tight truncate">
                Frugal
              </span>
            </Link>

            {!isSheet && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                aria-label="Collapse sidebar"
              >
                <LayoutSidebarIcon size={18} />
              </button>
            )}
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navSections.map((section, i) => (
          <div key={section.label}>
            {i > 0 && (
              <div
                className={cn(
                  "border-t border-border my-2",
                  isCollapsed ? "mx-2" : "mx-1"
                )}
              />
            )}
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground/40 mb-1.5 mt-1">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}

        <div>
          <div
            className={cn(
              "border-t border-white/[0.06] my-2",
              isCollapsed ? "mx-2" : "mx-1"
            )}
          />
        </div>
      </nav>

      <div className="border-t border-white/[0.06] shrink-0 p-3">
        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-full rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-200",
                isCollapsed
                  ? "flex justify-center p-2"
                  : "flex items-center gap-2.5 px-3 py-2.5"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center text-sm font-bold text-primary shrink-0 shadow-[0_0_12px_#FF500B22]">
                {initial}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate leading-tight">
                      {userEmail}
                    </p>
                  </div>
                </>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            align="end"
            className="w-56 p-1.5 rounded-xl border border-border shadow-lg z-[100]"
            sideOffset={8}
          >
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center text-sm font-bold text-primary shrink-0 shadow-[0_0_14px_#FF500B28]">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="border-t border-white/[0.08] my-1" />

            <Link
              href="/settings/account"
              onClick={() => {
                setUserMenuOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors w-full"
            >
              <UserIcon size={15} className="text-muted-foreground shrink-0" />
              Profile
            </Link>

            <Link
              href="/billing"
              onClick={() => {
                setUserMenuOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors w-full"
            >
              <CrownIcon size={15} className="text-primary shrink-0" />
              Upgrade plan
            </Link>

            <Link
              href="/settings"
              onClick={() => {
                setUserMenuOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors w-full"
            >
              <GearSixIcon size={15} className="text-muted-foreground shrink-0" />
              Settings
            </Link>

            <div className="border-t border-white/[0.08] my-1" />

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
            >
              <SignOutIcon size={15} className="text-muted-foreground shrink-0" />
              Log out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
