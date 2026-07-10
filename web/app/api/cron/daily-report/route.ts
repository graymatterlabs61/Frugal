import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { dailyReportHtml, dailyReportText } from "@/lib/email/dailyReport";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  // 1. Verify Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // 2. Fetch total users
  const { count: totalUsers, error: totalError } = await supabase
    .from("wishlist")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error("Failed to fetch total users:", totalError);
    return NextResponse.json({ error: "Failed to fetch total stats" }, { status: 500 });
  }

  // 3. Fetch today's users (IST timezone)
  // Calculate the start of the current day in IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  
  // Get current time in IST
  const istTime = new Date(now.getTime() + istOffset);
  
  // Set to midnight IST
  istTime.setUTCHours(0, 0, 0, 0);
  
  // Convert back to UTC for the database query
  const startOfDayUTC = new Date(istTime.getTime() - istOffset);

  const { count: todayJoins, error: todayError } = await supabase
    .from("wishlist")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDayUTC.toISOString());

  if (todayError) {
    console.error("Failed to fetch today's users:", todayError);
    return NextResponse.json({ error: "Failed to fetch daily stats" }, { status: 500 });
  }

  // 4. Send email
  try {
    await resend.emails.send({
      from: "Frugal Admin <admin@getfrugal.dev>",
      to: "neilkumaroff@gmail.com",
      subject: `Daily Wishlist Report: ${todayJoins} new joins today`,
      html: dailyReportHtml({ totalUsers: totalUsers ?? 0, todayJoins: todayJoins ?? 0 }),
      text: dailyReportText({ totalUsers: totalUsers ?? 0, todayJoins: todayJoins ?? 0 }),
    });

    return NextResponse.json({ success: true, totalUsers, todayJoins }, { status: 200 });
  } catch (error) {
    console.error("Failed to send daily report email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
