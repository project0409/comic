import { NextResponse } from "next/server";
import { loginAudits } from "../store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, audits: loginAudits.slice(0, 100) });
}