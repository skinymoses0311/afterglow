import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Stands in for photography the design calls for but that does not exist yet.
 *
 * The design ships three empty image slots on the homepage — a hero portrait, a
 * post-treatment shot, and a round client portrait. Rather than leave holes,
 * these render as on-brand blush panels with the brief still visible, so it is
 * obvious what belongs there. Replace with an <img> as the shots arrive.
 */
export const ImagePlaceholder = ({
  caption,
  className,
  rounded = "rounded-[28px]",
  align = "center",
}: {
  caption: string;
  className?: string;
  rounded?: string;
  /** "top" keeps the caption clear of the price card that overlaps the hero image. */
  align?: "center" | "top";
}) => (
  <div
    role="img"
    aria-label={caption}
    className={cn(
      "relative flex justify-center overflow-hidden bg-blush ring-1 ring-inset ring-border/60",
      align === "top" ? "items-start pt-16" : "items-center",
      rounded,
      className,
    )}
  >
    <div className="flex flex-col items-center gap-3 px-6 text-center">
      <ImageIcon className="h-7 w-7 text-primary-foreground/70" aria-hidden="true" />
      <span className="max-w-[220px] text-xs uppercase tracking-[0.18em] text-foreground/45">{caption}</span>
    </div>
  </div>
);
