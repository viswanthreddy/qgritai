import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, MapPin, Sparkles, UsersRound } from "lucide-react";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/marketing";
import { SiteHeader } from "@/components/site-header";
import { getActiveJobs } from "@/content/jobs";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join QGRITAI and help build practical AI agents, automations, and intelligent systems through a founder-led, agent-powered delivery model.",
};

export default function CareersPage() {
  const activeJobs = getActiveJobs();
  return <><SiteHeader/><main>
    <PageHero eyebrow="Careers" title="Build what the next generation of business will run on." description="Join a lean, high-ownership company using AI to solve consequential business problems—not to produce more theatre around them."/>
    <section className="section shell careers-intro"><div><span className="kicker">Why QGRITAI</span><h2>Ambition with accountability.</h2><p>We combine frontier curiosity with the grit required to make technology dependable. You will work close to the problem, make visible decisions, learn quickly, and help clients move from AI interest to working outcomes.</p></div><div className="culture-grid"><article><Sparkles/><h3>Meaningful work</h3><p>Build agents, automations, and intelligent systems around real workflows and measurable value.</p></article><article><UsersRound/><h3>High ownership</h3><p>Work directly with the founder, clients, and specialist agents—without layers of organizational theatre.</p></article><article><MapPin/><h3>Flexible by role</h3><p>We are based in Hyderabad and support hybrid or remote work where the role and engagement allow it.</p></article></div></section>
    <section className="section light-section"><div className="shell"><div className="section-heading"><div><span className="kicker">Open positions</span><h2>Find work worth doing.</h2></div><p>We value clear thinking, practical curiosity, ownership, and the persistence to turn difficult problems into useful systems.</p></div>
      {activeJobs.length ? <div className="job-grid">{activeJobs.map(job => <article className="job-card" key={job.id}><div className="job-card-top"><span>{job.department}</span><time dateTime={job.postedDate}>Posted {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${job.postedDate}T00:00:00Z`))}</time></div><BriefcaseBusiness/><h3>{job.title}</h3><p>{job.summary}</p><div className="job-meta"><span>{job.location}</span><span>{job.employmentType}</span><span>{job.experience}</span></div><Link className="job-link" href={`/careers/${job.id}`}>View details <ArrowRight size={16}/></Link></article>)}</div> : <div className="empty-jobs"><BriefcaseBusiness/><h3>No open roles right now</h3><p>Send your resume to <a href="mailto:info@qgritai.com">info@qgritai.com</a> and tell us what you would love to build.</p></div>}
    </div></section>
  </main><Footer/></>;
}
