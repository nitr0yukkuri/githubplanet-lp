import type { RefObject } from "react";
import type { SceneSnapshot, SceneSnapshotRef } from "../../lib/planet/scene-snapshot";
import { LanguageReadout } from "../planet/LanguageReadout";
import { PlanetStage } from "../planet/PlanetStage";
import type { ScrollTo } from "./types";

type HeroSectionProps = {
  heroRef: RefObject<HTMLElement | null>;
  snapshot: SceneSnapshot;
  snapshotRef: SceneSnapshotRef;
  scrollTo: ScrollTo;
};

export function HeroSection({ heroRef, snapshot, snapshotRef, scrollTo }: HeroSectionProps) {
  return (
    <section ref={heroRef} className="hero-scroll" id="top">
      <div className="hero-stage">
        <div className="hero-meta hero-meta-left"><span>ORBIT / 01</span><span>GITHUB ACTIVITY</span></div>
        <div className="hero-meta hero-meta-right"><span>{String(Math.round(snapshot.progress * 100)).padStart(2, "0")} %</span><span>SCROLL TO EXPLORE</span></div>
        <PlanetStage snapshotRef={snapshotRef} />
        <LanguageReadout snapshot={snapshot} />
        <div className="hero-title-group">
          <p className="hero-kicker">YOUR ACTIVITY, SHAPING A PLANET.</p>
          <h1><span>YOUR CODE,</span><span>IN ORBIT.</span></h1>
          <p className="hero-subtitle">GitHubの活動が、言語の個性を持つ惑星へ変わる。</p>
          <a className="wired-button" href="#story" onClick={(event) => scrollTo(event, "#story")}><span>ENTER THE ORBIT</span><b>→</b></a>
        </div>
        <a className="headphone-hint" href="#story" onClick={(event) => scrollTo(event, "#story")} aria-label="Scroll to change language worlds"><span className="headphone-icon" aria-hidden="true">↓</span><span>SCROLL TO CHANGE LANGUAGE WORLDS</span></a>
      </div>
    </section>
  );
}

