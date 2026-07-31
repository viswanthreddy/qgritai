import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getCanonicalRedirectUrl } from "@/lib/canonical-host";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const canonicalRedirect = getCanonicalRedirectUrl(request.nextUrl, process.env.NEXT_PUBLIC_SITE_URL);
  if (canonicalRedirect) return NextResponse.redirect(canonicalRedirect, 308);
  if (!isSupabaseConfigured()) return;
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
