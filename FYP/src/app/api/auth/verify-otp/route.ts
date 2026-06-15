import { NextRequest, NextResponse } from "next/server";
import { extractRequestIp, verifyOtpRequest } from "@/lib/server/authSecurity";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; otp?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const otp = body.otp ?? "";
  const ipAddress = extractRequestIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const result = verifyOtpRequest({ email, otp, ipAddress, userAgent });

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason, ipAddress }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mode: result.record.mode,
    email: result.record.email,
    displayName: result.record.displayName,
    role: result.record.role,
    ipAddress,
    loginTime: Date.now(),
    userAgent
  });
}
