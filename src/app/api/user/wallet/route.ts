import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ coinBalance: 120, subscription: "Premium", unlockedChapterIds: ["c1", "c2"] });
}