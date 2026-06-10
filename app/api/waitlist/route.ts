import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  email: z.string().email("Please provide a valid email address"),
})

const DISCOUNT_CODE = "EARLY35"

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

  const email = parsed.data.email.toLowerCase().trim()

  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, discount_code: DISCOUNT_CODE })

    // 23505 = unique_violation: already on the list, treat as success
    const alreadyJoined = error?.code === "23505"
    if (error && !alreadyJoined) {
      console.error("[waitlist] insert failed:", error.message)
      return NextResponse.json(
        { error: "Couldn't save your signup — please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      alreadyJoined,
      discountCode: DISCOUNT_CODE,
      message: alreadyJoined
        ? `You're already on the list! Your discount code is ${DISCOUNT_CODE}.`
        : `You're on the waitlist! Use ${DISCOUNT_CODE} for 35% off your first plan at launch.`,
    })
  } catch (err) {
    console.error("[waitlist] error:", err)
    return NextResponse.json(
      { error: "Couldn't save your signup — please try again." },
      { status: 500 }
    )
  }
}
