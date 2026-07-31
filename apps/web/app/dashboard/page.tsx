import { redirect } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { signOut } from "@/app/auth/actions";
import { createAction, createDecision, createEngagement, createSupportRequest, downloadDocument, updateAction, updateDecision, updateEngagement, uploadDocument } from "./actions";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Engagement = { id: string; name: string; description: string | null; status: string; progress: number; starts_on: string | null; ends_on: string | null };
type WorkspaceAction = { id: string; title: string; status: string; due_on: string | null; engagement_id: string | null; created_by: string };
type Decision = { id: string; title: string; status: string; rationale: string | null; engagement_id: string | null; created_by: string };

function EngagementSelect({ engagements }: { engagements: Engagement[] }) {
  return <select name="engagementId" defaultValue=""><option value="">No engagement</option>{engagements.map(engagement => <option key={engagement.id} value={engagement.id}>{engagement.name}</option>)}</select>;
}

function EngagementEditor({ engagement }: { engagement: Engagement }) {
  return <details className="record-editor"><summary><span><strong>{engagement.name}</strong><small>{engagement.status.replace("_", " ")} · {engagement.progress}% complete</small></span><span className="status-label">Edit</span></summary><form action={updateEngagement} className="workspace-form"><input type="hidden" name="id" value={engagement.id}/><label>Name<input name="name" required minLength={3} defaultValue={engagement.name}/></label><label>Status<select name="status" defaultValue={engagement.status}><option value="planned">Planned</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="complete">Complete</option><option value="cancelled">Cancelled</option></select></label><label>Progress<input name="progress" type="number" min="0" max="100" defaultValue={engagement.progress}/></label><label>Start date<input name="startsOn" type="date" defaultValue={engagement.starts_on ?? ""}/></label><label>End date<input name="endsOn" type="date" defaultValue={engagement.ends_on ?? ""}/></label><label className="form-wide">Description<textarea name="description" rows={3} defaultValue={engagement.description ?? ""}/></label><button className="button">Save engagement</button></form></details>;
}

