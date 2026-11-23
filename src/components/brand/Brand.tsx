import Link from "next/link";

type BrandProps = {
  href?: string;
  compact?: boolean;
  inverse?: boolean;
  iconOnly?: boolean;
  className?: string;
};

export function Brand({ href = "/", compact = false, inverse = false, iconOnly = false, className = "" }: BrandProps) {
  const label = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 64 64" className={compact ? "size-9 shrink-0" : "size-11 shrink-0"} fill="none">
        <rect width="64" height="64" rx="15" fill="#315F42" />
        <path d="M15 44V20h5l12 15 12-15h5v24h-6V29L32 42 21 29v15h-6Z" fill="#FFF8EC" />
      </svg>
      {!iconOnly && <span className="min-w-0">
        <span className={`block font-serif font-semibold leading-none tracking-[-0.045em] ${compact ? "text-lg" : "text-[22px]"} ${inverse ? "text-white" : "text-[#234B39]"}`}>MesaViva <span className={inverse ? "text-[#CDE0C7]" : "text-[#6F9F72]"}>3D</span></span>
        {!compact && <span className={`mt-1.5 block text-[10px] tracking-[.04em] ${inverse ? "text-white/60" : "text-neutral-500"}`}>Cardápios digitais interativos</span>}
      </span>}
    </span>
  );

  return <Link href={href} aria-label="MesaViva 3D — início">{label}</Link>;
}
