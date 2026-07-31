import type { Metadata } from "next";
import "./globals.css";
import "./backend.css";

export const metadata: Metadata = {
  title: "QgritAI | Enterprise AI Transformation",
  description: "QgritAI helps enterprises discover, design, build, govern, and optimize practical AI systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
