"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
}

export function DashboardShell({
  children,
  userEmail,
  userName,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient mesh backdrop — required for glass-panel blur to render.
          Orbs dialed down vs marketing pages: dashboard is a work surface. */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" style={{ opacity: 0.3 }} />
        <div className="mesh-orb mesh-orb-2" style={{ opacity: 0.25 }} />
        <div className="mesh-orb mesh-orb-3" style={{ opacity: 0.2 }} />
      </div>

      {/* Desktop sidebar — fixed, width animates via Sidebar's own class */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50">
        <Sidebar
          userEmail={userEmail}
          userName={userName}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-border">
          <Sidebar
            userEmail={userEmail}
            userName={userName}
            onNavigate={() => setMobileOpen(false)}
            isSheet
          />
        </SheetContent>
      </Sheet>

      {/* Main area — margin matches sidebar width on desktop, none on mobile */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ml-0 ${
          collapsed ? "lg:ml-[76px]" : "lg:ml-[256px]"
        }`}
      >
        <Header userName={userName} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 lg:p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
