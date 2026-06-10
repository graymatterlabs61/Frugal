import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/service"
import { sendWaitlistWelcome } from "@/lib/email"

const schema = z.object({
  email: z.string().email("Please provide a valid email address"),
})

const DISCOUNT_CODE = "EARLY35"

// Layered durability: Supabase table (primary, needs migration 006),
// Resend audience contact (if RESEND_AUDIENCE_ID set), welcome email with the
// code. Success requires at least one durable record of the signup.
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

  // 1. Supabase (primary store)
  let dbStored = false
  let alreadyJoined = false
  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, discount_code: DISCOUNT_CODE })

    if (!error) {
      dbStored = true
    } else if (error.code === "23505") {
      // unique_violation — repeat signup, already safely stored
      dbStored = true
      alreadyJoined = true
    } else {
      // 42P01 = table missing (migration 006 not applied yet) — fall through
      console.error("[waitlist] supabase insert failed:", error.code, error.message)
    }
  } catch (err) {
    console.error("[waitlist] supabase unavailable:", err)
  }

  // 2. Resend audience contact (secondary durable store)
  let contactStored = false
  const audienceId = process.env.RESEND_AUDIENCE_ID
  const resendKey = process.env.RESEND_API_KEY
  if (audienceId && resendKey) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(resendKey)
      const { error } = await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      })
      if (!error) contactStored = true
      else console.error("[waitlist] resend contact failed:", error.message)
    } catch (err) {
      console.error("[waitlist] resend contact error:", err)
    }
  }

  // 3. Welcome email with the discount code (skip repeat signups)
  let emailSent = false
  if (!alreadyJoined) {
    const result = await sendWaitlistWelcome(email, { discountCode: DISCOUNT_CODE })
    emailSent = result.success
    if (!result.success) {
      console.error("[waitlist] welcome email failed:", result.error)
    }
  }

  // No durable record anywhere — tell the user honestly instead of dropping them
  if (!dbStored && !contactStored && !emailSent) {
    return NextResponse.json(
      { error: "Couldn't save your signup — please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    alreadyJoined,
    emailSent,
    discountCode: DISCOUNT_CODE,
    message: alreadyJoined
      ? `You're already on the list! Your discount code is ${DISCOUNT_CODE}.`
      : `You're on the waitlist! Use ${DISCOUNT_CODE} for 35% off your first plan at launch.`,
  })
}
