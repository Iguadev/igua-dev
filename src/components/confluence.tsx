import { getI18n } from '@/lib/i18n/server';
import { ConfluenceEnhancement } from './confluence/enhancement';

export async function Confluence() {
  const { t, language } = await getI18n();
  return (
    <div className="confluence">
      <svg
        className="confluence-map"
        viewBox="0 0 620 600"
        fill="none"
        role="img"
        aria-label={t(
          'Ilustración abstracta de rutas que se conectan, inspirada en la confluencia de los ríos de Iguazú',
        )}
      >
        <defs>
          <pattern id="dots" width="25" height="25" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".8" fill="#617467" opacity=".35" />
          </pattern>
        </defs>
        <rect width="620" height="600" fill="url(#dots)" />
        <g className="confluence-static-routes">
          <g stroke="#52734A" opacity=".27" strokeWidth="1">
            {Array.from({ length: 15 }, (_, i) => (
              <path
                key={i}
                d={`M ${310 - i * 14} -20 C ${430 - i * 21} 120, ${30 + i * 12} 160, ${225 + i * 7} 310 S ${390 + i * 8} 410, ${215 + i * 9} 640`}
              />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={i}
                d={`M 640 ${120 + i * 16} C 490 ${80 + i * 20}, 520 ${330 + i * 3}, 330 ${310 + i * 8} S 290 530, ${395 + i * 11} 620`}
              />
            ))}
          </g>
          <g stroke="#85AC68" strokeWidth="1" strokeDasharray="4 7" opacity=".65">
            <path d="M80 190H195L325 323H515" />
            <path d="M405 75V240L325 323v170" />
          </g>
          <g stroke="#B5F36B" strokeWidth="2.5">
            <path d="M219 30C370 171 158 195 290 305s94 161 41 266" />
            <path d="M590 170c-141-27-85 161-237 153" />
          </g>
          <g fill="#B5F36B">
            <circle cx="325" cy="323" r="5" />
            <circle cx="219" cy="30" r="3" />
            <circle cx="590" cy="170" r="3" />
          </g>
          <circle cx="325" cy="323" r="26" stroke="#B5F36B" opacity=".35" />
          <circle cx="325" cy="323" r="46" stroke="#B5F36B" opacity=".13" />
        </g>
        <g fill="#A7B2BF" fontFamily="monospace" fontSize="11">
          <text x="77" y="177">
            {t('CONEXIONES SIN FRONTERAS')}
          </text>
          <text x="418" y="87">
            BR
          </text>
          <text x="455" y="351">
            PY
          </text>
          <text x="272" y="484">
            AR
          </text>
        </g>
        <g transform="translate(352 370)">
          <rect x="0" y="0" width="183" height="57" rx="4" fill="#121C1D" stroke="#34463B" />
          <circle cx="17" cy="19" r="3" fill="#B5F36B" />
          <text x="29" y="23" fill="#F4F7F8" fontFamily="monospace" fontSize="12">
            Puerto Iguazú
          </text>
          <text x="16" y="43" fill="#A7B2BF" fontFamily="monospace" fontSize="10">
            {t('Misiones, Argentina')}
          </text>
        </g>
        <g stroke="#55744B" opacity=".5">
          <path d="M25 40h14m-7-7v14M570 520h14m-7-7v14M60 490h14m-7-7v14" />
        </g>
      </svg>
      <ConfluenceEnhancement />
      <div className="confluence-caption">
        <span>{t('Un punto de encuentro.')}</span>
        <span>{t('Infinitas posibilidades.')}</span>
      </div>
    </div>
  );
}
