import { ArrowRight, BrainCircuit, ChartNoAxesCombined, Check, CloudCog, Code2, Layers3, MessageSquareText, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { ButtonLink, MetricCard } from "@qgritai/ui";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

const capabilities = [
  [BrainCircuit, "AI strategy and readiness", "Identify the workflows, data, controls, and operating changes required to adopt AI responsibly."],
  [Workflow, "Workflow automation", "Redesign repetitive work into reliable, measurable human-and-AI workflows."],
  [Code2, "Intelligent applications", "Build focused software products with AI designed into the core experience."],
  [MessageSquareText, "Conversational AI", "Create useful customer and employee experiences across chat, voice, and knowledge."],
  [CloudCog, "Enterprise integration", "Connect AI safely to systems of record, APIs, data platforms, and operational tools."],
  [ShieldCheck, "Governance and optimization", "Measure value, adoption, cost, safety, and performance after launch."],
];

export default function Home() {
  return <><SiteHeader/><main>
    <section className="hero shell"><div><div className="eyebrow"><Sparkles size={15}/> Enterprise AI transformation</div><h1>Turn AI ambition into <span>operational advantage.</span></h1><p>QgritAI helps enterprises discover, design, build, govern, and improve AI systems that move real work forward.</p><div className="hero-actions"><ButtonLink href="/contact">Discuss your opportunity <ArrowRight size={17}/></ButtonLink><ButtonLink href="/readiness" secondary>Assess AI readiness</ButtonLink></div><div className="proof-row"><span><Check/>Outcome-led</span><span><Check/>Enterprise-ready</span><span><Check/>Human-centered</span></div></div>
    <div className="command-card"><div className="command-top"><span className="status-dot"/>Qgrit transformation workspace <b>LIVE CONCEPT</b></div><div className="agent-query">“Which three workflows should we automate first?”</div><div className="agent-flow"><div><Layers3/><span>Process evidence</span><b>Connected</b></div><div><BrainCircuit/><span>Readiness analysis</span><b>Complete</b></div><div><ChartNoAxesCombined/><span>Value prioritization</span><b>12 opportunities</b></div></div><div className="agent-output"><span>Recommended focus</span><strong>Start with high-volume service intake, document review, and sales follow-up.</strong></div></div></section>
    <section className="trust-strip"><div className="shell trust-inner"><span>One transformation lifecycle</span><b>Discover</b><b>Design</b><b>Build</b><b>Govern</b><b>Optimize</b></div></section>
    <section className="section shell" id="solutions"><div className="section-heading"><div><span className="kicker">Capabilities</span><h2>Build the systems around AI—not just the model.</h2></div><p>We combine product thinking, engineering, enterprise process expertise, and responsible AI practices.</p></div><div className="service-grid">{capabilities.map(([Icon,title,text]) => { const C = Icon as typeof BrainCircuit; return <article className="service-card" key={String(title)}><div className="icon-box"><C/></div><h3>{String(title)}</h3><p>{String(text)}</p></article>; })}</div></section>
    <section className="section light-section"><div className="shell"><div className="section-heading"><div><span className="kicker">Product foundation</span><h2>A platform that supports the full AI transformation journey.</h2></div><p>The first release connects lead generation, assessment, business-case development, and client delivery.</p></div><div className="metric-grid"><MetricCard label="Discover" value="AI Readiness" note="A structured assessment of strategy, workflows, data, governance, and adoption."/><MetricCard label="Prioritize" value="ROI Studio" note="A directional business case for high-value automation and AI opportunities."/><MetricCard label="Deliver" value="Client Portal" note="A shared workspace for milestones, decisions, actions, and measurable value."/></div></div></section>
    <section className="section shell"><div className="cta"><span className="kicker">Start focused</span><h2>Find one important workflow and prove the value.</h2><p>QgritAI begins with business evidence, not AI theatre.</p><ButtonLink href="/contact">Book a discovery conversation <ArrowRight size={17}/></ButtonLink></div></section>
  </main><Footer/></>;
}
