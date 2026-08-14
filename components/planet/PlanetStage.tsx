"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { createPlanetScene } from "../../lib/planet/planet-scene";
import type { SceneSnapshotRef } from "../../lib/planet/scene-snapshot";

type PlanetStageProps = {
  snapshotRef: SceneSnapshotRef;
  planetColor: string;
};

export function PlanetStage({ snapshotRef, planetColor }: PlanetStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return createPlanetScene({ container, snapshotRef, reducedMotion });
  }, [snapshotRef]);

  return (
    <div ref={containerRef} className="planet-canvas" aria-hidden="true">
      <div className="planet-fallback" style={{ "--planet-color": planetColor } as CSSProperties} />
    </div>
  );
}

