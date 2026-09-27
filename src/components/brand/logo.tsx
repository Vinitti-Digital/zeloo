import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: number;
  priority?: boolean;
  /** cream (default), yellow, or brown square app icons */
  variant?: "cream" | "yellow" | "brown";
};

const MARK_SRC = {
  cream: "/brand/icon-cream.png",
  yellow: "/brand/icon-yellow.png",
  brown: "/brand/icon-brown.png",
} as const;

export function BrandMark({
  className,
  size = 40,
  priority = false,
  variant = "cream",
}: BrandMarkProps) {
  return (
    <Image
      src={MARK_SRC[variant]}
      alt="Zeloo"
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-xl", className)}
    />
  );
}

type BrandWordmarkProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

/** Horizontal wordmark only — keep height modest; do not force into square slots. */
export function BrandWordmark({
  className,
  height = 40,
  priority = false,
}: BrandWordmarkProps) {
  const width = Math.round(height * (731 / 206));

  return (
    <Image
      src="/brand/wordmark.png"
      alt="Zeloo"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}

type BrandStackProps = {
  className?: string;
  /** Rendered width; height follows ~1.07 aspect of the vertical lockup */
  width?: number;
  priority?: boolean;
};

/** Vertical mascot + wordmark. Use only at large sizes (landing / empty states). */
export function BrandStack({
  className,
  width = 220,
  priority = false,
}: BrandStackProps) {
  const height = Math.round(width * (886 / 946));

  return (
    <Image
      src="/brand/logo-stack.png"
      alt="Zeloo"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}

type BrandLockupProps = {
  className?: string;
  markSize?: number;
  showWordmark?: boolean;
};

/** Compact header lockup: square mark + text (not the tall logo-stack). */
export function BrandLockup({
  className,
  markSize = 36,
  showWordmark = true,
}: BrandLockupProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark size={markSize} />
      {showWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground">
          Zeloo
        </span>
      ) : null}
    </span>
  );
}
