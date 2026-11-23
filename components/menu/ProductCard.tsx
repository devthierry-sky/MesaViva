import Image from "next/image";
import { FoodViewer } from "@/components/ar/FoodViewer";
import { formatPrice } from "@/src/lib/demo-menu";
import type { MenuProduct } from "@/src/types/menu";
import { AddToOrderButton } from "@/src/components/menu/OrderMenuExperience";
import { QRProductViewReporter } from "@/src/components/menu/QRProductViewReporter";
import { recordQr3dInteraction } from "@/src/app/menu/actions";
import { getQrSessionId } from "@/src/lib/qr-session";

interface ProductCardProps {
  product: MenuProduct;
  allowOrder?: boolean;
  qrTrackingSlug?: string;
}

export function ProductCard({ product, allowOrder = false, qrTrackingSlug }: ProductCardProps) {
  const reportInteraction = () => {
    if (!qrTrackingSlug) return;
    const sessionId = getQrSessionId();
    if (sessionId) void recordQr3dInteraction(qrTrackingSlug, product.id, sessionId);
  };
  return (
    <article
      id={`product-${product.id}`}
      className="relative grid overflow-hidden rounded-lg border border-[#26382D]/10 bg-white shadow-[0_18px_52px_-40px_rgba(32,41,35,.45)] lg:grid-cols-[1.08fr_.92fr]"
    >
      {qrTrackingSlug && <QRProductViewReporter slug={qrTrackingSlug} productId={product.id} />}
      <div className="border-b border-[#26382D]/10 bg-[#EFEEE8] p-3 sm:p-5 lg:border-b-0 lg:border-r">
        {product.modelGlbUrl ? (
          <FoodViewer
            src={product.modelGlbUrl}
            alt={product.modelAlt ?? product.name}
            poster={product.imageUrl}
            onInteraction={reportInteraction}
          />
        ) : product.imageUrl ? (
          <div className="relative h-[340px] overflow-hidden rounded-md bg-[#E5E1D7] sm:h-[420px]">
            <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 540px" className="object-cover" />
          </div>
        ) : (
          <div
            role="img"
            aria-label={`${product.name}: modelo 3D indisponível`}
            className="flex h-[340px] items-center justify-center rounded-md bg-[#E5E1D7] text-sm text-[#687168] sm:h-[420px]"
          >
            Modelo 3D em breve
          </div>
        )}
        <p className="mt-3 text-center text-xs text-[#737B73]">
          {product.modelGlbUrl ? "Foto em escala para explorar · em aparelhos compatíveis, abra a câmera e veja na mesa" : "Imagem do prato"}
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-7 sm:px-9 sm:py-9 lg:px-10">
        <div className="flex items-center justify-end gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              product.available
                ? "bg-[#E7F0E4] text-[#456A3D]"
                : "bg-[#F1F0EB] text-[#687168]"
            }`}
          >
            {product.available ? "Disponível" : "Indisponível"}
          </span>
        </div>

        <h3 className="mt-3 font-serif text-3xl font-medium tracking-[-.035em] text-[#202923] sm:text-4xl">
          {product.name}
        </h3>
        <p className="mt-2 leading-7 text-[#687168]">
          {product.description}
        </p>

        <div className="mt-5 border-t border-[#26382D]/12 pt-5">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[#82877F]">
            {product.illustrativePrice ? "Preço de demonstração" : "Preço"}
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#202923]">
            {formatPrice(product.priceCents)}
          </p>
          {product.illustrativePrice && <p className="mt-2 text-xs leading-relaxed text-[#737B73]">
            Valor ilustrativo para esta demonstração. O restaurante define o preço
            exibido no cardápio publicado.
          </p>}
        </div>
        {allowOrder && product.available && <AddToOrderButton product={product} />}
      </div>
    </article>
  );
}
