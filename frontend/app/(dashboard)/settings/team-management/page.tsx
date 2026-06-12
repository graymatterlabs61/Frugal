import { Users, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const glassCard = {
  background:
    "linear-gradient(145deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.02) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid oklch(1 0 0 / 0.10)",
} as React.CSSProperties;

const features = [
  {
    icon: UserPlus,
    title: "Invite Teammates",
    desc: "Bring your team in with role-based access — admin, viewer, or billing only.",
  },
  {
    icon: Users,
    title: "Shared Dashboards",
    desc: "Everyone on your team sees the same projects and spend data in real time.",
  },
  {
    icon: Lock,
    title: "Per-Member Permissions",
    desc: "Control who can add API connections, modify budget rules, or view invoices.",
  },
];

export default function TeamManagementPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Coming soon banner */}
      <div
        className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
        style={glassCard}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "oklch(1 0 0 / 0.06)",
            border: "1px solid oklch(1 0 0 / 0.1)",
          }}
        >
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-base">Team features coming in V1.1</p>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            Invite teammates, set per-member access levels, and share project dashboards. Targeting V1.1.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl h-9 px-5 text-sm border-white/[0.1] mt-1"
          asChild
        >
          <a href="mailto:founder@getfrugal.dev?subject=Team%20Features%20Interest">
            Get notified at launch
          </a>
        </Button>
      </div>

      {/* Feature preview */}
      <div
        className="rounded-2xl overflow-hidden"
        style={glassCard}
      >
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="font-semibold text-sm">What&apos;s Coming</h3>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="px-5 py-4 flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: "oklch(1 0 0 / 0.05)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                }}
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
