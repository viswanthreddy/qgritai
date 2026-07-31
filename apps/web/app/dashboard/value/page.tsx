import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { calculateAdoptionRate, calculateTargetProgress } from "@/lib/value-reporting";
import { createValueMetric, recordAdoptionSnapshot, recordValueMeasurement } from "./actions";

export const dynamic = "force-dynamic";
type Engagement = { id: string; name: string };

function EngagementOptions({ engagements }: { engagements: Engagement[] }) { return <><option value="">Portfolio-wide</option>{engagements.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</>; }

export default async function ValuePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organization_members").select("role").limit(1).maybeSingle();
  if (!membership) redirect("/onboarding");
  const [{ data: engagements }, { data: metrics }, { data: measurements }, { data: adoption }] = await Promise.all([
    supabase.from("engagements").select("id, name").order("name"),
    supabase.from("value_metrics").select("id, name, category, unit, baseline_value, target_value, engagement_id").order("created_at"),
    supabase.from("value_measurements").select("id, metric_id, value, observed_on, note").order("observed_on", { ascending: false }),
    supabase.from("adoption_snapshots").select("id, observed_on, eligible_users, active_users, workflows_completed, note").order("observed_on", { ascending: false }).limit(12),
  ]);
  const engagementOptions = (engagements ?? []) as Engagement[];
  const canReport = ["owner", "admin", "consultant"].includes(membership.role);
  const latestByMetric = new Map<string, NonNullable<typeof measurements>[number]>();
  measurements?.forEach(item => { if (!latestByMetric.has(item.metric_id)) latestByMetric.set(item.metric_id, item); });
  const latestAdoption = adoption?.[0];
  const { error } = await searchParams;
  return <><SiteHeader/><main className="tool-page shell"><Link className="text-button" href="/dashboard">← Client workspace</Link><span className="kicker report-kicker">Value realization</span><h1>Outcomes and adoption</h1><p className="lede">Track baselines, targets, observed results, user adoption, and workflow activity with dated evidence.</p>{error && <p className="form-error panel" role="alert">{error}</p>}<div className="report-summary"><div className="panel"><span>Tracked metrics</span><strong>{metrics?.length ?? 0}</strong></div><div className="panel"><span>Latest adoption</span><strong>{latestAdoption ? `${calculateAdoptionRate(latestAdoption.active_users, latestAdoption.eligible_users)}%` : "—"}</strong></div><div className="panel"><span>Workflows completed</span><strong>{latestAdoption?.workflows_completed ?? "—"}</strong></div></div><div className="report-grid"><section className="portal-main"><div className="panel"><div className="panel-head"><div><span>Value measures</span><h2>Baseline to target</h2></div></div><div className="metric-list">{metrics?.length ? metrics.map(metric => { const latest = latestByMetric.get(metric.id); const current = latest ? Number(latest.value) : Number(metric.baseline_value); const progress = calculateTargetProgress(Number(metric.baseline_value), current, Number(metric.target_value)); return <article key={metric.id}><div><span>{metric.category}</span><h3>{metric.name}</h3><p>Baseline {Number(metric.baseline_value).toLocaleString()} {metric.unit} · Current {current.toLocaleString()} {metric.unit} · Target {Number(metric.target_value).toLocaleString()} {metric.unit}</p></div><strong>{progress}%</strong>{canReport && <form action={recordValueMeasurement}><input type="hidden" name="metricId" value={metric.id}/><input name="value" type="number" step="any" required placeholder="Current value"/><input name="observedOn" type="date" required defaultValue={new Date().toISOString().slice(0,10)}/><input name="note" maxLength={1000} placeholder="Evidence note"/><button className="text-button">Record</button></form>}</article>; }) : <p>No value metrics yet.</p>}</div></div>{canReport && <details className="panel workspace-create"><summary>Create value metric</summary><form action={createValueMetric} className="workspace-form"><label>Name<input name="name" required minLength={3}/></label><label>Category<select name="category"><option value="financial">Financial</option><option value="efficiency">Efficiency</option><option value="quality">Quality</option><option value="risk">Risk</option><option value="adoption">Adoption</option></select></label><label>Unit<input name="unit" required placeholder="%, hours, USD"/></label><label>Baseline<input name="baseline" type="number" step="any" required/></label><label>Target<input name="target" type="number" step="any" required/></label><label>Engagement<select name="engagementId"><EngagementOptions engagements={engagementOptions}/></select></label><button className="button">Create metric</button></form></details>}</section><aside><div className="panel"><span>Adoption history</span><h3>{adoption?.length ?? 0} snapshots</h3>{adoption?.slice(0,5).map(item => <p key={item.id}><strong>{calculateAdoptionRate(item.active_users, item.eligible_users)}%</strong> · {item.active_users}/{item.eligible_users} active<br/>{item.observed_on}</p>)}</div>{canReport && <details className="panel workspace-create"><summary>Record adoption</summary><form action={recordAdoptionSnapshot} className="workspace-form"><label>Date<input name="observedOn" type="date" required defaultValue={new Date().toISOString().slice(0,10)}/></label><label>Engagement<select name="engagementId"><EngagementOptions engagements={engagementOptions}/></select></label><label>Eligible users<input name="eligibleUsers" type="number" min="1" required/></label><label>Active users<input name="activeUsers" type="number" min="0" required/></label><label>Workflows completed<input name="workflowsCompleted" type="number" min="0" required defaultValue="0"/></label><label className="form-wide">Note<textarea name="note" maxLength={1000} rows={3}/></label><button className="button">Save snapshot</button></form></details>}</aside></div></main><Footer/></>;
}
