import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@qgritai/ui";

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-hero shell"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p className="lede">{description}</p></section>;
}

export function CallToAction({ title = "What could AI take off your team’s plate?", description = "Bring one workflow, bottleneck, or business ambition. We will identify the smallest useful next step." }: { title?: string; description?: string }) {
  return <section className="section shell"><div className="cta cta-panel"><span className="kicker">Start a conversation</span><h2>{title}</h2><p>{description}</p><ButtonLink href="/contact">Discuss your opportunity <ArrowRight size={17}/></ButtonLink></div></section>;
}

export function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="section-heading"><div><span className="kicker">{eyebrow}</span><h2>{title}</h2></div><p>{description}</p></div>;
}
