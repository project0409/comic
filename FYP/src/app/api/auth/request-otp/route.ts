import { NextRequest, NextResponse } from "next/server";
import { createOtpRequest, extractRequestIp, resendOtp } from "@/lib/server/authSecurity";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    email?: string;
    mode?: "login" | "register";
    role?: "reader" | "writer";
    displayName?: string;
    resend?: boolean;
  };
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const ipAddress = extractRequestIp(request);
  const record = body.resend
    ? resendOtp(email, ipAddress)
    : createOtpRequest({
        email,
        ipAddress,
        mode: body.mode ?? "login",
        role: body.role ?? "reader",
        displayName: body.displayName?.trim()
      });

  if (!record) {
    return NextResponse.json({ ok: false, error: "Start again to request a new verification code." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    demoCode: record.otp,
    ipAddress: record.ipAddress,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt
  });
}
