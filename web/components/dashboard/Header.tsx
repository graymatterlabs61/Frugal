"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ListIcon,
  BellIcon,
  CheckIcon,
  WarningIcon,
  XCircleIcon,
  ArrowRightIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Link from "next/link";

const breadcrumbs: Record<string, { label: string; parent?: string; parentHref?: string }> = {
  "/dashboard":             { label: "Overview" },
  "/projects":              { label: "Projects" },
  "/alerts":                { label: "Alerts" },
  "/connections":           { label: "Connections" },
  "/settings":              { label: "Settings" },
  "/settings/account":      { label: "Account",      parent: "Settings", parentHref: "/settings" },
  "/settings/security":     { label: "Security",     parent: "Settings", parentHref: "/settings" },
  "/settings/billing":      { label: "Billing",      parent: "Settings", parentHref: "/settings" },
  "/settings/preferences":  { label: "Preferences",  parent: "Settings", parentHref: "/settings" },
  "/settings/integration":  { label: "Integrations", parent: "Settings", parentHref: "/settings" },
  "/settings/reports":      { label: "Reports",      parent: "Settings", parentHref: "/settings" },
  "/settings/team-management": { label: "Team",      parent: "Settings", parentHref: "/settings" },
  "/billing":               { label: "Billing" },
  "/help":                  { label: "Help & Support" },
};

function getPageInfo(pathname: string) {
  if (breadcrumbs[pathname]) return breadcrumbs[pathname];
  if (pathname.startsWith("/projects/")) return { label: "Project", parent: "Projects", parentHref: "/projects" };
  if (pathname.startsWith("/settings/")) return { label: "Settings" };
  return { label: "Dashboard" };
}

type NotifType = "warning" | "error" | "success";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href?: string;
}

const initialNotifications: Notification[] = [];

const typeIcon: Record<NotifType, React.ElementType> = {
  warning: WarningIcon,
  error: XCircleIcon,
  success: CheckIcon,
};

const typeBg: Record<NotifType, string> = {
  warning: "bg-amber-500/15 text-amber-500",
  error: "bg-destructive/15 text-destructive",
  success: "bg-emerald-500/15 text-emerald-600",
};

interface HeaderProps {
  userName: string;
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center px-5 gap-3 header-glass sticky top-0 z-40">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground -ml-1 shrink-0"
        onClick={onMenuClick}
      >
        <ListIcon size={20} />
      </Button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {pageInfo.parent && pageInfo.parentHref ? (
          <>
            <Link
              href={pageInfo.parentHref}
              className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors truncate"
            >
              {pageInfo.parent}
            </Link>
            <CaretRightIcon size={12} className="text-muted-foreground/30 shrink-0" />
            <span className="text-sm font-semibold truncate">{pageInfo.label}</span>
          </>
        ) : (
          <span className="text-sm font-semibold">{pageInfo.label}</span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground shrink-0"
          >
            <BellIcon size={19} weight={open ? "fill" : "regular"} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full flex items-center justify-center">
                {unreadCount > 9 ? null : (
                  <span className="text-[7px] font-bold text-primary-foreground leading-none">
                    {unreadCount > 1 ? unreadCount : ""}
                  </span>
                )}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-80 p-0 rounded-xl border border-border shadow-lg"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">All clear</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Budget alerts and connection issues will show up here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type];
                const inner = (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-accent cursor-pointer",
                      !n.read && "bg-primary/[0.03]"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", typeBg[n.type])}>
                      <Icon size={13} weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-snug", !n.read && "font-semibold")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {n.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                  </div>
                );

                return n.href ? (
                  <Link key={n.id} href={n.href} onClick={() => { markRead(n.id); setOpen(false); }}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })
            )}
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/alerts"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all alerts
              <ArrowRightIcon size={11} />
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  );
}