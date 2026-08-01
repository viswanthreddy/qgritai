import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";
import "./backend.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "QGRITAI",
  title: {
    default: "QGRITAI | Founder-led, agent-powered AI transformation",
    template: "%s | QGRITAI",
  },
  description: "QGRITAI helps businesses understand, build, and operate practical AI agents, automations, and intelligent systems through a founder-led, agent-powered delivery model.",
  openGraph: {
    type: "website",
    siteName: "QGRITAI",
    title: "QGRITAI | Founder-led, agent-powered AI transformation",
    description: "Strategy, automation, agents, applications, and managed AI operations for real business work.",
  },
  twitter: {
    card: "summary",
    title: "QGRITAI | Founder-led, agent-powered AI transformation",
    description: "Strategy, automation, agents, applications, and managed AI operations for real business work.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
