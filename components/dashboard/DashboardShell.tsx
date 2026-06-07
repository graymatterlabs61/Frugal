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

      {/* Main area — margin matches sidebar width */}
      <div
        className="flex flex-col min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? "76px" : "256px" }}
      >
        {/* On mobile, override the inline margin-left via a utility */}
        <style>{`@media (max-width: 1023px) { .main-shell { margin-left: 0 !important; } }`}</style>
        <div className="main-shell flex flex-col min-h-screen">
          <Header userName={userName} onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-5 lg:p-6 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
