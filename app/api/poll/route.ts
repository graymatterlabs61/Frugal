import { NextResponse } from "next/server";
import { runPollingWorker } from "@/lib/polling/worker";

// QStash sends a POST with a signature header.
// In dev/test, fall back to a simple POLL_SECRET check.
export async function POST(request: Request): Promise<NextResponse> {
  const isVerified = await verifyRequest(request);
  if (!isVerified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPollingWorker();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/poll] Worker crashed:", err);
    return NextResponse.json({ error: "Worker failed" }, { status: 500 });
  }
}

async function verifyRequest(request: Request): Promise<boolean> {
  // QStash signature verification
  const qstashSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  if (qstashSigningKey) {
    try {
      const { Receiver } = await import("@upstash/qstash");
      const receiver = new Receiver({
        currentSigningKey: qstashSigningKey,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? qstashSigningKey,
      });
      const body = await request.text();
      const signature = request.headers.get("upstash-signature") ?? "";
      const isValid = await receiver.verify({ signature, body });
      return isValid;
    } catch {
      return false;
    }
  }

  // Dev fallback: simple shared secret
  const secret = process.env.POLL_SECRET;
  if (secret) {
    const header = request.headers.get("x-poll-secret");
    return header === secret;
  }

  // No auth configured — block in production, allow in development
  return process.env.NODE_ENV === "development";
}

// Manual trigger for local testing (GET /api/poll)
export async function GET(request: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret = process.env.POLL_SECRET;
  if (secret) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("secret") !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runPollingWorker();
  return NextResponse.json({ ok: true, ...result });
}
