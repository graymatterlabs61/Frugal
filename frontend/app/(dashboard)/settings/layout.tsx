import { SettingsNav } from "./SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="pb-5 border-b border-border mb-5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, billing, and preferences.
        </p>
      </div>

      {/* Glass tab nav */}
      <div
        className="mb-6 rounded-2xl p-1.5"
        style={{
          background:
            "linear-gradient(145deg, oklch(1 0 0 / 0.05) 0%, oklch(1 0 0 / 0.02) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid oklch(1 0 0 / 0.07)",
        }}
      >
        <SettingsNav />
      </div>

      {/* Tab content */}
      <div>{children}</div>
    </div>
  );
}
