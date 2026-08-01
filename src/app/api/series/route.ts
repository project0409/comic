import { NextResponse } from "next/server";
import { seriesList } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(seriesList);
}