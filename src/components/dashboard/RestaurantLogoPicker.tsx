"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function RestaurantLogoPicker({ restaurantId, restaurantName, logoUrl }: { restaurantId: string; restaurantName: string; logoUrl: string | null }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function previewFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    setHasSelection(Boolean(file));
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  const currentImage = previewUrl ?? logoUrl;
  const inputId = `restaurant-logo-${restaurantId}`;

  return <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#234B39]/10 bg-[#FBFAF6] p-4">
    <span className="relative flex size-[68px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF3E9] text-xl font-bold text-[#315F42]">
      {currentImage ? <Image src={currentImage} alt={`Foto de ${restaurantName}`} fill unoptimized sizes="68px" className="object-cover" /> : restaurantName.trim().slice(0, 1).toUpperCase()}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-[#38443B]">Foto do restaurante</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label htmlFor={inputId} className="inline-flex min-h-10 cursor-pointer items-center rounded-md bg-[#EAF3E9] px-4 text-xs font-bold text-[#315F42] transition hover:bg-[#DDEBDD] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#315F42]">Escolher foto</label>
        <span className="text-xs text-[#687168]">{hasSelection ? "Prévia pronta · salve para aplicar" : "JPG, PNG ou WebP · até 2 MB"}</span>
      </div>
      <input id={inputId} className="sr-only" name="logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={previewFile} />
    </div>
  </div>;
}
