import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getProjectLimit } from "@/lib/tier";

const createProjectSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().max(256).optional(),
  color: z.enum(["slate", "blue", "green", "purple", "orange", "red"]).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, color, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, description, color } = parsed.data;

  // Enforce per-plan project limit
  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  const userPlan = userData?.plan ?? "free";
  const projectLimit = getProjectLimit(userPlan);

  const { count: projectCount, error: countError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((projectCount ?? 0) >= projectLimit) {
    return NextResponse.json(
      {
        error: `Project limit reached. Your ${userPlan} plan allows ${projectLimit} project${projectLimit === 1 ? "" : "s"}. Upgrade your plan to add more.`,
      },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, description, color: color ?? "slate" })
    .select("id, name, description, color, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
