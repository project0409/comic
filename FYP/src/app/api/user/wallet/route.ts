import { NextResponse } from "next/server";

export async function GET() {
  // Prototype wallet: the UI uses Zustand; this endpoint matches the prompt for backend wiring.
  return NextResponse.json({
    coin_balance: 248,
    transactions: [
      { date: "2026-05-12", description: "Welcome bonus", coins: +50 },
      { date: "2026-05-18", description: "Unlocked Chapter c4", coins: -5 }
    ]
  });
}

