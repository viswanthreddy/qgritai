import { ButtonLink } from "@qgritai/ui";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Readiness result received",
  robots: { index: false, follow: false },
};

export default function ReadinessReceived() {
  return <><SiteHeader/><main className="tool-page shell"><section className="panel submission-confirmation"><span className="kicker">Result received</span><h1>Thank you for sharing your readiness context.</h1><p className="lede">Your assessment has been added to the QGRITAI opportunity queue. The next conversation will focus on evidence, constraints, and a practical first workflow.</p><ButtonLink href="/">Return home</ButtonLink></section></main><Footer/></>;
}
