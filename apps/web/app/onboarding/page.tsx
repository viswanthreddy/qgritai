import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { createOrganization, joinOrganization } from "./actions";

export const metadata: Metadata = {
  title: "Organization setup",
  robots: { index: false, follow: false },
};

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: memberships } = await supabase.from("organization_members").select("organization_id").limit(1);
  if (memberships?.length) redirect("/dashboard");
  const { error } = await searchParams;

  return <><SiteHeader/><main className="tool-page shell auth-page"><span className="kicker">Organization setup</span><h1>Create or join your workspace.</h1><p className="lede">Every client record is scoped to an organization and protected by database-level tenant policies.</p>{error && <p className="form-error" role="alert">{error}</p>}<section className="auth-grid">
    <form className="panel auth-form" action={createOrganization}><h2>Create an organization</h2><label>Organization name<input name="name" required minLength={2}/></label><label>Workspace slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="acme-enterprises"/></label><button className="button">Create workspace</button></form>
    <form className="panel auth-form" action={joinOrganization}><h2>Join an organization</h2><p>Ask an organization administrator for its secure join code.</p><label>Join code<input name="joinCode" required autoCapitalize="characters"/></label><button className="button">Join workspace</button></form>
  </section></main><Footer/></>;
}
