import { cn } from "@/lib/utils";

/**
 * The stacked AFTER/GLOW mark. A deliberately hard little square against an
 * otherwise very round brand — see the radius notes in the design system.
 */
export const Logo = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "grid h-11 w-11 place-items-center rounded-sm bg-primary font-display text-[10px] font-extrabold uppercase leading-[1.05] tracking-tight text-primary-foreground",
      className,
    )}
  >
    <span className="flex flex-col items-center">
      <span>After</span>
      <span>Glow</span>
    </span>
  </span>
);
