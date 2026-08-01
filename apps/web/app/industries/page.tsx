import { Building2, BriefcaseBusiness, Factory, Headphones, Landmark, Store } from "lucide-react";
import { CallToAction, PageHero } from "@/components/marketing";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Industries", description: "Applied AI services grounded in the workflows, controls, and operating context of each business." };

const industries = [
  [BriefcaseBusiness, "Professional services", "Research, proposals, onboarding, knowledge retrieval, delivery coordination, reporting, and recurring client work."],
  [Factory, "Enterprise operations", "Employee service, IT operations, procurement, approvals, asset intelligence, and cross-system workflow orchestration."],
  [Headphones, "Customer and sales operations", "Service assistance, enquiry qualification, follow-up, account intelligence, case summaries, and next-best actions."],
  [Building2, "Real estate and construction", "Lead journeys, project communication, document review, vendor coordination, reporting, and customer visibility."],
  [Landmark, "Finance and shared services", "Document processing, reconciliation assistance, policy guidance, controlled approvals, reporting, and exception handling."],
  [Store, "Growing digital businesses", "Lean internal operations, customer support, sales enablement, content systems, analytics, and AI-enabled products."],
];

export default function IndustriesPage() {
  return <><SiteHeader/><main><PageHero eyebrow="Industries" title="AI grounded in operational context." description="QGRITAI starts with the language, workflow, systems, controls, and customer expectations of the business—not with a generic catalogue of AI features."/><section className="section shell page-section"><div className="industry-grid">{industries.map(([Icon,title,text]) => { const C = Icon as typeof Building2; return <article className="industry-card" key={String(title)}><C/><h2>{String(title)}</h2><p>{String(text)}</p><a href="/contact">Explore a use case →</a></article>; })}</div><div className="context-note"><span className="kicker">A deliberate boundary</span><h2>Domain expertise is earned in the engagement.</h2><p>QGRITAI does not pretend that a generic model already understands your business. Discovery captures the policies, terminology, evidence, edge cases, and accountability required to build something dependable.</p></div></section><CallToAction title="Where is operational friction limiting your business?"/></main><Footer/></>;
}
