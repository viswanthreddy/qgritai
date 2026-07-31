import type { ReactNode } from "react";

export function ButtonLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a className={secondary ? "button button-secondary" : "button"} href={href}>{children}</a>;
}
