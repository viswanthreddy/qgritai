import { ArrowRight, Bot, BrainCircuit, Check, Code2, Compass, Gauge, Network, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { ButtonLink } from "@qgritai/ui";
import { Footer } from "@/components/footer";
import { SectionIntro } from "@/components/marketing";
import { SiteHeader } from "@/components/site-header";

const services = [
  [Compass, "AI opportunity and strategy", "Turn broad AI ambition into a prioritized roadmap grounded in workflows, economics, risk, and readiness."],
  [Workflow, "Agentic workflow automation", "Redesign repetitive, multi-step work and connect agents safely to the systems your business already uses."],
  [BrainCircuit, "AI agents and knowledge systems", "Build focused agents for research, service, sales, operations, decision support, and organizational knowledge."],
  [Code2, "AI-enabled applications", "Create internal tools and customer experiences when the right solution needs more than a conversational interface."],
  [ShieldCheck, "Governance and adoption", "Design permissions, evaluations, human approvals, operating controls, and adoption into the system from day one."],
  [Gauge, "Managed AI operations", "Monitor, maintain, measure, and improve deployed AI systems as models, workflows, and business needs change."],
];

const delivery = [
  ["01", "Understand", "Study the business outcome, workflow, people, evidence, systems, constraints, and economics."],
  ["02", "Prioritize", "Select the smallest high-value use case with a credible path to adoption and measurable value."],
  ["03", "Build", "Orchestrate specialist agents to research, design, engineer, test, document, and deploy the solution."],
  ["04", "Operate", "Measure reliability, usage, cost, risk, and outcomes—then improve what is actually being used."],
];

export default function Home() {
  return <><SiteHeader/><main>
    <section className="hero shell service-hero"><div><div className="eyebrow"><Sparkles size={15}/> Founder-led · Agent-powered</div><h1>Build an AI-enabled business, <span>without the usual overhead.</span></h1><p>QgritAI helps companies understand where AI can create value, then designs, builds, and operates the agents, automations, and intelligent systems that move real work forward.</p><div className="hero-actions"><ButtonLink href="/contact">Discuss your business <ArrowRight size={17}/></ButtonLink><ButtonLink href="/solutions" secondary>Explore services</ButtonLink></div><div className="proof-row"><span><Check/>One accountable founder</span><span><Check/>Specialist agent delivery</span><span><Check/>Measured business outcomes</span></div></div>
    <div className="orchestration-card"><div className="orchestration-head"><span className="status-dot"/><span>QgritAI delivery system</span><b>ACTIVE</b></div><div className="client-brief"><small>Client objective</small><strong>Reduce service resolution time without losing human control.</strong></div><div className="agent-network"><div><Compass/><span><b>Strategy agent</b><small>Opportunity and value</small></span></div><div><Network/><span><b>Architecture agent</b><small>Workflow and systems</small></span></div><div><Code2/><span><b>Engineering agent</b><small>Build and integration</small></span></div><div><ShieldCheck/><span><b>Assurance agent</b><small>Quality and governance</small></span></div></div><div className="founder-gate"><Bot/><span><small>Founder review gate</small><strong>Accountability, judgment, and client alignment</strong></span></div></div></section>
    <section className="trust-strip"><div className="shell trust-inner"><span>A leaner model for transformation</span><b>Strategy</b><b>Automation</b><b>Agents</b><b>Applications</b><b>Managed operations</b></div></section>

    <section className="section shell"><SectionIntro eyebrow="What we do" title="AI capabilities assembled around the problem—not sold as another platform." description="Engage QgritAI for a focused workflow or a broader transformation. The delivery model expands through specialist agents while one founder remains accountable for the result."/><div className="service-grid">{services.map(([Icon,title,text]) => { const C = Icon as typeof BrainCircuit; return <article className="service-card" key={String(title)}><div className="icon-box"><C/></div><h3>{String(title)}</h3><p>{String(text)}</p><a className="card-link" href="/solutions">Explore the service <ArrowRight size={15}/></a></article>; })}</div></section>

    <section className="section contrast-section"><div className="shell split-story"><div><span className="kicker">A different delivery model</span><h2>Senior attention without a large consulting pyramid.</h2><p>Traditional delivery scales by adding people. QgritAI scales through a governed network of research, strategy, engineering, testing, and operations agents—directed by one accountable founder.</p><a className="text-link" href="/about">How QgritAI works <ArrowRight size={16}/></a></div><div className="principle-list"><article><strong>Founder-led</strong><p>You work directly with the person accountable for scope, decisions, quality, and outcomes.</p></article><article><strong>Agent-powered</strong><p>Specialist agents compress research, analysis, implementation, testing, and documentation cycles.</p></article><article><strong>Human-controlled</strong><p>Business judgment, sensitive decisions, approvals, and accountability remain explicit.</p></article><article><strong>Outcome-measured</strong><p>Every engagement begins with what should improve and how the change will be evidenced.</p></article></div></div></section>

    <section className="section shell"><SectionIntro eyebrow="How engagements move" title="From an unclear opportunity to a working AI capability." description="Start small enough to learn quickly, but design the foundations so a successful workflow can expand safely."/><div className="delivery-grid">{delivery.map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="section light-section"><div className="shell"><SectionIntro eyebrow="Start with evidence" title="Useful tools before the first engagement." description="Explore the opportunity independently, then bring the result into a more focused business conversation."/><div className="tool-feature-grid"><article><span>5-minute assessment</span><h3>AI Readiness</h3><p>Evaluate workflow clarity, data access, ownership, integration conditions, governance, and adoption.</p><a href="/readiness">Assess your readiness <ArrowRight size={16}/></a></article><article><span>Directional business case</span><h3>Automation ROI Studio</h3><p>Estimate capacity value, hours returned, implementation economics, and directional payback.</p><a href="/roi">Model an opportunity <ArrowRight size={16}/></a></article></div></div></section>

    <section className="section shell"><div className="cta cta-panel"><span className="kicker">Start focused</span><h2>Bring the workflow your team knows should work better.</h2><p>QgritAI will help clarify the opportunity, determine where agents genuinely help, and define the smallest credible path to value.</p><ButtonLink href="/contact">Start a conversation <ArrowRight size={17}/></ButtonLink></div></section>
  </main><Footer/></>;
}
