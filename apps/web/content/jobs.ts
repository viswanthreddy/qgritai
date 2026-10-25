export type EmploymentType = "Full-time" | "Contract" | "Intern";

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experience: string;
  summary: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  niceToHaves: string[];
  postedDate: string;
  active: boolean;
};

/**
 * This is the single source of truth for careers listings.
 * Add, edit, deactivate, or remove roles here without changing page code.
 */
export const jobs: Job[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    department: "AI Engineering",
    location: "Hyderabad / Hybrid",
    employmentType: "Full-time",
    experience: "3–6 years",
    summary: "Design and ship dependable AI agents, automations, and intelligent applications for real business workflows.",
    description: [
      "QGRITAI is looking for an AI Engineer who can move confidently between business context, system design, experimentation, and production engineering.",
      "You will work directly with the founder and a network of specialist agents to turn ambiguous client problems into controlled, measurable AI capabilities.",
    ],
    responsibilities: [
      "Design and implement agentic workflows, retrieval systems, automations, and AI-enabled applications.",
      "Integrate models with enterprise data, APIs, tools, approval steps, and human escalation paths.",
      "Build evaluation datasets and measure quality, reliability, latency, safety, and cost.",
      "Create clear technical documentation and contribute reusable delivery components.",
      "Participate in discovery conversations and translate business workflows into practical system designs.",
    ],
    requirements: [
      "Strong TypeScript or Python engineering experience and sound software-design fundamentals.",
      "Hands-on experience building with modern LLM APIs, tool calling, retrieval, or workflow orchestration.",
      "Experience integrating databases, APIs, authentication, and cloud services.",
      "Ability to test assumptions, communicate trade-offs, and take ownership from prototype through production.",
    ],
    niceToHaves: [
      "Experience with Next.js, PostgreSQL, Supabase, Vercel, or vector-search systems.",
      "Knowledge of model evaluation, observability, prompt security, or responsible AI controls.",
      "Experience in consulting, client delivery, or early-stage product environments.",
    ],
    postedDate: "2026-10-25",
    active: true,
  },
  {
    id: "business-development-executive",
    title: "Business Development Executive",
    department: "Growth",
    location: "Hyderabad / Hybrid",
    employmentType: "Full-time",
    experience: "2–5 years",
    summary: "Create thoughtful conversations with business leaders and turn operational challenges into qualified AI opportunities.",
    description: [
      "QGRITAI is looking for a consultative Business Development Executive who is curious about how businesses work and where AI can create credible value.",
      "You will help identify the right organizations, research their context, open relevant conversations, and support opportunities from first contact through discovery.",
    ],
    responsibilities: [
      "Research target companies, industries, decision-makers, workflows, and transformation priorities.",
      "Build personalized outreach and develop a high-quality opportunity pipeline.",
      "Qualify enquiries through business problems, urgency, value potential, readiness, and stakeholder alignment.",
      "Coordinate discovery sessions, proposals, follow-ups, and CRM hygiene.",
      "Turn market conversations into useful feedback for QGRITAI offerings and content.",
    ],
    requirements: [
      "Experience in B2B business development, consulting services, SaaS, or technology solutions.",
      "Excellent written and verbal communication with strong research and listening skills.",
      "Ability to discuss business outcomes without relying on generic AI claims or technical jargon.",
      "Disciplined follow-through, accurate pipeline management, and comfort working independently.",
    ],
    niceToHaves: [
      "Existing exposure to AI, automation, cloud, data, or digital-transformation services.",
      "Experience selling to mid-market or enterprise leaders.",
      "A network in Hyderabad or other Indian technology and business communities.",
    ],
    postedDate: "2026-10-25",
    active: true,
  },
];

export function getActiveJobs() {
  return jobs.filter(job => job.active);
}

export function getActiveJob(id: string) {
  return jobs.find(job => job.id === id && job.active);
}
