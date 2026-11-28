'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, GitBranch, MapPin, RotateCcw } from 'lucide-react';
import { useI18n } from '@/components/i18n/provider';
import Link from '@/components/localized-link';
import type { MemberTicketData } from '@/features/members/directory';
import './member-ticket.css';

export function MemberTicket({ member }: { member: MemberTicketData }) {
  const { t } = useI18n();
  const reverseId = useId();
  const [flipped, setFlipped] = useState(false);
  const frontAction = useRef<HTMLButtonElement>(null);
  const backAction = useRef<HTMLButtonElement>(null);
  const focusOnFlip = useRef(false);
  const initials = member.display_name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toUpperCase())
    .join('');

  function flip() {
    focusOnFlip.current = true;
    setFlipped((current) => !current);
  }

  useEffect(() => {
    if (focusOnFlip.current) {
      (flipped ? backAction : frontAction).current?.focus({ preventScroll: true });
      focusOnFlip.current = false;
    }
  }, [flipped]);

  return (
    <article className="member-ticket" aria-label={member.display_name}>
      <div className="member-ticket-stack" data-flipped={flipped}>
        <div
          className="member-ticket-face member-ticket-front"
          inert={flipped}
          aria-hidden={flipped}
        >
          <div className="member-ticket-person">
            <span className="member-ticket-initials" aria-hidden="true">
              {initials}
            </span>
            <h2>{member.display_name}</h2>
            {member.city && (
              <p>
                <MapPin size={16} aria-hidden="true" />
                {member.city}
              </p>
            )}
          </div>
          <div className="member-ticket-stub">
            <span translate="no">IGUA.DEV</span>
            <span>
              {t('Ver perfil')} <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>
          <button
            className="member-ticket-open"
            type="button"
            ref={frontAction}
            aria-label={`${t('Ver perfil')} · ${member.display_name}`}
            aria-controls={reverseId}
            aria-expanded={flipped}
            onClick={flip}
          />
        </div>
        <div
          id={reverseId}
          className="member-ticket-face member-ticket-back"
          inert={!flipped}
          aria-hidden={!flipped}
        >
          <div className="member-ticket-back-header">
            <h2>{member.display_name}</h2>
            <button
              type="button"
              ref={backAction}
              className="member-ticket-return"
              aria-label={t('Volver al frente')}
              onClick={flip}
            >
              <RotateCcw size={17} aria-hidden="true" />
            </button>
          </div>
          {member.bio && <p className="member-ticket-bio">{member.bio}</p>}
          {member.github_url && (
            <a
              className="member-ticket-github"
              href={member.github_url}
              target="_blank"
              rel="noreferrer"
            >
              <GitBranch size={17} aria-hidden="true" /> {t('Perfil de GitHub')}{' '}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
          {member.projects.length > 0 && (
            <>
              <h3>{t('Proyectos publicados')}</h3>
              <ul className="member-ticket-projects">
                {member.projects.map(({ slug, title }) => (
                  <li key={slug}>
                    <Link href={`/projects/${slug}`}>
                      {title}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!member.bio && !member.github_url && member.projects.length === 0 && (
            <p>{t('Todavía no hay más información para mostrar.')}</p>
          )}
        </div>
      </div>
    </article>
  );
}
