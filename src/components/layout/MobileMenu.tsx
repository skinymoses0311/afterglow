import { Link, NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./navLinks";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** The phone menu. Loaded separately — see Header. */
const MobileMenu = ({ open, onOpenChange }: MobileMenuProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
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
        <Button asChild variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
          <Link to="/waitlist">Join Waitlist</Link>
        </Button>
        <Button asChild className="rounded-full" onClick={() => onOpenChange(false)}>
          <Link to="/book">Book Now</Link>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
);

export default MobileMenu;