function ActionEditor({ action, engagements }: { action: WorkspaceAction; engagements: Engagement[] }) {
  return <details className="record-editor"><summary><span><strong>{action.title}</strong><small>{action.status.replace("_", " ")}{action.due_on ? ` · ${action.due_on}` : ""}</small></span><span className="status-label">Edit</span></summary><form action={updateAction} className="workspace-form"><input type="hidden" name="id" value={action.id}/><label className="form-wide">Action<input name="title" required minLength={3} defaultValue={action.title}/></label><label>Engagement<select name="engagementId" defaultValue={action.engagement_id ?? ""}><option value="">No engagement</option>{engagements.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Status<select name="status" defaultValue={action.status}><option value="open">Open</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="complete">Complete</option></select></label><label>Due date<input name="dueOn" type="date" defaultValue={action.due_on ?? ""}/></label><button className="button">Save action</button></form></details>;
}

function DecisionEditor({ decision, engagements }: { decision: Decision; engagements: Engagement[] }) {
  return <details className="record-editor"><summary><span><strong>{decision.title}</strong><small>{decision.status} · {decision.rationale || "No rationale recorded."}</small></span><span className="status-label">Edit</span></summary><form action={updateDecision} className="workspace-form"><input type="hidden" name="id" value={decision.id}/><label>Decision<input name="title" required minLength={3} defaultValue={decision.title}/></label><label>Status<select name="status" defaultValue={decision.status}><option value="proposed">Proposed</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="superseded">Superseded</option></select></label><label>Engagement<select name="engagementId" defaultValue={decision.engagement_id ?? ""}><option value="">No engagement</option>{engagements.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="form-wide">Rationale<textarea name="rationale" rows={3} defaultValue={decision.rationale ?? ""}/></label><button className="button">Save decision</button></form></details>;
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
  const [{ data: engagements }, { data: assessments }, { data: scenarios }, { data: actions }, { data: decisions }, { data: requests }, { data: documents }] = await Promise.all([
    supabase.from("engagements").select("id, name, description, status, progress, starts_on, ends_on").order("created_at", { ascending: false }).limit(10),
    supabase.from("assessments").select("id, name, total_score, result_label, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("roi_scenarios").select("id, name, annual_value, roi_percent, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("actions").select("id, title, status, due_on, engagement_id, created_by").order("created_at", { ascending: false }).limit(12),
    supabase.from("decisions").select("id, title, status, rationale, engagement_id, created_by").order("created_at", { ascending: false }).limit(8),
    supabase.from("support_requests").select("id, subject, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("documents").select("id, file_name, mime_type, size_bytes, created_at, engagement_id, scan_status").order("created_at", { ascending: false }).limit(12),
  ]);
  const engagementOptions = (engagements ?? []) as Engagement[];
  const canManageWorkspace = ["owner", "admin", "consultant"].includes(membership.role);
  const { error } = await searchParams;

  return <><SiteHeader/><main className="portal-page">
    <section className="shell portal-hero"><div><span className="kicker">Client command center</span><h1>{organization?.name ?? "Organization workspace"}</h1><p>Secure tenant workspace for transformation evidence, decisions, actions, and value.</p></div><form action={signOut}><button className="button button-secondary">Sign out</button></form></section>
    {error && <div className="shell"><p className="form-error panel" role="alert">{error}</p></div>}
    <section className="shell portal-grid"><div className="portal-main">
      <div className="panel"><div className="panel-head"><div><span>Portfolio</span><h2>{engagementOptions.length} engagements</h2></div></div><div className="stat-row"><div><strong>{assessments?.length ?? 0}</strong><span>Recent assessments</span></div><div><strong>{scenarios?.length ?? 0}</strong><span>ROI scenarios</span></div><div><strong>{actions?.filter(action => action.status !== "complete").length ?? 0}</strong><span>Open actions</span></div></div></div>

      {canManageWorkspace && <details className="panel workspace-create"><summary>Create engagement</summary><form action={createEngagement} className="workspace-form"><label>Name<input name="name" required minLength={3}/></label><label>Start date<input name="startsOn" type="date"/></label><label className="form-wide">Description<textarea name="description" rows={3}/></label><button className="button">Add engagement</button></form></details>}

      <div className="panel"><div className="panel-head"><div><span>Engagement portfolio</span><h2>Delivery work</h2></div></div><div className="record-list">{engagementOptions.length ? engagementOptions.map(engagement => canManageWorkspace ? <EngagementEditor key={engagement.id} engagement={engagement}/> : <article key={engagement.id}><div><strong>{engagement.name}</strong><p>{engagement.status.replace("_", " ")} · {engagement.progress}% complete</p></div></article>) : <p>No engagements yet.</p>}</div></div>

      <div className="panel"><div className="panel-head"><div><span>Action register</span><h2>Next actions</h2></div></div><form action={createAction} className="workspace-form compact"><label className="form-wide">Action<input name="title" required minLength={3} placeholder="Add a concrete next action"/></label><label>Engagement<EngagementSelect engagements={engagementOptions}/></label><label>Due date<input name="dueOn" type="date"/></label><button className="button">Add action</button></form><div className="record-list">{actions?.length ? actions.map(action => canManageWorkspace || action.created_by === user.id ? <ActionEditor key={action.id} action={action} engagements={engagementOptions}/> : <article key={action.id}><div><strong>{action.title}</strong><p>{action.status.replace("_", " ")}</p></div></article>) : <p>No actions yet.</p>}</div></div>

      <div className="panel"><div className="panel-head"><div><span>Decision register</span><h2>Governance decisions</h2></div></div><form action={createDecision} className="workspace-form compact"><label>Decision<input name="title" required minLength={3}/></label><label>Engagement<EngagementSelect engagements={engagementOptions}/></label><label className="form-wide">Rationale<textarea name="rationale" rows={3}/></label><button className="button">Record decision</button></form><div className="record-list">{decisions?.length ? decisions.map(decision => canManageWorkspace || decision.created_by === user.id ? <DecisionEditor key={decision.id} decision={decision} engagements={engagementOptions}/> : <article key={decision.id}><div><strong>{decision.title}</strong><p>{decision.status} · {decision.rationale || "No rationale recorded."}</p></div></article>) : <p>No decisions recorded.</p>}</div></div>

      <div className="panel"><div className="panel-head"><div><span>Secure evidence</span><h2>Documents</h2></div></div><form action={uploadDocument} className="workspace-form compact"><label>File<input name="file" type="file" required accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.png,.jpg,.jpeg"/></label><label>Engagement<EngagementSelect engagements={engagementOptions}/></label><button className="button">Upload for scanning</button></form><div className="document-list">{documents?.length ? documents.map(document => <article key={document.id}><div><strong>{document.file_name}</strong><small>{document.mime_type} · {(Number(document.size_bytes) / 1024).toFixed(1)} KB · {new Date(document.created_at).toLocaleDateString()}</small><span className={`scan-status scan-${document.scan_status}`}>{document.scan_status.replace("_", " ")}</span></div>{document.scan_status === "clean" && <form action={downloadDocument}><input type="hidden" name="id" value={document.id}/><button className="text-button">Secure download</button></form>}</article>) : <p>No documents uploaded.</p>}</div></div>
    </div><aside>
      <div className="panel"><span>Access role</span><h3>{membership.role}</h3><p>Your access is enforced by PostgreSQL Row Level Security for this organization.</p></div>
      {["owner", "admin"].includes(membership.role) && <div className="panel"><span>Organization access</span><h3>Manage members</h3><p>Review roles and share the protected join code.</p><Link className="text-button" href="/dashboard/members">Open access management →</Link></div>}
      <div className="panel"><span>Value realization</span><h3>Outcomes and adoption</h3><p>Track baselines, targets, measurements, and usage evidence.</p><Link className="text-button" href="/dashboard/value">Open reporting →</Link></div>
      {canManageWorkspace && <div className="panel"><span>Governance evidence</span><h3>Audit activity</h3><p>Review important workspace and access changes.</p><Link className="text-button" href="/dashboard/audit">Open audit log →</Link></div>}
      <details className="panel workspace-create"><summary>Request support</summary><form action={createSupportRequest} className="workspace-form"><label>Subject<input name="subject" required minLength={3}/></label><label>Engagement<EngagementSelect engagements={engagementOptions}/></label><label className="form-wide">Details<textarea name="description" rows={4} required minLength={10}/></label><button className="button">Submit request</button></form></details>
      <div className="panel"><span>Support requests</span><h3>{requests?.filter(request => !["resolved", "closed"].includes(request.status)).length ?? 0} open</h3>{requests?.map(request => <p key={request.id}><Link href={`/dashboard/support/${request.id}`}><strong>{request.subject}</strong><br/>{request.status.replace("_", " ")} →</Link></p>)}</div>
    </aside></section>
  </main><Footer/></>;
}
