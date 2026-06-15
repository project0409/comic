import { NextResponse } from "next/server";
import { seriesList } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(seriesList);
}

