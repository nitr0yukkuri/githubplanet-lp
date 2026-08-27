"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { FinalCtaSection } from "./FinalCtaSection";
import { HeroSection } from "./HeroSection";
import { LandingHeader } from "./LandingHeader";
import { SiteFooter } from "./SiteFooter";
import { useLenisSceneProgress } from "../../lib/scroll/use-lenis-scene-progress";
import { PlanetStage } from "../planet/PlanetStage";

export function HeroExperience() {
  const heroRef = useRef<HTMLElement | null>(null);
  const finalSectionRef = useRef<HTMLElement | null>(null);
  const { snapshot, snapshotRef, scrollTo, startAutoPilot } = useLenisSceneProgress(heroRef, finalSectionRef);
  const pageStyle = {
    "--scene-progress": snapshot.progress,
    "--final-flight-progress": snapshot.finalFlightProgress,
  } as CSSProperties;

  return (
    <main className="site-shell" data-scene-phase={snapshot.phase} style={pageStyle}>
      <div className="star-field" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <LandingHeader scrollTo={scrollTo} />
      <div className="global-planet-scene" aria-hidden="true">
        <PlanetStage snapshotRef={snapshotRef} />
      </div>
      <HeroSection heroRef={heroRef} snapshot={snapshot} startAutoPilot={startAutoPilot} />
      <FinalCtaSection sectionRef={finalSectionRef} snapshot={snapshot} />
      <SiteFooter scrollTo={scrollTo} />
    </main>
  );
}
