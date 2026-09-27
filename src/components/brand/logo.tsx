import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function BrandMark({
  className,
  size = 40,
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      src="/brand/icon-cream.png"
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

export function BrandWordmark({
  className,
  height = 40,
  priority = false,
}: BrandWordmarkProps) {
  const width = Math.round(height * 3.2);

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

type BrandLockupProps = {
  className?: string;
  markSize?: number;
  showWordmark?: boolean;
};

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
