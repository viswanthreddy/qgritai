import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { submitContact } from "./actions";

export const metadata = { title: "Start a conversation | QgritAI" };

export default async function Contact({ searchParams }: { searchParams: Promise<{ submitted?: string; error?: string }> }) {
  const { submitted, error } = await searchParams;
  return <><SiteHeader/><main className="tool-page shell"><span className="kicker">Start focused</span><h1>Tell us where AI needs to move real work forward.</h1><p className="lede">Share the workflow, constraint, or opportunity you are evaluating. QgritAI will use this information only to respond to your request.</p><section className="contact-grid"><form action={submitContact} className="panel workspace-form"><label>Full name<input name="fullName" required minLength={2} autoComplete="name"/></label><label>Work email<input name="workEmail" required type="email" autoComplete="email"/></label><label>Company<input name="company" required minLength={2} autoComplete="organization"/></label><label>Job title<input name="jobTitle" autoComplete="organization-title"/></label><label className="form-wide">What opportunity are you exploring?<textarea name="message" required minLength={20} maxLength={3000} rows={7}/></label><label className="form-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><button className="button">Submit request</button></form><aside>{submitted && <div className="panel notice"><h2>Request received</h2><p>Thank you. Your request is now in the QgritAI opportunity queue.</p></div>}{error && <div className="panel"><p className="form-error" role="alert">{error}</p></div>}<div className="panel"><span>What happens next</span><h3>A focused first conversation</h3><p>We will clarify the business outcome, workflow evidence, constraints, and the smallest useful next step.</p></div></aside></section></main><Footer/></>;
}
