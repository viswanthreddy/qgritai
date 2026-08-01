import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { sendMagicLink, signIn, signUp } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return <><SiteHeader/><main className="tool-page shell auth-page"><span className="kicker">Secure workspace</span><h1>Sign in to QGRITAI.</h1><p className="lede">Access your organization’s assessments, scenarios, engagements, and delivery workspace.</p>
    {!isSupabaseConfigured() ? <div className="panel auth-notice"><strong>Supabase setup required</strong><p>Copy <code>.env.example</code> to <code>.env.local</code> and add your project URL and anonymous key before using authentication.</p></div> : <section className="auth-grid">
      <form className="panel auth-form"><h2>Email and password</h2><label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label>{params.error && <p className="form-error" role="alert">{params.error}</p>}{params.message && <p className="form-success" role="status">{params.message}</p>}<div className="auth-actions"><button className="button" formAction={signIn}>Sign in</button><button className="button button-secondary" formAction={signUp}>Create account</button></div></form>
      <form className="panel auth-form"><h2>Passwordless access</h2><p>Receive a one-time secure sign-in link.</p><label>Email<input name="email" type="email" autoComplete="email" required/></label><button className="button" formAction={sendMagicLink}>Email me a magic link</button></form>
    </section>}
  </main><Footer/></>;
}
