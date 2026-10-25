import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Clock3, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getActiveJob, getActiveJobs } from "@/content/jobs";

export function generateStaticParams() {
  return getActiveJobs().map(job => ({ id: job.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const job = getActiveJob((await params).id);
  return job ? { title: `${job.title} career`, description: `${job.summary} Apply to join QGRITAI.` } : { title: "Role not found" };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const job = getActiveJob((await params).id);
  if (!job) notFound();
  const posted = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${job.postedDate}T00:00:00Z`));
  return <><SiteHeader/><main>
    <section className="job-hero"><div className="shell"><Link className="back-link" href="/careers"><ArrowLeft size={16}/> All careers</Link><span className="kicker">{job.department}</span><h1>{job.title}</h1><p>{job.summary}</p><div className="job-detail-meta"><span><MapPin/> {job.location}</span><span><BriefcaseBusiness/> {job.employmentType}</span><span><Clock3/> {job.experience}</span><span><CalendarDays/> Posted {posted}</span></div><Link className="button" href={`/careers/${job.id}/apply`}>Apply for this role <ArrowRight size={17}/></Link></div></section>
    <section className="section shell job-description"><div>{job.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div><section><h2>Responsibilities</h2><ul>{job.responsibilities.map(item => <li key={item}>{item}</li>)}</ul></section><section><h2>Requirements</h2><ul>{job.requirements.map(item => <li key={item}>{item}</li>)}</ul></section><section><h2>Nice to have</h2><ul>{job.niceToHaves.map(item => <li key={item}>{item}</li>)}</ul></section><Link className="button" href={`/careers/${job.id}/apply`}>Apply now <ArrowRight size={17}/></Link></div></section>
  </main><Footer/></>;
}
