import { NextResponse } from "next/server";
import { getIp, loginAudits, otpRequests } from "../store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const otp = String(body?.otp ?? "").replace(/\D/g, "");
  const ipAddress = getIp(request);
  const record = otpRequests.get(email);
  if (!record) return NextResponse.json({ ok: false, reason: "no_pending", ipAddress }, { status: 400 });
  if (Date.now() > record.expiresAt) return NextResponse.json({ ok: false, reason: "expired", ipAddress }, { status: 400 });
  if (record.ipAddress !== ipAddress) return NextResponse.json({ ok: false, reason: "ip_mismatch", ipAddress }, { status: 400 });
  if (record.otp !== otp) return NextResponse.json({ ok: false, reason: "invalid", ipAddress }, { status: 400 });
  otpRequests.delete(email);
  loginAudits.unshift({ email, loginTime: Date.now(), ipAddress, userAgent: request.headers.get("user-agent") ?? "unknown" });
  return NextResponse.json({ ok: true, email, ipAddress });
}