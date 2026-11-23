"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface FoodViewerProps {
  src: string;
  alt: string;
  poster?: string;
  onInteraction?: () => void;
}

type ViewerStatus = "loading" | "ready" | "preview" | "error";
type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean;
  activateAR?: () => Promise<void>;
};

export function FoodViewer({ src, alt, poster, onInteraction }: FoodViewerProps) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const onInteractionRef = useRef(onInteraction);
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [arAvailable, setArAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    onInteractionRef.current = onInteraction;
  }, [onInteraction]);

  useEffect(() => {
    let active = true;
    let viewer: HTMLElement | null = null;
    let pointerOrigin: { x: number; y: number } | null = null;
    let interactionReported = false;
    const reportInteraction = () => {
      if (interactionReported) return;
      interactionReported = true;
      onInteractionRef.current?.();
    };
    const handlePointerDown = (event: Event) => {
      const pointer = event as PointerEvent;
      pointerOrigin = { x: pointer.clientX, y: pointer.clientY };
    };
    const handlePointerMove = (event: Event) => {
      if (!pointerOrigin) return;
      const pointer = event as PointerEvent;
      if (Math.hypot(pointer.clientX - pointerOrigin.x, pointer.clientY - pointerOrigin.y) >= 6) {
        reportInteraction();
        pointerOrigin = null;
      }
    };
    const handlePointerUp = () => { pointerOrigin = null; };
    const handleWheel = () => reportInteraction();
    const loadingTimeout = window.setTimeout(() => {
      if (active) setStatus((current) => current === "loading" ? (poster ? "preview" : "error") : current);
    }, 10000);

    const handleLoad = () => {
      if (!active) return;
      setStatus("ready");
      window.clearTimeout(loadingTimeout);

      // model-viewer exposes this after the custom element is registered.
      setArAvailable(Boolean((viewer as ModelViewerElement | null)?.canActivateAR));
    };

    const handleError = () => {
      if (active) setStatus("error");
      window.clearTimeout(loadingTimeout);
    };

    async function loadViewer() {
      try {
        await import("@google/model-viewer");
        if (!active || !viewerRef.current) return;

        viewer = document.createElement("model-viewer");
        viewer.setAttribute("src", src);
        viewer.setAttribute("alt", alt);
        if (poster) viewer.setAttribute("poster", poster);
        viewer.setAttribute("interaction-prompt", "none");
        viewer.setAttribute("camera-orbit", "0deg 55deg 180%");
        viewer.setAttribute("camera-target", "0m 0m 0m");
        viewer.setAttribute("field-of-view", "35deg");
        viewer.setAttribute("ar", "");
        viewer.setAttribute("ar-modes", "scene-viewer quick-look webxr");
        viewer.setAttribute("ar-scale", "fixed");
        viewer.setAttribute("ar-placement", "floor");
        viewer.setAttribute("shadow-intensity", "1");
        viewer.setAttribute("xr-environment", "");
        viewer.setAttribute("loading", "eager");
        viewer.setAttribute("reveal", "auto");
        viewer.setAttribute("exposure", "1");
        viewer.style.width = "100%";
        viewer.style.height = "100%";
        viewer.style.display = "block";
        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("error", handleError);
        viewer.addEventListener("pointerdown", handlePointerDown);
        viewer.addEventListener("pointermove", handlePointerMove);
        viewer.addEventListener("pointerup", handlePointerUp);
        viewer.addEventListener("pointercancel", handlePointerUp);
        viewer.addEventListener("wheel", handleWheel, { passive: true });

        viewerRef.current.replaceChildren(viewer);
      } catch (error) {
        console.error("Não foi possível inicializar o visualizador 3D.", error);
        if (active) setStatus("error");
      }
    }

    void loadViewer();

    return () => {
      active = false;
      viewer?.removeEventListener("load", handleLoad);
      viewer?.removeEventListener("error", handleError);
      viewer?.removeEventListener("pointerdown", handlePointerDown);
      viewer?.removeEventListener("pointermove", handlePointerMove);
      viewer?.removeEventListener("pointerup", handlePointerUp);
      viewer?.removeEventListener("pointercancel", handlePointerUp);
      viewer?.removeEventListener("wheel", handleWheel);
      viewer?.remove();
      window.clearTimeout(loadingTimeout);
    };
  }, [src, alt, poster]);

  async function activateAR() {
    onInteractionRef.current?.();
    const modelViewer = viewerRef.current?.querySelector("model-viewer") as ModelViewerElement | null;
    try {
      await modelViewer?.activateAR?.();
    } catch {
      setArAvailable(false);
    }
  }

  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-md bg-[#E5E1D7] sm:h-[420px]">
      <div ref={viewerRef} className="absolute inset-0" />

      {(status === "preview" || status === "error") && poster && (
        <Image src={poster} alt={alt} fill unoptimized sizes="(max-width: 1024px) 100vw, 540px" className="object-cover" />
      )}

      {status === "loading" && !poster && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <span className="size-8 animate-spin rounded-full border-2 border-[#C1D6B7] border-t-[#315F42]" />
          <p className="text-sm font-medium text-[#626C64]">Carregando modelo 3D…</p>
        </div>
      )}

      {(status === "preview" || status === "error") && (
        <div
          role={status === "error" ? "alert" : "status"}
          className="absolute inset-x-3 bottom-3 flex flex-col items-center justify-center rounded-md bg-white/90 px-4 py-3 text-center shadow-sm"
        >
          {!poster && <p className="font-semibold text-[#202923]">Modelo 3D indisponível</p>}
          <p className="text-xs leading-5 text-[#626C64]">{poster ? "A foto continua disponível. O modelo para explorar em 3D não carregou." : "Não foi possível carregar este arquivo. Confira se o modelo GLB está válido."}</p>
        </div>
      )}

      {status === "ready" && arAvailable === false && (
        <p className="absolute bottom-3 left-3 right-3 rounded-md bg-white/90 px-3 py-2 text-center text-xs text-[#626C64] shadow-sm">
          A realidade aumentada não está disponível neste dispositivo. Você ainda
          pode consultar a foto do prato no cardápio.
        </p>
      )}

      {status === "ready" && arAvailable && (
        <button
          type="button"
          onClick={() => void activateAR()}
          className="absolute right-3 top-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#315F42] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#234B39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C1D6B7]"
        >
          <span aria-hidden="true">◎</span> Ver na mesa
        </button>
      )}
    </div>
  );
}
