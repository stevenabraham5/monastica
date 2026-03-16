import { useMemo } from 'react';

/*
  useCelestialPosition — returns sun/moon arc position based on current hour.

  Sun arc: 6am (left, low) → 12pm (center, high) → 8pm (right, low)
  Moon arc: 8pm (left, low) → 1am (center, high) → 6am (right, low)

  Returns percentage-based left/top for absolute positioning.
*/

interface CelestialPosition {
  leftPct: number;   // 5–90%
  topPct: number;    // 3–45% (parabolic arc)
  isNight: boolean;
}

export function useCelestialPosition(): CelestialPosition {
  return useMemo(() => {
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const time = hour + minute / 60;

    // Day: 6am (6.0) → 8pm (20.0) = 14 hour span
    // Night: 8pm (20.0) → 6am (30.0 / next day) = 10 hour span

    const isNight = time < 6 || time >= 20;

    let progress: number; // 0→1 across the arc

    if (!isNight) {
      // Day: 6→20
      progress = (time - 6) / 14;
    } else {
      // Night: 20→30(6)
      const nightTime = time >= 20 ? time - 20 : time + 4; // 0→10
      progress = nightTime / 10;
    }

    // Clamp
    progress = Math.max(0, Math.min(1, progress));

    // Horizontal: left 8% → right 88%
    const leftPct = 8 + progress * 80;

    // Vertical: parabolic arc — lowest at edges, highest at center
    // topPct: 40% at edges (near horizon) → 4% at peak (noon/midnight)
    const arcHeight = 4 * Math.pow(progress - 0.5, 2); // 0→1 parabola
    const topPct = 4 + arcHeight * 36; // 4% at peak, 40% at horizon

    return { leftPct, topPct, isNight };
  }, []);
}
