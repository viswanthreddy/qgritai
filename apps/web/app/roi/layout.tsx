import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI ROI Studio",
  description: "Build a directional business case for workflow automation and prioritize enterprise AI opportunities.",
};

export default function RoiLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
