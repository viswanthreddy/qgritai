import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { signOut } from "@/app/auth/actions";
import { createAction, createDecision, createEngagement, createSupportRequest, updateActionStatus, updateDecisionStatus } from "./actions";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Engagement = { id: string; name: string; status: string; progress: number };

function EngagementSelect({ engagements }: { engagements: Engagement[] }) {
  return <select name="engagementId" defaultValue=""><option value="">No engagement</option>{engagements.map(engagement => <option key={engagement.id} value={engagement.id}>{engagement.name}</option>)}</select>;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase.from("organization_members").select("organization_id, role, organizations(name, join_code)").limit(1);
  if (!memberships?.length) redirect("/onboarding");
  const membership = memberships[0];
  const organization = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations;
  const [{ data: engagements }, { data: assessments }, { data: scenarios }, { data: actions }, { data: decisions }, { data: requests }] = await Promise.all([
    supabase.from("engagements").select("id, name, status, progress").order("created_at", { ascending: false }).limit(10),
    supabase.from("assessments").select("id, name, total_score, result_label, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("roi_scenarios").select("id, name, annual_value, roi_percent, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("actions").select("id, title, status, due_on, created_by").order("created_at", { ascending: false }).limit(12),
    supabase.from("decisions").select("id, title, status, rationale, created_by").order("created_at", { ascending: false }).limit(8),
    supabase.from("support_requests").select("id, subject, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  const engagementOptions = (engagements ?? []) as Engagement[];
  const { error } = await searchParams;

  return <><SiteHeader/><main className="portal-page">
    <section className="shell portal-hero"><div><span className="kicker">Client command center</span><h1>{organization?.name ?? "Organization workspace"}</h1><p>Secure tenant workspace for transformation evidence, decisions, actions, and value.</p></div><form action={signOut}><button className="button button-secondary">Sign out</button></form></section>
    {error && <div className="shell"><p className="form-error panel" role="alert">{error}</p></div>}
    <section className="shell portal-grid"><div className="portal-main">
      <div className="panel"><div className="panel-head"><div><span>Portfolio</span><h2>{engagementOptions.length} engagements</h2></div></div><div className="stat-row"><div><strong>{assessments?.length ?? 0}</strong><span>Recent assessments</span></div><div><strong>{scenarios?.length ?? 0}</strong><span>ROI scenarios</span></div><div><strong>{actions?.filter(action => action.status !== "complete").length ?? 0}</strong><span>Open actions</span></div></div></div>

      {["owner", "admin", "consultant"].includes(membership.role) && <details className="panel workspace-create"><summary>Create engagement</summary><form action={createEngagement} className="workspace-form"><label>Name<input name="name" required minLength={3}/></label><label>Start date<input name="startsOn" type="date"/></label><label className="form-wide">Description<textarea name="description" rows={3}/></label><button className="button">Add engagement</button></form></details>}

      <div className="panel"><div className="panel-head"><div><span>Action register</span><h2>Next actions</h2></div></div><form action={createAction} className="workspace-form compact"><label className="form-wide">Action<input name="title" required minLength={3} placeholder="Add a concrete next action"/></label><label>Engagement<EngagementSelect engagements={engagementOptions}/></label><label>Due date<input name="dueOn" type="date"/></label><button className="button">Add action</button></form><div className="action-list">{actions?.length ? actions.map(action => <div key={action.id} className={action.status === "complete" ? "action done" : "action"}><span><strong>{action.title}</strong><small>{action.status.replace("_", " ")}{action.due_on ? ` · ${action.due_on}` : ""}</small></span>{action.created_by === user.id && <form action={updateActionStatus}><input type="hidden" name="id" value={action.id}/><select name="status" defaultValue={action.status}><option value="open">Open</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="complete">Complete</option></select><button className="text-button">Update</button></form>}</div>) : <p>No actions yet.</p>}</div></div>

      <div className="panel"><div className="panel-head"><div><span>Decision register</span><h2>Governance decisions</h2></div></div><form action={createDecision} className="workspace-form compact"><label>Decision<input name="title" required minLength={3}/></label><label>Engagement<EngagementSelect engagements={engagementOptions}/></label><label className="form-wide">Rationale<textarea name="rationale" rows={3}/></label><button className="button">Record decision</button></form><div className="record-list">{decisions?.length ? decisions.map(decision => <article key={decision.id}><div><strong>{decision.title}</strong><p>{decision.rationale || "No rationale recorded."}</p></div><span className="status-label">{decision.status}</span>{decision.created_by === user.id && <form action={updateDecisionStatus}><input type="hidden" name="id" value={decision.id}/><select name="status" defaultValue={decision.status}><option value="proposed">Proposed</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="superseded">Superseded</option></select><button className="text-button">Update</button></form>}</article>) : <p>No decisions recorded.</p>}</div></div>
    </div><aside>
      <div className="panel"><span>Access role</span><h3>{membership.role}</h3><p>Your access is enforced by PostgreSQL Row Level Security for this organization.</p></div>
      <div className="panel"><span>Organization join code</span><h3>{organization?.join_code ?? "Unavailable"}</h3><p>Share only with people who should be added to this tenant.</p></div>
      <details className="panel workspace-create"><summary>Request support</summary><form action={createSupportRequest} className="workspace-form"><label>Subject<input name="subject" required minLength={3}/></label><label>Engagement<EngagementSelect engagements={engagementOptions}/></label><label className="form-wide">Details<textarea name="description" rows={4} required minLength={10}/></label><button className="button">Submit request</button></form></details>
      <div className="panel"><span>Support requests</span><h3>{requests?.filter(request => !["resolved", "closed"].includes(request.status)).length ?? 0} open</h3>{requests?.map(request => <p key={request.id}><strong>{request.subject}</strong><br/>{request.status.replace("_", " ")}</p>)}</div>
    </aside></section>
  </main><Footer/></>;
}
