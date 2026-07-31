import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Readiness Assessment",
  description: "Assess strategy, workflows, data, governance, and adoption readiness before investing in enterprise AI.",
};

export default function ReadinessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
