import Image from 'next/image';
import { pick, type Language } from '@/lib/i18n/routing';

export function FrontierMap({ language }: { language: Language }) {
  const alt = pick(language, {
    es: 'Vista aérea de Ciudad del Este, Foz do Iguaçu y Puerto Iguazú en la confluencia de los ríos Paraná e Iguazú.',
    pt: 'Vista aérea de Ciudad del Este, Foz do Iguaçu e Puerto Iguazú na confluência dos rios Paraná e Iguaçu.',
    en: 'Aerial view of Ciudad del Este, Foz do Iguaçu and Puerto Iguazú at the confluence of the Paraná and Iguazú rivers.',
  });

  return (
    <figure
      id="triple-frontera"
      className="frontier-map"
      itemScope
      itemType="https://schema.org/ImageObject"
    >
      <meta itemProp="creditText" content="Contains modified Copernicus Sentinel data 2026" />
      <Image
        className="frontier-landscape"
        src="/triple-frontera.webp"
        width={1280}
        height={1060}
        sizes="(max-width: 600px) calc(100vw - 44px), (max-width: 800px) 560px, (max-width: 1280px) 45vw, 552px"
        alt={alt}
      />
      <div aria-hidden="true">
        <span className="frontier-city frontier-city-oeste">Ciudad del Este</span>
        <span className="frontier-city frontier-city-foz">Foz do Iguaçu</span>
        <span className="frontier-city frontier-city-iguazu">Puerto Iguazú</span>
      </div>
    </figure>
  );
}
