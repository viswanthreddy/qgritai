import { redirect } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("platform_role").eq("id", user.id).single();
  if (!profile || !["consultant", "admin"].includes(profile.platform_role)) redirect("/dashboard");
  const { data: leads } = await supabase.from("leads").select("id, full_name, work_email, company, job_title, message, source, status, readiness_score, readiness_label, created_at").order("created_at", { ascending: false }).limit(100);
  const { error } = await searchParams;
  return <><SiteHeader/><main className="tool-page shell"><span className="kicker">Internal opportunity pipeline</span><h1>Lead intake</h1><p className="lede">Validated public requests visible only to authorized QGRITAI platform staff.</p>{error && <p className="form-error panel" role="alert">{error}</p>}<div className="lead-list">{leads?.length ? leads.map(lead => <article className="panel" key={lead.id}><div className="lead-head"><div><span>{lead.source} · {new Date(lead.created_at).toLocaleDateString()}</span><h2><Link href={`/admin/leads/${lead.id}`}>{lead.company}</Link></h2><p>{lead.full_name}{lead.job_title ? ` · ${lead.job_title}` : ""}<br/><a href={`mailto:${lead.work_email}`}>{lead.work_email}</a></p></div><form action={updateLeadStatus}><input type="hidden" name="id" value={lead.id}/><select name="status" defaultValue={lead.status}><option value="new">New</option><option value="qualified">Qualified</option><option value="discovery">Discovery</option><option value="proposal">Proposal</option><option value="won">Won</option><option value="lost">Lost</option></select><button className="text-button">Update</button></form></div>{lead.readiness_score !== null && <div className="lead-score"><strong>{lead.readiness_score}</strong><span>{lead.readiness_label}</span></div>}<p>{lead.message}</p><Link className="text-button" href={`/admin/leads/${lead.id}`}>Open opportunity →</Link></article>) : <div className="panel"><p>No leads captured yet.</p></div>}</div></main><Footer/></>;
}
