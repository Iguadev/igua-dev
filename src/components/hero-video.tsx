'use client';

import { useEffect, useRef, useState } from 'react';

const POSTER = '/video/hero-poster.jpg';
const FAST = '/video/hero-fast.mp4';
const SLOW = '/video/hero-slow.mp4';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function slowConnection() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  const narrow = matchMedia('(max-width: 800px)').matches;
  const type = connection?.effectiveType;
  return Boolean(
    connection?.saveData || narrow || type === 'slow-2g' || type === '2g' || type === '3g',
  );
}

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 800px)');
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const choose = () => {
      setSrc(motion.matches ? null : slowConnection() ? SLOW : FAST);
    };
    choose();
    motion.addEventListener('change', choose);
    narrow.addEventListener('change', choose);
    connection?.addEventListener?.('change', choose);
    return () => {
      motion.removeEventListener('change', choose);
      narrow.removeEventListener('change', choose);
      connection?.removeEventListener?.('change', choose);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    video.muted = true;
    const root = video.closest('.hero');
    if (!root) return;
    let visible = false;
    const sync = () => {
      if (!visible || document.hidden) {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    observer.observe(root);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [src]);

  return (
    <div className="hero-media" aria-hidden="true">
      <img className="hero-poster" src={POSTER} alt="" />
      {src ? (
        <video
          key={src}
          ref={videoRef}
          className="hero-video"
          src={src}
          poster={POSTER}
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
        />
      ) : null}
      <div className="hero-scrim" />
    </div>
  );
}
