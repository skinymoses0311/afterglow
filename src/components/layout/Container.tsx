import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The editorial layout measure: 1240px with 48px gutters, per the design
 * system. Gutters tighten on small screens, where 48px each side would leave
 * too little room for content.
 */
export const Container = ({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) => (
  <div id={id} className={cn("mx-auto w-full max-w-[1240px] px-6 md:px-12", className)}>
    {children}
  </div>
);
