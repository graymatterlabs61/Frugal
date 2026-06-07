import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canCreateBudgetRules, canUseThrottle } from "@/lib/tier";

const createBudgetRuleSchema = z.object({
  projectId: z.string().uuid(),
  thresholdPct: z.number().int().min(1).max(100),
  action: z.enum(["alert", "block", "throttle"]),
  limitUsd: z.number().positive().optional(),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const parsedId = z.string().uuid().safeParse(projectId);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: "Invalid or missing projectId" },
      { status: 400 }
    );
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("budget_rules")
    .select(
      "id, threshold_pct, action, limit_usd, budget_window, is_active, created_at"
    )
    .eq("project_id", parsedId.data)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rules: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = userData?.plan ?? "free";

  if (!canCreateBudgetRules(plan)) {
    return NextResponse.json(
      { error: "Upgrade to Plus to create budget rules" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBudgetRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { projectId, thresholdPct, action, limitUsd } = parsed.data;

  if (action === "throttle" && !canUseThrottle(plan)) {
    return NextResponse.json(
      { error: "Throttle action requires Pro plan" },
      { status: 403 }
    );
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, budget_limit")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const effectiveLimitUsd = limitUsd ?? project.budget_limit;
  if (!effectiveLimitUsd || effectiveLimitUsd <= 0) {
    return NextResponse.json(
      { error: "Set a monthly budget limit on this project first." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("budget_rules")
    .insert({
      user_id: user.id,
      project_id: projectId,
      threshold_pct: thresholdPct,
      action,
      limit_usd: effectiveLimitUsd,
      budget_window: "monthly",
      is_active: true,
    })
    .select(
      "id, threshold_pct, action, limit_usd, budget_window, is_active, created_at"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rule: data }, { status: 201 });
}
