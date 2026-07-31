import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { createSupportMessage, updateSupportStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function SupportThread({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: request }, { data: messages }] = await Promise.all([
    supabase.from("support_requests").select("id, subject, description, status, created_by, created_at, engagements(name)").eq("id", id).maybeSingle(),
    supabase.from("support_messages").select("id, body, created_by, created_at, profiles(full_name, email)").eq("support_request_id", id).order("created_at"),
  ]);
  if (!request) notFound();
  const engagement = Array.isArray(request.engagements) ? request.engagements[0] : request.engagements;
  const { error } = await searchParams;
  return <><SiteHeader/><main className="tool-page shell"><Link className="text-button" href="/dashboard">← Client workspace</Link><div className="support-head"><div><span className="kicker">Support · {request.status.replace("_", " ")}</span><h1>{request.subject}</h1><p className="lede">{engagement?.name ?? "General workspace request"} · Opened {new Date(request.created_at).toLocaleDateString()}</p></div><form action={updateSupportStatus}><input type="hidden" name="requestId" value={request.id}/><select name="status" defaultValue={request.status}><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><button className="text-button">Update status</button></form></div>{error && <p className="form-error panel" role="alert">{error}</p>}<section className="support-thread"><article className={request.created_by === user.id ? "message own-message" : "message"}><small>Initial request</small><p>{request.description}</p></article>{messages?.map(message => { const profile = Array.isArray(message.profiles) ? message.profiles[0] : message.profiles; return <article key={message.id} className={message.created_by === user.id ? "message own-message" : "message"}><small>{profile?.full_name || profile?.email || "Workspace member"} · {new Date(message.created_at).toLocaleString()}</small><p>{message.body}</p></article>; })}</section><form action={createSupportMessage} className="panel support-reply"><input type="hidden" name="requestId" value={request.id}/><label>Reply<textarea name="body" required minLength={2} maxLength={5000} rows={5}/></label><button className="button">Send reply</button></form></main><Footer/></>;
}
