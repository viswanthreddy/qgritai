"use client";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { calculateReadiness, readinessDimensions } from "@/lib/calculations";
import { saveReadiness } from "@/app/tools/actions";

export default function Readiness() {
 const [scores,setScores] = useState<Record<string,number>>(Object.fromEntries(readinessDimensions.map(d=>[d,3])));
 const result = useMemo(()=>calculateReadiness(Object.values(scores)),[scores]);
 return <><SiteHeader/><main className="tool-page shell"><span className="kicker">AI readiness assessment</span><h1>Understand what must be true before AI can create value.</h1><p className="lede">Score six practical dimensions from 1 to 5. Sign in to save the result to your organization.</p><section className="tool-grid"><form className="panel assessment" action={saveReadiness}>{readinessDimensions.map(d=><label key={d}><span>{d}<b>{scores[d]}/5</b></span><input name={d} type="range" min="1" max="5" value={scores[d]} onChange={e=>setScores({...scores,[d]:Number(e.target.value)})}/></label>)}<button className="button">Save assessment</button></form><aside className="score-card"><span>Readiness score</span><strong>{result.total}</strong><h2>{result.label}</h2><p>{result.total >= 60 ? "Select one high-value workflow, establish baseline measures, and validate it through a controlled pilot." : "Strengthen ownership, process clarity, data access, and governance before committing to a large implementation."}</p></aside></section></main><Footer/></>;
}
