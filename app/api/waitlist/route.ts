import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Please provide a valid email address"),
})

// In-memory log for dev/pre-launch; replace with Supabase insert in production:
//   await supabase.from("waitlist").insert({ email, joined_at: new Date().toISOString() })
const seen = new Set<string>()

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email" },
      { status: 400 }
    )
  }

  const { email } = parsed.data
  const alreadyJoined = seen.has(email)
  seen.add(email)

  // Log to server console so you can capture emails during pre-launch
  if (!alreadyJoined) {
    console.log(`[waitlist] +1 signup: ${email}  (total unique: ${seen.size})`)
  }

  return NextResponse.json(
    {
      success: true,
      alreadyJoined,
      discountCode: "EARLY35",
      message: alreadyJoined
        ? "You're already on the list! Your discount code is EARLY35."
        : "You're on the waitlist! Use EARLY35 for 35% off your first plan at launch.",
    },
    { status: 200 }
  )
}