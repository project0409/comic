import { NextResponse } from "next/server";
import { getIp, otpRequests } from "../store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  const ipAddress = getIp(request);
  const record = {
    email,
    otp: process.env.NODE_ENV === "production" ? String(Math.floor(100000 + Math.random() * 900000)) : "123456",
    ipAddress,
    expiresAt: Date.now() + 5 * 60 * 1000
  };
  otpRequests.set(email, record);
  return NextResponse.json({
    ok: true,
    email,
    ipAddress,
    expiresAt: record.expiresAt,
    devOtp: process.env.NODE_ENV === "production" ? undefined : record.otp
  });
}