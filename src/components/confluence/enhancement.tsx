'use client';

import { useI18n } from '@/components/i18n/provider';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { ConfluenceScene } from './scene';

type DataConnection = {
  saveData?: boolean;
  addEventListener?: (type: string, callback: () => void) => void;
  removeEventListener?: (type: string, callback: () => void) => void;
};

/** The accessible SVG is server-rendered. This controller only enhances it. */
export function ConfluenceEnhancement() {
  const { t, language } = useI18n();
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ConfluenceScene | null>(null);
  const pausedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const visual = host.parentElement!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: DataConnection }).connection;
    let visible = false;
    let loading = false;
    let disposed = false;
    let failed = false;
    let generation = 0;
    let cancelScheduled: (() => void) | undefined;
    const allowed = () => !motion.matches && !connection?.saveData;
    const clear = () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
      delete visual.dataset.enhanced;
      setReady(false);
    };
    const sync = () => {
      if (disposed) return;
      if (!allowed()) {
        generation++;
        cancelScheduled?.();
        cancelScheduled = undefined;
        loading = false;
        clear();
        return;
      }
      const active = visible && !document.hidden;
      if (!active && loading) {
        generation++;
        cancelScheduled?.();
        cancelScheduled = undefined;
        loading = false;
      }
      sceneRef.current?.setRunning(active && !pausedRef.current);
      if (!active || sceneRef.current || loading || failed) return;
      loading = true;
      const currentGeneration = generation;
      const load = async () => {
        cancelScheduled = undefined;
        try {
          const { createConfluenceScene } = await import('./scene');
          if (
            disposed ||
            currentGeneration !== generation ||
            !allowed() ||
            !visible ||
            document.hidden
          )
            return;
          const scene = createConfluenceScene(host, () => {
            failed = true;
            clear();
          });
          if (!scene) {
            failed = true;
            return;
          }
          sceneRef.current = scene;
          visual.dataset.enhanced = 'true';
          setReady(true);
          scene.setRunning(visible && !document.hidden && !pausedRef.current);
        } catch {
          failed = true;
          // Network/WebGL failures preserve the original SVG and functional page.
        } finally {
          if (currentGeneration === generation) loading = false;
        }
      };
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(
          () => {
            void load();
          },
          { timeout: 1500 },
        );
        cancelScheduled = () => window.cancelIdleCallback(id);
      } else {
        const id = setTimeout(() => {
          void load();
        }, 200);
        cancelScheduled = () => clearTimeout(id);
      }
    };
    syncRef.current = sync;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.08 },
    );
    observer.observe(host);
    motion.addEventListener('change', sync);
    connection?.addEventListener?.('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      generation++;
      cancelScheduled?.();
      observer.disconnect();
      motion.removeEventListener('change', sync);
      connection?.removeEventListener?.('change', sync);
      document.removeEventListener('visibilitychange', sync);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      delete visual.dataset.enhanced;
      syncRef.current = () => {};
    };
  }, []);

  function toggle() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    syncRef.current();
  }

  return (
    <>
      <div ref={hostRef} className="confluence-canvas" aria-hidden="true" />
      {ready && (
        <button
          type="button"
          className="confluence-toggle"
          onClick={toggle}
          aria-pressed={paused}
          aria-label={
            paused ? t('Reanudar animación de conexiones') : t('Pausar animación de conexiones')
          }
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          <span>{paused ? t('Reanudar') : t('Pausar')}</span>
        </button>
      )}
    </>
  );
}
