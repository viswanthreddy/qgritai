import { Bot, Check, CircleUserRound, Eye, Gauge, ShieldCheck } from "lucide-react";
import { CallToAction, PageHero, SectionIntro } from "@/components/marketing";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "About", description: "QgritAI is a founder-led, agent-powered AI transformation company built for accountable, efficient delivery." };

const agentRoles = [
  [Eye, "Research and discovery", "Study industries, businesses, workflows, evidence, technologies, and constraints."],
  [Bot, "Strategy and design", "Develop opportunity maps, business cases, architectures, controls, and implementation plans."],
  [Gauge, "Engineering and operations", "Build, test, document, monitor, and improve agents, automations, and applications."],
  [ShieldCheck, "Assurance", "Challenge quality, security, reliability, permissions, evaluation evidence, and failure handling."],
];

export default function AboutPage() {
  return <><SiteHeader/><main><PageHero eyebrow="About QgritAI" title="A company designed around what AI makes possible now." description="QgritAI is a founder-led, agent-powered transformation company. It combines direct senior accountability with a governed network of specialist agents to deliver useful AI systems faster and with less organizational overhead."/>
  <section className="section shell page-section"><div className="founder-model"><div><span className="kicker">The model</span><h2>One accountable relationship. Many specialized capabilities.</h2><p>Clients work directly with the founder responsible for understanding the business, setting direction, making trade-offs, and standing behind the work. Specialist agents expand the research, strategy, engineering, testing, documentation, and operational capacity behind that relationship.</p><div className="proof-stack"><span><Check/>No consulting pyramid</span><span><Check/>No artificial team biographies</span><span><Check/>No uncontrolled agent autonomy</span></div></div><div className="accountability-card"><CircleUserRound/><span>Accountable principal</span><strong>Founder direction and client judgment</strong><div>Agent research</div><div>Agent engineering</div><div>Agent assurance</div><div>Agent operations</div></div></div></section>
  <section className="section contrast-section"><div className="shell"><SectionIntro eyebrow="The delivery network" title="Agents are the operating leverage—not the product promise." description="Clients buy a result. QgritAI uses specialized agents behind the scenes to increase depth, speed, consistency, and responsiveness while preserving clear human accountability."/><div className="scope-grid">{agentRoles.map(([Icon,title,text]) => { const C = Icon as typeof Bot; return <article key={String(title)}><C/><h3>{String(title)}</h3><p>{String(text)}</p></article>; })}</div></div></section>
  <section className="section shell"><SectionIntro eyebrow="Principles" title="Practical intelligence. Serious execution." description="The company is intentionally lean, but the standard for trust, clarity, and production quality is not."/><div className="values-grid"><article><span>01</span><h3>Outcome before output</h3><p>Define what should improve before deciding what should be built.</p></article><article><span>02</span><h3>Clarity over complexity</h3><p>Prefer understandable systems and transparent operating logic.</p></article><article><span>03</span><h3>Human control</h3><p>Design review, escalation, permissions, and accountability into the workflow.</p></article><article><span>04</span><h3>Improve continuously</h3><p>Measure real use and outcomes so deployed systems become more valuable over time.</p></article></div></section><CallToAction title="Explore what a lean, agent-powered delivery model could do for your business."/></main><Footer/></>;
}
