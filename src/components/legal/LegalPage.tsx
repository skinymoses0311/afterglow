import type { ReactNode } from "react";

import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

/**
 * Shared furniture for the long-form legal pages.
 *
 * These are documents rather than marketing pages: the job is a comfortable
 * reading measure, a clear heading hierarchy, and tables that survive a phone.
 */

export const LegalPage = ({
  title,
  standfirst,
  meta,
  children,
}: {
  title: string;
  standfirst?: string;
  meta?: ReactNode;
  children: ReactNode;
}) => (
  <Layout>
    <section className="bg-glow">
      <Container className="py-16 md:py-20">
        <h1 className="max-w-[860px] font-display text-[clamp(2.25rem,6vw,3.25rem)] leading-[1.05]">{title}</h1>
        {standfirst ? (
          <p className="mt-4 max-w-[640px] text-lg text-muted-foreground">{standfirst}</p>
        ) : null}
        {meta ? <div className="mt-5 text-sm text-muted-foreground">{meta}</div> : null}
      </Container>
    </section>

    <Container className="max-w-[860px] pb-20 pt-12 md:pb-28">{children}</Container>
  </Layout>
);

/** A numbered top-level clause. The id makes it linkable from elsewhere. */
export const Section = ({ n, title, id, children }: { n: number; title: string; id?: string; children: ReactNode }) => (
  <section id={id} className="mt-12 scroll-mt-24 first:mt-0">
    <h2 className="font-display text-2xl leading-snug md:text-[28px]">
      <span className="text-primary">{n}.</span> {title}
    </h2>
    <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

export const SubHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="pt-2 font-display text-lg text-foreground">{children}</h3>
);

export const P = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("text-[15px] leading-relaxed text-muted-foreground", className)}>{children}</p>
);

export const Bullets = ({ items }: { items: ReactNode[] }) => (
  <ul className="ml-1 space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3">
        <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-primary" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

/** Emphasised lead-in, e.g. "Legitimate interests:" at the start of a paragraph. */
export const Lead = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
);

export const Mail = ({ address }: { address: string }) => (
  <a href={`mailto:${address}`} className="text-primary underline underline-offset-2 hover:no-underline">
    {address}
  </a>
);

export const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-primary underline underline-offset-2 hover:no-underline"
  >
    {children}
  </a>
);

/**
 * Tables carry a lot of the meaning in these documents, so they get a real
 * treatment rather than being squeezed — they scroll inside their own container
 * so the page body never scrolls sideways.
 */
export const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="border-b-2 border-border pb-2.5 pr-4 align-bottom font-sans text-xs font-semibold uppercase tracking-[0.1em] text-foreground last:pr-0"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="align-top">
            {row.map((cell, j) => (
              <td
                key={j}
                className="border-b border-border/70 py-3 pr-4 leading-relaxed text-muted-foreground last:pr-0"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
