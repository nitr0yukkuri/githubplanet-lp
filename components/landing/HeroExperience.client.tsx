"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { FinalCtaSection } from "./FinalCtaSection";
import { HeroSection } from "./HeroSection";
import { LandingHeader } from "./LandingHeader";
import { ProcessSection } from "./ProcessSection";
import { SignalsSection } from "./SignalsSection";
import { SiteFooter } from "./SiteFooter";
import { StorySection } from "./StorySection";
import { useLenisSceneProgress } from "../../lib/scroll/use-lenis-scene-progress";

export function HeroExperience() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { snapshot, snapshotRef, scrollTo } = useLenisSceneProgress(heroRef);
  const pageStyle = { "--scene-progress": snapshot.progress } as CSSProperties;

  return (
    <main className="site-shell" style={pageStyle}>
      <div className="star-field" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <LandingHeader scrollTo={scrollTo} progress={snapshot.progress} />
      <HeroSection heroRef={heroRef} snapshot={snapshot} snapshotRef={snapshotRef} scrollTo={scrollTo} />
      <StorySection />
      <SignalsSection />
      <ProcessSection />
      <FinalCtaSection />
      <SiteFooter scrollTo={scrollTo} />
    </main>
  );
}

