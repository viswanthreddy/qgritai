import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { createDiscoveryNote, createProposal, updateProposalStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function OpportunityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("platform_role").eq("id", user.id).single();
  if (!profile || !["consultant", "admin"].includes(profile.platform_role)) redirect("/dashboard");
  const [{ data: lead }, { data: notes }, { data: proposals }] = await Promise.all([
    supabase.from("leads").select("id, full_name, work_email, company, job_title, message, source, status, readiness_score, readiness_label, created_at").eq("id", id).maybeSingle(),
    supabase.from("discovery_notes").select("id, body, created_at").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("proposals").select("id, title, summary, fee_amount, currency, status, created_at").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);
  if (!lead) notFound();
  const { error } = await searchParams;
  return <><SiteHeader/><main className="tool-page shell"><Link className="text-button" href="/admin/leads">← Opportunity pipeline</Link><div className="opportunity-head"><div><span className="kicker">{lead.source} · {lead.status}</span><h1>{lead.company}</h1><p className="lede">{lead.full_name}{lead.job_title ? ` · ${lead.job_title}` : ""} · <a href={`mailto:${lead.work_email}`}>{lead.work_email}</a></p></div>{lead.readiness_score !== null && <div className="lead-score"><strong>{lead.readiness_score}</strong><span>{lead.readiness_label}</span></div>}</div>{error && <p className="form-error panel" role="alert">{error}</p>}<div className="opportunity-grid"><div className="portal-main"><div className="panel"><span>Initial context</span><p>{lead.message}</p></div><div className="panel"><div className="panel-head"><div><span>Discovery</span><h2>Notes</h2></div></div><form action={createDiscoveryNote} className="workspace-form compact"><input type="hidden" name="leadId" value={lead.id}/><label className="form-wide">New note<textarea name="body" required minLength={10} maxLength={5000} rows={5}/></label><button className="button">Add note</button></form><div className="note-list">{notes?.length ? notes.map(note => <article key={note.id}><small>{new Date(note.created_at).toLocaleString()}</small><p>{note.body}</p></article>) : <p>No discovery notes yet.</p>}</div></div></div><aside><details className="panel workspace-create" open><summary>Create proposal</summary><form action={createProposal} className="workspace-form"><input type="hidden" name="leadId" value={lead.id}/><label>Title<input name="title" required minLength={3}/></label><label>Fee amount<input name="feeAmount" type="number" min="0" step="0.01"/></label><label>Currency<select name="currency" defaultValue="USD"><option>USD</option><option>GBP</option><option>EUR</option><option>INR</option></select></label><label className="form-wide">Summary<textarea name="summary" required minLength={20} maxLength={5000} rows={6}/></label><button className="button">Create draft</button></form></details><div className="proposal-list">{proposals?.length ? proposals.map(proposal => <article className="panel" key={proposal.id}><span>{proposal.status}</span><h3>{proposal.title}</h3><p>{proposal.summary}</p>{proposal.fee_amount !== null && <strong>{proposal.currency} {Number(proposal.fee_amount).toLocaleString()}</strong>}<form action={updateProposalStatus}><input type="hidden" name="id" value={proposal.id}/><input type="hidden" name="leadId" value={lead.id}/><select name="status" defaultValue={proposal.status}><option value="draft">Draft</option><option value="sent">Sent</option><option value="accepted">Accepted</option><option value="declined">Declined</option></select><button className="text-button">Update</button></form></article>) : <div className="panel"><p>No proposals yet.</p></div>}</div></aside></div></main><Footer/></>;
}
