import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { encrypt } from "@/lib/encryption";
import { getConnectionLimit } from "@/lib/tier";
import { validateOpenAIKey } from "@/lib/providers/openai";
import { validateAnthropicKey } from "@/lib/providers/anthropic";
import { validateReplicateKey } from "@/lib/providers/replicate";
import { validateFalAIKey } from "@/lib/providers/falai";
import { validateGeminiKey } from "@/lib/providers/gemini";
import { validateGroqKey } from "@/lib/providers/groq";
import { validateMistralKey } from "@/lib/providers/mistral";
import { validateTogetherKey } from "@/lib/providers/together";
import { validateCohereKey } from "@/lib/providers/cohere";
import { validatePerplexityKey } from "@/lib/providers/perplexity";
import { validateDeepSeekKey } from "@/lib/providers/deepseek";
import { validateStabilityKey } from "@/lib/providers/stability";

const PROVIDERS = [
  "openai", "anthropic", "replicate", "falai",
  "gemini", "groq", "mistral", "together",
  "cohere", "perplexity", "deepseek", "stability",
] as const;

type Provider = (typeof PROVIDERS)[number];

const createConnectionSchema = z.object({
  provider: z.enum(PROVIDERS),
  apiKey: z.string().min(8),
  projectId: z.string().uuid().optional().nullable(),
  label: z.string().max(64).optional().nullable(),
});

async function checkProviderKey(provider: Provider, key: string): Promise<boolean> {
  switch (provider) {
    case "openai":      return validateOpenAIKey(key);
    case "anthropic":   return validateAnthropicKey(key);
    case "replicate":   return validateReplicateKey(key);
    case "falai":       return validateFalAIKey(key);
    case "gemini":      return validateGeminiKey(key);
    case "groq":        return validateGroqKey(key);
    case "mistral":     return validateMistralKey(key);
    case "together":    return validateTogetherKey(key);
    case "cohere":      return validateCohereKey(key);
    case "perplexity":  return validatePerplexityKey(key);
    case "deepseek":    return validateDeepSeekKey(key);
    case "stability":   return validateStabilityKey(key);
  }
}

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
    .from("api_connections")
    .select(
      "id, provider, label, api_key_suffix, status, is_active, last_polled_at, created_at, project_id, projects(id, name)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections: data });
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

  const parsed = createConnectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { provider, apiKey, projectId, label } = parsed.data;

  // Enforce per-plan connection limit
  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  const userPlan = userData?.plan ?? "free";
  const connectionLimit = getConnectionLimit(userPlan);

  const { count: connectionCount, error: countError } = await supabase
    .from("api_connections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((connectionCount ?? 0) >= connectionLimit) {
    return NextResponse.json(
      {
        error: `Connection limit reached. Your ${userPlan} plan allows ${connectionLimit} connection${connectionLimit === 1 ? "" : "s"}. Upgrade your plan to add more.`,
      },
      { status: 403 }
    );
  }

  const isValid = await checkProviderKey(provider, apiKey);
  if (!isValid) {
    return NextResponse.json(
      { error: "API key validation failed. Check your key and try again." },
      { status: 422 }
    );
  }

  const encryptedKey = encrypt(apiKey);
  const keySuffix = apiKey.slice(-4);

  const { data, error } = await supabase
    .from("api_connections")
    .insert({
      user_id: user.id,
      provider,
      api_key_encrypted: encryptedKey,
      api_key_suffix: keySuffix,
      project_id: projectId ?? null,
      label: label ?? null,
      status: "active",
    })
    .select(
      "id, provider, label, api_key_suffix, status, is_active, last_polled_at, created_at, project_id, projects(id, name)"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connection: data }, { status: 201 });
}
