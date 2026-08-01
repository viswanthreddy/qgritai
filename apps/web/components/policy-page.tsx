import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

type PolicySection = { title: string; paragraphs: string[]; items?: string[] };

export function PolicyPage({ eyebrow, title, introduction, sections }: { eyebrow: string; title: string; introduction: string; sections: PolicySection[] }) {
  return <><SiteHeader/><main><section className="policy-hero shell"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p className="lede">{introduction}</p><small>Last updated: 1 August 2026</small></section><section className="policy-body shell">{sections.map(section => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}<div className="policy-contact"><h2>Questions</h2><p>Contact <a href="mailto:info@qgritai.com">info@qgritai.com</a>.</p></div></section></main><Footer/></>;
}
