import { Suspense, lazy, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { NAV_LINKS } from "./navLinks";
import { cn } from "@/lib/utils";

/**
 * The phone menu is its own chunk: the dialog machinery behind it is several
 * kilobytes that only a phone visitor who opens the menu needs. main.tsx fetches
 * it once the page is idle, and a pointer or focus on the button fetches it
 * straight away, so opening it doesn't wait on the network.
 */
export const loadMobileMenu = () => import("./MobileMenu");
const MobileMenu = lazy(loadMobileMenu);

export const Header = () => {
  const [open, setOpen] = useState(false);
  // Stays mounted after the first open, so closing can still animate out.
  const [menuMounted, setMenuMounted] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/[0.72] backdrop-blur-md safe-top safe-x">
      <Container className="flex h-[72px] items-center justify-between">
        <Link to="/" aria-label="AfterGlow home" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center rounded-full px-4 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground",
                  isActive && "bg-secondary text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/waitlist">Join Waitlist</Link>
          </Button>
          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link to="/book">Book Now</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            onPointerDown={loadMobileMenu}
            onFocus={loadMobileMenu}
            onClick={() => {
              setMenuMounted(true);
              setOpen(true);
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {menuMounted && (
            <Suspense fallback={null}>
              <MobileMenu open={open} onOpenChange={setOpen} />
            </Suspense>
          )}
        </div>
      </Container>
    </header>
  );
};
