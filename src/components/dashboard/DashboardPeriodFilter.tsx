"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CalendarDays } from "lucide-react";

const periods = [7, 30, 90] as const;

export function DashboardPeriodFilter({ value }: { value: (typeof periods)[number] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return <label className={`inline-flex min-h-11 items-center gap-2 rounded-md border border-[#234B39]/10 bg-white px-3 text-sm text-[#38443B] shadow-sm transition-opacity ${pending ? "opacity-65" : ""}`}>
    <CalendarDays size={15} className="shrink-0 text-[#315F42]" />
    <span className="sr-only">Período do painel</span>
    <select aria-label="Período do painel" value={value} disabled={pending} onChange={(event) => {
      const nextPeriod = Number(event.currentTarget.value);
      if (nextPeriod === 7 || nextPeriod === 30 || nextPeriod === 90) {
        startTransition(() => router.replace(`/dashboard?period=${nextPeriod}`, { scroll: false }));
      }
    }} className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-semibold outline-none disabled:cursor-wait">
      {periods.map((days) => <option key={days} value={days}>Últimos {days} dias</option>)}
    </select>
  </label>;
}
