import { CallToAction, PageHero } from "@/components/marketing";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "AI transformation insights", description: "Practical perspectives from QGRITAI on agentic delivery, workflow automation, adoption, governance, and measurable AI value." };

const insights = [
  { number: "01", topic: "Strategy", title: "Start with the workflow, not the model", body: "The model is rarely the whole solution. Useful AI begins with the work: the trigger, evidence, judgment, systems, exceptions, owner, and measurable definition of improvement." },
  { number: "02", topic: "Operating model", title: "Agents need accountability, not mythology", body: "Reliable agentic systems have bounded responsibilities, trusted tools, evaluation criteria, escalation paths, and named human accountability. Autonomy is a design decision—not a marketing claim." },
  { number: "03", topic: "Economics", title: "Measure capacity before claiming savings", body: "Automation may return time without immediately reducing cost. A credible business case distinguishes capacity, service improvement, risk reduction, growth enablement, and cash impact." },
  { number: "04", topic: "Adoption", title: "A technically correct system can still fail", body: "Users adopt systems that fit the workflow, make responsibility clear, and earn trust through evidence. Training, feedback, permissions, and exception handling belong in the product design." },
  { number: "05", topic: "Transformation", title: "Small proofs should create reusable foundations", body: "A narrow first use case reduces risk, but it should still establish reusable integration, knowledge, evaluation, security, and operating patterns for the next workflow." },
  { number: "06", topic: "Delivery", title: "AI changes the economics of consulting", body: "Specialist agents can compress research, analysis, engineering, testing, and documentation. The advantage comes from orchestration and quality—not from pretending accountability has disappeared." },
];

export default function InsightsPage() {
  return <><SiteHeader/><main><PageHero eyebrow="Insights" title="Practical thinking for businesses adopting AI." description="Clear perspectives on where AI creates value, why transformations stall, and how to build agentic systems that remain useful after the demonstration."/><section className="section shell page-section"><div className="insight-list">{insights.map(item => <article key={item.number}><div><span>{item.number}</span><small>{item.topic}</small></div><h2>{item.title}</h2><p>{item.body}</p></article>)}</div></section><CallToAction title="Turn the principles into a practical first move."/></main><Footer/></>;
}
