import { Box, QrCode, ScanLine, Utensils } from "lucide-react";

const items = [
  { label: "Cardápio digital próprio", icon: Utensils },
  { label: "Modelos 3D dos pratos", icon: Box },
  { label: "Realidade aumentada compatível", icon: ScanLine },
  { label: "Acesso por link e QR Code", icon: QrCode },
];

export function Marquee() {
  return (
    <section className="overflow-hidden border-y border-white/10 bg-[#171A18] py-5 text-white" aria-label="Recursos da MesaViva 3D">
      <p className="sr-only">{items.map(({ label }) => label).join(" · ")}</p>
      <div aria-hidden="true" className="marquee-track flex w-max items-center gap-8">
        {[0, 1, 2, 3].map((copy) => (
          <div key={copy} className="flex items-center gap-8">
            {items.map(({ label, icon: Icon }) => (
              <span key={`${copy}-${label}`} className="flex items-center gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-[.16em] text-white/75 sm:text-sm">
                {label}<Icon size={16} strokeWidth={1.7} aria-hidden="true" className="text-[#6F9F72]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
