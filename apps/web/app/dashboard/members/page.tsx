import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { removeMember, updateMemberRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("organization_members").select("organization_id, role, organizations(name, join_code)").limit(1).maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role)) redirect("/dashboard");
  const organization = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations;
  const { data: members } = await supabase.from("organization_members").select("user_id, role, created_at, profiles(full_name, email)").eq("organization_id", membership.organization_id).order("created_at");
  const { error } = await searchParams;
  return <><SiteHeader/><main className="tool-page shell"><Link className="text-button" href="/dashboard">← Client workspace</Link><span className="kicker member-kicker">Organization access</span><h1>{organization?.name} members</h1><p className="lede">Owners and administrators can manage workspace access. Only owners can promote or manage another owner.</p>{error && <p className="form-error panel" role="alert">{error}</p>}<div className="member-layout"><section className="member-list">{members?.map(member => { const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles; return <article className="panel" key={member.user_id}><div><strong>{profile?.full_name || profile?.email || "Workspace member"}</strong><small>{profile?.email}{member.user_id === user.id ? " · You" : ""}</small></div><form action={updateMemberRole}><input type="hidden" name="userId" value={member.user_id}/><select name="role" defaultValue={member.role}><option value="owner">Owner</option><option value="admin">Admin</option><option value="consultant">Consultant</option><option value="client">Client</option></select><button className="text-button">Update</button></form><form action={removeMember}><input type="hidden" name="userId" value={member.user_id}/><button className="text-button danger-button">Remove</button></form></article>; })}</section><aside><div className="panel"><span>Join code</span><h3>{organization?.join_code}</h3><p>Share this code only with people authorized to enter this customer workspace. New members join with the client role.</p></div><div className="panel"><span>Role guide</span><p><strong>Owner:</strong> full workspace and membership control.</p><p><strong>Admin:</strong> manages members except owners.</p><p><strong>Consultant:</strong> manages delivery work.</p><p><strong>Client:</strong> participates in assigned workspace records.</p></div></aside></div></main><Footer/></>;
}
