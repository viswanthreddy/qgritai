"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  ["Services", "/solutions"],
  ["Industries", "/industries"],
  ["Work", "/work"],
  ["AI Tools", "/tools"],
  ["Insights", "/insights"],
  ["About", "/about"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="shell nav-wrap">
    <Link className="brand" href="/"><span className="brand-mark">Q</span><span>QgritAI</span></Link>
    <nav className={open ? "nav-links open" : "nav-links"} aria-label="Primary navigation">
      {links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      <a className="button button-small" href="/contact">Start a conversation</a>
    </nav>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button>
  </div></header>;
}
