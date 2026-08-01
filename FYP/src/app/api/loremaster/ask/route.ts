import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const q = String(body?.query_text ?? "").trim();
  const p = Number(body?.current_page ?? 1);
  return NextResponse.json({
    answer_text: [
      `Spoiler-safe answer up to page ${p}:`,
      q ? `- About "${q}":` : "- Ask a question to get lore context.",
      "- The violet glow usually signifies forged intent (not destiny).",
      "- I can summarize the last pages you have read."
    ].join("\n")
  });
}