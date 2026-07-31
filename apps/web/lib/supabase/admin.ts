import { createClient } from "@supabase/supabase-js";
import { getNotificationEnv, getSupabaseEnv } from "@/lib/env";

export function createAdminClient(serviceRoleKey?: string) {
  const publicEnv = getSupabaseEnv();
  const key = serviceRoleKey ?? getNotificationEnv().SUPABASE_SERVICE_ROLE_KEY;
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
