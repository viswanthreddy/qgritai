import { ArrowRight, BookOpenCheck, FileSearch, Headset, Radar, Settings2, UserRoundSearch } from "lucide-react";
import { CallToAction, PageHero } from "@/components/marketing";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Work and solution concepts", description: "Representative QgritAI solution patterns for strategy, operations, service, sales, documents, and enterprise knowledge." };

const concepts = [
  [Radar, "Strategy", "AI opportunity intelligence", "An evidence-led discovery system maps workflows, constraints, economics, and readiness to produce a prioritized transformation roadmap."],
  [Headset, "Service operations", "Resolution co-pilot", "An agent retrieves trusted knowledge, builds case context, recommends actions, and coordinates the next step with human approval."],
  [FileSearch, "Document operations", "Document intelligence workflow", "A controlled pipeline classifies, extracts, validates, routes, and reports on high-volume business documents and exceptions."],
  [UserRoundSearch, "Sales operations", "Lead and account intelligence", "Specialist agents research accounts, qualify enquiries, prepare context, and keep follow-up work moving across the commercial workflow."],
  [BookOpenCheck, "Enterprise knowledge", "Trusted knowledge assistant", "A permission-aware assistant helps employees find, understand, and apply organizational knowledge with source evidence."],
  [Settings2, "Managed operations", "Agent performance system", "Monitoring connects reliability, cost, quality, exceptions, adoption, and business outcomes so deployed agents improve continuously."],
];

export default function WorkPage() {
  return <><SiteHeader/><main><PageHero eyebrow="Representative work" title="Solution patterns designed for visible operational change." description="These concepts demonstrate how QgritAI approaches common business problems. They are not presented as completed client engagements or guaranteed outcomes."/><section className="section shell page-section"><div className="work-concept-grid">{concepts.map(([Icon,label,title,text], index) => { const C = Icon as typeof Radar; return <article className="work-concept" key={String(title)}><div className="concept-art"><span>0{index + 1}</span><C/></div><small>{String(label)}</small><h2>{String(title)}</h2><p>{String(text)}</p><a href="/contact">Discuss a similar problem <ArrowRight size={15}/></a></article>; })}</div></section><CallToAction title="Have a workflow that does not fit a standard category?" description="That is usually where discovery is most useful. Start with the business outcome and the work as it happens today."/></main><Footer/></>;
}
