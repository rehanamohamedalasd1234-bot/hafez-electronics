import { useEffect, useMemo, useState } from 'react';
import type { Ad } from '../data/mock';
import { useResolvedMediaUrl } from '../lib/localMedia';

function isCurrentlyActive(ad: Ad, today: string) {
  return ad.is_active && ad.start_date <= today && ad.end_date >= today;
}

export default function AdsCarousel({ ads }: { ads: Ad[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const activeAds = useMemo(
    () => ads.filter((ad) => isCurrentlyActive(ad, today)),
    [ads, today],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeAds.length]);

  useEffect(() => {
    if (activeAds.length < 2) return;

    const currentAd = activeAds[activeIndex];
    const duration = Math.max(1, currentAd?.duration_seconds ?? 5) * 1000;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % activeAds.length);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [activeAds, activeIndex]);

  const ad = activeAds[activeIndex];
  const mediaUrl = useResolvedMediaUrl(ad?.url ?? '');

  if (!ad) return null;

  return (
    <section
      aria-label="إعلانات المتجر"
      className="relative isolate h-52 overflow-hidden rounded-3xl bg-slate-900 sm:h-72"
    >
      {ad.type === 'video' ? (
        <video
          key={ad.id}
          src={mediaUrl || undefined}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <img
          key={ad.id}
          src={mediaUrl || undefined}
          alt={ad.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-l from-slate-950/75 via-slate-950/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-8">
        <div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            إعلان مميز
          </span>
          <h2 className="mt-3 text-xl font-bold sm:text-2xl">{ad.title}</h2>
        </div>

        {activeAds.length > 1 && (
          <div className="flex shrink-0 gap-1.5" aria-label="اختيار الإعلان">
            {activeAds.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                aria-label={`عرض الإعلان ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
