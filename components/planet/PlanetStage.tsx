"use client";

import { useEffect, useRef } from "react";
import { createPlanetScene } from "../../lib/planet/planet-scene";

type PlanetStageProps = {
  progressRef: { current: number };
};

export function PlanetStage({ progressRef }: PlanetStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return createPlanetScene({ container, progressRef, reducedMotion });
  }, [progressRef]);

  return <div ref={containerRef} className="planet-canvas" aria-hidden="true" />;
}
