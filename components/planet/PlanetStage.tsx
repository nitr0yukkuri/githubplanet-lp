"use client";

import { useEffect, useRef } from "react";
import { createPlanetScene } from "../../lib/planet/planet-scene";
import type { SceneSnapshotRef } from "../../lib/planet/scene-snapshot";

type PlanetStageProps = {
  snapshotRef: SceneSnapshotRef;
};

export function PlanetStage({ snapshotRef }: PlanetStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return createPlanetScene({ container, snapshotRef, reducedMotion });
  }, [snapshotRef]);

  return (
    <div ref={containerRef} className="planet-canvas" aria-hidden="true">
      <div className="planet-fallback" aria-hidden="true">
        <div className="planet">
          <div className="planet-glow" />
          <div className="planet-land land-one" />
          <div className="planet-land land-two" />
          <div className="planet-land land-three" />
          <div className="planet-crater crater-one" />
          <div className="planet-crater crater-two" />
        </div>
      </div>
    </div>
  );
}
