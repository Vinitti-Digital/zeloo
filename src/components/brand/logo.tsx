import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandSymbolProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

/** Smiling house only — favicon/app mark / compact symbol. */
export function BrandSymbol({
  className,
  size = 40,
  priority = false,
}: BrandSymbolProps) {
  return (
    <Image
      src="/branding/zeloo-symbol.png"
      alt="Zeloo"
      width={size}
      height={size}
      priority={priority}
      unoptimized
      style={{ width: size, height: size }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

/** @deprecated Prefer BrandSymbol — kept as alias for existing imports. */
export function BrandMark(props: BrandSymbolProps) {
  return <BrandSymbol {...props} />;
}

type BrandWordmarkProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

/** Wordmark only — primary brand mark inside authenticated app chrome. */
export function BrandWordmark({
  className,
  height = 32,
  priority = false,
}: BrandWordmarkProps) {
  const width = Math.round(height * (1568 / 470));

  return (
    <Image
      src="/branding/zeloo-wordmark.png"
      alt="Zeloo"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      style={{ width, height }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

type BrandMascotProps = {
  className?: string;
  width?: number;
  priority?: boolean;
};

/** Full mascot with tools — empty states, success, friendly moments. */
export function BrandMascot({
  className,
  width = 160,
  priority = false,
}: BrandMascotProps) {
  const height = Math.round(width * (1041 / 1231));

  return (
    <Image
      src="/branding/zeloo-mascot.png"
      alt=""
      width={width}
      height={height}
      priority={priority}
      unoptimized
      style={{ width, height }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

type BrandLogoFullProps = {
  className?: string;
  width?: number;
  priority?: boolean;
};

/** Mascot + Zeloo wordmark — login, register, landing, institutional. */
export function BrandLogoFull({
  className,
  width = 220,
  priority = false,
}: BrandLogoFullProps) {
  const height = Math.round(width * (1099 / 1162));

  return (
    <Image
      src="/branding/zeloo-logo-full.png"
      alt="Zeloo"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      style={{ width, height, maxWidth: "100%" }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

/** @deprecated Prefer BrandLogoFull. */
export function BrandStack(props: BrandLogoFullProps) {
  return <BrandLogoFull {...props} />;
}

type BrandLockupProps = {
  className?: string;
  height?: number;
};

/** Compact header lockup: wordmark only (authenticated app). */
export function BrandLockup({ className, height = 28 }: BrandLockupProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <BrandWordmark height={height} />
    </span>
  );
}
