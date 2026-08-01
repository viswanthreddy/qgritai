import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "Security", description: "QGRITAI's security principles and responsible vulnerability reporting guidance." };

export default function SecurityPage() {
  return <PolicyPage eyebrow="Trust" title="Security" introduction="QGRITAI treats security, data minimization, access control, and accountable AI operation as design requirements rather than afterthoughts." sections={[
    { title: "Security principles", paragraphs: ["The public service is designed around least privilege, environment-separated credentials, validated input, encrypted provider connections, dependency review, and restricted administrative access. Sensitive credentials are not committed to the source repository."], items: ["Collect only information needed for a defined purpose", "Keep privileged operations on trusted server boundaries", "Use explicit tenant and role controls where private data exists", "Log and audit important operational changes without copying unnecessary sensitive content", "Review dependencies, configuration, and failure behavior continuously"] },
    { title: "AI and client delivery", paragraphs: ["Security controls for an engagement depend on the workflow, information classification, systems, jurisdictions, and risk. Written delivery scope should define data handling, model and provider choices, retention, approvals, evaluation, incident response, and client responsibilities before sensitive information is processed."] },
    { title: "Report a concern", paragraphs: ["Send a clear description of a suspected vulnerability to info@qgritai.com, including the affected URL or component, reproduction steps, impact, and a safe method for follow-up. Do not access, modify, retain, or disclose data that does not belong to you; disrupt service; use social engineering; or perform destructive testing." ] },
    { title: "Response", paragraphs: ["QGRITAI will acknowledge credible reports, investigate them in proportion to potential impact, and coordinate remediation and disclosure where appropriate. This page does not establish a paid bug-bounty program or authorize testing beyond applicable law and the boundaries described above."] },
  ]}/>;
}
