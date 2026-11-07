import { ImageResponse } from 'next/og';
import type { Language } from '@/lib/i18n/routing';
export const size = { width: 1200, height: 630 };
export function socialImage(language: Language) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0B1016',
        color: '#F4F7F8',
        padding: '65px 75px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>
        IGUA
        <span style={{ background: '#B5F36B', color: '#0B1016', padding: '0 7px', marginLeft: 4 }}>
          .DEV
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 76,
          fontWeight: 600,
          lineHeight: 1.07,
          letterSpacing: -4,
          maxWidth: 960,
        }}
      >
        {language === 'en'
          ? 'The future is being built here, too.'
          : 'El futuro también se construye desde acá.'}
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', color: '#A7B2BF', fontSize: 21 }}
      >
        <span>Puerto Iguazú, Misiones, Argentina</span>
        <span style={{ color: '#B5F36B' }}>
          {language === 'en'
            ? 'Code, community, and opportunities.'
            : 'Código, comunidad y oportunidades.'}
        </span>
      </div>
    </div>,
    { ...size },
  );
}
