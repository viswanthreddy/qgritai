import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { submitContact } from "./actions";

export const metadata = {
  title: "Start a conversation",
  description: "Discuss an AI strategy, workflow, automation, agent, or intelligent-product opportunity with QgritAI.",
};

export default async function Contact({ searchParams }: { searchParams: Promise<{ submitted?: string; error?: string }> }) {
  const { submitted, error } = await searchParams;
  return <><SiteHeader/><main className="tool-page shell contact-page"><span className="kicker">Start focused</span><h1>What could AI take off your team’s plate?</h1><p className="lede">Share a repetitive process, strategic question, customer journey, product idea, or operational constraint. You do not need to arrive with a technical solution.</p><section className="contact-grid"><form action={submitContact} className="panel workspace-form"><label>Full name<input name="fullName" required minLength={2} autoComplete="name"/></label><label>Work email<input name="workEmail" required type="email" autoComplete="email"/></label><label>Company<input name="company" required minLength={2} autoComplete="organization"/></label><label>Job title<input name="jobTitle" autoComplete="organization-title"/></label><label className="form-wide">What would you like to improve?<textarea name="message" required minLength={20} maxLength={3000} rows={7} placeholder="Describe the work, friction, ambition, or outcome in your own words."/></label><label className="form-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><button className="button">Start the conversation</button></form><aside>{submitted && <div className="panel notice"><h2>Request received</h2><p>Thank you. Your request is now in the QgritAI opportunity queue.</p></div>}{error && <div className="panel"><p className="form-error" role="alert">{error}</p></div>}<div className="panel"><span>What happens next</span><h3>A direct conversation with the founder</h3><p>We will clarify the outcome, understand how the work happens today, and determine whether strategy, automation, agents, software—or no build at all—is the right next move.</p></div><div className="panel"><span>Useful starting points</span><p>AI strategy · Workflow automation · Business agents · Knowledge systems · AI-enabled applications · Managed AI operations</p></div></aside></section></main><Footer/></>;
}
