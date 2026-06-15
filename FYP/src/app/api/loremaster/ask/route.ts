import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { query_text?: string; current_page?: number };
  const q = (body.query_text ?? "").trim();
  const p = Number(body.current_page ?? 1);

  // Prototype, spoiler-safe: never references content beyond current_page.
  const answer = [
    `Spoiler-safe answer up to page ${p}:`,
    q ? `• About "${q}":` : "• Ask a question to get lore context.",
    "• The violet glow usually signifies forged intent (not destiny).",
    "• If you want, I can summarize the last 3 pages you’ve read."
  ].join("\n");

  return NextResponse.json({ answer_text: answer });
}

