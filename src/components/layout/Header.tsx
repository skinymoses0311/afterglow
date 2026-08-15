import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/waitlist", label: "Waitlist" },
  { to: "/book", label: "Book Now" },
  { to: "/merchants", label: "For Merchants" },
];

const Wordmark = () => (
  <span
    className="grid h-11 w-11 place-items-center rounded-sm bg-primary font-display text-[10px] font-extrabold uppercase leading-[1.05] tracking-tight text-primary-foreground"
    style={{ backgroundColor: "hsl(357 80% 79%)" }}
  >
    <span className="flex flex-col items-center">
      <span>After</span>
      <span>Glow</span>
    </span>
  </span>
);

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-md safe-top safe-x">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" aria-label="AfterGlow home" className="flex items-center">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground",
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
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/book">Book Now</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[85%] max-w-sm flex-col safe-top safe-bottom">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-4 py-3 text-base text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground",
                        isActive && "bg-secondary text-foreground",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-2">
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/waitlist">Join Waitlist</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/book">Book Now</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
