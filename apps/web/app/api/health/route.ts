import { NextResponse } from "next/server";
import { getPlatformConfiguration } from "@/lib/env";

export function GET() {
  const configuration = getPlatformConfiguration();
  return NextResponse.json(
    { status: configuration.ready ? "ok" : "configuration_required", checks: configuration.checks },
    { status: configuration.ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
