type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-8 w-auto max-w-[140px]",
  md: "h-9 w-auto max-w-[160px] sm:h-10 sm:max-w-[180px]",
  lg: "h-12 w-auto max-w-[220px]",
};

export function BrandLogo({
  size = "md",
  priority = false,
  className = "",
}: {
  size?: Size;
  priority?: boolean;
  className?: string;
}) {
  return (
    <img
      src="/logonew.png"
      alt="Hansagiri Auto Traders"
      width={480}
      height={180}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={`${sizes[size]} object-contain object-left ${className}`}
    />
  );
}
