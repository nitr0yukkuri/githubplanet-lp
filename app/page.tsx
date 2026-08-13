"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { FinalCtaSection } from "../components/landing/FinalCtaSection";
import { HeroSection } from "../components/landing/HeroSection";
import { LandingHeader } from "../components/landing/LandingHeader";
import { ProcessSection } from "../components/landing/ProcessSection";
import { SignalsSection } from "../components/landing/SignalsSection";
import { SiteFooter } from "../components/landing/SiteFooter";
import { StorySection } from "../components/landing/StorySection";
import { useLenisSceneProgress } from "../lib/scroll/use-lenis-scene-progress";

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { progress: sceneProgress, progressRef, scrollTo } = useLenisSceneProgress(heroRef);
  const pageStyle = { "--scene-progress": sceneProgress } as CSSProperties;

  return (
    <main className="site-shell" style={pageStyle}>
      <div className="star-field" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <LandingHeader scrollTo={scrollTo} progress={sceneProgress} />
      <HeroSection heroRef={heroRef} progress={sceneProgress} progressRef={progressRef} scrollTo={scrollTo} />
      <StorySection />
      <SignalsSection />
      <ProcessSection />
      <FinalCtaSection />
      <SiteFooter scrollTo={scrollTo} />
    </main>
  );
}
