import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

export function GET() {
  return NextResponse.json(
    { status: isSupabaseConfigured() ? "ok" : "configuration_required" },
    { status: isSupabaseConfigured() ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
