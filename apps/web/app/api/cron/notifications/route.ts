import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getNotificationEnv } from "@/lib/env";
import { renderNotification, type Notification } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let env: ReturnType<typeof getNotificationEnv>;
  try { env = getNotificationEnv(); } catch { return NextResponse.json({ error: "Notification delivery is not configured." }, { status: 503 }); }
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("claim_notifications", { batch_size: 20 });
  if (error) return NextResponse.json({ error: "Unable to claim notifications." }, { status: 500 });
  let sent = 0;
  for (const notification of (data ?? []) as Notification[]) {
    try {
      const email = renderNotification(notification, env.CONTACT_NOTIFICATION_TO);
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `qgritai/${notification.id}` }, body: JSON.stringify({ from: env.EMAIL_FROM, to: [email.to], subject: email.subject, text: email.text }) });
      if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
      const result = await response.json() as { id?: string };
      await supabase.from("notification_outbox").update({ status: "sent", provider_message_id: result.id ?? null, sent_at: new Date().toISOString(), last_error: null }).eq("id", notification.id);
      sent += 1;
    } catch (deliveryError) {
      const retryMinutes = Math.min(60, 2 ** notification.attempts);
      await supabase.from("notification_outbox").update({ status: "failed", last_error: deliveryError instanceof Error ? deliveryError.message.slice(0, 500) : "Unknown delivery error", next_attempt_at: new Date(Date.now() + retryMinutes * 60_000).toISOString() }).eq("id", notification.id);
    }
  }
  return NextResponse.json({ claimed: data?.length ?? 0, sent });
}
