import { ArrowRight, ChartNoAxesCombined, ScanSearch } from "lucide-react";
import { PageHero } from "@/components/marketing";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "AI planning tools", description: "Explore QGRITAI's AI readiness assessment and automation ROI studio before beginning an engagement." };

export default function ToolsPage() {
  return <><SiteHeader/><main><PageHero eyebrow="AI tools" title="Create evidence before you start building." description="Use these lightweight planning tools to structure the opportunity and make the first strategy conversation more useful."/><section className="section shell page-section"><div className="tool-choice-grid"><a className="tool-choice" href="/readiness"><ScanSearch/><span className="kicker">5-minute assessment</span><h2>AI Readiness</h2><p>Evaluate strategy, workflow clarity, data access, integration conditions, governance, ownership, and adoption.</p><b>Assess your readiness <ArrowRight size={17}/></b></a><a className="tool-choice" href="/roi"><ChartNoAxesCombined/><span className="kicker">Directional model</span><h2>Automation ROI Studio</h2><p>Estimate annual capacity value, potential hours returned, implementation economics, and directional payback.</p><b>Model an opportunity <ArrowRight size={17}/></b></a></div><p className="tool-disclaimer">These tools support early prioritization. Results are directional and should be validated against the actual workflow, cost base, risks, and adoption conditions.</p></section></main><Footer/></>;
}
