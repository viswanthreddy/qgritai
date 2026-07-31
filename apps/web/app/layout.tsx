import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";
import "./backend.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "QgritAI",
  title: {
    default: "QgritAI | Enterprise AI Transformation",
    template: "%s | QgritAI",
  },
  description: "QgritAI helps enterprises discover, design, build, govern, and optimize practical AI systems.",
  openGraph: {
    type: "website",
    siteName: "QgritAI",
    title: "QgritAI | Enterprise AI Transformation",
    description: "Turn AI ambition into operational advantage with an outcome-led transformation platform.",
  },
  twitter: {
    card: "summary",
    title: "QgritAI | Enterprise AI Transformation",
    description: "Turn AI ambition into operational advantage with an outcome-led transformation platform.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
