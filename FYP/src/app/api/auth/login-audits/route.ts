import { NextResponse } from "next/server";
import { getLoginAudits } from "@/lib/server/authSecurity";

export async function GET() {
  return NextResponse.json({ ok: true, audits: getLoginAudits() });
}
