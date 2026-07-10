import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Resend } from "resend";
import { wishlistWelcomeHtml, wishlistWelcomeText } from "@/lib/email/wishlistWelcome";

const schema = z.object({
  email: z.string().email(),
  referredBy: z.string().optional(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, referredBy } = parsed.data;
  const supabase = await createClient();

  // Already on wishlist — return their existing code
  const { data: existing } = await supabase
    .from("wishlist")
    .select("id, referral_code, referral_count")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json(
      {
        alreadyJoined: true,
        referralCode: existing.referral_code,
        referralCount: existing.referral_count,
      },
      { status: 200 },
    );
  }

  // Insert new entry
  const { data, error } = await supabase
    .from("wishlist")
    .insert({ email, referred_by: referredBy ?? null })
    .select("id, referral_code, referral_count")
    .single();

  if (error || !data) {
    console.error("Wishlist insert error:", error);
    return NextResponse.json({ error: "Failed to join wishlist" }, { status: 500 });
  }

  const discountPercent = Math.min(25 + (data.referral_count ?? 0), 50);

  // Send welcome email (non-blocking — don't fail the request if email fails)
  if (process.env.RESEND_API_KEY) {
    resend.emails
      .send({
        from: "Frugal <noreply@getfrugal.dev>",
        to: email,
        subject: `You're on the wishlist — ${discountPercent}% off locked in`,
        html: wishlistWelcomeHtml({ email, referralCode: data.referral_code, discountPercent }),
        text: wishlistWelcomeText({ email, referralCode: data.referral_code, discountPercent }),
      })
      .catch((err) => console.error("Wishlist email failed:", err));
  }

  return NextResponse.json(
    {
      success: true,
      referralCode: data.referral_code,
      referralCount: data.referral_count,
    },
    { status: 201 },
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist")
    .select("referral_code, referral_count, created_at")
    .eq("email", email)
    .single();

  if (!data) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  return NextResponse.json({
    found: true,
    referralCode: data.referral_code,
    referralCount: data.referral_count,
    joinedAt: data.created_at,
  });
}
