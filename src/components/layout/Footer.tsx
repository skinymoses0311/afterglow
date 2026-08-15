import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-secondary/40 safe-bottom safe-x">
    <div className="container grid gap-10 py-14 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="flex items-center">
          <span className="grid h-11 w-11 place-items-center rounded-sm bg-primary font-display text-[10px] font-extrabold uppercase leading-[1.05] tracking-tight text-primary-foreground">
            <span className="flex flex-col items-center">
              <span>After</span>
              <span>Glow</span>
            </span>
          </span>
        </div>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          Glow now, pay later. The buy now, pay later platform built for beauty and wellness.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold">Product</h4>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link to="/book" className="hover:text-foreground">
              Book Now
            </Link>
          </li>
          <li>
            <Link to="/merchants" className="hover:text-foreground">
              For Merchants
            </Link>
          </li>
          <li>
            <Link to="/waitlist" className="hover:text-foreground">
              Join Waitlist
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold">Company</h4>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>About</li>
          <li>Contact</li>
          <li>Privacy</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} AfterGlow. All rights reserved.
    </div>
  </footer>
);
