import { NextResponse } from "next/server";
import { buildMockPages } from "@/lib/mockData";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(buildMockPages(id));
}

