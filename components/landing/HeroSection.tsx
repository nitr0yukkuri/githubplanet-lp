import type { RefObject } from "react";
import type { SceneSnapshot } from "../../lib/planet/scene-snapshot";
import { LanguageReadout } from "../planet/LanguageReadout";
import type { ScrollTo } from "./types";

type HeroSectionProps = {
  heroRef: RefObject<HTMLElement | null>;
  snapshot: SceneSnapshot;
  scrollTo: ScrollTo;
};

export function HeroSection({ heroRef, snapshot, scrollTo }: HeroSectionProps) {
  return (
    <section ref={heroRef} className="hero-scroll" id="top">
      <div className="hero-stage">
        <div className="hero-meta hero-meta-left"><span>ORBIT / 01</span><span>GITHUB ACTIVITY</span></div>
        <div className="hero-meta hero-meta-right"><span>{String(Math.round(snapshot.progress * 100)).padStart(2, "0")} %</span><span>SCROLL TO EXPLORE</span></div>
        <LanguageReadout snapshot={snapshot} />
        <div className="hero-title-group">
          <p className="hero-kicker">YOUR ACTIVITY, SHAPING A PLANET.</p>
          <h1><span>YOUR CODE,</span><span>IN ORBIT.</span></h1>
          <p className="hero-subtitle">GitHubの活動が、言語の個性を持つ惑星へ変わる。</p>
          <a className="wired-button" href="#start" onClick={(event) => scrollTo(event, "#start")}><span>ENTER THE ORBIT</span><b>→</b></a>
        </div>
        <a className="headphone-hint" href="#start" onClick={(event) => scrollTo(event, "#start")} aria-label="Scroll to change language worlds"><span className="headphone-icon" aria-hidden="true">↓</span><span>SCROLL TO CHANGE LANGUAGE WORLDS</span></a>
      </div>
    </section>
  );
}
