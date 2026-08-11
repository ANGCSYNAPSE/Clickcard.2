import Link from "next/link";
import { cn } from "@/lib/cn";

export default function Logo({
  href = "/",
  className,
  showText = true,
  solid = false,
}: {
  href?: string;
  className?: string;
  showText?: boolean;
  /** Compact square badge; the wider default reads better on marketing pages. */
  solid?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid h-9 place-items-center rounded-xl font-display text-base font-black tracking-tight text-white shadow-soft",
          "bg-brand-500",
          solid ? "w-9" : "w-11",
        )}
      >
        CK
      </span>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-ink dark:text-white">
          ClickCard
        </span>
      )}
    </Link>
  );
}
