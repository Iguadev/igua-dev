import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { pick, type Language } from '@/lib/i18n/routing';
export const size = { width: 1200, height: 630 };
const logo = `data:image/svg+xml;base64,${readFileSync(
  join(process.cwd(), 'public/brand/wordmark-reverse.svg'),
).toString('base64')}`;
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
      <img src={logo} width={223} height={60} alt="IGUA.DEV" />
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
        {pick(language, {
          es: 'El futuro también se construye desde acá.',
          pt: 'O futuro também se constrói daqui.',
          en: 'The future is being built here, too.',
        })}
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', color: '#A7B2BF', fontSize: 21 }}
      >
        <span>Puerto Iguazú, Misiones, Argentina</span>
        <span style={{ color: '#69D381' }}>
          {pick(language, {
            es: 'Código, comunidad y oportunidades.',
            pt: 'Código, comunidade e oportunidades.',
            en: 'Code, community, and opportunities.',
          })}
        </span>
      </div>
    </div>,
    { ...size },
  );
}
