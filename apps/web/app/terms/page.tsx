import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "Terms of use", description: "Terms governing access to and use of the QGRITAI public website and planning tools." };

export default function TermsPage() {
  return <PolicyPage eyebrow="Trust" title="Terms of use" introduction="These terms govern use of the QGRITAI public website. A separate written agreement governs any consulting, implementation, or managed service engagement." sections={[
    { title: "Website information", paragraphs: ["Website content is provided for general information and evaluation. It may describe service capabilities, representative solution concepts, and QGRITAI's approach, but it does not create a client relationship, professional duty, or binding service commitment."] },
    { title: "Planning tools", paragraphs: ["AI Readiness and ROI results are directional planning aids based on the information entered. They are not guarantees, valuations, financial advice, legal advice, security certification, or a substitute for analysis of the actual business, workflow, data, controls, and economics."] },
    { title: "Engagements", paragraphs: ["No consulting or delivery engagement begins until the parties agree to written scope, responsibilities, commercial terms, confidentiality, data handling, intellectual property, and other applicable conditions. If these website terms conflict with a signed agreement, the signed agreement controls for that engagement."] },
    { title: "Acceptable use", paragraphs: ["You must not misuse the website, interfere with its operation, attempt unauthorized access, submit unlawful or harmful material, probe security without written authorization, or use the service to infringe the rights of others."] },
    { title: "Intellectual property", paragraphs: ["Unless otherwise stated, the website design, text, tools, trademarks, and original materials belong to QGRITAI or its licensors. You may use the website for internal evaluation but may not reproduce or commercially exploit substantial portions without permission."] },
    { title: "Availability and liability", paragraphs: ["The website is provided on an as-available basis and may change or be unavailable. To the extent permitted by applicable law, QGRITAI does not warrant that public content is error-free or suitable for a particular decision and excludes liability for indirect or consequential loss arising solely from use of the public website."] },
    { title: "Changes", paragraphs: ["QGRITAI may update these terms as the website and operating model evolve. The date shown on this page identifies the current version. Continued use after an update constitutes acceptance where permitted by applicable law."] },
  ]}/>;
}
