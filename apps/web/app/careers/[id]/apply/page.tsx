import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CareerApplicationForm } from "@/components/career-application-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getActiveJob, getActiveJobs } from "@/content/jobs";

export function generateStaticParams() {
  return getActiveJobs().map(job => ({ id: job.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const job = getActiveJob((await params).id);
  return job ? { title: `Apply — ${job.title}`, description: `Submit your application for the ${job.title} role at QGRITAI.` } : { title: "Role not found" };
}

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const job = getActiveJob((await params).id);
  if (!job) notFound();
  return <><SiteHeader/><main className="application-page"><section className="shell application-heading"><Link className="back-link" href={`/careers/${job.id}`}><ArrowLeft size={16}/> Back to role</Link><span className="kicker">Apply to QGRITAI</span><h1>{job.title}</h1><p>Tell us about your experience and the work you want to do. Required fields are marked with an asterisk.</p></section><section className="shell application-shell"><CareerApplicationForm jobId={job.id} jobTitle={job.title}/><aside><div className="panel"><span>Application process</span><h3>What happens next</h3><p>We review every application against the role. Strong matches will be invited to a direct conversation about the work, expectations, and mutual fit.</p></div><div className="panel"><span>Privacy</span><p>Your information is used only for recruitment and handled according to our <Link href="/privacy">privacy policy</Link>.</p></div></aside></section></main><Footer/></>;
}
