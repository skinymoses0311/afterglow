import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

import { Container } from "./Container";
import { Logo } from "./Logo";

/** Only some of these have pages yet; the rest stay as plain text until they do. */
const COLUMNS: { title: string; items: { label: string; to?: string }[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Book Now", to: "/book" },
      { label: "For Merchants", to: "/merchants" },
      { label: "Join Waitlist", to: "/waitlist" },
    ],
  },
  { title: "Company", items: [{ label: "About" }, { label: "Contact" }, { label: "Careers" }] },
  { title: "Legal", items: [{ label: "Privacy" }, { label: "Terms" }, { label: "Complaints" }] },
];

export const Footer = () => (
  <footer className="border-t border-border/60 bg-secondary/40 safe-bottom safe-x">
    <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
      <div>
        <Logo />
        <p className="mt-[18px] max-w-[300px] text-sm leading-relaxed text-muted-foreground">
          Glow now, pay later. The buy now, pay later platform built for beauty and wellness.
        </p>
        <div className="mt-[22px] flex gap-3 text-muted-foreground">
          <a href="https://instagram.com" aria-label="AfterGlow on Instagram" className="hover:text-foreground">
            <Instagram className="h-[18px] w-[18px]" />
          </a>
          <a href="mailto:hello@afterglowcredit.com" aria-label="Email AfterGlow" className="hover:text-foreground">
            <Mail className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>

      {COLUMNS.map((column) => (
        <div key={column.title}>
          <h4 className="font-sans text-[13px] font-semibold tracking-normal">{column.title}</h4>
          <ul className="mt-[14px] flex flex-col gap-[9px] text-sm text-muted-foreground">
            {column.items.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link to={item.to} className="hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Container>

    <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} AfterGlow. All rights reserved. AfterGlow is not a lender; credit is subject to
      status.
    </div>
  </footer>
);
