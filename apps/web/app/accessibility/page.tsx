import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "Accessibility", description: "QGRITAI's commitment to an accessible and inclusive website experience." };

export default function AccessibilityPage() {
  return <PolicyPage eyebrow="Trust" title="Accessibility statement" introduction="QGRITAI aims to make its website and digital services usable by people with a broad range of abilities, technologies, and access needs." sections={[
    { title: "Our approach", paragraphs: ["The public website is designed with semantic structure, keyboard-accessible controls, visible focus behavior, responsive layouts, readable contrast, descriptive labels, and reduced dependence on motion. QGRITAI uses WCAG 2.2 Level AA as the target for public experiences." ] },
    { title: "Ongoing improvement", paragraphs: ["Accessibility is an ongoing engineering and editorial responsibility. New pages and tools are reviewed as the website evolves, and identified barriers are prioritized according to their impact on access."] },
    { title: "Known limitations", paragraphs: ["Some third-party services, browser behavior, or future embedded content may not provide the same level of control as the core website. QGRITAI will seek an accessible alternative or reasonable accommodation when a barrier is reported."] },
    { title: "Request assistance", paragraphs: ["If you cannot access information or complete a task, contact QGRITAI with the page, device, browser, assistive technology, and problem encountered where you are comfortable providing those details. We will work with you on an alternative and use the report to improve the service."] },
  ]}/>;
}
