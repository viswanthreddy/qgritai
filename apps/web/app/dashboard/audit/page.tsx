import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organization_members").select("role").limit(1).maybeSingle();
  if (!membership || !["owner", "admin", "consultant"].includes(membership.role)) redirect("/dashboard");
  const { data: events } = await supabase.from("audit_events").select("id, actor_id, action, entity_type, entity_id, details, created_at, profiles(full_name, email)").order("created_at", { ascending: false }).limit(100);
  return <><SiteHeader/><main className="tool-page shell"><Link className="text-button" href="/dashboard">← Client workspace</Link><span className="kicker audit-kicker">Governance evidence</span><h1>Audit activity</h1><p className="lede">An append-only record of important workspace changes. Events cannot be edited or deleted through the application.</p><section className="audit-list">{events?.length ? events.map(event => { const actor = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles; const details = event.details as Record<string, string>; const label = details.name || details.title || details.subject || details.file_name || event.entity_id || "record"; return <article className="panel" key={event.id}><div><span>{event.entity_type.replaceAll("_", " ")} · {event.action}</span><h2>{label}</h2><p>{actor?.full_name || actor?.email || "System process"} · {new Date(event.created_at).toLocaleString()}</p></div><div className="audit-changes">{details.previous_status && <small>Status: {details.previous_status} → {details.status}</small>}{details.previous_role && <small>Role: {details.previous_role} → {details.role}</small>}{!details.previous_status && !details.previous_role && details.status && <small>Status: {details.status}</small>}{details.progress && <small>Progress: {details.progress}%</small>}</div></article>; }) : <div className="panel"><p>No audited activity yet.</p></div>}</section></main><Footer/></>;
}
